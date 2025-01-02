import { grids } from '@unocss/preset-mini/rules'
import { transformEmptyRule } from '../../utils/index.js'

// flex 不支持的属性抽离并覆盖
const gridsRules = transformEmptyRule(grids)

export {
  gridsRules as grids
}
