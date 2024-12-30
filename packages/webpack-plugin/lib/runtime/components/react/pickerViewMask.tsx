import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

type OverlayProps = {
  itemHeight: number
  maskContainerStyle?: StyleProp<ViewStyle>
}

const _PickerViewMask = ({
  itemHeight,
  maskContainerStyle
}: OverlayProps) => {
  return (
    <View style={[styles.overlayContainer, maskContainerStyle]} pointerEvents={'none'}>
      <LinearGradient colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.5)']} style={{ flex: 1 }} />
      <View style={{ height: itemHeight }} />
      <LinearGradient colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,1)']} style={{ flex: 1 }} />
    </View>
  )
}
const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100
  }
})

_PickerViewMask.displayName = 'MpxPickerViewMask'
export default _PickerViewMask
