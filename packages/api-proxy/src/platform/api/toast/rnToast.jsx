import { View, Text, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native'
import { successHandle, failHandle } from '../../../common/js'
import Portal from '@mpxjs/webpack-plugin/lib/runtime/components/react/dist/mpx-portal'

let toastKey
let isLoadingShow
const dimensionsScreen = Dimensions.get('screen')
const screenHeight = dimensionsScreen.height
const contentTop = parseInt(screenHeight * 0.35)
let tId // show duration 计时id
const styles = StyleSheet.create({
  toastContent: {
    maxWidth: '60%',
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: contentTop // 小程序里面展示偏上一点
  },
  toastWrap: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10000,
    position: "absolute",
    display: 'flex',
    alignItems: 'center'
  },
  toastHasIcon: {
    height: 110,
    width: 120
  },
  toastImg: {
    width: 40,
    height: 40,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  toastText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 18,
    height: 18,
    overflow: 'hidden',
    marginTop: 10
  }
})

function showToast (options = {}) {
  const { title, icon = 'success', image, duration = 1500, mask = false, success, fail, complete, isLoading } = options
  let ToastView
  const successPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcAgMAAACegTrLAAAADFBMVEUAAAD////R0dHj4+PcME2AAAAAAXRSTlMAQObYZgAAANNJREFUSMft1FEKwkAMBNBGyBFyH4/gR8f+ehSPLtiyQ+wM2C8Rmp+WQN90N8tOZ/1/4SbbYfpp+sBVMqafgGQKs+FvkjF8GR6aj4M8NB+GT8OX5i+GT8OX4aH5MHwZHpoPw+c3fA0xGl/zYBrP92o8vwVwF3NO8tySjXmINQLAs/WX9S8bP9UGJUZSi8MAuUqsj75payPxuWn1BmrjewCCfAvA4Fmjvx8HQL4HiJEHeRmg5k2+B8gTFeRFwL7NzREB/sCKwsG7KN2VSb7XMp31i3oBatNdEForTOoAAAAASUVORK5CYII='
  const errorPng = 'data:image/png;base64,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'
  const iconImg = {
    success: successPng,
    error: errorPng
  }
  const pointerEvents = mask ? 'auto' : 'none'
  isLoadingShow = isLoading
  if (tId) {
    clearTimeout(tId)
  }
  tId = null
  if (image || icon === 'success' || icon === 'error') {
    ToastView = <View style={styles.toastWrap} pointerEvents={pointerEvents}>
      <View style={[styles.toastContent, styles.toastHasIcon]}>
        <Image style={ styles.toastImg } source={{uri: image || iconImg[icon]}}></Image>
        { title ? <Text style={styles.toastText}>{title}</Text> : null }
      </View>
    </View>
  } else if (icon === 'loading') {
    ToastView = <View style={styles.toastWrap} pointerEvents={pointerEvents}>
      <View style={[styles.toastContent, styles.toastHasIcon]}>
        <ActivityIndicator
          animating
          size='small'
          color='#eee'
        />
        { title ? <Text style={styles.toastText}>{title}</Text> : null }
      </View>
    </View>
  }  else  {
    ToastView = <View style={styles.toastWrap} pointerEvents={pointerEvents}>
      <View style={styles.toastContent}>
        { title ? <Text numberOfLines={2} style={{ ...styles.toastText, ...(icon === 'none' ? {
            height: 'auto',
            marginTop: 0
          } : {}) }}>{title}</Text> : null }
      </View>
    </View>
  }
  try {
    if (toastKey) {
      Portal.remove(toastKey)
    }
    toastKey = Portal.add(ToastView)
    if (!isLoading) {
      tId = setTimeout(() => {
        Portal.remove(toastKey)
        toastKey = null
      }, duration)
    }
    const result = {
      errMsg: 'showToast:ok'
    }
    successHandle(result, success, complete)
  } catch (e) {
    const result = {
      errMsg: `showToast:fail invalid ${e}`
    }
    failHandle(result, fail, complete)
  }
}

function hideToast(options = {}) {
  const { noConflict = false, success, fail, complete } = options

  if (isLoadingShow && noConflict) {
    return
  }
  try {
    if (toastKey) {
      Portal.remove(toastKey)
      toastKey = null
    }
    const result = {
      errMsg: 'hideToast:ok'
    }
    successHandle(result, success, complete)
  } catch (e) {
    const result = {
      errMsg: `hideToast:fail invalid ${e}`
    }
    failHandle(result, fail, complete)
  }
}

function showLoading (options = {}) {
  const { title, mask, success, fail, complete } = options
  showToast({
    title,
    mask,
    icon: 'loading',
    isLoading: true,
    success () {
      const result = {
        errMsg: 'showLoading:ok'
      }
      successHandle(result, success, complete)
    },
    fail (res) {
      const result = {
        errMsg: res.errMsg.replace('showToast', 'showLoading')
      }
      failHandle(result, success, complete)
    }
  })
}

function hideLoading (options = {}) {
  const { noConflict = false, success, fail, complete } = options
  if (!isLoadingShow && noConflict) {
    return
  }
  isLoadingShow = false
  try {
    if (toastKey) {
      Portal.remove(toastKey)
      toastKey = null
    }
    const result = {
      errMsg: 'hideLoading:ok'
    }
    successHandle(result, success, complete)
  } catch (e) {
    const result = {
      errMsg: `hideLoading:fail invalid ${e}`
    }
    failHandle(result, fail, complete)
  }
}

export {
  showToast,
  hideToast,
  showLoading,
  hideLoading
}
