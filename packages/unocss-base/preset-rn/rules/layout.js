import { ruleCallback, ruleFallback } from '../../utils/index.js'

const overflows = [
  [
    /^(?:overflow|of)-(.+)$/,
    ([match, v], { generator }) => {
      if (['hidden', 'visiable', 'scroll'].includes(v)) {
        return {
          overflow: v
        }
      } else {
        return ruleFallback(match, generator)
      }
    }
  ],
  [/^(?:overflow|of)-([xy])-(.+)$/, ruleCallback]
]

export { overflows }
