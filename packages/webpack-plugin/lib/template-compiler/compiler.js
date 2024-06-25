const JSON5 = require('json5')
const he = require('he')
const config = require('../config')
const { MPX_ROOT_VIEW, MPX_APP_MODULE_ID } = require('../utils/const')
const normalize = require('../utils/normalize')
const { normalizeCondition } = require('../utils/match-condition')
const isValidIdentifierStr = require('../utils/is-valid-identifier-str')
const isEmptyObject = require('../utils/is-empty-object')
const getRulesRunner = require('../platform/index')
const addQuery = require('../utils/add-query')
const transDynamicClassExpr = require('./trans-dynamic-class-expr')
const dash2hump = require('../utils/hump-dash').dash2hump
const makeMap = require('../utils/make-map')
const { isNonPhrasingTag } = require('../utils/dom-tag-config')
const { isProductionLikeMode, generateVariableNameBySource } = require('../utils/optimize-compress')

const no = function () {
  return false
}

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'
const startTagOpen = new RegExp(('^<' + qnameCapture))
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(('^<\\/' + qnameCapture + '[^>]*>'))
const doctype = /^<!DOCTYPE [^>]+>/i
const comment = /^<!--/
const conditionalComment = /^<!\[/

let IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function (m, g) {
  IS_REGEX_CAPTURING_BROKEN = g === ''
})

// Special Elements (can contain anything)
const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = function (tag, html) {
  return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'
}

const splitRE = /\r?\n/g
const replaceRE = /./g
const isSpecialTag = makeMap('script,style,template,json', true)

function makeAttrsMap (attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value
  }
  return map
}

function createASTElement (tag, attrs, parent) {
  return {
    type: 1,
    tag: tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    parent: parent,
    children: []
  }
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

// configurable state
// 由于template处理为纯同步过程，采用闭包变量存储各种状态方便全局访问
let warn$1
let error$1
let mode
let defs
let i18n
let srcMode
let processingTemplate
let isNative
let rulesRunner
let currentEl
let injectNodes = []
let forScopes = []
let forScopesMap = {}
let hasI18n = false
let i18nInjectableComputed = []
let env
let platformGetTagNamespace
let filePath
let refId
let hasOptionalChain = false

function updateForScopesMap () {
  forScopes.forEach((scope) => {
    forScopesMap[scope.index] = 'index'
    forScopesMap[scope.item] = 'item'
  })
  return forScopesMap
}

function pushForScopes (scope) {
  forScopes.push(scope)
  updateForScopesMap()
  return scope
}

function popForScopes () {
  const scope = forScopes.pop()
  updateForScopesMap()
  return scope
}

const rulesResultMap = new Map()
const deleteErrorInResultMap = (node) => {
  rulesResultMap.delete(node)
  Array.isArray(node.children) && node.children.forEach(item => deleteErrorInResultMap(item))
}

function baseWarn (msg) {
  console.warn(('[template compiler]: ' + msg))
}

function baseError (msg) {
  console.error(('[template compiler]: ' + msg))
}

const decodeMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#39;': '\''
}
const encodedRe = /&(?:lt|gt|quot|amp|#39);/g

function decode (value) {
  if (value != null) {
    return value.replace(encodedRe, function (match) {
      return decodeMap[match]
    })
  }
}

const i18nFuncNames = ['\\$(t)', '\\$(tc)', '\\$(te)', '\\$(tm)', 't', 'tc', 'te', 'tm']
const i18nWxsPath = normalize.lib('runtime/i18n.wxs')
const i18nWxsLoaderPath = normalize.lib('wxs/i18n-loader.js')
// 添加~前缀避免wxs绝对路径在存在projectRoot时被拼接为错误路径
const i18nWxsRequest = '~' + i18nWxsLoaderPath + '!' + i18nWxsPath
const i18nModuleName = '__i18n__'
const stringifyWxsPath = '~' + normalize.lib('runtime/stringify.wxs')
const stringifyModuleName = '__stringify__'
const optionalChainWxsPath = '~' + normalize.lib('runtime/oc.wxs')
const optionalChainWxsName = '__oc__'

const tagRES = /(\{\{(?:.|\n|\r)+?\}\})(?!})/
const tagRE = /\{\{((?:.|\n|\r)+?)\}\}(?!})/
const tagREG = /\{\{((?:.|\n|\r)+?)\}\}(?!})/g

function decodeInMustache (value) {
  const sArr = value.split(tagRES)
  const ret = sArr.map((s) => {
    if (tagRES.test(s)) {
      return decode(s)
    }
    return s
  })
  return ret.join('')
}

function parseHTML (html, options) {
  const stack = []
  const expectHTML = options.expectHTML
  const isUnaryTag$$1 = options.isUnaryTag || no
  const canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no
  let index = 0
  let last, lastTag
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd))
            }
            advance(commentEnd + 3)
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // Doctype:
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // End tag:
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          const curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // Start tag:
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(lastTag, html)) {
            advance(1)
          }
          continue
        }
      }

      let text, rest, next
      if (textEnd >= 0) {
        rest = html.slice(textEnd)
        while (!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest) && !conditionalComment.test(rest)) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1)
          if (next < 0) {
            break
          }
          textEnd += next
          rest = html.slice(textEnd)
        }
        text = html.substring(0, textEnd)
        advance(textEnd)
      }

      if (textEnd < 0) {
        text = html
        html = ''
      }

      if (options.chars && text) {
        options.chars(text)
      }
    } else {
      let endTagLength = 0
      const stackedTag = lastTag.toLowerCase()
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
      const rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!--([\s\S]*?)-->/g, '$1')
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest$1.length
      html = rest$1
      parseEndTag(stackedTag, index - endTagLength, index)
    }

    if (html === last) {
      options.chars && options.chars(html)
      if (!stack.length && options.warn) {
        options.warn(('Mal-formatted tag at end of template: "' + html + '"'))
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  function advance (n) {
    index += n
    html = html.substring(n)
  }

  function parseStartTag () {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      advance(start[0].length)
      let end, attr
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push(attr)
      }
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  function handleStartTag (match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    const unary = isUnaryTag$$1(tagName) || !!unarySlash

    const l = match.attrs.length
    const attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        if (args[3] === '') {
          delete args[3]
        }
        if (args[4] === '') {
          delete args[4]
        }
        if (args[5] === '') {
          delete args[5]
        }
      }
      let value
      for (const index of [3, 4, 5]) {
        if (args[index] != null) {
          value = args[index]
          break
        }
      }
      attrs[i] = {
        name: args[1],
        value: decode(value)
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
      lastTag = tagName
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) {
      start = index
    }
    if (end == null) {
      end = index
    }

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
    }

    // Find the closest opened tag of the same type
    if (tagName) {
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; i--) {
        if ((i > pos || !tagName) && options.warn) {
          options.warn(
            ('tag <' + (stack[i].tag) + '> has no matching end tag.')
          )
        }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}

function parseComponent (content, options) {
  mode = options.mode || 'wx'
  env = options.env
  filePath = options.filePath

  const sfc = {
    template: null,
    script: null,
    json: null,
    styles: [],
    customBlocks: []
  }
  let depth = 0
  let currentBlock = null

  function start (tag, attrs, unary, start, end) {
    if (depth === 0) {
      currentBlock = {
        tag,
        content: '',
        start: end,
        attrs: attrs.reduce(function (cumulated, ref) {
          const name = ref.name
          const value = ref.value
          cumulated[name] = value || true
          return cumulated
        }, {})
      }
      if (isSpecialTag(tag)) {
        checkAttrs(currentBlock, attrs)
        // 带mode的fields只有匹配当前编译mode才会编译
        if (tag === 'style') {
          if (currentBlock.mode && currentBlock.env) {
            if (currentBlock.mode === mode && currentBlock.env === env) {
              sfc.styles.push(currentBlock)
            }
          } else if (currentBlock.mode) {
            if (currentBlock.mode === mode) {
              sfc.styles.push(currentBlock)
            }
          } else if (currentBlock.env) {
            if (currentBlock.env === env) {
              sfc.styles.push(currentBlock)
            }
          } else {
            sfc.styles.push(currentBlock)
          }
        } else {
          if (tag === 'script') {
            // 支持type写为application\/json5
            if (/^application\/json/.test(currentBlock.type) || currentBlock.name === 'json') {
              tag = 'json'
            }
            if (currentBlock.name === 'json') {
              currentBlock.useJSONJS = true
            }
          }
          if (currentBlock.mode && currentBlock.env) {
            if (currentBlock.mode === mode && currentBlock.env === env) {
              currentBlock.priority = 4
            }
          } else if (currentBlock.mode) {
            if (currentBlock.mode === mode) {
              currentBlock.priority = 3
            }
          } else if (currentBlock.env) {
            if (currentBlock.env === env) {
              currentBlock.priority = 2
            }
          } else {
            currentBlock.priority = 1
          }
          if (currentBlock.priority) {
            if (!sfc[tag] || sfc[tag].priority <= currentBlock.priority) {
              sfc[tag] = currentBlock
            }
          }
        }
      } else { // custom blocks
        sfc.customBlocks.push(currentBlock)
      }
    }
    if (!unary) {
      depth++
    }
  }

  function checkAttrs (block, attrs) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i]
      if (attr.name === 'lang') {
        block.lang = attr.value
      }
      if (attr.name === 'type') {
        block.type = attr.value
      }
      if (attr.name === 'scoped') {
        block.scoped = true
      }
      if (attr.name === 'src') {
        block.src = attr.value
      }
      if (attr.name === 'mode') {
        block.mode = attr.value
      }
      if (attr.name === 'name') {
        block.name = attr.value
      }
      if (attr.name === 'env') {
        block.env = attr.value
      }
      if (attr.name === 'setup') {
        block.setup = true
      }
    }
  }

  function end (tag, start) {
    if (depth === 1 && currentBlock) {
      currentBlock.end = start
      let text = content.slice(currentBlock.start, currentBlock.end)
      // pad content so that linters and pre-processors can output correct
      // line numbers in errors and warnings
      if (options.pad) {
        text = padContent(currentBlock, options.pad) + text
      }
      currentBlock.content = text
      currentBlock = null
    }
    depth--
  }

  function padContent (block, pad) {
    if (pad === 'space') {
      return content.slice(0, block.start).replace(replaceRE, ' ')
    } else {
      const offset = content.slice(0, block.start).split(splitRE).length
      const padChar = '\n'
      return Array(offset).join(padChar)
    }
  }

  parseHTML(content, {
    start: start,
    end: end
  })

  return sfc
}

