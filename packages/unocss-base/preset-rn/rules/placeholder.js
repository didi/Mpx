import { placeholders } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const placeholdersRules = transformEmptyRule(placeholders)

export { placeholdersRules as placeholders }
