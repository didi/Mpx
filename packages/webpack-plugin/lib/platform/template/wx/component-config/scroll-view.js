const TAG_NAME = 'scroll-view'

module.exports = function ({ print }) {
  const baiduPropLog = print({ platform: 'baidu', tag: TAG_NAME, isError: false })
  const baiduEventLog = print({ platform: 'baidu', tag: TAG_NAME, isError: false, type: 'event' })
  const ttPropLog = print({ platform: 'bytedance', tag: TAG_NAME, isError: false })
  const jdPropLog = print({ platform: 'jd', tag: TAG_NAME, isError: false })
  const jdEventLog = print({ platform: 'jd', tag: TAG_NAME, isError: false, type: 'event' })
  const qaPropLog = print({ platform: 'qa', tag: TAG_NAME, isError: false })
  const ttEventLog = print({ platform: 'bytedance', tag: TAG_NAME, isError: false, type: 'event' })
  const aliPropLog = print({ platform: 'ali', tag: TAG_NAME, isError: false })
  const aliEventLog = print({ platform: 'ali', tag: TAG_NAME, isError: false, type: 'event' })
  const qqEventLog = print({ platform: 'qq', tag: TAG_NAME, isError: false, type: 'event' })
  const qqPropLog = print({ platform: 'qq', tag: TAG_NAME, isError: false })
  const androidEventLog = print({ platform: 'android', tag: TAG_NAME, isError: false, type: 'event' })
  const androidPropLog = print({ platform: 'android', tag: TAG_NAME, isError: false })
  const iosEventLog = print({ platform: 'ios', tag: TAG_NAME, isError: false, type: 'event' })
  const iosPropLog = print({ platform: 'ios', tag: TAG_NAME, isError: false })

  return {
    test: TAG_NAME,
    web (tag, { el }) {
      el.isBuiltIn = true
      return 'mpx-scroll-view'
    },
    android (tag, { el }) {
      el.isBuiltIn = true
      return 'mpx-scroll-view'
    },
    ios (tag, { el }) {
      el.isBuiltIn = true
      return 'mpx-scroll-view'
    },
    props: [
      {
        test: /^(enable-flex|scroll-anchoring|refresher-enabled|refresher-threshold|refresher-default-style|refresher-background|refresher-triggered|enhanced|bounces|show-scrollbar|paging-enabled|fast-deceleration)$/,
        ali: aliPropLog,
        tt: ttPropLog,
        qq: qqPropLog,
        swan: baiduPropLog
      },
      {
        test: /^(enable-back-to-top)$/,
        swan: baiduPropLog,
        tt: ttPropLog
      },
      {
        test: /^(enable-flex|scroll-anchoring|refresher-enabled|refresher-threshold|refresher-default-style|refresher-background|refresher-triggered)$/,
        jd: jdPropLog
      },
      {
        test: /^(enable-back-to-top|enable-flex|scroll-anchoring|enhanced|bounces|show-scrollbar|paging-enabled|fast-deceleration|binddragstart|binddragging|binddragend)$/,
        qa: qaPropLog
      },
      {
        test: /^(refresher-threshold|enable-passive|scroll-anchoring|using-sticky|fast-deceleration|enable-flex)$/,
        android: androidPropLog,
        ios: iosPropLog
      },
      {
        test: /^(refresher-default-style|refresher-background)$/,
        ios: iosPropLog
      }
    ],
    event: [
      {
        test: /^(scrolltoupper|scrolltolower|scroll)$/,
        ali (eventName) {
          const eventMap = {
            scrolltoupper: 'scrollToUpper',
            scrolltolower: 'scrollToLower',
            scroll: 'scroll'
          }
          return eventMap[eventName]
        }
      },
      {
        test: /^(refresherpulling|refresherrefresh|refresherrestore|refresherabort)$/,
        jd: jdEventLog
      },
      {
        test: /^(dragstart|dragging|dragend|refresherpulling|refresherrefresh|refresherrestore|refresherabort)$/,
        ali: aliEventLog,
        tt: ttEventLog,
        qq: qqEventLog,
        swan: baiduEventLog
      },
      {
        test: /^(refresherpulling|refresherrestore|refresherabort)$/,
        android: androidEventLog,
        ios: iosEventLog
      }
    ]
  }
}
