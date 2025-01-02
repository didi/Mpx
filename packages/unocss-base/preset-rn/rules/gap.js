import { gaps } from '@unocss/preset-mini/rules'
import { ruleCallback } from '../../utils/index.js'

const gapsRules = gaps.map(v => {
  const [regex, matcher, ...another] = v
  return [
    regex,
    (...args) => {
      const [[a]] = args
      if (a.startsWith('grid')) return ruleCallback(...args)
      return matcher(...args)
    },
    ...another
  ]
})

export {
  gapsRules as gaps
}
