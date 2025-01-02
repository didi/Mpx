import { touchActions } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const touchActionsRules = transformEmptyRule(touchActions)

export { touchActionsRules as touchActions }
