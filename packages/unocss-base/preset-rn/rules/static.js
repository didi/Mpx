import {
  appearances,
  breaks,
  contains,
  contents,
  contentVisibility,
  cursors,
  displays,
  fontSmoothings,
  fontStyles,
  resizes,
  textOverflows,
  textWraps,
  whitespaces
} from '@unocss/preset-mini/rules'
import { backgroundBlendModes, mixBlendModes, hyphens, isolations, objectPositions } from '@unocss/preset-wind/rules'
import { findRawRules, transformEmptyRule } from '../../utils/index.js'

// display不支持的属性抽离并覆盖
const displaysRules = transformEmptyRule(
  findRawRules(
    ['inline', 'block', 'inline-block', 'contents', 'flow-root', 'list-item'],
    displays
  )
)

const backgroundBlendModesRules = transformEmptyRule(backgroundBlendModes)

const appearancesRules = transformEmptyRule(
  findRawRules(['visible', 'invisible'], appearances)
)

const cursorsRules = transformEmptyRule(cursors)

const containsRules = transformEmptyRule(contains)

const resizesRules = transformEmptyRule(resizes)

const whitespacesRules = transformEmptyRule(whitespaces)

const contentVisibilityRules = transformEmptyRule(contentVisibility)

const contentsRules = transformEmptyRule(contents)

const breaksRules = transformEmptyRule(breaks)

const textWrapsRules = transformEmptyRule(textWraps)

const textOverflowsRules = transformEmptyRule(
  findRawRules(['text-ellipsis', 'text-clip'], textOverflows)
)

const fontStylesRules = transformEmptyRule(
  findRawRules(['oblique', 'font-oblique'], fontStyles)
)

const fontSmoothingsRules = transformEmptyRule(fontSmoothings)

const hyphensRules = transformEmptyRule(hyphens)

const objectPositionsRules = transformEmptyRule(objectPositions)

const isolationsRules = transformEmptyRule(isolations)

const mixBlendModesRules = transformEmptyRule(mixBlendModes)

export {
  backgroundBlendModesRules as backgroundBlendModes,
  displaysRules as displays,
  appearancesRules as appearances,
  cursorsRules as cursors,
  containsRules as contains,
  resizesRules as resizes,
  whitespacesRules as whitespaces,
  contentVisibilityRules as contentVisibility,
  contentsRules as contents,
  breaksRules as breaks,
  textWrapsRules as textWraps,
  textOverflowsRules as textOverflows,
  fontStylesRules as fontStyles,
  fontSmoothingsRules as fontSmoothings,
  hyphensRules as hyphens,
  objectPositionsRules as objectPositions,
  isolationsRules as isolations,
  mixBlendModesRules as mixBlendModes
}
