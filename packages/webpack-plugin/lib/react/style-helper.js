const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')
const getRulesRunner = require('../platform/index')
const dash2hump = require('../utils/hump-dash').dash2hump
const rpxRegExp = /^\s*(\d+(\.\d+)?)rpx\s*$/
const pxRegExp = /^\s*(\d+(\.\d+)?)(px)?\s*$/
const cssPrefixExp = /^-(webkit|moz|ms|o)-/
function getClassMap ({ content, filename, mode, srcMode }) {
  const classMap = {}

  const root = postcss.parse(content, {
    from: filename
  })

  function formatValue (value) {
    let matched
    let needStringify = true
    if ((matched = pxRegExp.exec(value))) {
      value = matched[1]
      needStringify = false
    } else if ((matched = rpxRegExp.exec(value))) {
      value = `this.__rpx(${matched[1]})`
      needStringify = false
    }
    return needStringify ? JSON.stringify(value) : value
  }

  function setFontSize (classMapValue) {
    const lineHeight = classMapValue.lineHeight
    const fontSize = classMapValue.fontSize
    if (+lineHeight && !fontSize) {
      classMapValue.fontSize = lineHeight * 16
    }
  }

  const rulesRunner = getRulesRunner({
    mode,
    srcMode,
    type: 'style',
    testKey: 'prop',
    warn: (msg) => {
      console.warn('[style compiler warn]: ' + msg)
    },
    error: (msg) => {
      console.error('[style compiler error]: ' + msg)
    }
  })
  root.walkRules(rule => {
    const classMapValue = {}
    // let isFlex = false, hasFlexDirection = false
    rule.walkDecls(({ prop, value }) => {
      if (cssPrefixExp.test(prop) || cssPrefixExp.test(value)) return
      let newData = rulesRunner({ prop, value })
      if (!newData.length) {
        newData = [newData]
      }
      newData.forEach(item => {
        // if (value === 'flex') isFlex = true
        // if (prop === 'flex-direction') hasFlexDirection = true
        prop = dash2hump(item.prop)
        value = item.value
        if (typeof item.value === 'object') {
          for (const key in item.value) {
            item.value[key] = formatValue(item.value[key])
          }
        } else {
          value = formatValue(value)
        }
        classMapValue[prop] = value
      })
      setFontSize(classMapValue)
      // 定义flex布局且未定义方向时设置默认row
      // if (isFlex && !hasFlexDirection) classMapValue['flexDirection'] = formatValue('row')
    })

    const classMapKeys = []

    selectorParser(selectors => {
      selectors.each(selector => {
        if (selector.nodes.length === 1 && selector.nodes[0].type === 'class') {
          classMapKeys.push(selector.nodes[0].value)
        } else {
          rule.error('Only single class selector is supported in react native mode temporarily.')
        }
      })
    }).processSync(rule.selector)

    if (classMapKeys.length) {
      classMapKeys.forEach((key) => {
        classMap[key] = Object.assign(classMap[key] || {}, classMapValue)
      })
    }
  })
  return classMap
}

module.exports = {
  getClassMap
}
