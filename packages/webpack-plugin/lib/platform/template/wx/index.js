const runRules = require('../../run-rules')
const JSON5 = require('json5')
const getComponentConfigs = require('./component-config')
const normalizeComponentRules = require('../normalize-component-rules')
const isValidIdentifierStr = require('../../../utils/is-valid-identifier-str')
const { parseMustacheWithContext, stringifyWithResolveComputed } = require('../../../template-compiler/compiler')
const normalize = require('../../../utils/normalize')
const { dash2hump } = require('../../../utils/hump-dash')

module.exports = function getSpec ({ warn, error }) {
  const spec = {
    supportedModes: ['ali', 'swan', 'qq', 'tt', 'web', 'qa', 'jd', 'dd', 'ios', 'android'],
    // props预处理
    preProps: [],
    // props后处理
    postProps: [
      {
        web ({ name, value }) {
          const parsed = parseMustacheWithContext(value)
          if (name.startsWith('data-')) {
            return {
              name: ':' + name,
              value: `__ensureString(${parsed.result})`
            }
          } else if (parsed.hasBinding) {
            return {
              name: name === 'animation' ? 'v-animation' : ':' + name,
              value: parsed.result
            }
          }
        }
      }
    ],
    // 指令处理
    directive: [
      // 特殊指令
      {
        test: 'wx:for',
        swan (obj, data) {
          const attrsMap = data.el.attrsMap
          const parsed = parseMustacheWithContext(obj.value)
          let listName = parsed.result
          const el = data.el

          const itemName = attrsMap['wx:for-item'] || 'item'
          const indexName = attrsMap['wx:for-index'] || 'index'
          const keyName = attrsMap['wx:key'] || null
          let keyStr = ''

          if (parsed.hasBinding) {
            listName = listName.slice(1, -1)
          }

          if (keyName) {
            const parsed = parseMustacheWithContext(keyName)
            if (parsed.hasBinding) {
              // keyStr = ` trackBy ${parsed.result.slice(1, -1)}`
            } else if (keyName === '*this') {
              keyStr = ` trackBy ${itemName}`
            } else {
              if (!isValidIdentifierStr(keyName)) {
                keyStr = ` trackBy ${itemName}['${keyName}']`
              } else {
                keyStr = ` trackBy ${itemName}.${keyName}`
              }
            }
          }
          if (el) {
            const injectWxsProp = {
              injectWxsPath: '~' + normalize.lib('runtime/swanHelper.wxs'),
              injectWxsModuleName: 'mpxSwanHelper'
            }
            if (el.injectWxsProps && Array.isArray(el.injectWxsProps)) {
              el.injectWxsProps.push(injectWxsProp)
            } else {
              el.injectWxsProps = [injectWxsProp]
            }
          }
          return {
            name: 's-for',
            value: `${itemName}, ${indexName} in mpxSwanHelper.processFor(${listName})${keyStr}`
          }
        },
        web ({ value }, { el }) {
          const parsed = parseMustacheWithContext(value)
          const attrsMap = el.attrsMap
          const itemName = attrsMap['wx:for-item'] || 'item'
          const indexName = attrsMap['wx:for-index'] || 'index'
          return {
            name: 'v-for',
            value: `(${itemName}, ${indexName}) in ${parsed.result}`
          }
        }
      },
      {
        test: 'wx:key',
        swan () {
          return false
        },
        web ({ value }, { el }) {
          // vue的template中不能包含key，对应于小程序中的block
          if (el.tag === 'block') return false
          const itemName = el.attrsMap['wx:for-item'] || 'item'
          const keyName = value
          if (value === '*this') {
            value = itemName
          } else {
            if (isValidIdentifierStr(keyName)) {
              value = `${itemName}.${keyName}`
            } else {
              value = `${itemName}['${keyName}']`
            }
          }
          return {
            name: ':key',
            value
          }
        }
      },
      {
        // 在swan/web模式下删除for-index/for-item，转换为v/s-for表达式
        test: /^wx:(for-item|for-index)$/,
        swan () {
          return false
        },
        web () {
          return false
        }
      },
      {
        test: 'wx:model',
        web ({ value }, { el }) {
          el.hasModel = true
          const attrsMap = el.attrsMap
          const tagRE = /\{\{((?:.|\n|\r)+?)\}\}(?!})/
          const stringify = JSON.stringify
          const match = tagRE.exec(value)
          if (match) {
            const modelProp = attrsMap['wx:model-prop'] || 'value'
            const modelEvent = attrsMap['wx:model-event'] || 'input'
            const modelValuePathRaw = attrsMap['wx:model-value-path']
            const modelValuePath = modelValuePathRaw === undefined ? 'value' : modelValuePathRaw
            const modelFilter = attrsMap['wx:model-filter']
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
            const modelValue = match[1].trim()
            return [
              {
                name: ':' + modelProp,
                value: modelValue
              },
              {
                name: 'mpxModelEvent',
                value: modelEvent
              },
              {
                name: '@mpxModel',
                value: `__model(${stringifyWithResolveComputed(modelValue)}, $event, ${stringify(modelValuePathArr)}, ${stringify(modelFilter)})`
              }
            ]
          }
        }
      },
      {
        test: /^wx:(model-prop|model-event|model-value-path|model-filter)$/,
        web () {
          return false
        }
      },
      {
        // ref只支持字符串字面量
        test: 'wx:ref',
        web ({ value }) {
          return {
            name: 'ref',
            value: `__mpx_ref_${value}__`
          }
        }
      },
      {
        // style样式绑定
        test: /^(style|wx:style)$/,
        web ({ value }, { el }) {
          if (el.isStyleParsed) {
            return false
          }
          const styleBinding = []
          el.isStyleParsed = true
          el.attrsList.filter(item => this.test.test(item.name)).forEach((item) => {
            const parsed = parseMustacheWithContext(item.value)
            styleBinding.push(parsed.result)
          })
          return {
            name: ':style',
            value: `[${styleBinding}] | transRpxStyle`
          }
        }
      },
      {
        // 样式类名绑定
        test: /^(class|wx:class)$/,
        web ({ name, value }, { el }) {
          if (el.classMerged) return false
          const classBinding = []
          el.attrsList.filter(item => this.test.test(item.name)).forEach(({ name, value }) => {
            const parsed = parseMustacheWithContext(value)
            if (name === 'wx:class') {
              classBinding.push(parsed.result)
            } else if (name === 'class' && parsed.hasBinding === true) {
              el.classMerged = true
              classBinding.push(parsed.result)
            }
          })

          if (el.classMerged) {
            return {
              name: ':class',
              value: `[${classBinding}]`
            }
          } else if (name === 'wx:class') {
            // 对于纯静态class不做合并转换
            return {
              name: ':class',
              value: classBinding[0]
            }
          }
        }
      },
      // 通用指令
      {
        test: /^wx:(.*)$/,
        ali ({ name, value }) {
          const dir = this.test.exec(name)[1]
          return {
            name: 'a:' + dir,
            value
          }
        },
        swan ({ name, value }) {
          const dir = this.test.exec(name)[1]
          return {
            name: 's-' + dir,
            value
          }
        },
        qq ({ name, value }) {
          const dir = this.test.exec(name)[1]
          return {
            name: 'qq:' + dir,
            value
          }
        },
        jd ({ name, value }) {
          const dir = this.test.exec(name)[1]
          return {
            name: 'jd:' + dir,
            value
          }
        },
        tt ({ name, value }) {
          const dir = this.test.exec(name)[1]
          return {
            name: 'tt:' + dir,
            value
          }
        },
        dd ({ name, value }) {
          const dir = this.test.exec(name)[1]
          return {
            name: 'dd:' + dir,
            value
          }
        },
        web ({ name, value }) {
          let dir = this.test.exec(name)[1]
          const parsed = parseMustacheWithContext(value)
          if (dir === 'elif') {
            dir = 'else-if'
          }
          return {
            name: 'v-' + dir,
            value: parsed.result
          }
        }
      },
      // 事件
      {
        test: /^(bind|catch|capture-bind|capture-catch):?(.*?)(\..*)?$/,
        ali ({ name, value }, { eventRules }) {
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          const rPrefix = runRules(spec.event.prefix, prefix, { mode: 'ali' })
          const rEventName = runRules(eventRules, eventName, { mode: 'ali' })
          return {
            name: dash2hump(rPrefix + '-' + rEventName) + modifierStr,
            value
          }
        },
        swan ({ name, value }, { eventRules }) {
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          let rPrefix = runRules(spec.event.prefix, prefix, { mode: 'swan' })
          const rEventName = runRules(eventRules, eventName, { mode: 'swan' })
          if (rEventName.includes('-')) rPrefix += ':'
          return {
            name: rPrefix + rEventName + modifierStr,
            value
          }
        },
        qq ({ name, value }, { eventRules }) {
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          let rPrefix = runRules(spec.event.prefix, prefix, { mode: 'qq' })
          const rEventName = runRules(eventRules, eventName, { mode: 'qq' })
          if (rEventName.includes('-')) rPrefix += ':'
          return {
            name: rPrefix + rEventName + modifierStr,
            value
          }
        },
        jd ({ name, value }, { eventRules }) {
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          let rPrefix = runRules(spec.event.prefix, prefix, { mode: 'jd' })
          const rEventName = runRules(eventRules, eventName, { mode: 'jd' })
          if (rEventName.includes('-')) rPrefix += ':'
          return {
            name: rPrefix + rEventName + modifierStr,
            value
          }
        },
        // tt ({ name, value }, { eventRules }) {
        //   const match = this.test.exec(name)
        //   const prefix = match[1]
        //   const eventName = match[2]
        //   const modifierStr = match[3] || ''
        //   const rEventName = runRules(eventRules, eventName, { mode: 'tt' })
        //   return {
        //     // 字节将所有事件转为小写
        //     name: prefix + rEventName.toLowerCase() + modifierStr,
        //     value
        //   }
        // },
        tt ({ name, value }, { eventRules }) {
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          let rPrefix = runRules(spec.event.prefix, prefix, { mode: 'tt' })
          const rEventName = runRules(eventRules, eventName, { mode: 'tt' })
          if (rEventName.includes('-')) rPrefix += ':'
          return {
            name: rPrefix + rEventName + modifierStr,
            value
          }
        },
        dd ({ name, value }, { eventRules }) {
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          let rPrefix = runRules(spec.event.prefix, prefix, { mode: 'dd' })
          const rEventName = runRules(eventRules, eventName, { mode: 'dd' })
          if (rEventName.includes('-')) rPrefix += ':'
          return {
            name: rPrefix + rEventName + modifierStr,
            value
          }
        },
        web ({ name, value }, { eventRules, el, usingComponents }) {
          const parsed = parseMustacheWithContext(value)
          if (parsed.hasBinding) {
            value = '__invokeHandler(' + parsed.result + ', $event)'
          }
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          const meta = {
            modifierStr
          }
          const isComponent = usingComponents.indexOf(el.tag) !== -1 || el.tag === 'component'
          const rPrefix = runRules(spec.event.prefix, prefix, { mode: 'web', meta })
          const rEventName = runRules(eventRules, eventName, { mode: 'web', data: { isComponent } })
          return {
            name: rPrefix + rEventName + meta.modifierStr,
            value
          }
        },
        ios ({ name, value }, { eventRules, el }) {
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          const meta = {
            modifierStr
          }
          const rPrefix = runRules(spec.event.prefix, prefix, { mode: 'ios' })
          const rEventName = runRules(eventRules, eventName, { mode: 'ios', data: { el } })
          return {
            name: rPrefix + rEventName + meta.modifierStr,
            value
          }
        },
        android ({ name, value }, { eventRules, el }) {
          const match = this.test.exec(name)
          const prefix = match[1]
          const eventName = match[2]
          const modifierStr = match[3] || ''
          const meta = {
            modifierStr
          }
          const rPrefix = runRules(spec.event.prefix, prefix, { mode: 'android' })
          const rEventName = runRules(eventRules, eventName, { mode: 'android', data: { el } })
          return {
            name: rPrefix + rEventName + meta.modifierStr,
            value
          }
        }
      },
      // 无障碍
      {
        test: /^aria-(role|label)$/,
        ali () {
          warn('Ali environment does not support aria-role|label props!')
        }
      }
    ],
    event: {
      prefix: [
        {
          ali (prefix) {
            const prefixMap = {
              bind: 'on',
              catch: 'catch'
            }
            if (!prefixMap[prefix]) {
              error(`Ali environment does not support [${prefix}] event handling!`)
              return
            }
            return prefixMap[prefix]
          },
          // 通过meta将prefix转化为modifier
          web (prefix, data, meta) {
            const modifierStr = meta.modifierStr
            const modifierMap = modifierStr.split('.').reduce((map, key) => {
              if (key) {
                map[key] = true
              }
              return map
            }, {})
            switch (prefix) {
              case 'catch':
                modifierMap.stop = true
                break
              case 'capture-bind':
                modifierMap.capture = true
                break
              case 'capture-catch':
                modifierMap.stop = true
                modifierMap.capture = true
                break
            }
            // web中不支持proxy modifier
            delete modifierMap.proxy
            const tempModifierStr = Object.keys(modifierMap).join('.')
            meta.modifierStr = tempModifierStr ? '.' + tempModifierStr : ''
            return '@'
          }
          // ios (prefix) {
          //   const prefixMap = {
          //     bind: 'on',
          //     catch: 'catch'
          //   }
          //   if (!prefixMap[prefix]) {
          //     error(`React native environment does not support [${prefix}] event handling!`)
          //     return
          //   }
          //   return prefixMap[prefix]
          // },
          // android (prefix) {
          //   const prefixMap = {
          //     bind: 'on',
          //     catch: 'catch'
          //   }
          //   if (!prefixMap[prefix]) {
          //     error(`React native environment does not support [${prefix}] event handling!`)
          //     return
          //   }
          //   return prefixMap[prefix]
          // }
        }
      ],
      rules: [
        // 通用冒泡事件
        {
          test: /^(touchstart|touchmove|touchcancel|touchend|tap|longpress|longtap|transitionend|animationstart|animationiteration|animationend|touchforcechange)$/,
          ali (eventName) {
            const eventMap = {
              touchstart: 'touchStart',
              touchmove: 'touchMove',
              touchend: 'touchEnd',
              touchcancel: 'touchCancel',
              tap: 'tap',
              longtap: 'longTap',
              longpress: 'longTap',
              transitionend: 'transitionEnd',
              animationstart: 'animationStart',
              animationiteration: 'animationIteration',
              animationend: 'animationEnd'
            }
            if (eventMap[eventName]) {
              return eventMap[eventName]
            } else {
              error(`Ali environment does not support [${eventName}] event!`)
            }
          },
          web (eventName) {
            if (eventName === 'touchforcechange') {
              error(`Web environment does not support [${eventName}] event!`)
            }
          },
          ios (eventName) {
            const eventMap = {
              tap: 'tap',
              longtap: 'longpress',
              longpress: 'longpress',
              touchstart: 'touchstart',
              touchmove: 'touchmove',
              touchend: 'touchend',
              touchcancel: 'touchcancel'
            }
            if (eventMap[eventName]) {
              return eventMap[eventName]
            } else {
              error(`React native environment does not support [${eventName}] event!`)
            }
          },
          android (eventName) {
            const eventMap = {
              tap: 'tap',
              longtap: 'longpress',
              longpress: 'longpress',
              touchstart: 'touchstart',
              touchmove: 'touchmove',
              touchend: 'touchend',
              touchcancel: 'touchcancel'
            }
            if (eventMap[eventName]) {
              return eventMap[eventName]
            } else {
              error(`React native environment does not support [${eventName}] event!`)
            }
          }
        },
        // web event escape
        {
          test: /^click$/,
          web (eventName, { isComponent }) {
            // 自定义组件根节点
            if (isComponent) {
              return '_' + eventName
            }
          }
        }
      ]
    }
  }
  spec.rules = normalizeComponentRules(getComponentConfigs({ warn, error }).concat({}), spec)
  return spec
}
