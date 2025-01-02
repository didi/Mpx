import { platformSelect } from '../utils/index.js'

export default {
  preflightRoot: [],
  letterSpacing: {
    tighter: '-0.5px',
    tight: '-0.25px',
    normal: '0px',
    wide: '0.25px',
    wider: '0.5px',
    widest: '1px'
  },
  boxShadow: {
    DEFAULT: '0 1px 3px rgba(0 0 0 / 0.1)',
    none: '0 0 rgba(0 0 0 / 0)',
    sm: '0 1px 2px rgba(0 0 0 / 0.05)',
    md: '0 4px 6px rgba(0 0 0 / 0.1)',
    lg: '0 10px 15px rgba(0 0 0 / 0.1)',
    xl: '0 20px 25px rgba(0 0 0 / 0.1)',
    '2xl': '0 25px 50px rgba(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0 0 0 / 0.05)'
  },
  fontFamily: {
    sans: platformSelect({ android: 'san-serif', ios: "'system font'" }),
    serif: platformSelect({ android: 'serif', ios: 'Georgia' }),
    mono: platformSelect({ android: 'mono', ios: "'Courier New'" })
  }
}
