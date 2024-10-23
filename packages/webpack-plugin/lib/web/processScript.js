const genComponentTag = require('../utils/gen-component-tag')
const loaderUtils = require('loader-utils')
const normalize = require('../utils/normalize')
const shallowStringify = require('../utils/shallow-stringify')
const optionProcessorPath = normalize.lib('runtime/optionProcessor')
const wxmlTemplateLoader = normalize.lib('web/wxml-template-loader')
const WriteVfsDependency = require('../dependencies/WriteVfsDependency')
const {
  buildComponentsMap,
  getRequireScript,
  buildGlobalParams,
  stringifyRequest
} = require('./script-helper')

module.exports = function (script, {
  loaderContext,
  ctorType,
  srcMode,
  moduleId,
  isProduction,
  componentGenerics,
  jsonConfig,
  outputPath,
  builtInComponentsMap,
  genericsInfo,
  wxsModuleMap,
  templateSrcList,
  inlineTemplateMap,
  localComponentsMap
}, callback) {
  const { projectRoot, appInfo, webConfig, __vfs: vfs } = loaderContext.getMpx()

  let output = '/* script */\n'
  let scriptSrcMode = srcMode
  if (script) {
    scriptSrcMode = script.mode || scriptSrcMode
  } else {
    script = { tag: 'script' }
  }

  output += genComponentTag(script, {
    attrs (script) {
      const attrs = Object.assign({}, script.attrs)
      // src改为内联require，删除
      delete attrs.src
      // script setup通过mpx处理，删除该属性避免vue报错
      delete attrs.setup
      return attrs
    },
    content (script) {
      let content = `\n  import { processComponentOption, getComponent, getWxsMixin } from ${stringifyRequest(loaderContext, optionProcessorPath)}\n`
      let hasApp = true
      if (!appInfo.name) {
        hasApp = false
      }
      // 注入wxs模块
      content += '  var wxsModules = {}\n'
      if (wxsModuleMap) {
        Object.keys(wxsModuleMap).forEach((module) => {
          const src = loaderUtils.urlToRequest(wxsModuleMap[module], projectRoot)
          const expression = `require(${stringifyRequest(loaderContext, src)})`
          content += `  wxsModules.${module} = ${expression}\n`
        })
      }
      content += 'const templateModules = {}\n'
      if (templateSrcList?.length) { // import标签处理
        templateSrcList?.forEach((item) => {
          content += `
          const tempLoaderResult = require(${stringifyRequest(this, `!!${wxmlTemplateLoader}!${item}`)})\n
          Object.assign(templateModules, tempLoaderResult)\n`
        })
      }

      // 获取组件集合
      const componentsMap = buildComponentsMap({ localComponentsMap, builtInComponentsMap, loaderContext, jsonConfig })
      // 获取pageConfig
      const pageConfig = {}
      if (ctorType === 'page') {
        Object.assign(pageConfig, jsonConfig)
        delete pageConfig.usingComponents
      }
      if (inlineTemplateMap) { // 处理行内template(只有属性为name的情况)
        const inlineTemplateMapLists = Object.keys(inlineTemplateMap)
        if (inlineTemplateMapLists.length) {
          inlineTemplateMapLists.forEach((name) => {
            const { filePath, content } = inlineTemplateMap[name]
            loaderContext._module.addPresentationalDependency(new WriteVfsDependency(filePath, content)) // 处理缓存报错的情况
            vfs.writeModule(filePath, content) // 截取template写入文件
            const expression = `getComponent(require(${stringifyRequest(loaderContext, `${filePath}?is=${name}&isTemplate`)}))`
            componentsMap[name] = expression
          })
        }
      }
      content += buildGlobalParams({ moduleId, scriptSrcMode, loaderContext, isProduction, webConfig, hasApp })
      content += getRequireScript({ ctorType, script, loaderContext })
      content += `
  export default processComponentOption({
    option: global.__mpxOptionsMap[${JSON.stringify(moduleId)}],
    ctorType: ${JSON.stringify(ctorType)},
    outputPath: ${JSON.stringify(outputPath)},
    pageConfig: ${JSON.stringify(pageConfig)},
    // @ts-ignore
    componentsMap: Object.assign(${shallowStringify(componentsMap)}, templateModules),
    componentGenerics: ${JSON.stringify(componentGenerics)},
    genericsInfo: ${JSON.stringify(genericsInfo)},
    wxsMixin: getWxsMixin(wxsModules),
    hasApp: ${hasApp}
  })\n`
      return content
    }
  })
  callback(null, {
    output
  })
}
