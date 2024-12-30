import { View, Text, StyleSheet } from 'react-native'
import { successHandle, failHandle } from '../../../common/js'
import Portal from '@mpxjs/webpack-plugin/lib/runtime/components/react/dist/mpx-portal'
import { getWindowInfo } from '../system/rnSystem'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated'

function showActionSheet (options = {}) {
  const { alertText, itemList = [], itemColor = '#000000', success, fail, complete } = options
  const windowInfo = getWindowInfo()
  const bottom = windowInfo.screenHeight - windowInfo.safeArea.bottom
  let actionSheetKey = null
  const styles = StyleSheet.create({
    actionActionMask: {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      position: 'absolute',
      zIndex: 1000
    },
    actionSheetContent: {
      backgroundColor: '#ffffff',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: bottom
    },
    itemStyle: {
      paddingTop: 15,
      paddingBottom: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    itemTextStyle: {
      fontSize: 18
    },
    buttonStyle: {
      fontSize: 18,
      paddingTop: 10,
      paddingBottom: 10
    }
  })
  function ActionSheet () {
    const offset = useSharedValue(1000);

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ translateY: offset.value }],
    }))

    const slideOut = () => {
      // Will change fadeAnim value to 1 in 5 seconds
      offset.value = withTiming(1000)
    }

    offset.value = withTiming(0)

    const selectAction = function (index, e) {
      e.stopPropagation()
      const result = {
        errMsg: 'showActionSheet:ok',
        tapIndex: index
      }
      successHandle(result, success, complete)
      remove()
    }

    const remove = function () {
      if (actionSheetKey) {
        slideOut()
        Portal.remove(actionSheetKey)
        actionSheetKey = null
        setTimeout(() => {
          Portal.remove(actionSheetKey)
          actionSheetKey = null
        }, 200)
      }
    }

    const cancelAction = function (e) {
      e.stopPropagation()
      const result = {
        errMsg: 'showActionSheet:fail cancel'
      }
      failHandle(result, fail, complete)
      remove()
    }
    return (
      <View onTouchEnd={cancelAction} style={styles.actionActionMask}>
        <Animated.View style={[styles.actionSheetContent, animatedStyles]}>
          { alertText ? <View style={ styles.itemStyle }><Text style={[styles.itemTextStyle, { color: '#666666' }]}>{alertText}</Text></View> : null }
          { itemList.map((item, index) => <View key={index} onTouchEnd={(e) => selectAction(index, e)} style={ [styles.itemStyle, itemList.length -1 === index ? {
            borderBottomWidth: 6,
            borderBottomStyle: 'solid',
            borderBottomColor: '#f7f7f7'
          } : {}] }><Text style={[styles.itemTextStyle, { color: itemColor }]}>{item}</Text></View>) }
          <View style={styles.buttonStyle} onTouchEnd={cancelAction}><Text style={{ color: "#000000", width: "100%", textAlign: "center" }}>取消</Text></View>
        </Animated.View>
      </View>
    )
  }
  
  actionSheetKey = Portal.add(<ActionSheet/>)
}

export {
  showActionSheet
}
