import { viewTransition } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const viewTransitionRules = transformEmptyRule(viewTransition)

export {
  viewTransitionRules as viewTransition
}
