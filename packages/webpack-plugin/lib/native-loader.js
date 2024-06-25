const path = require('path')
const JSON5 = require('json5')
const parseRequest = require('./utils/parse-request')
const config = require('./config')
const createHelpers = require('./helpers')
const getJSONContent = require('./utils/get-json-content')
const async = require('async')
const { matchCondition } = require('./utils/match-condition')
const { JSON_JS_EXT, MPX_APP_MODULE_ID } = require('./utils/const')
const getRulesRunner = require('./platform')
const getEntryName = require('./utils/get-entry-name')
const AppEntryDependency = require('./dependencies/AppEntryDependency')
const RecordResourceMapDependency = require('./dependencies/RecordResourceMapDependency')

// todo native-loader考虑与mpx-loader或加强复用，原生组件约等于4个区块都为src的.mpx文件
module.exports = function (content) {
  this.cacheable()

  const mpx = this.getMpx()
  if (!mpx) {
    return content
  }

  const nativeCallback = this.async()
  const loaderContext = this
  const isProduction = this.minimize || process.env.NODE_ENV === 'production'
  const filePath = this.resourcePath
  const { resourcePath, queryObj } = parseRequest(this.resource)
  const packageRoot = queryObj.packageRoot || mpx.currentPackageRoot
  const mode = mpx.mode
  const globalSrcMode = mpx.srcMode
  const localSrcMode = queryObj.mode
  const packageName = queryObj.packageRoot || mpx.currentPackageRoot || 'main'
  const pagesMap = mpx.pagesMap
  const componentsMap = mpx.componentsMap[packageName]
  const parsed = path.parse(resourcePath)
  const resourceName = path.join(parsed.dir, parsed.name)
  const srcMode = localSrcMode || globalSrcMode
  const typeExtMap = config[srcMode].typeExtMap
  const typeResourceMap = {}
  const autoScope = matchCondition(resourcePath, mpx.autoScopeRules)

  const CSS_LANG_EXT_MAP = {
    less: '.less',
    stylus: '.styl',
    sass: '.sass',
    scss: '.scss'
  }

  const TS_EXT = '.ts'

  let useJSONJS = false
  let cssLang = ''
  const hasScoped = (queryObj.scoped || autoScope) && mode === 'ali'
  const hasComment = false
  const isNative = true

  const checkFileExists = (extName, callback) => {
    this.resolve(parsed.dir, resourceName + extName, callback)
  }

  function checkCSSLangFile (callback) {
    const langs = mpx.nativeConfig.cssLangs || ['less', 'stylus', 'scss', 'sass']
    const results = []
    async.eachOf(langs, function (lang, i, callback) {
      if (!CSS_LANG_EXT_MAP[lang]) {
        return callback()
      }
      checkFileExists(CSS_LANG_EXT_MAP[lang], (err, result) => {
        if (!err && result) {
          results[i] = result
        }
        callback()
      })
    }, function (err) {
      for (let i = 0; i < langs.length; i++) {
        if (results[i]) {
          cssLang = langs[i]
          typeResourceMap.styles = results[i]
          break
        }
      }
      callback(err)
    })
  }

  function checkJSONJSFile (callback) {
    checkFileExists(JSON_JS_EXT, (err, result) => {
      if (!err && result) {
        typeResourceMap.json = result
        useJSONJS = true
      }
      callback()
    })
  }

  function checkTSFile (callback) {
    checkFileExists(TS_EXT, (err, result) => {
      if (!err && result) {
        typeResourceMap.script = result
      }
      callback()
    })
  }

  const emitWarning = (msg) => {
    this.emitWarning(
      new Error('[native-loader][' + this.resource + ']: ' + msg)
    )
  }

  const emitError = (msg) => {
    this.emitError(
      new Error('[native-loader][' + this.resource + ']: ' + msg)
    )
  }

  // 先读取json获取usingComponents信息
  async.waterfall([
    (callback) => {
      async.parallel([
        checkCSSLangFile,
        checkJSONJSFile,
        checkTSFile
      ], (err) => {
        callback(err)
      })
    },
    (callback) => {
      async.forEachOf(typeExtMap, (ext, key, callback) => {
        // 对应资源存在预处理类型文件时跳过对应的标准文件检测
        if (typeResourceMap[key]) {
          return callback()
        }
        checkFileExists(ext, (err, result) => {
          if (!err && result) {
            typeResourceMap[key] = result
          }
          callback()
        })
      }, callback)
    },
    (callback) => {
      getJSONContent({
        src: typeResourceMap.json,
        useJSONJS
      }, null, this, callback)
    }, (content, callback) => {
      let componentPlaceholder = []
      let json
      try {
        json = JSON5.parse(content)
      } catch (e) {
        return callback(e)
      }
      let usingComponents = Object.keys(mpx.usingComponents)
      const rulesRunnerOptions = {
        mode,
        srcMode,
        type: 'json',
        waterfall: true,
        warn: emitWarning,
        error: emitError
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

      // 处理构造器类型
      const ctor = ctorType === 'page'
        ? (mpx.forceUsePageCtor || mode === 'ali') ? 'Page' : 'Component'
        : ctorType === 'component'
          ? 'Component'
          : 'App'

      if (ctorType === 'app') {
        const appName = getEntryName(this)
        if (appName) this._module.addPresentationalDependency(new AppEntryDependency(resourcePath, appName))
      }

      const moduleId = ctorType === 'app' ? MPX_APP_MODULE_ID : '_' + mpx.pathHash(filePath)

      if (ctorType !== 'app') {
        rulesRunnerOptions.mainKey = pagesMap[resourcePath] ? 'page' : 'component'
      }
      const rulesRunner = getRulesRunner(rulesRunnerOptions)
      if (rulesRunner) rulesRunner(json)
      if (json.usingComponents) {
        usingComponents = usingComponents.concat(Object.keys(json.usingComponents))
      }
      if (json.componentPlaceholder) {
        componentPlaceholder = componentPlaceholder.concat(Object.values(json.componentPlaceholder))
      }
      const {
        getRequire
      } = createHelpers(loaderContext)

      const getRequireByType = (type) => {
        const src = typeResourceMap[type]
        const part = { src }
        const extraOptions = {
          ...queryObj,
          resourcePath
        }

        switch (type) {
          case 'template':
            if (ctorType === 'app') return ''
            Object.assign(extraOptions, {
              hasScoped,
              hasComment,
              isNative,
              moduleId,
              usingComponents,
              componentPlaceholder
            })
            // if (template.src) extraOptions.resourcePath = resourcePath
            break
          case 'styles':
            if (cssLang) part.lang = cssLang
            Object.assign(extraOptions, {
              moduleId,
              scoped: hasScoped
            })
            break
          case 'json':
            if (useJSONJS) part.useJSONJS = true
            break
        }
        return getRequire(type, part, extraOptions)
      }

      // 注入模块id及资源路径
      // currentModuleId -> _mid
      let output = `global._mid = ${JSON.stringify(moduleId)}\n`
      if (!isProduction) {
        output += `global.currentResource = ${JSON.stringify(filePath)}\n`
      }
      // currentCtor -> _ctor
      output += `global._ctor = ${ctor}\n`
      // currentCtorType -> _ctorT
      output += `global._ctorT = ${JSON.stringify(ctor.replace(/^./, (match) => {
        return match.toLowerCase()
      }))}\n`
      // currentResourceType -> _crt
      output += `global._crt = ${JSON.stringify(ctorType)}\n`

      if (srcMode) {
        // currentSrcMode -> _sm
        output += `global._sm = ${JSON.stringify(srcMode)}\n`
      }

      for (const type in typeResourceMap) {
        output += `/* ${type} */\n${getRequireByType(type)}\n\n`
      }

      callback(null, output)
    }
  ], nativeCallback)
}
