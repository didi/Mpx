import { imageRenderings, overscrolls, listStyle } from '@unocss/preset-wind/rules'
import { appearance, outline, willChange } from '@unocss/preset-mini/rules'
import { transformEmptyRule } from '../../utils/index.js'

// todo
// const placeholder = findRawRules('$ placeholder', rules, true)

export default [
  ...transformEmptyRule(
    overscrolls,
    imageRenderings,
    listStyle,
    outline,
    willChange,
    appearance
  )
]
