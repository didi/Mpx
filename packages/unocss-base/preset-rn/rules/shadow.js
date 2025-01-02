import { colorableShadows, colorResolver, h, hasParseableColor } from '@unocss/preset-mini/utils'

const boxShadows = [
  [/^shadow(?:-(.+))?$/, (match, context) => {
    const [, d] = match
    const { theme } = context
    const v = theme.boxShadow?.[d || 'DEFAULT']
    const c = d ? h.bracket.cssvar(d) : undefined

    if ((v != null || c != null) && !hasParseableColor(c, theme, 'shadowColor')) {
      return {
        'box-shadow': colorableShadows(v || c, '--un-shadow-color').join(',')
      }
    }
    return colorResolver('--un-shadow-color', 'shadow', 'shadowColor')(match, context)
  }]
]

export default boxShadows
