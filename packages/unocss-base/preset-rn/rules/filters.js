import { filters, filterBase } from '@unocss/preset-wind/rules'
import { transformEmptyRule, findRawRules, ruleCallback } from '../../utils/index.js'

const filterValue = [
  'blur',
  'brightness',
  'contrast',
  'grayscale',
  'hue-rotate',
  'invert',
  'saturate',
  'sepia'
]

const newFilters = filters.map(v => {
  const [regex, matcher, ...another] = v
  if (typeof matcher === 'function') {
    return [
      regex,
      (...args) => {
        const [[r]] = args
        if (/^backdrop/.test(r)) return ruleCallback(...args)
        const res = matcher(...args)
        // 统一作为工具类使用
        if (filterValue.some(i => r.includes(i))) {
          delete res.filter
        }
        return res
      },
      ...another
    ]
  }
  return v
})

const backDropFilter = transformEmptyRule(
  findRawRules(['backdrop-filter', 'backdrop-filter-none'], filters)
)

const filterBaseRule = [
  ['filter', null],
  ['filter', {
    ...filterBase,
    filter: 'var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-drop-shadow) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia)'
  }]
]

newFilters.push(...backDropFilter, ...filterBaseRule)

export default newFilters
