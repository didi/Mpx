import { containerParent } from '@unocss/preset-mini/rules'
import { container } from '@unocss/preset-wind/rules'
import { transformEmptyRule } from '../../utils/index.js'

const containerParentRules = transformEmptyRule(containerParent)
const containerRules = transformEmptyRule(container)

export {
  containerParentRules as containerParent,
  containerRules as container
}
