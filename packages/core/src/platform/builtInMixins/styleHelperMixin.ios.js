import { isObject, isArray, dash2hump, cached, isEmptyObject } from '@mpxjs/utils'
import { Dimensions, StyleSheet, Appearance } from 'react-native'

let { width, height } = Dimensions.get('screen')

Dimensions.addEventListener('change', ({ screen }) => {
  width = screen.width
  height = screen.height
})

function rpx (value) {
  // rn 单位 dp = 1(css)px =  1 物理像素 * pixelRatio(像素比)
  // px = rpx * (750 / 屏幕宽度)
  return value * width / 750
}
function vw (value) {
  return value * width / 100
}
function vh (value) {
  return value * height / 100
}

const unit = {
  rpx,
  vw,
  vh
}

const empty = {}

function formatValue (value) {
  const matched = unitRegExp.exec(value)
  if (matched) {
    if (!matched[2] || matched[2] === 'px') {
      return +matched[1]
    } else {
      return unit[matched[2]](+matched[1])
    }
  }
  if (hairlineRegExp.test(value)) return StyleSheet.hairlineWidth
  return value
}

global.__formatValue = formatValue

function concat (a = '', b = '') {
  return a ? b ? (a + ' ' + b) : a : b
}

function stringifyArray (value) {
  let res = ''
  let classString
  for (let i = 0; i < value.length; i++) {
    if ((classString = stringifyDynamicClass(value[i]))) {
      if (res) res += ' '
      res += classString
    }
  }
  return res
}

function stringifyObject (value) {
  let res = ''
  const keys = Object.keys(value)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (value[key]) {
      if (res) res += ' '
      res += key
    }
  }
  return res
}

function stringifyDynamicClass (value) {
  if (isArray(value)) {
    value = stringifyArray(value)
  } else if (isObject(value)) {
    value = stringifyObject(value)
  }
  return value
}

const listDelimiter = /;(?![^(]*[)])/g
const propertyDelimiter = /:(.+)/
const unitRegExp = /^\s*(-?\d+(?:\.\d+)?)(rpx|vw|vh|px)?\s*$/
const hairlineRegExp = /^\s*hairlineWidth\s*$/
const varRegExp = /^--/

const parseStyleText = cached((cssText) => {
  if (typeof cssText !== 'string') return cssText
  const res = {}
  const arr = cssText.split(listDelimiter)
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (item) {
      const tmp = item.split(propertyDelimiter)
      if (tmp.length > 1) {
        let k = tmp[0].trim()
        k = varRegExp.test(k) ? k : dash2hump(k)
        res[k] = tmp[1].trim()
      }
    }
  }
  return res
})

function normalizeDynamicStyle (value) {
  if (!value) return {}
  if (isArray(value)) {
    return mergeObjectArray(value)
  }
  if (typeof value === 'string') {
    return parseStyleText(value)
  }
  return value
}

function mergeObjectArray (arr) {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    Object.assign(res, arr[i])
  }
  return res
}

function transformStyleObj (styleObj) {
  const transformed = {}
  Object.keys(styleObj).forEach((prop) => {
    transformed[prop] = formatValue(styleObj[prop])
  })
  return transformed
}

export default function styleHelperMixin () {
  return {
    methods: {
      __getClass (staticClass, dynamicClass) {
        return concat(staticClass, stringifyDynamicClass(dynamicClass))
      },
      __getStyle (staticClass, dynamicClass, staticStyle, dynamicStyle, hide) {
        const result = {}
        const classMap = this.__getClassMap?.() || {}
        const unoClassMap = global.__getUnoClassMap?.() || {}
        const appClassMap = global.__getAppClassMap?.() || {}

        if (staticClass || dynamicClass) {
          const classString = concat(staticClass, stringifyDynamicClass(dynamicClass))
          classString.split(/\s+/).forEach((className) => {
            if (classMap[className]) {
              Object.assign(result, classMap[className])
            } else if (appClassMap[className]) {
              // todo 全局样式在每个页面和组件中生效，以支持全局原子类，后续支持样式模块复用后可考虑移除
              Object.assign(result, appClassMap[className])
            } else if (unoClassMap[className]) {
              Object.assign(result, unoClassMap[className])
            } else if (isObject(this.__props[className])) {
              // externalClasses必定以对象形式传递下来
              Object.assign(result, this.__props[className])
            }
          })
        }

        if (staticStyle || dynamicStyle) {
          const styleObj = Object.assign({}, parseStyleText(staticStyle), normalizeDynamicStyle(dynamicStyle))
          Object.assign(result, transformStyleObj(styleObj))
        }

        if (hide) {
          Object.assign(result, {
            display: 'none'
          })
        }
        return isEmptyObject(result) ? empty : result
      },
      __getDynamicClass (dynamicClass, mediaQueryClass) {
        return [dynamicClass, this.__getMediaQueryClass(mediaQueryClass)]
      },
      __getMediaQueryClass (mediaQueryClass = []) {
        if (!mediaQueryClass.length) return ''
        const { width, height } = Dimensions.get('screen')
        const colorScheme = Appearance.getColorScheme()
        const { entries, entriesMap } = global.__getUnoBreakpoints()
        return mediaQueryClass.map(([className, querypoints = []]) => {
          const res = querypoints.every(([prefix = '', point = 0]) => {
            if (prefix === 'landscape') return width > height
            if (prefix === 'portrait') return width <= height
            if (prefix === 'dark') return colorScheme === 'dark'
            if (prefix === 'light') return colorScheme === 'light'
            const size = formatValue(entriesMap[point] || point)
            const index = entries.findIndex(item => item[0] === point)
            const isGtPrefix = prefix.startsWith('min-')
            const isLtPrefix = prefix.startsWith('lt-') || prefix.startsWith('<') || prefix.startsWith('max-')
            const isAtPrefix = prefix.startsWith('at-') || prefix.startsWith('~')
            if (isGtPrefix) return width > size
            if (isLtPrefix) return width < size
            if (isAtPrefix && (index && index < entries.length - 1)) {
              return width >= size && width < formatValue(entries[index + 1][1])
            }
            return width > size
          })

          return res ? className : ''
        })
      }
    }
  }
}
