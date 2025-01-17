const TAG_NAME = 'video'

module.exports = function ({ print }) {
  const baiduPropLog = print({ platform: 'baidu', tag: TAG_NAME, isError: false })
  const baiduEventLogError = print({ platform: 'baidu', tag: TAG_NAME, isError: false, type: 'event' })
  const qqPropLog = print({ platform: 'qq', tag: TAG_NAME, isError: false })
  const qqEventLogError = print({ platform: 'qq', tag: TAG_NAME, isError: false, type: 'event' })
  const ttPropLog = print({ platform: 'bytedance', tag: TAG_NAME, isError: false })
  const ttEventLogError = print({ platform: 'bytedance', tag: TAG_NAME, isError: false, type: 'event' })
  const aliPropLog = print({ platform: 'ali', tag: TAG_NAME, isError: false })
  const aliEventLogError = print({ platform: 'ali', tag: TAG_NAME, isError: false, type: 'event' })
  const qaPropLog = print({ platform: 'qa', tag: TAG_NAME, isError: false })
  const qaEventLogError = print({ platform: 'qa', tag: TAG_NAME, isError: false, type: 'event' })
  const iosPropLog = print({ platform: 'ios', tag: TAG_NAME, isError: false })
  const iosEventLogError = print({ platform: 'ios', tag: TAG_NAME, isError: false, type: 'event' })
  const androidPropLog = print({ platform: 'android', tag: TAG_NAME, isError: false })
  const androidEventLogError = print({ platform: 'android', tag: TAG_NAME, isError: false, type: 'event' })
  return {
    test: TAG_NAME,
    web (tag, { el }) {
      el.isBuiltIn = true
      return 'mpx-video'
    },
    android (tag, { el }) {
      el.isBuiltIn = true
      return 'mpx-video'
    },
    ios (tag, { el }) {
      el.isBuiltIn = true
      return 'mpx-video'
    },
    props: [
      {
        test: /^(enable-danmu|danmu-btn|show-progress|play-btn-position|enable-play-gesture|auto-pause-if-navigate|auto-pause-if-open-native|vslide-gesture|vslide-gesture-in-fullscreen|ad-unit-id|poster-for-crawler|show-casting-button|picture-in-picture-mode|picture-in-picture-show-progress|enable-auto-rotation|show-snapshot-button|show-screen-lock-button)$/,
        ali: aliPropLog
      },
      {
        test: /^(duration|play-btn-position|auto-pause-if-navigate|auto-pause-if-open-native|ad-unit-id|poster-for-crawler|show-casting-button|picture-in-picture-mode|picture-in-picture-show-progress|enable-auto-rotation|show-snapshot-button|show-screen-lock-button)$/,
        swan: baiduPropLog
      },
      {
        test: /^(vslide-gesture)$/,
        qq (obj) {
          const propsMap = {
            'vslide-gesture': 'page-gesture'
          }
          obj.name = propsMap[obj.name]
          return obj
        }
      },
      {
        test: /^(vslide-gesture-in-fullscreen|ad-unit-id|show-screen-lock-button|enable-auto-rotation|show-snapshot-button|picture-in-picture-show-progress|picture-in-picture-mode|poster-for-crawler|show-casting-button|enable-play-gesture)$/,
        qq: qqPropLog
      },
      {
        test: /^(duration|danmu-list|danmu-btn|enable-danmu|muted|initial-time|page-gesture|direction|show-progress|show-center-play-btn|enable-progress-gesture|show-mute-btn|title|enable-play-gesture|auto-pause-if-navigate|auto-pause-if-open-native|vslide-gesture|vslide-gesture-in-fullscreen|ad-unit-id|poster-for-crawler|show-casting-button|picture-in-picture-mode|picture-in-picture-show-progress|enable-auto-rotation|show-screen-lock-button|show-snapshot-button)$/,
        tt: ttPropLog
      },
      {
        test: /^(duration|danmu-list|danmu-btn|enable-danmu|muted|initial-time|page-gesture|direction|show-progress|show-center-play-btn|enable-progress-gesture|show-mute-btn|enable-play-gesture|auto-pause-if-navigate|auto-pause-if-open-native|vslide-gesture|vslide-gesture-in-fullscreen|ad-unit-id|poster-for-crawler|show-casting-button|picture-in-picture-mode|picture-in-picture-show-progress|enable-auto-rotation|show-screen-lock-button|show-snapshot-button)$/,
        qa: qaPropLog
      },
      {
        test: /^(duration|enable-danmu|danmu-btn|page-gesture|direction|show-progress|show-fullscreen-btn|show-center-play-btn|enable-progress-gesture|show-mute-btn|title|play-btn-position|enable-play-gesture|auto-pause-if-navigate|auto-pause-if-open-native|vslide-gesture|vslide-gesture-in-fullscreen|show-bottom-progress|ad-unit-id|poster-for-crawler|show-casting-button|picture-in-picture-mode|picture-in-picture-show-progress| picture-in-picture-init-position|show-snapshot-button|show-screen-lock-button|show-background-playback-button|background-poster|referrer-policy|is-live)$/,
        ios: iosPropLog
      },
      {
        test: /^(duration|enable-danmu|danmu-btn|page-gesture|direction|show-progress|show-fullscreen-btn|show-center-play-btn|enable-progress-gesture|show-mute-btn|title|play-btn-position|enable-play-gesture|auto-pause-if-navigate|auto-pause-if-open-native|vslide-gesture|vslide-gesture-in-fullscreen|show-bottom-progress|ad-unit-id|poster-for-crawler|show-casting-button|picture-in-picture-mode|picture-in-picture-show-progress| picture-in-picture-init-position|enable-auto-rotation|show-snapshot-button|show-screen-lock-button|show-background-playback-button|background-poster|referrer-policy|is-live)$/,
        android: androidPropLog
      }
    ],
    event: [
      {
        test: /^(timeupdate|fullscreenchange|waiting|loadedmetadata)$/,
        ali (evtName) {
          const eventMap = {
            timeupdate: 'timeUpdate',
            fullscreenchange: 'fullScreenChange',
            waiting: 'loading',
            loadedmetadata: 'renderStart'
          }
          return eventMap[evtName]
        }
      },
      {
        test: /^(enterpictureinpicture|leavepictureinpicture|controlstoggle|seekcomplete)$/,
        ali: aliEventLogError
      },
      {
        test: /^(enterpictureinpicture|leavepictureinpicture|controlstoggle|loadedmetadata|seekcomplete)$/,
        qq: qqEventLogError
      },
      {
        test: /^(progress|enterpictureinpicture|leavepictureinpicture|controlstoggle|loadedmetadata|seekcomplete)$/,
        swan: baiduEventLogError
      },
      {
        test: /^(progress|enterpictureinpicture|leavepictureinpicture|controlstoggle|loadedmetadata|seekcomplete)$/,
        tt: ttEventLogError
      },
      {
        test: /^(progress|enterpictureinpicture|leavepictureinpicture|controlstoggle|loadedmetadata|seekcomplete)$/,
        qa: qaEventLogError
      },
      {
        test: /^(progress|controlstoggle|enterpictureinpicture|leavepictureinpicture|castinguserselect|castingstatechange|castinginterrupt)$/,
        ios: iosEventLogError
      },
      {
        test: /^(progress|enterpictureinpicture|leavepictureinpicture|castinguserselect|castingstatechange|castinginterrupt)$/,
        android: androidEventLogError
      }
    ]
  }
}
