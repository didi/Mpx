import { textDecorations } from '@unocss/preset-mini/rules'
import { transformEmptyRule, ruleCallback, findRawRules } from '../../utils/index.js'

const unSupport = [
  'auto',
  'from-font',
  'overline'
]

const textDecorationsRules = textDecorations.map(v => {
  const [regex, matcher, ...another] = v
  if (typeof matcher === 'function') {
    return [
      regex,
      (...args) => {
        const [[, v]] = args
        if (unSupport.includes(v)) return ruleCallback(...args)
        const res = matcher(...args)
        if (res['text-decoration-thickness'] || res['text-underline-offset']) {
          return ruleCallback(...args)
        }
        return res
      },
      ...another
    ]
  }
  return v
})

const textDecorationsWavyStyle = transformEmptyRule(
  findRawRules(['underline-wavy', 'decoration-wavy'], textDecorationsRules)
)

textDecorationsRules.push(...textDecorationsWavyStyle)

export {
  textDecorationsRules as textDecorations
}
