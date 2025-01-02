import { lineClamps } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const lineClampsRules = transformEmptyRule(lineClamps)

export {
  lineClampsRules as lineClamps
}
