const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')
const getRulesRunner = require('../platform/index')
const dash2hump = require('../utils/hump-dash').dash2hump
const unitRegExp = /^\s*(-?\d+(?:\.\d+)?)(rpx|vw|vh)\s*$/
const numberRegExp = /^\s*(-?\d+(\.\d+)?)(px)?\s*$/
const hairlineRegExp = /^\s*hairlineWidth\s*$/
const varRegExp = /^--/
const cssPrefixExp = /^-(webkit|moz|ms|o)-/

function createFormatValue (formatValueFn) {
  formatValueFn = formatValueFn || 'global.__formatValue'
  return function (value) {
    let matched
    let needStringify = true
    if ((matched = numberRegExp.exec(value))) {
      value = matched[1]
      needStringify = false
    } else if (unitRegExp.test(value) || hairlineRegExp.test(value)) {
      value = `${formatValueFn}(${JSON.stringify(value)})`
      needStringify = false
    }
    return needStringify ? JSON.stringify(value) : value
  }
}

function getClassMap ({ content, filename, mode, srcMode, warn, error, formatValueFn }) {
  const classMap = {}
  const formatValue = createFormatValue(formatValueFn)
  const root = postcss.parse(content, {
    from: filename
  })
  const rulesRunner = getRulesRunner({
    mode,
    srcMode,
    type: 'style',
    testKey: 'prop',
    warn,
    error
  })

  root.walkRules(rule => {
    const classMapValue = {}
    rule.walkDecls(({ prop, value }) => {
      if (cssPrefixExp.test(prop) || cssPrefixExp.test(value)) return
      let newData = rulesRunner({ prop, value, selector: rule.selector })
      if (!newData) return
      if (!Array.isArray(newData)) {
        newData = [newData]
      }
      newData.forEach(item => {
        prop = varRegExp.test(item.prop) ? item.prop : dash2hump(item.prop)
        value = item.value
        if (Array.isArray(value)) {
          value = value.map(val => {
            if (typeof val === 'object') {
              for (const key in val) {
                val[key] = formatValue(val[key])
              }
              return val
            } else {
              return formatValue(val)
            }
          })
        } else if (typeof value === 'object') {
          for (const key in value) {
            value[key] = formatValue(value[key])
          }
        } else {
          value = formatValue(value)
        }
        classMapValue[prop] = value
      })
    })

    const classMapKeys = []

    selectorParser(selectors => {
      selectors.each(selector => {
        if (selector.nodes.length === 1 && selector.nodes[0].type === 'class') {
          classMapKeys.push(selector.nodes[0].value)
        } else if (selector.nodes.length === 2 && selector.nodes[0].type === 'class' && selector.nodes[1].type === 'pseudo') {
          classMapKeys.push(selector.nodes[0].value + selector.nodes[1].value)
        } else {
          error('Only single class selector is supported in react native mode temporarily.')
        }
      })
    }).processSync(rule.selector)

    if (classMapKeys.length) {
      classMapKeys.forEach((key) => {
        if (Object.keys(classMapValue).length) {
          classMap[key] = Object.assign(classMap[key] || {}, classMapValue)
        }
      })
    }
  })
  return classMap
}

module.exports = {
  getClassMap,
  unitRegExp,
  numberRegExp
}
