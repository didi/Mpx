import React, { useEffect } from 'react'
import { LayoutChangeEvent } from 'react-native'
import Reanimated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { wrapChildren, extendObject } from './utils'
import { createFaces } from './pickerFaces'
import { usePickerViewColumnAnimationContext } from './pickerVIewContext'

interface PickerColumnItemProps {
  item: React.ReactElement
  index: number
  itemHeight: number
  itemWidth?: number | '100%'
  textStyleFromParent: Record<string, any>
  textStyle: Record<string, any>
  hasVarDec: boolean
  varContext: Record<string, any>
  visibleCount: number
  textProps?: any
  onItemLayout?: (e: LayoutChangeEvent) => void
}

const _PickerViewColumnItem: React.FC<PickerColumnItemProps> = ({
  item,
  index,
  itemHeight,
  itemWidth = '100%',
  textStyleFromParent,
  textStyle,
  hasVarDec,
  varContext,
  textProps,
  visibleCount,
  onItemLayout
}) => {
  const offsetYShared = usePickerViewColumnAnimationContext()
  const facesShared = useSharedValue(createFaces(itemHeight, visibleCount))

  useEffect(() => {
    facesShared.value = createFaces(itemHeight, visibleCount)
  }, [itemHeight])

  const animatedStyles = useAnimatedStyle(() => {
    const inputRange = facesShared.value.map((f) => itemHeight * (index + f.index))
    return {
      opacity: interpolate(offsetYShared.value, inputRange, facesShared.value.map((x) => x.opacity), Extrapolation.CLAMP),
      transform: [
        { rotateX: interpolate(offsetYShared.value, inputRange, facesShared.value.map((x) => x.deg), Extrapolation.CLAMP) + 'deg' },
        { translateY: interpolate(offsetYShared.value, inputRange, facesShared.value.map((x) => x.offsetY), Extrapolation.EXTEND) },
        { scale: interpolate(offsetYShared.value, inputRange, facesShared.value.map((x) => x.scale), Extrapolation.EXTEND) }
      ]
    }
  })

  const strKey = `picker-column-item-${index}`
  const restProps = index === 0 ? { onLayout: onItemLayout } : {}
  const itemProps = extendObject(
    {
      style: extendObject(
        { height: itemHeight, width: '100%' },
        textStyleFromParent,
        textStyle,
        item.props.style
      )
    },
    restProps
  )
  const realItem = React.cloneElement(item, itemProps)

  return (
    <Reanimated.View
      key={strKey}
      style={[{ height: itemHeight, width: itemWidth }, animatedStyles]}
    >
      {wrapChildren(
        { children: realItem },
        {
          hasVarDec,
          varContext,
          textStyle,
          textProps
        }
      )}
    </Reanimated.View>
  )
}

_PickerViewColumnItem.displayName = 'MpxPickerViewColumnItem'
export default _PickerViewColumnItem
