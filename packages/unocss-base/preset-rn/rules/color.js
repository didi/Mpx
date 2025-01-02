import { colorScheme } from '@unocss/preset-mini/rules'
import { transformEmptyRule } from '../../utils/index.js'

const colorSchemeRules = transformEmptyRule(colorScheme)

export { colorSchemeRules as colorScheme }
