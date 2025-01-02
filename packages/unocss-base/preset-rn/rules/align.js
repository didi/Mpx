import { textAligns, verticalAligns } from '@unocss/preset-mini/rules'
import { findRawRules, ruleCallback, transformEmptyRule } from '../../utils/index.js'

const support = [
  'mid',
  'start',
  'btm',
  'end',
  'auto',
  'top',
  'bottom',
  'middle'
]

const verticalAlignsRules = verticalAligns.map(v => {
  const [regex, matcher, ...another] = v
  return [
    regex,
    (...args) => {
      const [[, v]] = args
      if (support.includes(v)) return matcher(...args)
      return ruleCallback(...args)
    },
    ...another
  ]
})

const textAlignValuesRules = transformEmptyRule(
  findRawRules(
    ['text-start', 'text-end', 'text-align-start', 'text-align-end'],
    textAligns
  )
)

export {
  verticalAlignsRules as verticalAligns,
  textAlignValuesRules as textAligns
}
