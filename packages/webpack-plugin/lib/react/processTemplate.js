const addQuery = require('../utils/add-query')
const parseRequest = require('../utils/parse-request')
const { matchCondition } = require('../utils/match-condition')
const loaderUtils = require('loader-utils')
const templateCompiler = require('../template-compiler/compiler')
const genNode = require('../template-compiler/gen-node-react')
const bindThis = require('../template-compiler/bind-this')

module.exports = function (template, {
  loaderContext,
  // hasScoped,
  hasComment,
  isNative,
  srcMode,
  moduleId,
  ctorType,
  usingComponents,
  componentGenerics
}, callback) {
  const mpx = loaderContext.getMpx()
  const {
    projectRoot,
    mode,
    env,
    defs,
    wxsContentMap,
    decodeHTMLText,
    externalClasses,
    checkUsingComponents,
    autoVirtualHostRules,
    customTextRules,
    hasUnoCSS,
    unoCtx
  } = mpx
  const { resourcePath } = parseRequest(loaderContext.resource)
  const builtInComponentsMap = {}

  let genericsInfo
  let output = '/* template */\n'

  output += `global.currentInject = {
  moduleId: ${JSON.stringify(moduleId)}
};\n`

  if (template) {
    // 由于远端src template资源引用的相对路径可能发生变化，暂时不支持。
    if (template.src) {
      return callback(new Error('[mpx loader][' + loaderContext.resource + ']: ' + 'template content must be inline in .mpx files!'))
    }
    if (template.lang) {
      return callback(new Error('[mpx loader][' + loaderContext.resource + ']: ' + 'template lang is not supported in trans react native mode temporarily, we will support it in the future!'))
    }

    if (template.content) {
      const templateSrcMode = template.mode || srcMode
      const warn = (msg) => {
        loaderContext.emitWarning(
          new Error('[template compiler][' + loaderContext.resource + ']: ' + msg)
        )
      }
      const error = (msg) => {
        loaderContext.emitError(
          new Error('[template compiler][' + loaderContext.resource + ']: ' + msg)
        )
      }
      const { root, meta } = templateCompiler.parse(template.content, {
        warn,
        error,
        usingComponents,
        hasComment,
        isNative,
        ctorType,
        mode,
        env,
        srcMode: templateSrcMode,
        defs,
        decodeHTMLText,
        externalClasses,
        // todo 后续输出web也采用mpx的scoped处理
        hasScoped: false,
        moduleId,
        filePath: resourcePath,
        // react中模版i18n不需要特殊处理
        i18n: null,
        checkUsingComponents,
        // web模式下全局组件不会被合入usingComponents中，故globalComponents可以传空
        globalComponents: [],
        // web模式下实现抽象组件
        componentGenerics,
        hasVirtualHost: matchCondition(resourcePath, autoVirtualHostRules),
        isCustomText: matchCondition(resourcePath, customTextRules),
        hasUnoCSS,
        unoCtx
      })

      if (meta.wxsContentMap) {
        for (const module in meta.wxsContentMap) {
          wxsContentMap[`${resourcePath}~${module}`] = meta.wxsContentMap[module]
        }
      }
      if (meta.builtInComponentsMap) {
        Object.keys(meta.builtInComponentsMap).forEach((name) => {
          builtInComponentsMap[name] = {
            resource: addQuery(meta.builtInComponentsMap[name], { isComponent: true })
          }
        })
      }
      if (meta.genericsInfo) {
        genericsInfo = meta.genericsInfo
      }

      for (const module in meta.wxsModuleMap) {
        const src = loaderUtils.urlToRequest(meta.wxsModuleMap[module], projectRoot)
        output += `var ${module} = require(${loaderUtils.stringifyRequest(this, src)});\n`
      }

      const rawCode = genNode(root)
      if (rawCode) {
        try {
          const ignoreMap = Object.assign({
            createElement: true,
            getComponent: true
          }, meta.wxsModuleMap)
          const bindResult = bindThis.transform(rawCode, {
            ignoreMap
          })
          output += `global.currentInject.render = function (createElement, getComponent) {
  return ${bindResult.code}
};\n`
        } catch (e) {
          error(`Invalid render function generated by the template, please check!
Error code:
${rawCode}
Error Detail:
${e.stack}`)
        }
      }

      if (meta.computed) {
        output += bindThis.transform(`global.currentInject.injectComputed = {${meta.computed.join(',')}};`).code + '\n'
      }

      if (meta.refs) {
        output += `global.currentInject.getRefsData = function () {return ${JSON.stringify(meta.refs)};};\n`
      }

      if (meta.options) {
        output += `global.currentInject.injectOptions = ${JSON.stringify(meta.options)};\n`
      }
    }
  }

  callback(null, {
    output,
    builtInComponentsMap,
    genericsInfo
  })
}