function parse (template, options) {
  rulesResultMap.clear()
  warn$1 = options.warn || baseWarn
  error$1 = options.error || baseError
  i18nInjectableComputed = []

  const _warn = content => {
    const currentElementRuleResult = rulesResultMap.get(currentEl) || rulesResultMap.set(currentEl, {
      warnArray: [],
      errorArray: []
    }).get(currentEl)
    currentElementRuleResult.warnArray.push(content)
  }
  const _error = content => {
    const currentElementRuleResult = rulesResultMap.get(currentEl) || rulesResultMap.set(currentEl, {
      warnArray: [],
      errorArray: []
    }).get(currentEl)
    currentElementRuleResult.errorArray.push(content)
  }

  mode = options.mode || 'wx'
  env = options.env
  defs = options.defs || {}
  srcMode = options.srcMode || mode
  isNative = options.isNative
  filePath = options.filePath
  i18n = options.i18n
  refId = 0

  rulesRunner = getRulesRunner({
    mode,
    srcMode,
    type: 'template',
    testKey: 'tag',
    data: {
      usingComponents: options.usingComponents
    },
    warn: _warn,
    error: _error
  })

  injectNodes = []
  forScopes = []
  forScopesMap = {}
  hasI18n = false
  hasOptionalChain = false

  platformGetTagNamespace = options.getTagNamespace || no

  const stack = []
  let root
  const meta = {}
  let currentParent
  let multiRootError
  // 用于记录模板用到的组件，匹配引用组件，看是否有冗余
  const tagNames = new Set()

  function genTempRoot () {
    // 使用临时节点作为root，处理multi root的情况
    root = currentParent = getVirtualHostRoot(options, meta)
    stack.push(root)
  }

  parseHTML(template, {
    warn: warn$1,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldKeepComment: true,
    start: function start (tag, attrs, unary) {
      // check namespace.
      // inherit parent ns if there is one
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

      const element = createASTElement(tag, attrs, currentParent)
      if (ns) {
        element.ns = ns
      }

      if (isForbiddenTag(element)) {
        element.forbidden = true
        warn$1(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          '<' + tag + '>' + ', as they will not be parsed.'
        )
      }

      // multi root
      if (!currentParent) genTempRoot()

      currentParent.children.push(element)
      element.parent = currentParent
      processElement(element, root, options, meta)
      tagNames.add(element.tag)

      if (!unary) {
        currentParent = element
        stack.push(element)
      } else {
        element.unary = true
        closeElement(element, meta, options)
      }
    },

    end: function end () {
      // remove trailing whitespace
      const element = stack[stack.length - 1]
      if (element) {
        const lastNode = element.children[element.children.length - 1]
        if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
          element.children.pop()
        }
        // pop stack
        stack.pop()
        currentParent = stack[stack.length - 1]
        closeElement(element, meta, options)
      }
    },

    chars: function chars (text) {
      if (!currentParent) genTempRoot()

      const children = currentParent.children
      if (currentParent.tag !== 'text') {
        text = text.trim()
      }

      if ((!config[mode].wxs || currentParent.tag !== config[mode].wxs.tag) && options.decodeHTMLText) {
        text = he.decode(text)
      }

      if (text) {
        if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          const el = {
            type: 3,
            // 支付宝小程序模板解析中未对Mustache进行特殊处理，无论是否decode都会解析失败，无解，只能支付宝侧进行修复
            text: decodeInMustache(text),
            parent: currentParent
          }
          children.push(el)
          processText(el)
        }
      }
    },
    comment: function comment (text) {
      if (!currentParent) genTempRoot()
      if (options.hasComment || /mpx_config_/.test(text)) {
        currentParent.children.push({
          type: 3,
          text: text,
          parent: currentParent,
          isComment: true
        })
      }
    }
  })

  if (multiRootError) {
    error$1('Template fields should has one single root, considering wrapping your template content with <view> or <text> tag!')
  }

  if (hasI18n) {
    if (i18nInjectableComputed.length) {
      meta.computed = (meta.computed || []).concat(i18nInjectableComputed)
    } else {
      injectWxs(meta, i18nModuleName, i18nWxsRequest)
    }
  }

  if (hasOptionalChain) {
    injectWxs(meta, optionalChainWxsName, optionalChainWxsPath)
  }

  injectNodes.forEach((node) => {
    addChild(root, node, true)
  })

  rulesResultMap.forEach((val) => {
    Array.isArray(val.warnArray) && val.warnArray.forEach(item => warn$1(item))
    Array.isArray(val.errorArray) && val.errorArray.forEach(item => error$1(item))
  })

  if (!tagNames.has('component') && options.checkUsingComponents) {
    const arr = []
    options.usingComponents.forEach((item) => {
      if (!tagNames.has(item) && !options.globalComponents.includes(item) && !options.componentPlaceholder.includes(item)) {
        arr.push(item)
      }
    })
    arr.length && warn$1(`\n ${options.filePath} \n 组件 ${arr.join(' | ')} 注册了，但是未被对应的模板引用，建议删除！`)
  }

  if (options.optimizeSize && isProductionLikeMode(this)) {
    processOptimizeSize(root, options)
  }

  return {
    root,
    meta
  }
}

function getTempNode () {
  return createASTElement('temp-node', [])
}

function addChild (parent, newChild, before) {
  parent.children = parent.children || []
  if (before) {
    parent.children.unshift(newChild)
  } else {
    parent.children.push(newChild)
  }
  newChild.parent = parent
}

function getAndRemoveAttr (el, name, removeFromMap = true) {
  let val, has
  const list = el.attrsList
  for (let i = 0, l = list.length; i < l; i++) {
    if (list[i].name === name) {
      val = list[i].value
      has = true
      list.splice(i, 1)
      break
    }
  }
  if (removeFromMap && val === el.attrsMap[name]) {
    delete el.attrsMap[name]
  }
  return {
    has,
    val
  }
}

function addAttrs (el, attrs) {
  const list = el.attrsList
  const map = el.attrsMap
  for (let i = 0, l = attrs.length; i < l; i++) {
    list.push(attrs[i])
    map[attrs[i].name] = attrs[i].value
  }
}

function modifyAttr (el, name, val) {
  el.attrsMap[name] = val
  const list = el.attrsList
  for (let i = 0, l = list.length; i < l; i++) {
    if (list[i].name === name) {
      list[i].value = val
      break
    }
  }
}

