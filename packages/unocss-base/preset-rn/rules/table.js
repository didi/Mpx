import { tables } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const tablesRules = transformEmptyRule(tables)

export { tablesRules as tables }
