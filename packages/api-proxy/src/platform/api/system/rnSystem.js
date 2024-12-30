import { PixelRatio, Dimensions } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'
import { getFocusedNavigation } from '../../../common/js'

const getWindowInfo = function () {
  const dimensionsScreen = Dimensions.get('screen')
  const navigation = getFocusedNavigation() || {}
  const initialWindowMetricsInset = initialWindowMetrics?.insets || {}
  const navigationInsets = navigation.insets || {}
  const insets = Object.assign(initialWindowMetricsInset, navigationInsets)
  let safeArea = {}
  const { top = 0, bottom = 0, left = 0, right = 0 } = insets

  const screenHeight = __mpx_mode__ === 'ios' ? dimensionsScreen.height : dimensionsScreen.height - bottom // 解决安卓开启屏幕内三建导航安卓把安全区计算进去后产生的影响
  const screenWidth = __mpx_mode__ === 'ios' ? dimensionsScreen.width : dimensionsScreen.width - right
  const layout = navigation.layout || {}
  const layoutHeight = layout.height || 0
  const layoutWidth = layout.width || 0
  const windowHeight = layoutHeight || screenHeight
  try {
    safeArea = {
      left,
      right: screenWidth - right,
      top,
      bottom: screenHeight - bottom,
      height: screenHeight - top - bottom,
      width: screenWidth - left - right
    }
  } catch (error) {
  }
  const result = {
    pixelRatio: PixelRatio.get(),
    windowWidth: layoutWidth || screenWidth,
    windowHeight, // 取不到layout的时候有个兜底
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    screenTop: screenHeight - windowHeight,
    statusBarHeight: safeArea.top,
    safeArea
  }
  return result
}

const getLaunchOptionsSync = function () {
  const options = global.__mpxEnterOptions || {}
  const { path, scene, query } = options
  return {
    path,
    scene,
    query
  }
}

const getEnterOptionsSync = function () {
  const result = getLaunchOptionsSync()
  return result
}

export {
  getWindowInfo,
  getLaunchOptionsSync,
  getEnterOptionsSync
}
