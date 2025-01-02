import { margins, paddings } from '@unocss/preset-mini/rules'
import { spaces } from '@unocss/preset-wind/rules'
import { ruleCallback, transformEmptyRule } from '../../utils/index.js'

const unSupport = [
  's',
  'e',
  'bs',
  'be',
  'is',
  'ie',
  'block',
  'inline'
]

const paddingsRules = paddings.map(v => {
  const [regex, matcher, ...another] = v
  return [
    regex,
    (...args) => {
      const [[, direction]] = args
      if (unSupport.includes(direction)) return ruleCallback(...args)
      return matcher(...args)
    },
    ...another
  ]
})

const marginsRules = margins.map(v => {
  const [regex, matcher, ...another] = v
  return [
    regex,
    (...args) => {
      const [[, direction]] = args
      if (unSupport.includes(direction)) return ruleCallback(...args)
      return matcher(...args)
    },
    ...another
  ]
})

const spacesRules = transformEmptyRule(spaces)

export {
  paddingsRules as paddings,
  marginsRules as margins,
  spacesRules as spaces
}
