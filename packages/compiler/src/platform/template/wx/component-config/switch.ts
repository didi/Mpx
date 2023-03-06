import { DefineConfig } from '.'

const TAG_NAME = 'switch'

export default <DefineConfig> function ({ print }) {
  const aliPropLog = print({ platform: 'ali', tag: TAG_NAME, isError: false })
  const jdPropLog = print({ platform: 'jd', tag: TAG_NAME, isError: false })

  return {
    test: TAG_NAME,
    web (_tag, { el }) {
      el.isBuiltIn = true
      return 'mpx-switch'
    },
    props: [
      {
        test: /^type$/,
        ali: aliPropLog
      },
      {
        test: /^disabled$/,
        jd: jdPropLog
      }
    ]
  }
}
