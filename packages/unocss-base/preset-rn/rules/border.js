import { borders } from '@unocss/preset-mini/rules'
import { ruleCallback } from '../../utils/index.js'

const bordersRules = borders.map(v => {
  const [regex, matcher, ...another] = v
  return [
    regex,
    (...args) => {
      const [[, a]] = args
      if (['block', 'inline'].includes(a)) return ruleCallback(...args)
      return matcher(...args)
    },
    ...another
  ]
})

export default bordersRules
