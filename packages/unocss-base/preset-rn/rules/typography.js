import { transformEmptyRule } from '../../utils/index.js'
import {
  writingModes,
  writingOrientations,
  hyphens,
  fontVariantNumeric
} from '@unocss/preset-wind/rules'
import {
  textStrokes,
  textIndents,
  tabSizes,
  whitespaces,
  breaks,
  textOverflows,
  textWraps,
  fontSmoothings
} from '@unocss/preset-mini/rules'

export default [
  ...transformEmptyRule(
    textIndents,
    textStrokes,
    tabSizes,
    whitespaces,
    breaks,
    textOverflows,
    hyphens,
    writingModes,
    writingOrientations,
    textWraps,
    fontSmoothings,
    fontVariantNumeric
  )
]
