import { backgroundStyles } from '@unocss/preset-wind/rules'
import { findRawRules, transformEmptyRule } from '../../utils/index.js'

// todo background-position 剔除
const NewBackgroundRules = transformEmptyRule(findRawRules(
  [
    // attachments
    'bg-fixed',
    'bg-locale',
    'bg-scroll',
    // repeat
    /^bg-repeat-?.*/,
    // origins
    /^bg-origin-.*/,
    // clips
    /^bg-clip-.*/
  ],
  backgroundStyles
))

export { NewBackgroundRules as backgroundStyles }
