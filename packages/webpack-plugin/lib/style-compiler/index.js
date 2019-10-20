const getMainCompilation = require('../utils/get-main-compilation')
const { normalizeCondition } = require('../utils/match-condition')
const postcss = require('postcss')
const loaderUtils = require('loader-utils')
const loadPostcssConfig = require('./load-postcss-config')

const trim = require('./plugins/trim')
const rpx = require('./plugins/rpx')
const pluginCondStrip = require('./plugins/conditional-strip')
const scopeId = require('./plugins/scope-id')

module.exports = function (css, map) {
  this.cacheable()
  const cb = this.async()
  const loaderOptions = loaderUtils.getOptions(this) || {}

  const mainCompilation = getMainCompilation(this._compilation)
  const compilationMpx = mainCompilation.__mpx__

  const transRpxs = Array.isArray(loaderOptions.transRpx) ? loaderOptions.transRpx : [loaderOptions.transRpx]

  const testResolveRange = (include, exclude) => {
    const matchInclude = include && normalizeCondition(include)
    const matchExclude = exclude && normalizeCondition(exclude)

    let useRpxPlugin = true
    if (matchInclude && !matchInclude(this.resourcePath)) {
      useRpxPlugin = false
    }
    if (matchExclude && matchExclude(this.resourcePath)) {
      useRpxPlugin = false
    }
    return useRpxPlugin
  }

  loadPostcssConfig(this)
    .then(config => {
      const plugins = config.plugins.concat(trim)
      const options = Object.assign(
        {
          to: this.resourcePath,
          from: this.resourcePath,
          map: false
        },
        config.options
      )

      if (loaderOptions.scoped) {
        plugins.push(scopeId({ id: loaderOptions.moduleId }))
      }

      plugins.push(pluginCondStrip({
        __mpx_mode__: compilationMpx.mode
      }))

      if (transRpxs.length) {
        for (let item of transRpxs) {
          const {
            mode = (typeof loaderOptions.transRpx === 'string' && loaderOptions.transRpx) || (typeof loaderOptions.transRpx === 'boolean' && loaderOptions.transRpx && 'all'),
            comment = loaderOptions.comment,
            include,
            exclude,
            designWidth = loaderOptions.designWidth
          } = item || {}

          if (testResolveRange(include, exclude)) {
            // 对同一个资源一旦匹配到，推入一个rpx插件后就不再继续推了
            plugins.push(rpx({ mode, comment, designWidth }))
            break
          }
        }
      }

      // source map
      if (loaderOptions.sourceMap && !options.map) {
        options.map = {
          inline: false,
          annotation: false,
          prev: map
        }
      }

      return postcss(plugins)
        .process(css, options)
        .then(result => {
          if (result.messages) {
            result.messages.forEach(({ type, file }) => {
              if (type === 'dependency') {
                this.addDependency(file)
              }
            })
          }
          const map = result.map && result.map.toJSON()
          cb(null, result.css, map)
          return null // silence bluebird warning
        })
    })
    .catch(e => {
      console.error(e)
      cb(e)
    })
}
