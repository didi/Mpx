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
  customStyle: Object;
  itemIndex: number;
}

interface ContextType {
  offset: SharedValue<number>;
  step: SharedValue<number>;
  scale: boolean;
  dir: string;
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
  const dir = contextValue.dir || 'x'
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
    // 实现元素的宽度跟随step从0到真实宽度，且不能触发重新渲染整个组件，通过AnimatedStyle的方式实现
    const outerLayoutStyle = dir === 'x' ? { width: step.value, height: '100%' } : { width: '100%', height: step.value }
    const transformStyle = []
    if (scale) {
      transformStyle.push({
        scale: interpolate(Math.abs(Math.abs(offset.value) - itemIndex * step.value), inputRange, outputRange)
      })
    }
    return Object.assign(outerLayoutStyle, {
      transform: transformStyle
    })
  })
  return (
    <Animated.View
      {...innerProps}
      style={[innerStyle, layoutStyle, itemAnimatedStyle, customStyle]}
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
