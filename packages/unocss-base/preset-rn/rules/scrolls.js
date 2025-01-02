import { scrolls } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const scrollsRules = transformEmptyRule(scrolls)

export {
  scrollsRules as scrolls
}
