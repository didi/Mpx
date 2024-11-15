import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

type OverlayProps = {
  itemHeight: number
  overlayItemStyle?: StyleProp<ViewStyle>
  overlayContainerStyle?: StyleProp<ViewStyle>
}

const Overlay = ({ itemHeight, overlayItemStyle, overlayContainerStyle }: OverlayProps) => {
  return (
    <View style={[styles.overlayContainer, overlayContainerStyle]} pointerEvents={'none'}>
      <View
        style={[styles.selection, { height: itemHeight }, overlayItemStyle]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selection: {
    opacity: 0.05,
    backgroundColor: '#000',
    borderRadius: 8,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // borderColor: 'rgba(0, 0, 0, 0.05)',
    // borderRadius: 0,
    alignSelf: 'stretch'
  }
})

export default React.memo(Overlay)
