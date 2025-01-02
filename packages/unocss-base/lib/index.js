import { presetUno } from '@unocss/preset-uno'
import presetRn from '../preset-rn/index.js'

// eslint-disable-next-line
const remRE = /(-?[\.\d]+)rem/g

export default function presetMpx (options = {}) {
  const mpxCurrentTargetMode = process.env.MPX_CURRENT_TARGET_MODE
  const isReact = mpxCurrentTargetMode === 'ios' || mpxCurrentTargetMode === 'android'
  const extraPresets = []
  if (isReact) {
    extraPresets.push(presetRn())
    options.dark = 'media'
  }
  const uno = presetUno(options)
  const { baseFontSize = 37.5 } = options

  return {
    ...uno,
    name: '@mpxjs/unocss-base',
    theme: {
      ...uno.theme,
      preflightRoot: ['page,view,text,div,span,::before,::after']
    },
    postprocess: (util) => {
      util.entries.forEach((i) => {
        const value = i[1]
        if (typeof value === 'string' && remRE.test(value)) {
          i[1] = value.replace(remRE, (_, p1) => mpxCurrentTargetMode === 'web'
            ? `${p1 * baseFontSize * (100 / 750).toFixed(8)}vw`
            : `${p1 * baseFontSize}rpx`)
        }
      })
    },
    presets: extraPresets
  }
}
