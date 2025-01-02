import { transitions } from '@unocss/preset-mini/rules'
import { transformEmptyRule } from '../../utils/index.js'

const transitionsRules = transformEmptyRule(transitions)

export { transitionsRules as transitions }
