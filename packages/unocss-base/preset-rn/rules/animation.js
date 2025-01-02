import { animations } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const animationsRules = transformEmptyRule(animations)

export { animationsRules as animations }
