import { PixelRatio, Dimensions } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'
import { getFocusedNavigation } from '../../../common/js'

const getWindowInfo = function () {
  const dimensionsScreen = Dimensions.get('screen')
  const navigation = getFocusedNavigation()
  const insets = Object.assign(initialWindowMetrics?.insets, navigation?.insets)
  let safeArea = {}
  const { top = 0, bottom = 0, left = 0, right = 0 } = insets
  const screenHeight = dimensionsScreen.height
  const screenWidth = dimensionsScreen.width
  const layout = navigation?.layout || {}
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
    safeArea
  }
  return result
}

export {
  getWindowInfo
}
