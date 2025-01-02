import {
  globalKeywords,
  transformEmptyRule
} from '../../utils/index.js'

export const globalRules = transformEmptyRule(
  globalKeywords.map(v => [new RegExp(`.*-${v}$`)])
)
