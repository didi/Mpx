const templateCompiler = require('../template-compiler/compiler')
const parseRequest = require('../utils/parse-request')
const addQuery = require('../utils/add-query')
const { buildComponentsMap } = require('./script-helper')
const normalize = require('../utils/normalize')
const optionProcessorPath = normalize.lib('runtime/optionProcessor')
const shallowStringify = require('../utils/shallow-stringify')
const { stringifyRequest } = require('./script-helper')
const parseQuery = require('loader-utils').parseQuery
const wxmlTemplateLoader = normalize.lib('web/wxml-template-loader')

const getRefVarNames = function (str) { // 获取元素属性上用到的动态数据keyname
  const regex = /\(([a-zA-Z_$]\w*)\)/g

  const matches = str.match(regex) || []
  const variableNames = matches.map(name => {
    const getName = /\((\w+)\)/.exec(name)
    return getName[1]
  })
  return variableNames
}

const getEventName = function (eventStr) { // 获取事件用到的动态数据keyname
  const regex = /\b(\w+)\s*\(([^)]*?)\)/g
  const regexInParams = /\b(?<!\w+\s)\w+\b(?!\s*["'])/g
  const matches = regex.exec(eventStr)
  const result = []
  if (matches) {
    result.push(matches[1])
    const matchesInParams = matches[2].match(regexInParams)
    result.push(...matchesInParams)
  }
  return result
}

module.exports = function (content) {
  this._compiler = true
  const query = parseQuery(this.resourceQuery)
  if (!query.is) {
    return content
  }
  const { resourcePath } = parseRequest(this.resource)
  const props = ['_data_v_id']
  const { root, meta } = templateCompiler.parse(content, {
    warn: (msg) => {
      this.emitWarning(
        new Error('[template compiler][' + this.resource + ']: ' + msg)
      )
    },
    error: (msg) => {
      this.emitError(
        new Error('[template compiler][' + this.resource + ']: ' + msg)
      )
    },
    mode: 'web',
    srcMode: 'wx',
    wxmlName: query.is,
    filePath: resourcePath,
    usingComponents: []
  })
  const builtInComponentsMap = {}
  if (meta.builtInComponentsMap) {
    Object.keys(meta.builtInComponentsMap).forEach((name) => {
      builtInComponentsMap[name] = {
        resource: addQuery(meta.builtInComponentsMap[name], { isComponent: true })
      }
    })
  }

  const getForValue = function (str) { // 获取v-for中遍历的子对象
    const regex = /\(([^)]+)\)/
    let forValue
    const matches = regex.exec(str)
    if (matches) {
      const matchMaps = matches[1].split(',')
      forValue = matchMaps[0]
    }
    return forValue
  }

  function parseText (text, node) { // 拼接数据时过滤一下props
    const tagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
    if (!tagRE.test(text)) {
      return text
    }
    let forValue
    let parent = node.parent
    while (parent) {
      const value = parent.attrsMap['v-for']
      if (value) {
        forValue = getForValue(value)
        break
      }
      parent = parent.parent
    }
    const tokens = []
    const rawTokens = []
    let lastIndex = (tagRE.lastIndex = 0)
    let match, index, tokenValue
    while ((match = tagRE.exec(text))) {
      index = match.index
      // push text token
      if (index > lastIndex) {
        rawTokens.push((tokenValue = text.slice(lastIndex, index)))
        tokens.push(tokenValue)
      }
      // tag token
      const exp = match[1].trim()
      if (exp !== forValue) {
        props.push(exp)
      }
      lastIndex = index + match[0].length
    }
    return text
  }
  const eventReg = /^@[a-zA-Z]+/
  let isFindRoot = false
  const componentNames = [] // 记录引用多少个组件
  function serialize (root) {
    function walk (node) {
      let result = ''
      if (node) {
        if (node.type === 3) {
          if (node.isComment) {
            result += '<!--' + node.text + '-->'
          } else {
            result += parseText(node.text, node)
          }
        }
        if (node.type === 1) {
          if (node.tag === 'wxs' || node.tag === 'import') { // wxml文件里不支持import wxs后续支持
            return ''
          } else if (node.tag !== 'temp-node') {
            if (node.tag === 'template' && !node._fakeTemplate) {
              if (node.attrsMap.name) { // template name处理逻辑
                if (isFindRoot) {
                  componentNames.push(node.attrsMap.name)
                  return ''
                }
                isFindRoot = true
                result += '<' + node.tag
              } else if (node.attrsMap.is) { // template is处理逻辑
                node.tag = 'component'
                result += '<' + node.tag
                node.attrsList.forEach((item) => {
                  if (item.name === 'is') {
                    item.name = ':is'
                    item.value = `'${item.value}'`
                  }
                  if (item.name === ':data') {
                    // const bindValue = item.value.replace(/\(([^()]+)\)/, '$1')
                    item.name = 'v-bind'
                    // item.value = item.value.replace(/\(([^()]+)\)/, '{$1}')
                    const bindValue = item.value.replace(/\(|\)/g, '')
                    item.value = bindValue ? `{${bindValue}, _data_v_id}` : '{ _data_v_id }'
                    // 获取props 清掉传入是写的空格
                    props.push(...bindValue.split(',').map((item) => item?.trim()))
                  }
                  result += ' ' + item.name
                  const value = item.value
                  if (value != null) {
                    result += '=' + templateCompiler.stringifyAttr(value)
                  }
                })
              } else { // 其他template逻辑全部丢弃
                return ''
              }
            } else {
              result += '<' + node.tag + ' :[_data_v_id]="_data_v_id"'
              let forValue
              let tagProps = []
              node.attrsList.forEach(function (attr) {
                result += ' ' + attr.name
                const value = attr.value
                if (attr.name === 'v-for') {
                  forValue = getForValue(attr.value)
                }
                if (eventReg.exec(attr.name)) { // 事件
                  const result = getEventName(attr.value)
                  tagProps.push(...result)
                } else { // 属性
                  const result = getRefVarNames(value)
                  tagProps.push(...result)
                }
                if (value != null) {
                  result += '=' + templateCompiler.stringifyAttr(value)
                }
              })
              if (forValue) {
                tagProps = tagProps.filter((item) => {
                  return item !== forValue
                })
              }
              props.push(...tagProps)
            }
            if (node.unary) {
              result += '/>'
            } else {
              result += '>'
              node.children.forEach(function (child) {
                result += walk(child)
              })
              result += '</' + node.tag + '>'
            }
          } else {
            node.children.forEach(function (child) {
              result += walk(child)
            })
          }
        }
      }
      return result
    }
    return walk(root)
  }
  const tempCompMaps = []
  const path = this.resourcePath || ''
  const template = serialize(root)
  componentNames.forEach((item) => {
    tempCompMaps[item] = {
      resource: `${path.replace(query.is, item)}?is=${item}&isTemplate`
    }
  })
  const componentsMap = buildComponentsMap({ localComponentsMap: tempCompMaps, builtInComponentsMap, loaderContext: this, jsonConfig: {} })
  let script = `\n<script>\n
    const {getComponent} = require(${stringifyRequest(this, optionProcessorPath)})\n`
  script += 'const templateModules = {}\n'
  meta.templateSrcList?.forEach((item) => {
    script += `
          const tempLoaderResult = require(${stringifyRequest(this, `!!${wxmlTemplateLoader}!${item}`)})\n
          Object.assign(templateModules, tempLoaderResult)\n`
  })
  script += `export default {
      name: '${query.is}',
      props: ${JSON.stringify([...(new Set(props))])},
      components: Object.assign(${shallowStringify(componentsMap)}, templateModules),
    }
  </script>`
  const text = template + script
  if (query.type === 'template') {
    return template
  } else if (query.type === 'script') {
    return script
  } else {
    return text
  }
}
