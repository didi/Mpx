import { View } from 'react-native'
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated'
import { ReactNode, forwardRef, useRef, useContext } from 'react'
import useInnerProps from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef' // 引入辅助函数
import { useTransformStyle, splitStyle, splitProps, wrapChildren, useLayout } from './utils'
import { SwiperContext } from './context'

interface SwiperItemProps {
  'item-id'?: string;
  'enable-offset'?: boolean;
  'enable-var': boolean;
  'external-var-context'?: Record<string, any>;
  'parent-font-size'?: number;
  'parent-width'?: number;
  'parent-height'?: number;
  children?: ReactNode;
  style?: Object;
  customStyle: [];
  itemIndex: number;
}

interface ContextType {
  offset: SharedValue<number>;
  step: SharedValue<number>;
  scale: boolean;
}

const _SwiperItem = forwardRef<HandlerRef<View, SwiperItemProps>, SwiperItemProps>((props: SwiperItemProps, ref) => {
  const {
    'enable-var': enableVar,
    'external-var-context': externalVarContext,
    style,
    customStyle,
    itemIndex
  } = props

  const contextValue = useContext(SwiperContext) as ContextType
  const offset = contextValue.offset || 0
  const step = contextValue.step || 0
  const scale = contextValue.scale || false
  const { textProps } = splitProps(props)
  const nodeRef = useRef(null)

  const {
    normalStyle,
    hasVarDec,
    varContextRef,
    hasSelfPercent,
    setWidth,
    setHeight
  } = useTransformStyle(style, { enableVar, externalVarContext })
  const { textStyle, innerStyle } = splitStyle(normalStyle)
  useNodesRef(props, ref, nodeRef, {
    style: normalStyle
  })

  const {
    // 存储layout布局信息
    layoutRef,
    layoutProps,
    layoutStyle
  } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef: nodeRef })

  const innerProps = useInnerProps(props, {
    ref: nodeRef,
    ...layoutProps
  }, [
    'children',
    'enable-offset',
    'style'
  ], { layoutRef })

  const itemAnimatedStyle = useAnimatedStyle(() => {
    if (!step.value) return {}
    const inputRange = [step.value, 0]
    const outputRange = [0.7, 1]
    return {
      transform: [{
        scale: interpolate(Math.abs(Math.abs(offset.value) - itemIndex * step.value), inputRange, outputRange)
      }]
    }
  })
  const mergeStyle = [innerStyle, layoutStyle, { width: '100%', height: '100%' }, scale ? itemAnimatedStyle : {}].concat(customStyle)
  return (
    <Animated.View
      {...innerProps}
      style={mergeStyle}
      data-itemId={props['item-id']}>
      {
        wrapChildren(
          props,
          {
            hasVarDec,
            varContext: varContextRef.current,
            textStyle,
            textProps
          }
        )
      }
    </Animated.View>
  )
})

_SwiperItem.displayName = 'MpxSwiperItem'

export default _SwiperItem
