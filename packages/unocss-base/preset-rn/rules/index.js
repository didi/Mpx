import { colorScheme } from './color.js'
import { backgroundStyles } from './background.js'
import { margins, paddings, spaces } from './spacing.js'
import typography from './typography.js'
import shadow from './shadow.js'
import behaviors from './behaviors.js'
import { overflows } from './layout.js'
import filters from './filters.js'
import {
  appearances,
  backgroundBlendModes,
  contains,
  cursors,
  displays,
  resizes,
  whitespaces,
  contentVisibility,
  contents,
  breaks,
  textWraps,
  textOverflows,
  fontStyles,
  fontSmoothings,
  hyphens,
  objectPositions,
  isolations,
  mixBlendModes
} from './static.js'
import {
  flexGridJustifiesAlignments,
  justifies,
  orders,
  placements,
  positions,
  floats,
  boxSizing
} from './positions.js'
import { flex } from './flex.js'
import { globalRules } from './global.js'
import { textAligns, verticalAligns } from './align.js'
import { container, containerParent } from './container.js'
import { animations } from './animation.js'
import { columns } from './columns.js'
import { divides } from './divide.js'
import { placeholders } from './placeholder.js'
import { scrolls } from './scrolls.js'
import { tables } from './table.js'
import { touchActions } from './touch-actions.js'
import { viewTransition } from './view-transition.js'
import { gaps } from './gap.js'
import { transitions } from './transition.js'
import { svgUtilities } from './svg.js'
import ring from './ring.js'
import border from './border.js'
import { transforms } from './transforms.js'
import { textDecorations } from './decoration.js'

export default [
  ...typography,
  ...textDecorations,
  ...shadow,
  ...behaviors,
  ...filters,
  ...ring,
  ...border,
  // align
  ...verticalAligns,
  ...textAligns,
  // color
  ...colorScheme,
  ...backgroundStyles,
  // container
  ...containerParent,
  ...container,
  // layout
  ...overflows,
  // positions
  ...floats,
  ...flex,
  ...positions,
  ...justifies,
  ...orders,
  ...placements,
  ...flexGridJustifiesAlignments,
  ...boxSizing,
  // static
  ...displays,
  ...backgroundBlendModes,
  ...appearances,
  ...cursors,
  ...contains,
  ...resizes,
  ...whitespaces,
  ...contentVisibility,
  ...contents,
  ...breaks,
  ...textWraps,
  ...textOverflows,
  ...fontStyles,
  ...fontSmoothings,
  ...hyphens,
  ...objectPositions,
  ...isolations,
  ...mixBlendModes,
  // spaceing
  ...paddings,
  ...margins,
  ...spaces,
  // animations,
  ...animations,
  // columns
  ...columns,
  // divide
  ...divides,
  // placeholder
  ...placeholders,
  // scrolls
  ...scrolls,
  // tables
  ...tables,
  // touchActions
  ...touchActions,
  // view-transition
  ...viewTransition,
  // gap
  ...gaps,
  // transition
  ...transitions,
  // svg
  ...svgUtilities,
  // transforms
  ...transforms,
  // global
  ...globalRules
]
