const path = require('path')
const postcss = require('postcss')
const loadPostcssConfig = require('./load-postcss-config')
const { MPX_ROOT_VIEW, MPX_DISABLE_EXTRACTOR_CACHE } = require('../utils/const')
const rpx = require('./plugins/rpx')
const vw = require('./plugins/vw')
const scopeId = require('./plugins/scope-id')
const transSpecial = require('./plugins/trans-special')
const cssArrayList = require('./plugins/css-array-list')
const { matchCondition } = require('../utils/match-condition')
const parseRequest = require('../utils/parse-request')
const isReact = require('../utils/env').isReact
const RecordRuntimeInfoDependency = require('../dependencies/RecordRuntimeInfoDependency')

module.exports = function (css, map) {
  this.cacheable()
  const cb = this.async()
  const { resourcePath, queryObj } = parseRequest(this.resource)
  const mpx = this.getMpx()
  const mpxStyleOptions = (queryObj.mpxStyleOptions && JSON.parse(queryObj.mpxStyleOptions)) || {}
  const id = queryObj.moduleId || mpxStyleOptions.mid || mpx.getModuleId(resourcePath)
  const appInfo = mpx.appInfo
  const defs = mpx.defs
  const mode = mpx.mode
  const isApp = resourcePath === appInfo.resourcePath
  const transRpxRulesRaw = mpx.transRpxRules
  const transRpxRules = transRpxRulesRaw ? (Array.isArray(transRpxRulesRaw) ? transRpxRulesRaw : [transRpxRulesRaw]) : []
  const runtimeCompile = queryObj.isDynamic
  const index = queryObj.index || 0
  const packageName = queryObj.packageRoot || mpx.currentPackageRoot || 'main'

  const transRpxFn = mpx.webConfig.transRpxFn
  const testResolveRange = (include = () => true, exclude) => {
    return matchCondition(this.resourcePath, { include, exclude })
  }

  const inlineConfig = Object.assign({}, mpx.postcssInlineConfig, { defs, inlineConfigFile: path.join(mpx.projectRoot, 'vue.config.js') })
  loadPostcssConfig(this, inlineConfig).then(config => {
    const plugins = [] // init with trim plugin
    const options = Object.assign(
      {
        to: this.resourcePath,
        from: this.resourcePath,
        map: false
      },
      config.options
    )
    // ali平台下处理scoped和host选择器
    if (mode === 'ali' || mode === 'web') {
      if (queryObj.scoped || mpxStyleOptions.scoped) {
        plugins.push(scopeId({ id }))
      }
      plugins.push(transSpecial({ id }))
    }

    if (isReact(mode)) {
      plugins.push(transSpecial({ id }))
    }

    // plugins.push(pluginCondStrip({
    //   defs
    // }))

    for (const item of transRpxRules) {
      const {
        mode,
        comment,
        include,
        exclude,
        designWidth
      } = item || {}

      if (testResolveRange(include, exclude)) {
        // 对同一个资源一旦匹配到，推入一个rpx插件后就不再继续推了
        plugins.push(rpx({ mode, comment, designWidth }))
        break
      }
    }

    if (mpx.mode === 'web') {
      plugins.push(vw({ transRpxFn }))
    }
    // source map
    if (this.sourceMap && !options.map) {
      options.map = {
        inline: false,
        annotation: false,
        prev: map
      }
    }

    const finalPlugins = config.prePlugins.concat(plugins, config.plugins)

    const cssList = []
    if (runtimeCompile) {
      finalPlugins.push(cssArrayList(cssList))
    }

    return postcss(finalPlugins)
      .process(css, options)
      .then(result => {
        // ali环境添加全局样式抹平root差异
        if ((mode === 'ali' || mode === 'web') && isApp) {
          result.css += `\n.${MPX_ROOT_VIEW} { display: initial }\npage { line-height: normal }`
        }

        for (const warning of result.warnings()) {
          this.emitWarning(warning)
        }

        // todo 后续考虑直接使用postcss-loader来处理postcss
        for (const message of result.messages) {
          // eslint-disable-next-line default-case
          switch (message.type) {
            case 'dependency':
              this.addDependency(message.file)
              break

            case 'build-dependency':
              this.addBuildDependency(message.file)
              break

            case 'missing-dependency':
              this.addMissingDependency(message.file)
              break

            case 'context-dependency':
              this.addContextDependency(message.file)
              break

            case 'dir-dependency':
              this.addContextDependency(message.dir)
              break

            case 'asset':
              if (message.content && message.file) {
                this.emitFile(message.file, message.content, message.sourceMap, message.info)
              }
          }
        }

        if (runtimeCompile) {
          // 包含了运行时组件的 style 模块必须每次都创建（但并不是每次都需要build），用于收集组件节点信息，传递信息以禁用父级extractor的缓存
          this.emitFile(MPX_DISABLE_EXTRACTOR_CACHE, '', undefined, { skipEmit: true })
          this._module.addPresentationalDependency(new RecordRuntimeInfoDependency(packageName, resourcePath, { type: 'style', info: cssList, index }))
          return cb(null, '')
        }

        const map = result.map && result.map.toJSON()
        cb(null, result.css, map)
        return null // silence bluebird warning
      })
  }).catch(e => {
    console.error(e)
    cb(e)
  })
}
