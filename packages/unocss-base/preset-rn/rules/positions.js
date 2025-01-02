import {
  positions,
  justifies,
  orders,
  alignments,
  placements,
  floats,
  boxSizing
} from '@unocss/preset-mini/rules'
import {
  findRawRules,
  ruleCallback,
  transformEmptyRule
} from '../../utils/index.js'

const unSupport = ['sticky', 'fixed']
// position 不支持的属性抽离并覆盖
const positionsRules = positions.map(v => {
  const [regex, matcher, ...another] = v
  return [
    regex,
    (...args) => {
      const [[, v]] = args
      if (unSupport.includes(v)) return ruleCallback(...args)
      return matcher(...args)
    },
    ...another
  ]
})

// 不支持的规则过滤覆盖
const justifiesRules = [
  ...transformEmptyRule(
    findRawRules(
      [
        'justify-left',
        'justify-right',
        'justify-stretch',
        'justify-items-center',
        'justify-items-end',
        'justify-items-start',
        'justify-items-stretch',
        'justify-self-auto',
        'justify-self-center',
        'justify-self-end',
        'justify-self-stretch',
        'justify-self-start'
      ],
      justifies
    )
  )
]

const ordersRules = transformEmptyRule(orders)

const placementsRules = transformEmptyRule(placements)

const flexGridJustifiesAlignmentsRules = transformEmptyRule([
  // flex部分不支持
  ...[...justifiesRules, ...placementsRules].map(
    ([k, v]) => [`flex-${k}`, v]
  ),
  // grid全部不支持
  ...[...justifies, ...alignments, ...placements].map(([k, v]) => [
    `grid-${k}`,
    v
  ])
])

// floats 不支持的属性抽离并覆盖
const floatsRules = transformEmptyRule(floats)

const boxSizingRules = transformEmptyRule(
  findRawRules(['box-content'], boxSizing)
)

export {
  positionsRules as positions,
  justifiesRules as justifies,
  ordersRules as orders,
  placementsRules as placements,
  flexGridJustifiesAlignmentsRules as flexGridJustifiesAlignments,
  floatsRules as floats,
  boxSizingRules as boxSizing
}
