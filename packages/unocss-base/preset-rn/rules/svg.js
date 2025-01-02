import { svgUtilities } from '@unocss/preset-mini/rules'
import { transformEmptyRule } from '../../utils/index.js'

const svgUtilitiesRules = transformEmptyRule(svgUtilities)

export { svgUtilitiesRules as svgUtilities }
