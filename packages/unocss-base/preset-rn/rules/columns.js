import { columns } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const columnsRules = transformEmptyRule(columns)

export { columnsRules as columns }
