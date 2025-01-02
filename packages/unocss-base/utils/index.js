const EMPTY = ' '

const isReg = (reg) => {
  return reg instanceof RegExp
}

const isString = (str) => {
  return typeof str === 'string'
}

const isFunction = (fn) => {
  return typeof fn === 'function'
}

const ruleCallback = ([match], { generator }) => {
  return ruleFallback(match, generator)
}

const ruleFallback = (match, generator) => {
  generator._mpx2rnUnsuportedRules = generator._mpx2rnUnsuportedRules || []
  generator._mpx2rnUnsuportedRules.push(match)
  return EMPTY
}

const genEmptyRule = (...rules) => {
  return rules.map(rule => [rule, ruleCallback])
}

const transformEmptyRule = (...rulesArr) => {
  return rulesArr.map(rules => rules.map(rule => {
    if (isString(rule[0])) { // staticRule
      return [
        [rule[0], null],
        [new RegExp(`^${rule[0]}$`), ruleCallback]
      ]
    }
    return [[rule[0], ruleCallback]]
  })).reduce((preV, curV) => preV.concat(...curV), [])
}

const findRawRules = (matcher, rawRules, byReg = false) => {
  if (!Array.isArray(matcher)) {
    matcher = [matcher]
  }

  return matcher.map(m => {
    const result = []
    rawRules.forEach(r => {
      const tester = r[0]
      if (isString(m)) {
        if (byReg) {
          if (isReg(tester) && tester.test(m)) {
            result.push(r)
          }
        } else {
          if (isString(tester) && m === tester) {
            result.push(r)
          }
        }
      } else if (isReg(m)) {
        if (isString(tester) && m.test(tester)) {
          result.push(r)
        }
      }
    })
    return result
  })
  .filter(item => !!item.length)
  .reduce((preV, curV) => preV.concat(curV), [])
}

export const globalKeywords = ['inherit', 'initial', 'revert', 'revert-layer', 'unset']

export const makeGlobalStaticRules = prefix => {
  return globalKeywords.map(v => `${prefix}-${v}`)
}

export const platformSelect = (options = {}) => {
  const platform = process.env.MPX_CURRENT_TARGET_MODE
  return options[platform] || ''
}

export {
  genEmptyRule,
  transformEmptyRule,
  findRawRules,
  ruleFallback,
  isFunction,
  ruleCallback
}
