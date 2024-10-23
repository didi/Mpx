const async = require('async')
const processJSON = require('./processJSON')
const processMainScript = require('./processMainScript')
const processTemplate = require('./processTemplate')
const processStyles = require('./processStyles')
const processScript = require('./processScript')
const RecordLoaderContentDependency = require('../dependencies/RecordLoaderContentDependency')

module.exports = function ({
  parts,
  loaderContext,
  pagesMap,
  componentsMap,
  queryObj,
  ctorType,
  srcMode,
  moduleId,
  isProduction,
  hasScoped,
  hasComment,
  isNative,
  usingComponents,
  componentGenerics,
  autoScope,
  callback
}) {
  if (ctorType === 'app' && !queryObj.isApp) {
    return async.waterfall([
      (callback) => {
        processJSON(parts.json, {
          loaderContext,
          ctorType,
          pagesMap,
          componentsMap
        }, callback)
      },
      (jsonRes, callback) => {
        processMainScript({
          loaderContext,
          jsonConfig: jsonRes.jsonObj,
          localComponentsMap: jsonRes.localComponentsMap,
          tabBar: jsonRes.jsonObj.tabBar,
          tabBarMap: jsonRes.tabBarMap,
          tabBarStr: jsonRes.tabBarStr,
          localPagesMap: jsonRes.localPagesMap
        }, callback)
      }
    ], (err, scriptRes) => {
      if (err) return callback(err)
      loaderContext.loaderIndex = -1
      return callback(null, scriptRes.output)
    })
  }
  const mpx = loaderContext.getMpx()
  // 通过RecordLoaderContentDependency和loaderContentCache确保子request不再重复生成loaderContent
  const cacheContent = mpx.loaderContentCache.get(loaderContext.resourcePath)
  if (cacheContent) return callback(null, cacheContent)
  let output = ''
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
            ctorType,
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
        templateSrcList: templateRes.templateSrcList,
        inlineTemplateMap: templateRes.inlineTemplateMap,
        localComponentsMap: jsonRes.localComponentsMap
      }, callback)
    }
  ], (err, scriptRes) => {
    if (err) return callback(err)
    output += scriptRes.output
    loaderContext._module.addPresentationalDependency(new RecordLoaderContentDependency(loaderContext.resourcePath, output))
    callback(null, output)
  })
}