function moveBaseDirective (target, from, isDelete = true) {
  target.for = from.for
  target.if = from.if
  target.elseif = from.elseif
  target.else = from.else
  if (isDelete) {
    delete from.for
    delete from.if
    delete from.elseif
    delete from.else
  }
}

function stringify (str) {
  if (mode === 'web') str = str.replace(/'/g, '"')
  return JSON.stringify(str)
}

// function processLifecycleHack (el, options) {
//   if (isComponentNode(el,options)) {
//     if (el.if) {
//       el.if = {
//         raw: `{{${el.if.exp} && mpxLifecycleHack}}`,
//         exp: `${el.if.exp} && mpxLifecycleHack`
//       }
//     } else if (el.elseif) {
//       el.elseif = {
//         raw: `{{${el.elseif.exp} && mpxLifecycleHack}}`,
//         exp: `${el.elseif.exp} && mpxLifecycleHack`
//       }
//     } else if (el.else) {
//       el.elseif = {
//         raw: '{{mpxLifecycleHack}}',
//         exp: 'mpxLifecycleHack'
//       }
//       delete el.else
//     } else {
//       el.if = {
//         raw: '{{mpxLifecycleHack}}',
//         exp: 'mpxLifecycleHack'
//       }
//     }
//   }
// }

const genericRE = /^generic:(.+)$/

function processComponentGenericsForWeb (el, options, meta) {
  if (options.componentGenerics && options.componentGenerics[el.tag]) {
    const generic = dash2hump(el.tag)
    el.tag = 'component'
    addAttrs(el, [{
      name: ':is',
      value: `generic${generic}`
    }])
  }

  let hasGeneric = false

  const genericHash = options.moduleId

  el.attrsList.forEach((attr) => {
    if (genericRE.test(attr.name)) {
      getAndRemoveAttr(el, attr.name)
      addAttrs(el, [{
        name: attr.name.replace(':', ''),
        value: attr.value
      }])
      hasGeneric = true
      addGenericInfo(meta, genericHash, attr.value)
    }
  })

  if (hasGeneric) {
    addAttrs(el, [{
      name: 'generichash',
      value: genericHash
    }])
  }
}

function addGenericInfo (meta, genericHash, genericValue) {
  if (!meta.genericsInfo) {
    meta.genericsInfo = {
      hash: genericHash,
      map: {}
    }
  }
  meta.genericsInfo.map[genericValue] = true
}

function processComponentIs (el, options) {
  if (el.tag !== 'component') {
    return
  }

  options = options || {}
  el.components = options.usingComponents
  if (!el.components) {
    warn$1('Component in which <component> tag is used must have a nonblank usingComponents field')
  }

  const is = getAndRemoveAttr(el, 'is').val
  if (is) {
    el.is = parseMustacheWithContext(is).result
  } else {
    warn$1('<component> tag should have attrs[is].')
  }
}

const eventIdentifier = '__mpx_event__'

function parseFuncStr2 (str) {
  const funcRE = /^([^()]+)(\((.*)\))?/
  const match = funcRE.exec(str)
  if (match) {
    const funcName = parseMustacheWithContext(match[1]).result
    const hasArgs = !!match[2]
    let args = match[3] ? `,${match[3]}` : ''
    const ret = /(,|^)\s*(\$event)\s*(,|$)/.exec(args)
    if (ret) {
      const subIndex = ret[0].indexOf('$event')
      if (subIndex) {
        const index1 = ret.index + subIndex
        const index2 = index1 + 6
        args = args.substring(0, index1) + stringify(eventIdentifier) + args.substring(index2)
      }
    }
    return {
      hasArgs,
      expStr: `[${funcName + args}]`
    }
  }
}

function stringifyWithResolveComputed (modelValue) {
  const result = []
  let inString = false
  const computedStack = []
  let fragment = ''

  for (let i = 0; i < modelValue.length; i++) {
    const char = modelValue[i]
    if (inString) {
      if (char === inString) {
        inString = false
      }
    } else if (char === '"' || char === '\'') {
      inString = char
    } else if (char === '[') {
      computedStack.push(char)
      if (computedStack.length === 1) {
        fragment += '.'
        result.push(stringify(fragment))
        fragment = ''
        continue
      }
    } else if (computedStack.length) {
      if (char === ']') {
        computedStack.pop()
        if (computedStack.length === 0) {
          result.push(fragment)
          fragment = ''
          continue
        }
      }
    }
    fragment += char
  }
  if (fragment !== '') {
    result.push(stringify(fragment))
  }
  return result.join('+')
}

function processBindEvent (el, options) {
  const eventConfigMap = {}
  el.attrsList.forEach(function (attr) {
    const parsedEvent = config[mode].event.parseEvent(attr.name)

    if (parsedEvent) {
      const type = parsedEvent.eventName
      const modifiers = (parsedEvent.modifier || '').split('.')
      const parsedFunc = parseFuncStr2(attr.value)
      if (parsedFunc) {
        if (!eventConfigMap[type]) {
          eventConfigMap[type] = {
            rawName: attr.name,
            configs: []
          }
        }
        eventConfigMap[type].configs.push(parsedFunc)
        if (modifiers.indexOf('proxy') > -1 || options.forceProxyEvent) {
          eventConfigMap[type].proxy = true
        }
      }
    }
  })

  const modelExp = getAndRemoveAttr(el, config[mode].directive.model).val
  if (modelExp) {
    const match = tagRE.exec(modelExp)
    if (match) {
      const modelProp = getAndRemoveAttr(el, config[mode].directive.modelProp).val || config[mode].event.defaultModelProp
      const modelEvent = getAndRemoveAttr(el, config[mode].directive.modelEvent).val || config[mode].event.defaultModelEvent
      const modelValuePathRaw = getAndRemoveAttr(el, config[mode].directive.modelValuePath).val
      const modelValuePath = modelValuePathRaw === undefined ? config[mode].event.defaultModelValuePath : modelValuePathRaw
      const modelFilter = getAndRemoveAttr(el, config[mode].directive.modelFilter).val
      let modelValuePathArr
      try {
        modelValuePathArr = JSON5.parse(modelValuePath)
      } catch (e) {
        if (modelValuePath === '') {
          modelValuePathArr = []
        } else {
          modelValuePathArr = modelValuePath.split('.')
        }
      }
      if (!isValidIdentifierStr(modelEvent)) {
        warn$1(`EventName ${modelEvent} which is used in ${config[mode].directive.model} must be a valid identifier!`)
        return
      }
      const modelValue = match[1].trim()
      const stringifiedModelValue = stringifyWithResolveComputed(modelValue)
      // if (forScopes.length) {
      //   stringifiedModelValue = stringifyWithResolveComputed(modelValue)
      // } else {
      //   stringifiedModelValue = stringify(modelValue)
      // }

      if (!eventConfigMap[modelEvent]) {
        eventConfigMap[modelEvent] = {
          configs: []
        }
      }
      eventConfigMap[modelEvent].configs.unshift({
        hasArgs: true,
        expStr: `[${stringify('__model')},${stringifiedModelValue},${stringify(eventIdentifier)},${stringify(modelValuePathArr)},${stringify(modelFilter)}]`
      })
      addAttrs(el, [
        {
          name: modelProp,
          value: modelExp
        }
      ])
    }
  }

  for (const type in eventConfigMap) {
    let needBind = false
    let { configs, rawName, proxy } = eventConfigMap[type]
    delete eventConfigMap[type]
    if (proxy) {
      needBind = true
    } else if (configs.length > 1) {
      needBind = true
    } else if (configs.length === 1) {
      needBind = !!configs[0].hasArgs
    }

    const escapedType = dash2hump(type)
    // 排除特殊情况
    if (!isValidIdentifierStr(escapedType)) {
      warn$1(`EventName ${type} which need be framework proxy processed must be a valid identifier!`)
      needBind = false
    }

    if (needBind) {
      if (rawName) {
        // 清空原始事件绑定
        let has
        do {
          has = getAndRemoveAttr(el, rawName).has
        } while (has)
        // 清除修饰符
        rawName = rawName.replace(/\..*/, '')
      }

      addAttrs(el, [
        {
          name: rawName || config[mode].event.getEvent(type),
          value: '__invoke'
        }
      ])
      eventConfigMap[escapedType] = configs.map((item) => {
        return item.expStr
      })
    }
  }

  if (!isEmptyObject(eventConfigMap)) {
    addAttrs(el, [{
      name: 'data-eventconfigs',
      value: `{{${config[mode].event.shallowStringify(eventConfigMap)}}}`
    }])
  }
}

function wrapMustache (val) {
  return val && !tagRE.test(val) ? `{{${val}}}` : val
}

function parseMustacheWithContext (raw = '') {
  return parseMustache(raw, (exp) => {
    if (defs) {
      // eval处理的话，和别的判断条件，比如运行时的判断混用情况下得不到一个结果，还是正则替换
      const defKeys = Object.keys(defs)
      defKeys.forEach((defKey) => {
        const defRE = new RegExp(`\\b${defKey}\\b`)
        const defREG = new RegExp(`\\b${defKey}\\b`, 'g')
        if (defRE.test(exp)) {
          exp = exp.replace(defREG, stringify(defs[defKey]))
        }
      })
    }

    exp = parseOptionChain(exp)
    if (i18n) {
      for (const i18nFuncName of i18nFuncNames) {
        const funcNameRE = new RegExp(`(?<![A-Za-z0-9_$.])${i18nFuncName}\\(`)
        const funcNameREG = new RegExp(`(?<![A-Za-z0-9_$.])${i18nFuncName}\\(`, 'g')
        if (funcNameRE.test(exp)) {
          if (i18n.useComputed || !i18nFuncName.startsWith('\\$')) {
            const i18nInjectComputedKey = `_i${i18nInjectableComputed.length + 1}`
            i18nInjectableComputed.push(`${i18nInjectComputedKey} () {\nreturn ${exp.trim()}}`)
            exp = i18nInjectComputedKey
          } else {
            exp = exp.replace(funcNameREG, `${i18nModuleName}.$1(null, _l, _fl, `)
          }
          hasI18n = true
          break
        }
      }
    }

    return exp
  })
}

function parseMustache (raw = '', expHandler = exp => exp, strHandler = str => str) {
  let replaced = false
  if (tagRE.test(raw)) {
    const ret = []
    let lastLastIndex = 0
    let match
    while (match = tagREG.exec(raw)) {
      const pre = raw.substring(lastLastIndex, match.index)
      if (pre) {
        const pre2 = strHandler(pre)
        if (pre2 !== pre) replaced = true
        if (pre2) ret.push(stringify(pre2))
      }

      const exp = match[1].trim()
      if (exp) {
        const exp2 = expHandler(exp)
        if (exp2 !== exp) replaced = true
        if (exp2) ret.push(`(${exp2})`)
      }

      lastLastIndex = tagREG.lastIndex
    }

    const post = raw.substring(lastLastIndex)
    if (post) {
      const post2 = strHandler(post)
      if (post2 !== post) replaced = true
      if (post2) ret.push(stringify(post2))
    }

    let result
    if (ret.length === 1) {
      result = ret[0]
    } else {
      result = `(${ret.join('+')})`
    }

    return {
      result,
      hasBinding: true,
      val: replaced ? `{{${result}}}` : raw,
      replaced
    }
  }

  const raw2 = strHandler(raw)
  if (raw2 !== raw) replaced = true

  return {
    result: stringify(raw2),
    hasBinding: false,
    val: raw2,
    replaced
  }
}

function addExp (el, exp, isProps) {
  if (exp) {
    if (!el.exps) {
      el.exps = []
    }
    el.exps.push({ exp, isProps })
  }
}

function processIf (el) {
  let val = getAndRemoveAttr(el, config[mode].directive.if).val
  if (val) {
    if (mode === 'swan') val = wrapMustache(val)
    const parsed = parseMustacheWithContext(val)
    el.if = {
      raw: parsed.val,
      exp: parsed.result
    }
  } else if (val = getAndRemoveAttr(el, config[mode].directive.elseif).val) {
    if (mode === 'swan') val = wrapMustache(val)
    const parsed = parseMustacheWithContext(val)
    el.elseif = {
      raw: parsed.val,
      exp: parsed.result
    }
  } else if (getAndRemoveAttr(el, config[mode].directive.else).has) {
    el.else = true
  }
}

function processIfForWeb (el) {
  let val = getAndRemoveAttr(el, config[mode].directive.if).val
  if (val) {
    el.if = {
      raw: val,
      exp: val
    }
  } else if (val = getAndRemoveAttr(el, config[mode].directive.elseif).val) {
    el.elseif = {
      raw: val,
      exp: val
    }
  } else if (getAndRemoveAttr(el, config[mode].directive.else).has) {
    el.else = true
  }
}

const swanForInRe = /^\s*(\w+)(?:\s*,\s*(\w+))?\s+in\s+(\S+)(?:\s+trackBy\s+(\S+))?\s*$/

function processFor (el) {
  let val = getAndRemoveAttr(el, config[mode].directive.for).val
  if (val) {
    let matched
    if (mode === 'swan' && (matched = swanForInRe.exec(val))) {
      el.for = {
        raw: val,
        exp: matched[3],
        item: matched[1] || 'item',
        index: matched[2] || 'index'
      }
    } else {
      if (mode === 'swan') val = wrapMustache(val)
      const parsed = parseMustacheWithContext(val)
      el.for = {
        raw: parsed.val,
        exp: parsed.result
      }
      if (val = getAndRemoveAttr(el, config[mode].directive.forIndex).val) {
        el.for.index = val
      }
      if (val = getAndRemoveAttr(el, config[mode].directive.forItem).val) {
        el.for.item = val
      }
      if (val = getAndRemoveAttr(el, config[mode].directive.key).val) {
        el.for.key = val
      }
    }
    pushForScopes({
      index: el.for.index || 'index',
      item: el.for.item || 'item'
    })
  }
}

function processRef (el, options, meta) {
  const val = getAndRemoveAttr(el, config[mode].directive.ref).val
  const type = isComponentNode(el, options) ? 'component' : 'node'
  if (val) {
    if (!meta.refs) {
      meta.refs = []
    }
    const all = !!forScopes.length
    // swan的page中进行selectComponent匹配时会将类名前面的__去除掉，refClassName用__开头会导致swan在page中的组件refs失效
    let refClassName = `ref_${val}_${++refId}`
    // 支付宝中对于node进行的my.createSelectorQuery是在全局范围内进行的，需添加运行时组件id确保selector唯一
    if (type === 'node' && mode === 'ali') {
      refClassName += '_{{mpxCid}}'
    }
    let className = getAndRemoveAttr(el, 'class').val
    className = className ? className + ' ' + refClassName : refClassName
    addAttrs(el, [{
      name: 'class',
      value: className
    }])
    meta.refs.push({
      key: val,
      selector: `.${refClassName}`,
      type,
      all
    })
  }
}

function addWxsModule (meta, module, src) {
  if (!meta.wxsModuleMap) {
    meta.wxsModuleMap = {}
  }
  if (meta.wxsModuleMap[module]) return true
  meta.wxsModuleMap[module] = src
}

function addWxsContent (meta, module, content) {
  if (!meta.wxsContentMap) {
    meta.wxsContentMap = {}
  }
  if (meta.wxsContentMap[module]) return true
  meta.wxsContentMap[module] = content
}

function postProcessWxs (el, meta) {
  if (el.tag === config[mode].wxs.tag) {
    const module = el.attrsMap[config[mode].wxs.module]
    if (module) {
      let src
      if (el.attrsMap[config[mode].wxs.src]) {
        src = el.attrsMap[config[mode].wxs.src]
      } else {
        const content = el.children.filter((child) => {
          return child.type === 3 && !child.isComment
        }).map(child => child.text).join('\n')
        addWxsContent(meta, module, content)

        const fakeRequest = filePath + config[mode].wxs.ext
        src = addQuery(`~${fakeRequest}!=!${filePath}`, {
          wxsModule: module
        })
      }
      // wxs hoist
      injectWxs(meta, module, src)
      removeNode(el, true)
    }
  }
}

const spreadREG = /\{\s*\.\.\.\s*([^,{]+?)\s*\}/g

function processAttrs (el, options) {
  el.attrsList.forEach((attr) => {
    const isTemplateData = el.tag === 'template' && attr.name === 'data'
    const needWrap = isTemplateData && mode !== 'swan'
    const value = needWrap ? `{${attr.value}}` : attr.value
    const parsed = parseMustacheWithContext(value)
    if (parsed.hasBinding) {
      // 该属性判断用于提供给运行时对于计算属性作为props传递时提出警告
      const isProps = isComponentNode(el, options) && !(attr.name === 'class' || attr.name === 'style')
      let result = parsed.result
      if (isTemplateData) {
        result = result.replace(spreadREG, '$1')
      }
      addExp(el, result, isProps)
      if (parsed.replaced) {
        modifyAttr(el, attr.name, needWrap ? parsed.val.slice(1, -1) : parsed.val)
      }
    }
  })
}

function postProcessFor (el) {
  if (el.for) {
    /*
      对百度小程序同时带有if和for的指令外套一层block，并将for放到外层
      这个操作主要是因为百度小程序不支持这两个directive在同级使用
     */
    if (el.if && mode === 'swan') {
      const block = createASTElement('block', [])
      replaceNode(el, block, true)
      block.for = el.for
      delete el.for
      addChild(block, el)
      el = block
    }

    const attrs = [
      {
        name: config[mode].directive.for,
        value: el.for.raw
      }
    ]
    // 对于swan的for in进行特殊处理
    if (mode !== 'swan' || !swanForInRe.test(el.for.raw)) {
      if (el.for.index) {
        attrs.push({
          name: config[mode].directive.forIndex,
          value: el.for.index
        })
      }
      if (el.for.item) {
        attrs.push({
          name: config[mode].directive.forItem,
          value: el.for.item
        })
      }
      if (el.for.key) {
        attrs.push({
          name: config[mode].directive.key,
          value: el.for.key
        })
      }
    }
    addAttrs(el, attrs)
    popForScopes()
  }
}

function evalExp (exp) {
  let result = { success: false }
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return ${exp};`)
    result = {
      success: true,
      result: fn()
    }
  } catch (e) {
  }
  return result
}

function postProcessIf (el) {
  let attrs, result, prevNode
  if (el.if) {
    result = evalExp(el.if.exp)
    if (result.success) {
      if (result.result) {
        delete el.if
        el._if = true
      } else {
        replaceNode(el, getTempNode())._if = false
      }
    } else {
      attrs = [{
        name: config[mode].directive.if,
        value: el.if.raw
      }]
    }
  } else if (el.elseif) {
    prevNode = findPrevNode(el)
    if (prevNode._if === true) {
      removeNode(el)
    } else if (prevNode._if === false) {
      // 当做if处理
      el.if = el.elseif
      delete el.elseif
      postProcessIf(el)
    } else {
      result = evalExp(el.elseif.exp)
      if (result.success) {
        if (result.result) {
          // 当做else处理
          delete el.elseif
          el._if = el.else = true
          postProcessIf(el)
        } else {
          removeNode(el)
        }
      } else {
        attrs = [{
          name: config[mode].directive.elseif,
          value: el.elseif.raw
        }]
      }
    }
  } else if (el.else) {
    prevNode = findPrevNode(el)
    if (prevNode._if === true) {
      removeNode(el)
    } else if (prevNode._if === false) {
      delete el.else
    } else {
      attrs = [{
        name: config[mode].directive.else,
        value: undefined
      }]
    }
  }
  if (attrs) {
    addAttrs(el, attrs)
  }
}

function processText (el) {
  if (el.type !== 3 || el.isComment) {
    return
  }
  const parsed = parseMustacheWithContext(el.text)
  if (parsed.hasBinding) {
    addExp(el, parsed.result)
  }
  el.text = parsed.val
}

// function injectComputed (el, meta, type, body) {
//   if (!meta.computed) {
//     meta.computed = []
//     meta.computedId = 0
//   }
//   let injectName = `__injected_${type}_${++meta.computedId}`
//   meta.computed.push(`${injectName}: function(){\n${body}}`)
//   addAttrs(el, [{
//     name: type,
//     value: `{{${injectName}}}`
//   }])
// }

function injectWxs (meta, module, src) {
  if (addWxsModule(meta, module, src)) {
    return
  }
  const wxsNode = createASTElement(config[mode].wxs.tag, [
    {
      name: config[mode].wxs.module,
      value: module
    },
    {
      name: config[mode].wxs.src,
      value: src
    }
  ])
  injectNodes.push(wxsNode)
}

function processClass (el, meta) {
  const type = 'class'
  const needEx = el.tag.startsWith('th-')
  const targetType = needEx ? 'ex-' + type : type
  const dynamicClass = getAndRemoveAttr(el, config[mode].directive.dynamicClass).val
  let staticClass = getAndRemoveAttr(el, type).val || ''
  staticClass = staticClass.replace(/\s+/g, ' ')
  if (dynamicClass) {
    const staticClassExp = parseMustacheWithContext(staticClass).result
    const dynamicClassExp = transDynamicClassExpr(parseMustacheWithContext(dynamicClass).result, {
      error: error$1
    })
    addAttrs(el, [{
      name: targetType,
      // swan中externalClass是通过编译时静态实现，因此需要保留原有的staticClass形式避免externalClass失效
      value: mode === 'swan' && staticClass ? `${staticClass} {{${stringifyModuleName}.stringifyClass('', ${dynamicClassExp})}}` : `{{${stringifyModuleName}.stringifyClass(${staticClassExp}, ${dynamicClassExp})}}`
    }])
    injectWxs(meta, stringifyModuleName, stringifyWxsPath)
  } else if (staticClass) {
    addAttrs(el, [{
      name: targetType,
      value: staticClass
    }])
  }

  if (needEx && staticClass) {
    const refClassRegExp = /ref_(\w+)_(\d+)/
    const match = staticClass.match(refClassRegExp)
    if (match) {
      addAttrs(el, [{
        name: 'class',
        value: match[0]
      }])
    }
  }
}

function processStyle (el, meta) {
  const type = 'style'
  const targetType = el.tag.startsWith('th-') ? 'ex-' + type : type
  const dynamicStyle = getAndRemoveAttr(el, config[mode].directive.dynamicStyle).val
  let staticStyle = getAndRemoveAttr(el, type).val || ''
  staticStyle = staticStyle.replace(/\s+/g, ' ')
  if (dynamicStyle) {
    const staticStyleExp = parseMustacheWithContext(staticStyle).result
    const dynamicStyleExp = parseMustacheWithContext(dynamicStyle).result
    addAttrs(el, [{
      name: targetType,
      value: `{{${stringifyModuleName}.stringifyStyle(${staticStyleExp}, ${dynamicStyleExp})}}`
    }])
    injectWxs(meta, stringifyModuleName, stringifyWxsPath)
  } else if (staticStyle) {
    addAttrs(el, [{
      name: targetType,
      value: staticStyle
    }])
  }
}

function isRealNode (el) {
  const virtualNodeTagMap = ['block', 'template', 'import', config[mode].wxs.tag].reduce((map, item) => {
    map[item] = true
    return map
  }, {})
  return !virtualNodeTagMap[el.tag]
}

function isComponentNode (el, options) {
  return options.usingComponents.indexOf(el.tag) !== -1 || el.tag === 'component'
}

function processAliExternalClassesHack (el, options) {
  const isComponent = isComponentNode(el, options)
  // 处理组件externalClass多层传递
  const classLikeAttrNames = isComponent ? ['class'].concat(options.externalClasses) : ['class']
  classLikeAttrNames.forEach((classLikeAttrName) => {
    let classLikeAttrValue = getAndRemoveAttr(el, classLikeAttrName).val
    if (classLikeAttrValue) {
      options.externalClasses.forEach((className) => {
        const reg = new RegExp('\\b' + className + '\\b', 'g')
        const replacement = dash2hump(className)
        classLikeAttrValue = classLikeAttrValue.replace(reg, `{{${replacement}||''}}`)
      })
      addAttrs(el, [{
        name: classLikeAttrName,
        value: classLikeAttrValue
      }])
    }
  })

  if (options.hasScoped && isComponent) {
    options.externalClasses.forEach((className) => {
      const externalClass = getAndRemoveAttr(el, className).val
      if (externalClass) {
        addAttrs(el, [{
          name: className,
          value: `${externalClass} ${options.moduleId}`
        }])
      }
    })
  }
}

// externalClasses只能模拟静态传递
function processWebExternalClassesHack (el, options) {
  const staticClass = getAndRemoveAttr(el, 'class').val
  if (staticClass) {
    const classNames = staticClass.split(/\s+/)
    const replacements = []
    options.externalClasses.forEach((className) => {
      const index = classNames.indexOf(className)
      if (index > -1) {
        replacements.push(`$attrs[${stringify(className)}]`)
        classNames.splice(index, 1)
      }
    })

    if (classNames.length) {
      addAttrs(el, [{
        name: 'class',
        value: classNames.join(' ')
      }])
    }

    if (replacements.length) {
      const dynamicClass = getAndRemoveAttr(el, ':class').val
      if (dynamicClass) replacements.push(dynamicClass)

      addAttrs(el, [{
        name: ':class',
        value: `[${replacements}]`
      }])
    }
  }

  // 处理externalClasses多层透传
  const isComponent = isComponentNode(el, options)
  if (isComponent) {
    options.externalClasses.forEach((classLikeAttrName) => {
      const classLikeAttrValue = getAndRemoveAttr(el, classLikeAttrName).val
      if (classLikeAttrValue) {
        const classNames = classLikeAttrValue.split(/\s+/)
        const replacements = []
        options.externalClasses.forEach((className) => {
          const index = classNames.indexOf(className)
          if (index > -1) {
            replacements.push(`$attrs[${stringify(className)}]`)
            classNames.splice(index, 1)
          }
        })

        if (classNames.length) {
          replacements.unshift(stringify(classNames.join(' ')))
        }

        addAttrs(el, [{
          name: ':' + classLikeAttrName,
          value: `[${replacements}].join(' ')`
        }])
      }
    })
  }
}

function processScoped (el, options) {
  if (options.hasScoped && isRealNode(el)) {
    const moduleId = options.moduleId
    const rootModuleId = options.isComponent ? '' : MPX_APP_MODULE_ID // 处理app全局样式对页面的影响
    const staticClass = getAndRemoveAttr(el, 'class').val
    addAttrs(el, [{
      name: 'class',
      value: `${staticClass || ''} ${moduleId} ${rootModuleId}`
    }])
  }
}

const builtInComponentsPrefix = '@mpxjs/webpack-plugin/lib/runtime/components'

function processBuiltInComponents (el, meta) {
  if (el.isBuiltIn) {
    if (!meta.builtInComponentsMap) {
      meta.builtInComponentsMap = {}
    }
    const tag = el.tag
    if (!meta.builtInComponentsMap[tag]) {
      meta.builtInComponentsMap[tag] = `${builtInComponentsPrefix}/${mode}/${tag}.vue`
    }
  }
}

function processAliAddComponentRootView (el, options) {
  const processAttrsConditions = [
    { condition: /^(on|catch)Tap$/, action: 'clone' },
    { condition: /^(on|catch)TouchStart$/, action: 'clone' },
    { condition: /^(on|catch)TouchMove$/, action: 'clone' },
    { condition: /^(on|catch)TouchEnd$/, action: 'clone' },
    { condition: /^(on|catch)TouchCancel$/, action: 'clone' },
    { condition: /^(on|catch)LongTap$/, action: 'clone' },
    { condition: /^data-/, action: 'clone' },
    { condition: /^id$/, action: 'clone' },
    { condition: /^style$/, action: 'move' },
    { condition: /^slot$/, action: 'move' }
  ]
  const processAppendAttrsRules = [
    { name: 'class', value: `${MPX_ROOT_VIEW} host-${options.moduleId}` }
  ]
  const newElAttrs = []
  const allAttrs = cloneAttrsList(el.attrsList)

  function processClone (attr) {
    newElAttrs.push(attr)
  }

  function processMove (attr) {
    getAndRemoveAttr(el, attr.name)
    newElAttrs.push(attr)
  }

  function processAppendRules (el) {
    processAppendAttrsRules.forEach((rule) => {
      const getNeedAppendAttrValue = el.attrsMap[rule.name]
      const value = getNeedAppendAttrValue ? getNeedAppendAttrValue + ' ' + rule.value : rule.value
      newElAttrs.push({
        name: rule.name,
        value
      })
    })
  }

  processAttrsConditions.forEach(item => {
    const matcher = normalizeCondition(item.condition)
    allAttrs.forEach((attr) => {
      if (matcher(attr.name)) {
        if (item.action === 'clone') {
          processClone(attr)
        } else if (item.action === 'move') {
          processMove(attr)
        }
      }
    })
  })

  processAppendRules(el)
  const componentWrapView = createASTElement('view', newElAttrs)
  moveBaseDirective(componentWrapView, el)
  if (el.is && el.components) {
    el = postProcessComponentIs(el)
  }

  replaceNode(el, componentWrapView, true)
  addChild(componentWrapView, el)
  return componentWrapView
}

// 有virtualHost情况wx组件注入virtualHost。无virtualHost阿里组件注入root-view。其他跳过。
function getVirtualHostRoot (options, meta) {
  if (srcMode === 'wx') {
    if (options.isComponent) {
      if ((mode === 'wx') && options.hasVirtualHost) {
        // wx组件注入virtualHost配置
        !meta.options && (meta.options = {})
        meta.options.virtualHost = true
      }
      if ((mode === 'web') && !options.hasVirtualHost) {
        // ali组件根节点实体化
        const rootView = createASTElement('view', [
          {
            name: 'class',
            value: `${MPX_ROOT_VIEW} host-${options.moduleId}`
          },
          {
            name: 'v-on',
            value: '$listeners'
          }
        ])
        processElement(rootView, rootView, options, meta)
        return rootView
      }
    }
    if (options.isPage) {
      if (mode === 'web') {
        return createASTElement('page', [])
      }
    }
  }
  return getTempNode()
}

function processShow (el, options, root) {
  // 开启 virtualhost 全部走 props 传递处理
  // 未开启 virtualhost 直接绑定 display:none 到节点上
  let { val: show, has } = getAndRemoveAttr(el, config[mode].directive.show)
  if (mode === 'swan') show = wrapMustache(show)
  if (has && show === undefined) {
    error$1(`Attrs ${config[mode].directive.show} should have a value `)
  }
  if (options.hasVirtualHost) {
    if (options.isComponent && el.parent === root && isRealNode(el)) {
      if (show !== undefined) {
        show = `{{${parseMustacheWithContext(show).result}&&mpxShow}}`
      } else {
        show = '{{mpxShow}}'
      }
    }
    if (isComponentNode(el, options) && show !== undefined) {
      if (show === '') {
        show = '{{false}}'
      }
      addAttrs(el, [{
        name: 'mpxShow',
        value: show
      }])
    } else {
      processShowStyle()
    }
  } else {
    processShowStyle()
  }

  function processShowStyle () {
    if (show !== undefined) {
      const showExp = parseMustacheWithContext(show).result
      let oldStyle = getAndRemoveAttr(el, 'style').val
      oldStyle = oldStyle ? oldStyle + ';' : ''
      addAttrs(el, [{
        name: 'style',
        value: `${oldStyle}{{${showExp}?'':'display:none;'}}`
      }])
    }
  }
}

function processTemplate (el) {
  if (el.tag === 'template' && el.attrsMap.name) {
    el.isTemplate = true
    processingTemplate = true
    return true
  }
}

function postProcessTemplate (el) {
  if (el.isTemplate) {
    processingTemplate = false
    return true
  }
}

const isValidMode = makeMap('wx,ali,swan,tt,qq,web,qa,jd,dd,tenon,noMode')

function isValidModeP (i) {
  return isValidMode(i[0] === '_' ? i.slice(1) : i)
}

const wrapRE = /^\((.*)\)$/

function processAtMode (el) {
  // 父节点的atMode匹配状态不应该影响子节点，atMode的影响范围应该限制在当前节点本身
  // if (el.parent && el.parent._atModeStatus) {
  //   el._atModeStatus = el.parent._atModeStatus
  // }

  const attrsListClone = cloneAttrsList(el.attrsList)
  attrsListClone.forEach(item => {
    const attrName = item.name || ''
    if (!attrName || attrName.indexOf('@') === -1) {
      return
    }
    // @wx|ali
    // hello@wx|ali
    // hello@:didi
    // hello@wx:didi:qingju:chengxin|ali
    // hello@(wx:didi:qingju:chengxin|ali)
    // @click@ali
    // @click:qingju:didi
    const attrArr = attrName.split('@')
    let modeStr = attrArr.pop()
    if (wrapRE.test(modeStr)) {
      modeStr = wrapRE.exec(modeStr)[1]
    }

    if (!modeStr) {
      return
    }

    const conditionMap = new Map()
    modeStr.split('|').forEach(item => {
      const arr = item.split(':')
      const key = arr[0] || 'noMode'
      conditionMap.set(key, arr.slice(1))
    })

    const modeArr = [...conditionMap.keys()]

    if (modeArr.every(i => isValidModeP(i))) {
      const attrValue = getAndRemoveAttr(el, attrName).val
      const replacedAttrName = attrArr.join('@')
      const processedAttr = { name: replacedAttrName, value: attrValue }

      for (let [defineMode, defineEnvArr] of conditionMap.entries()) {
        const isImplicitMode = defineMode[0] === '_'
        if (isImplicitMode) defineMode = defineMode.slice(1)
        if (defineMode === 'noMode' || defineMode === mode) {
          // 命中 env 规则(没有定义env 或者定义的envArr包含当前env)
          if (!defineEnvArr.length || defineEnvArr.includes(env)) {
            if (!replacedAttrName) {
              if (defineMode === 'noMode' || isImplicitMode) {
                // 若defineMode 为 noMode 或 implicitMode，则 element 都需要进行规则转换
              } else {
                el._atModeStatus = 'match'
              }
            } else {
              if (defineMode === 'noMode' || isImplicitMode) {
                // 若defineMode 为 noMode 或 implicitMode，则直接将 attr 挂载回 el，进行规则转换
                addAttrs(el, [processedAttr])
              } else {
                // 如果命中了指定的mode，且当前 mode 不为 noMode 或 implicitMode，则把不需要转换的 attrs 暂存在 noTransAttrs 上，等规则转换后再挂载回去
                el.noTransAttrs ? el.noTransAttrs.push(processedAttr) : el.noTransAttrs = [processedAttr]
              }
            }
            // 命中mode，命中env，完成匹配，直接退出
            break
          } else if (!replacedAttrName) {
            // 命中mode规则，没有命中当前env规则，设置为 'mismatch'
            el._atModeStatus = 'mismatch'
          }
        } else if (!replacedAttrName) {
          // 没有命中当前mode规则，设置为 'mismatch'
          el._atModeStatus = 'mismatch'
        } else {
          // 如果没命中指定的mode，则该属性删除
        }
      }
    }
  })
}

// 去除重复的attrsList项，这些项可能由平台转换规则造成
function processDuplicateAttrsList (el) {
  const attrsMap = el.attrsMap
  const attrsList = []
  Object.keys(attrsMap).forEach((name) => {
    const value = attrsMap[name]
    attrsList.push({
      name,
      value
    })
  })
  el.attrsList = attrsList
}

// 处理wxs注入逻辑
function processInjectWxs (el, meta) {
  if (el.injectWxsProps && el.injectWxsProps.length) {
    el.injectWxsProps.forEach((injectWxsProp) => {
      const { injectWxsPath, injectWxsModuleName } = injectWxsProp
      injectWxs(meta, injectWxsModuleName, injectWxsPath)
    })
  }
}

function processNoTransAttrs (el) {
  // 转换完成，把不需要处理的attr挂回去
  if (el.noTransAttrs) {
    addAttrs(el, el.noTransAttrs)
    delete el.noTransAttrs
  }
}

function processMpxTagName (el) {
  const mpxTagName = getAndRemoveAttr(el, 'mpxTagName').val
  if (mpxTagName) {
    el.tag = mpxTagName
  }
}

function processElement (el, root, options, meta) {
  processAtMode(el)
  // 如果已经标记了这个元素要被清除，直接return跳过后续处理步骤
  if (el._atModeStatus === 'mismatch') {
    return
  }

  if (rulesRunner && el._atModeStatus !== 'match') {
    currentEl = el
    rulesRunner(el)
  }

  processNoTransAttrs(el)

  processDuplicateAttrsList(el)

  processMpxTagName(el)

  processInjectWxs(el, meta)

  const transAli = mode === 'ali' && srcMode === 'wx'

  if (mode === 'web') {
    // 收集内建组件
    processBuiltInComponents(el, meta)
    // 预处理代码维度条件编译
    processIfForWeb(el)
    processWebExternalClassesHack(el, options)
    processComponentGenericsForWeb(el, options, meta)
    return
  }

  const pass = isNative || processTemplate(el) || processingTemplate

  // 仅ali平台需要scoped模拟样式隔离
  if (mode === 'ali') {
    processScoped(el, options)
  }

  if (transAli) {
    processAliExternalClassesHack(el, options)
  }

  processIf(el)
  processFor(el)
  processRef(el, options, meta)
  processClass(el, meta)
  processStyle(el, meta)
  processBindEvent(el, options)

  if (!pass) {
    processShow(el, options, root)
    processComponentIs(el, options)
  }

  processAttrs(el, options)
}

function closeElement (el, meta, options) {
  postProcessAtMode(el)
  if (mode === 'web') {
    postProcessWxs(el, meta)
    // 处理代码维度条件编译移除死分支
    postProcessIf(el)
    return
  }
  const pass = isNative || postProcessTemplate(el) || processingTemplate
  postProcessWxs(el, meta)

  if (!pass) {
    if (isComponentNode(el, options) && !options.hasVirtualHost && mode === 'ali') {
      el = processAliAddComponentRootView(el, options)
    } else {
      el = postProcessComponentIs(el)
    }
  }
  postProcessFor(el)
  postProcessIf(el)
}

function postProcessAtMode (el) {
  if (el._atModeStatus === 'mismatch') {
    removeNode(el, true)
  }
}

// 目前为了处理动态组件children中后续if无效的问题(#633)，仅进行节点对象本身的浅clone，没有对attrsList/attrsMap/exps/if/elseif/else/for等深层对象进行copy
function cloneNode (el) {
  const clone = Object.assign({}, el)
  if (el.parent) clone.parent = null
  if (el.children) {
    clone.children = []
    el.children.forEach((child) => {
      addChild(clone, cloneNode(child))
    })
  }
  return clone
}

function cloneAttrsList (attrsList) {
  return attrsList.map(({ name, value }) => {
    return {
      name,
      value
    }
  })
}

function postProcessComponentIs (el) {
  if (el.is && el.components) {
    let tempNode
    if (el.for || el.if || el.elseif || el.else) {
      tempNode = createASTElement('block', [])
      moveBaseDirective(tempNode, el)
    } else {
      tempNode = getTempNode()
    }
    let range = []
    if (el.attrsMap.range) {
      range = getAndRemoveAttr(el, 'range').val.split(',').map(item => item.trim())
    }
    el.components.forEach(function (component) {
      if (range.length > 0 && !range.includes(component)) return
      const newChild = createASTElement(component, cloneAttrsList(el.attrsList), tempNode)
      newChild.if = {
        raw: `{{${el.is} === ${stringify(component)}}}`,
        exp: `${el.is} === ${stringify(component)}`
      }
      el.children.forEach((child) => {
        addChild(newChild, cloneNode(child))
      })
      newChild.exps = el.exps
      addChild(tempNode, newChild)
      postProcessIf(newChild)
    })

    if (!el.parent) {
      error$1('Dynamic component can not be the template root, considering wrapping it with <view> or <text> tag!')
    } else {
      el = replaceNode(el, tempNode, true) || el
    }
  }
  return el
}

function processOptimizeSize (root, options) {
  const { usingComponents, filePath } = options
  function walkNode (root, callback) {
    if (!root) return
    callback(root)
    if (Array.isArray(root.children) && root.children.length) {
      for (const node of root.children) {
        if (!node) continue
        walkNode(node, callback)
      }
    }
  }
  // 记录所有原生组件（判断条件：usingComponents中不存在的组件）
  const nativeTags = new Set()
  walkNode(root, (node) => {
    if (node.tag && usingComponents.indexOf(node.tag) === -1) {
      nativeTags.add(node.tag)
    }
  })
  walkNode(root, (node) => {
    // 只有自定义组件才替换（判断条件：在usingComponents中的组件），并且新组件名不允许出现原生组件名
    if (node.tag && usingComponents.indexOf(node.tag) !== -1) {
      node.tag = generateVariableNameBySource(node.tag, filePath + 'componentName', [...nativeTags])
    }
  })
}

function stringifyAttr (val) {
  if (typeof val === 'string') {
    const hasSingle = val.indexOf('\'') > -1
    const hasDouble = val.indexOf('"') > -1
    // 移除属性中换行
    val = val.replace(/\n/g, '')

    if (hasSingle && hasDouble) {
      val = val.replace(/'/g, '"')
    }
    if (hasDouble) {
      return `'${val}'`
    } else {
      return `"${val}"`
    }
  }
}

function serialize (root) {
  function walk (node) {
    let result = ''
    if (node) {
      if (node.type === 3) {
        if (node.isComment) {
          result += '<!--' + node.text + '-->'
        } else {
          result += node.text
        }
      }
      if (node.tag === 'wxs' && mode === 'web') {
        return result
      }
      if (node.type === 1) {
        if (node.tag !== 'temp-node') {
          result += '<' + node.tag
          node.attrsList.forEach(function (attr) {
            result += ' ' + attr.name
            const value = attr.value
            if (value != null) {
              result += '=' + stringifyAttr(value)
            }
          })
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

function findPrevNode (node) {
  const parent = node.parent
  if (parent) {
    let index = parent.children.indexOf(node)
    while (index--) {
      const preNode = parent.children[index]
      if (preNode.type === 1) {
        return preNode
      }
    }
  }
}

function replaceNode (node, newNode, reserveNode) {
  if (!reserveNode) deleteErrorInResultMap(node)
  const parent = node.parent
  if (parent) {
    const index = parent.children.indexOf(node)
    if (index !== -1) {
      parent.children.splice(index, 1, newNode)
      newNode.parent = parent
      return newNode
    }
  }
}

function removeNode (node, reserveNode) {
  if (!reserveNode) deleteErrorInResultMap(node)
  const parent = node.parent
  if (parent) {
    const index = parent.children.indexOf(node)
    if (index !== -1) {
      parent.children.splice(index, 1)
      return true
    }
  }
}

function genIf (node) {
  node.ifProcessed = true
  return `if(${node.if.exp}){\n${genNode(node)}}\n`
}

function genElseif (node) {
  node.elseifProcessed = true
  if (node.for) {
    error$1(`wx:elif (wx:elif="${node.elseif.raw}") invalidly used on the for-list <"${node.tag}"> which has a wx:for directive, please create a block element to wrap the for-list and move the if-directive to it`)
    return
  }
  const preNode = findPrevNode(node)
  if (preNode && (preNode.if || preNode.elseif)) {
    return `else if(${node.elseif.exp}){\n${genNode(node)}}\n`
  } else {
    error$1(`wx:elif (wx:elif="${node.elseif.raw}") invalidly used on the element <"${node.tag}"> without corresponding wx:if or wx:elif.`)
  }
}

function genElse (node) {
  node.elseProcessed = true
  if (node.for) {
    error$1(`wx:else invalidly used on the for-list <"${node.tag}"> which has a wx:for directive, please create a block element to wrap the for-list and move the if-directive to it`)
    return
  }
  const preNode = findPrevNode(node)
  if (preNode && (preNode.if || preNode.elseif)) {
    return `else{\n${genNode(node)}}\n`
  } else {
    error$1(`wx:else invalidly used on the element <"${node.tag}"> without corresponding wx:if or wx:elif.`)
  }
}

function genExps (node) {
  return `${node.exps.map(({ exp, isProps }) => {
    return isProps ? `this._p(${exp});\n` : `${exp};\n`
  }).join('')}`
}

function genFor (node) {
  node.forProcessed = true
  const index = node.for.index || 'index'
  const item = node.for.item || 'item'
  return `_i(${node.for.exp}, function(${item},${index}){\n${genNode(node)}});\n`
}

function genNode (node) {
  let exp = ''
  if (node) {
    if (node.type === 3) {
      if (node.exps && !node.isComment) {
        exp += genExps(node)
      }
    }
    if (node.type === 1) {
      if (node.tag !== 'temp-node') {
        if (node.for && !node.forProcessed) {
          exp += genFor(node)
        } else if (node.if && !node.ifProcessed) {
          exp += genIf(node)
        } else if (node.elseif && !node.elseifProcessed) {
          exp += genElseif(node)
        } else if (node.else && !node.elseProcessed) {
          exp += genElse(node)
        } else {
          if (node.exps) {
            exp += genExps(node)
          }
          if (!node.unary) {
            node.children.forEach(function (child) {
              exp += genNode(child)
            })
          }
        }
      } else {
        node.children.forEach(function (child) {
          exp += genNode(child)
        })
      }
    }
  }
  return exp
}

/**
 * 处理可选链用法
 * @param str
 * @returns
 */
function parseOptionChain (str) {
  const wxsName = `${optionalChainWxsName}.g`
  let optionsRes
  while (optionsRes = /\?\./.exec(str)) {
    const strLength = str.length
    const grammarMap = {
      init () {
        const initKey = [
          {
            mapKey: '[]',
            mapValue: [
              {
                key: '[',
                value: 1
              },
              {
                key: ']',
                value: -1
              }
            ]
          },
          {
            mapKey: '()',
            mapValue: [
              {
                key: '(',
                value: 1
              },
              {
                key: ')',
                value: -1
              }
            ]
          }
        ]
        this.count = {}
        initKey.forEach(({ mapKey, mapValue }) => {
          mapValue.forEach(({ key, value }) => {
            this[key] = this.changeState(mapKey, value)
          })
        })
      },
      changeState (key, value) {
        if (!this.count[key]) {
          this.count[key] = 0
        }
        return () => {
          this.count[key] = this.count[key] + value
          return this.count[key]
        }
      },
      checkState () {
        return Object.values(this.count).find(i => i)
      }
    }
    let leftIndex = optionsRes.index
    let rightIndex = leftIndex + 2
    let haveNotGetValue = true
    let chainValue = ''
    let chainKey = ''
    let notCheck = false
    grammarMap.init()
    // 查 ?. 左边值
    while (haveNotGetValue && leftIndex > 0) {
      const left = str[leftIndex - 1]
      const grammar = grammarMap[left]
      if (notCheck) {
        // 处于表达式内
        chainValue = left + chainValue
        if (grammar) {
          grammar()
          if (!grammarMap.checkState()) {
            // 表达式结束
            notCheck = false
          }
        }
      } else if (~[']', ')'].indexOf(left)) {
        // 命中表达式，开始记录表达式
        chainValue = left + chainValue
        notCheck = true
        grammar()
      } else if (left !== ' ') {
        if (!/[A-Za-z0-9_$.]/.test(left)) {
          // 结束
          haveNotGetValue = false
          leftIndex++
        } else {
          // 正常语法
          chainValue = left + chainValue
        }
      }
      leftIndex--
    }
    if (grammarMap.checkState() && haveNotGetValue) {
      // 值查找结束但是语法未闭合或者处理到边界还未结束，抛异常
      throw new Error('[optionChain] option value illegal!!!')
    }
    haveNotGetValue = true
    let keyValue = ''
    // 查 ?. 右边key
    while (haveNotGetValue && rightIndex < strLength) {
      const right = str[rightIndex]
      const grammar = grammarMap[right]
      if (notCheck) {
        // 处于表达式内
        if (grammar) {
          grammar()
          if (grammarMap.checkState()) {
            keyValue += right
          } else {
            // 表达式结束
            notCheck = false
            chainKey += `,${keyValue}`
            keyValue = ''
          }
        } else {
          keyValue += right
        }
      } else if (~['[', '('].indexOf(right)) {
        // 命中表达式，开始记录表达式
        grammar()
        if (keyValue) {
          chainKey += `,'${keyValue}'`
          keyValue = ''
        }
        notCheck = true
      } else if (!/[A-Za-z0-9_$.?]/.test(right)) {
        // 结束
        haveNotGetValue = false
        rightIndex--
      } else if (right !== '?') {
        // 正常语法
        if (right === '.') {
          if (keyValue) {
            chainKey += `,'${keyValue}'`
          }
          keyValue = ''
        } else {
          keyValue += right
        }
      }
      rightIndex++
    }
    if (grammarMap.checkState() && haveNotGetValue) {
      // key值查找结束但是语法未闭合或者处理到边界还未结束，抛异常
      throw new Error('[optionChain] option key illegal!!!')
    }
    if (keyValue) {
      chainKey += `,'${keyValue}'`
    }
    str = str.slice(0, leftIndex) + `${wxsName}(${chainValue},[${chainKey.slice(1)}])` + str.slice(rightIndex)
    if (!hasOptionalChain) {
      hasOptionalChain = true
    }
  }
  return str
}

module.exports = {
  parseComponent,
  parse,
  serialize,
  genNode,
  makeAttrsMap,
  stringifyAttr,
  parseMustache,
  parseMustacheWithContext,
  stringifyWithResolveComputed,
  addAttrs
}
