import { imageRenderings, overscrolls, listStyle, accents, carets } from '@unocss/preset-wind/rules'
import { appearance, outline, willChange } from '@unocss/preset-mini/rules'
import { transformEmptyRule } from '../../utils/index.js'

export default [
  ...transformEmptyRule(
    overscrolls,
    imageRenderings,
    listStyle,
    outline,
    willChange,
    appearance,
    accents,
    carets,
    willChange
  )
]
