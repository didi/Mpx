import { divides } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const divideRules = transformEmptyRule(divides)

export { divideRules as divides }
