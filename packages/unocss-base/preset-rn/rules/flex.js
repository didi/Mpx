import { flex } from '@unocss/preset-mini/rules'
import { findRawRules, transformEmptyRule } from '../../utils/index.js'

// flex 不支持的属性抽离并覆盖
const flexRules = transformEmptyRule(findRawRules([
  'flex-inline',
  'inline-flex'
], flex))

export {
  flexRules as flex
}
