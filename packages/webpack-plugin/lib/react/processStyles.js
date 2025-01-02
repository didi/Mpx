const createHelpers = require('../helpers')
const async = require('async')
const getClassMap = require('./style-helper').getClassMap
const shallowStringify = require('../utils/shallow-stringify')

module.exports = function (styles, {
  loaderContext,
  ctorType,
  autoScope,
  moduleId
}, callback) {
  const { getRequestString } = createHelpers(loaderContext)
  let content = ''
  let output = '/* styles */\n'
  if (styles.length) {
    const warn = (msg) => {
      loaderContext.emitWarning(
        new Error('[style compiler][' + loaderContext.resource + ']: ' + msg)
      )
    }
    const error = (msg) => {
      loaderContext.emitError(
        new Error('[style compiler][' + loaderContext.resource + ']: ' + msg)
      )
    }
    const { mode, srcMode, hasUnoCSS } = loaderContext.getMpx()
    async.eachOfSeries(styles, (style, i, callback) => {
      const scoped = style.scoped || autoScope
      const extraOptions = {
        moduleId,
        scoped,
        extract: false
      }
      // todo 建立新的request在内部导出classMap，便于样式模块复用
      loaderContext.importModule(JSON.parse(getRequestString('styles', style, extraOptions, i))).then((result) => {
        if (Array.isArray(result)) {
          result = result.map((item) => {
            return item[1]
          }).join('\n')
        }
        content += result.trim() + '\n'
        callback()
      }).catch((e) => {
        callback(e)
      })
      // require style
    }, (err) => {
      if (err) return callback(err)
      try {
        const classMap = getClassMap({
          content,
          filename: loaderContext.resourcePath,
          mode,
          srcMode,
          warn,
          error
        })
        if (ctorType === 'app') {
          if (hasUnoCSS) {
            output += `
            global.__getUnoBreakpoints = function () {
              return __unoCssBreakpointsPlaceholder__
            };\n
            let __unoClassMap
            global.__getUnoClassMap = function () {
              if (!__unoClassMap) {
                __unoClassMap = __unoCssMapPlaceholder__
              }
              return __unoClassMap
            };\n`
          }
          output += `
          let __appClassMap
          global.__getAppClassMap = function() {
            if(!__appClassMap) {
              __appClassMap = ${shallowStringify(classMap)};
            }
            return __appClassMap;
          };\n`
        } else {
          output += `
          let __classMap
          global.currentInject.injectMethods = {
            __getClassMap: function() {
              if(!__classMap) {
                __classMap = ${shallowStringify(classMap)};
              }
              return __classMap;
            }
          };\n`
        }
      } catch (e) {
        return callback(e)
      }
      callback(null, {
        output
      })
    })
  } else {
    callback(null, {
      output: ''
    })
  }
}
