import rules from './rules/index.js'
import theme from './theme.js'

export default function presetRnMpx () {
  return {
    name: '@mpxjs/unocss-preset-rn',
    rules,
    theme
  }
}
