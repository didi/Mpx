const JSON5 = require('json5')
const parseComponent = require('./parser')
const createHelpers = require('./helpers')
const parseRequest = require('./utils/parse-request')
const { matchCondition } = require('./utils/match-condition')
const addQuery = require('./utils/add-query')
const async = require('async')
const processJSON = require('./web/processJSON')
const processScript = require('./web/processScript')
const processStyles = require('./web/processStyles')
const processTemplate = require('./web/processTemplate')
const getJSONContent = require('./utils/get-json-content')
const normalize = require('./utils/normalize')
const getEntryName = require('./utils/get-entry-name')
const AppEntryDependency = require('./dependencies/AppEntryDependency')
const RecordResourceMapDependency = require('./dependencies/RecordResourceMapDependency')
const RecordVueContentDependency = require('./dependencies/RecordVueContentDependency')
const CommonJsVariableDependency = require('./dependencies/CommonJsVariableDependency')
const tsWatchRunLoaderFilter = require('./utils/ts-loader-watch-run-loader-filter')
const { MPX_APP_MODULE_ID } = require('./utils/const')
const path = require('path')
const processMainScript = require('./web/processMainScript')
const getRulesRunner = require('./platform')

module.exports = function (content) {
  this.cacheable()

  // 兼容处理处理ts-loader中watch-run/updateFile逻辑，直接跳过当前loader及后续的loader返回内容
  const pathExtname = path.extname(this.resourcePath)
  if (!['.vue', '.mpx'].includes(pathExtname)) {
    this.loaderIndex = tsWatchRunLoaderFilter(this.loaders, this.loaderIndex)
    return content
  }

  const mpx = this.getMpx()
  if (!mpx) {
    return content
  }
  const { resourcePath, queryObj } = parseRequest(this.resource)

  const packageRoot = queryObj.packageRoot || mpx.currentPackageRoot
  const packageName = packageRoot || 'main'
  const independent = queryObj.independent
  const pagesMap = mpx.pagesMap
  const componentsMap = mpx.componentsMap[packageName]
  const mode = mpx.mode
  const env = mpx.env
  const i18n = mpx.i18n
  const globalSrcMode = mpx.srcMode
  const localSrcMode = queryObj.mode
  const srcMode = localSrcMode || globalSrcMode
  const autoScope = matchCondition(resourcePath, mpx.autoScopeRules)

  const emitWarning = (msg) => {
    this.emitWarning(
      new Error('[mpx-loader][' + this.resource + ']: ' + msg)
    )
  }

  const emitError = (msg) => {
    this.emitError(
      new Error('[mpx-loader][' + this.resource + ']: ' + msg)
    )
  }

  let ctorType = pagesMap[resourcePath]
    ? 'page'
    : componentsMap[resourcePath]
      ? 'component'
      : 'app'

  // 支持资源query传入isPage或isComponent支持页面/组件单独编译
  if (ctorType === 'app' && (queryObj.isComponent || queryObj.isPage)) {
    const entryName = getEntryName(this) || mpx.getOutputPath(resourcePath, queryObj.isComponent ? 'component' : 'page')
    ctorType = queryObj.isComponent ? 'component' : 'page'
    this._module.addPresentationalDependency(new RecordResourceMapDependency(resourcePath, ctorType, entryName, packageRoot))
  }

  if (ctorType === 'app') {
    const appName = getEntryName(this)
    if (appName) this._module.addPresentationalDependency(new AppEntryDependency(resourcePath, appName))
  }
  const loaderContext = this
  const isProduction = this.minimize || process.env.NODE_ENV === 'production'
  const filePath = this.resourcePath
  const moduleId = ctorType === 'app' ? MPX_APP_MODULE_ID : '_' + mpx.pathHash(filePath)

  const parts = parseComponent(content, {
    filePath,
    needMap: this.sourceMap,
    mode,
    env
  })

  const {
    getRequire
  } = createHelpers(loaderContext)

  let output = ''
  const callback = this.async()

  async.waterfall([
    (callback) => {
      getJSONContent(parts.json || {}, null, loaderContext, (err, content) => {
        if (err) return callback(err)
        if (parts.json) parts.json.content = content
        callback()
      })
    },
    (callback) => {
      const hasScoped = parts.styles.some(({ scoped }) => scoped) || autoScope
      const templateAttrs = parts.template && parts.template.attrs
      const hasComment = templateAttrs && templateAttrs.comments
      const isNative = false

      let usingComponents = [].concat(Object.keys(mpx.usingComponents))
      let componentPlaceholder = []
      let componentGenerics = {}

      if (parts.json && parts.json.content) {
        const rulesRunnerOptions = {
          mode,
          srcMode,
          type: 'json',
          waterfall: true,
          warn: emitWarning,
          error: emitError
        }
        if (ctorType !== 'app') {
          rulesRunnerOptions.mainKey = pagesMap[resourcePath] ? 'page' : 'component'
        }
        const rulesRunner = getRulesRunner(rulesRunnerOptions)
        try {
          const ret = JSON5.parse(parts.json.content)
          if (rulesRunner) rulesRunner(ret)
          if (ret.usingComponents) {
            usingComponents = usingComponents.concat(Object.keys(ret.usingComponents))
          }
          if (ret.componentPlaceholder) {
            componentPlaceholder = componentPlaceholder.concat(Object.values(ret.componentPlaceholder))
          }
          if (ret.componentGenerics) {
            componentGenerics = Object.assign({}, ret.componentGenerics)
          }
        } catch (e) {
          return callback(e)
        }
      }
      // 处理mode为web时输出vue格式文件
      if (mode === 'web') {
        if (ctorType === 'app' && !queryObj.isApp) {
          return async.waterfall([
            (callback) => {
              processJSON(parts.json, { loaderContext, pagesMap, componentsMap }, callback)
            },
            (jsonRes, callback) => {
              processMainScript(parts.script, {
                loaderContext,
                ctorType,
                srcMode,
                moduleId,
                isProduction,
                jsonConfig: jsonRes.jsonObj,
                outputPath: queryObj.outputPath || '',
                localComponentsMap: jsonRes.localComponentsMap,
                tabBar: jsonRes.jsonObj.tabBar,
                tabBarMap: jsonRes.tabBarMap,
                tabBarStr: jsonRes.tabBarStr,
                localPagesMap: jsonRes.localPagesMap,
                resource: this.resource
              }, callback)
            }
          ], (err, scriptRes) => {
            if (err) return callback(err)
            this.loaderIndex = -1
            return callback(null, scriptRes.output)
          })
        }
        // 通过RecordVueContentDependency和vueContentCache确保子request不再重复生成vueContent
        const cacheContent = mpx.vueContentCache.get(filePath)
        if (cacheContent) return callback(null, cacheContent)

        return async.waterfall([
          (callback) => {
            async.parallel([
              (callback) => {
                processTemplate(parts.template, {
                  loaderContext,
                  hasScoped,
                  hasComment,
                  isNative,
                  srcMode,
                  moduleId,
                  ctorType,
                  usingComponents,
                  componentGenerics
                }, callback)
              },
              (callback) => {
                processStyles(parts.styles, {
                  ctorType,
                  autoScope,
                  moduleId
                }, callback)
              },
              (callback) => {
                processJSON(parts.json, {
                  loaderContext,
                  pagesMap,
                  componentsMap
                }, callback)
              }
            ], (err, res) => {
              callback(err, res)
            })
          },
          ([templateRes, stylesRes, jsonRes], callback) => {
            output += templateRes.output
            output += stylesRes.output
            output += jsonRes.output
            processScript(parts.script, {
              loaderContext,
              ctorType,
              srcMode,
              moduleId,
              isProduction,
              componentGenerics,
              jsonConfig: jsonRes.jsonObj,
              outputPath: queryObj.outputPath || '',
              builtInComponentsMap: templateRes.builtInComponentsMap,
              genericsInfo: templateRes.genericsInfo,
              wxsModuleMap: templateRes.wxsModuleMap,
              localComponentsMap: jsonRes.localComponentsMap
            }, callback)
          }
        ], (err, scriptRes) => {
          if (err) return callback(err)
          output += scriptRes.output
          this._module.addPresentationalDependency(new RecordVueContentDependency(filePath, output))
          callback(null, output)
        })
      }
      const moduleGraph = this._compilation.moduleGraph

      const issuer = moduleGraph.getIssuer(this._module)

      if (issuer) {
        return callback(new Error(`Current ${ctorType} [${this.resourcePath}] is issued by [${issuer.resource}], which is not allowed!`))
      }

      // 注入模块id及资源路径
      // currentModuleId -> _mid
      output += `global._mid = ${JSON.stringify(moduleId)}\n`
      if (!isProduction) {
        output += `global.currentResource = ${JSON.stringify(filePath)}\n`
      }

      // 为app注入i18n
      if (i18n && ctorType === 'app') {
        const i18nWxsPath = normalize.lib('runtime/i18n.wxs')
        const i18nWxsLoaderPath = normalize.lib('wxs/i18n-loader.js')
        const i18nWxsRequest = i18nWxsLoaderPath + '!' + i18nWxsPath
        this._module.addDependency(new CommonJsVariableDependency(i18nWxsRequest))
        // 避免该模块被concatenate导致注入的i18n没有最先执行
        this._module.buildInfo.moduleConcatenationBailout = 'i18n'
      }

      // 为独立分包注入init module
      if (independent && typeof independent === 'string') {
        const independentLoader = normalize.lib('independent-loader.js')
        const independentInitRequest = `!!${independentLoader}!${independent}`
        this._module.addDependency(new CommonJsVariableDependency(independentInitRequest))
        // 避免该模块被concatenate导致注入的independent init没有最先执行
        this._module.buildInfo.moduleConcatenationBailout = 'independent init'
      }

      // 注入构造函数
      const ctor = ctorType === 'page'
        ? (mpx.forceUsePageCtor || mode === 'ali') ? 'Page' : 'Component'
        : ctorType === 'component'
          ? 'Component'
          : 'App'
      // currentCtor -> _ctor
      output += `global._ctor = ${ctor}\n`
      // currentCtorType -> _ctorT
      output += `global._ctorT = ${JSON.stringify(ctor.replace(/^./, (match) => {
        return match.toLowerCase()
      }))}\n`
      // currentResourceType -> _crt
      output += `global._crt = ${JSON.stringify(ctorType)}\n`

      // template
      output += '/* template */\n'
      const template = parts.template

      if (template) {
        const extraOptions = {
          ...template.src
            ? { ...queryObj, resourcePath }
            : null,
          hasScoped,
          hasComment,
          isNative,
          moduleId,
          usingComponents,
          componentPlaceholder
          // 添加babel处理渲染函数中可能包含的...展开运算符
          // 由于...运算符应用范围极小以及babel成本极高，先关闭此特性后续看情况打开
          // needBabel: true
        }
        if (template.src) extraOptions.resourcePath = resourcePath
        // 基于global.currentInject来注入模板渲染函数和refs等信息
        output += getRequire('template', template, extraOptions) + '\n'
      }

      // styles
      output += '/* styles */\n'
      if (parts.styles.length) {
        parts.styles.forEach((style, i) => {
          const scoped = style.scoped || autoScope
          const extraOptions = {
            // style src会被特殊处理为全局复用样式，不添加resourcePath，添加isStatic及issuerFile
            ...style.src
              ? { ...queryObj, isStatic: true, issuerResource: addQuery(this.resource, { type: 'styles' }, true) }
              : null,
            moduleId,
            scoped
          }
          // require style
          output += getRequire('styles', style, extraOptions, i) + '\n'
        })
      }

      if (parts.styles.filter(style => !style.src).length === 0 && ctorType === 'app' && mode === 'ali') {
        output += getRequire('styles', {}, {}, parts.styles.length) + '\n'
      }

      // json
      output += '/* json */\n'
      // 给予json默认值, 确保生成json request以自动补全json
      const json = parts.json || {}
      output += getRequire('json', json, json.src && { ...queryObj, resourcePath }) + '\n'

      // script
      output += '/* script */\n'
      let scriptSrcMode = srcMode
      // 给予script默认值, 确保生成js request以自动补全js
      const script = parts.script || {}
      if (script) {
        scriptSrcMode = script.mode || scriptSrcMode
        // currentSrcMode -> _sm
        if (scriptSrcMode) output += `global._sm = ${JSON.stringify(scriptSrcMode)}\n`
        // 传递ctorType以补全js内容
        const extraOptions = {
          ...script.src
            ? { ...queryObj, resourcePath }
            : null,
          ctorType,
          lang: script.lang || 'js'
        }
        output += getRequire('script', script, extraOptions) + '\n'
      }
      callback(null, output)
    }
  ], callback)
}
