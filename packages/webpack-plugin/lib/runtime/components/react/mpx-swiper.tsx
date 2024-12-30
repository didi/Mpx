import { View, NativeSyntheticEvent, LayoutChangeEvent } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing, runOnJS, runOnUI, useAnimatedReaction, cancelAnimation } from 'react-native-reanimated'

import React, { JSX, forwardRef, useRef, useEffect, ReactNode, ReactElement } from 'react'
import useInnerProps, { getCustomEvent } from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef' // 引入辅助函数
import { useTransformStyle, splitStyle, splitProps, useLayout, wrapChildren } from './utils'
import { SwiperContext } from './context'
/**
 * ✔ indicator-dots
 * ✔ indicator-color
 * ✔ indicator-active-color
 * ✔ autoplay
 * ✔ current
 * ✔ interval
 * ✔ duration
 * ✔ circular
 * ✔ vertical
 * ✔ previous-margin
 * ✔ next-margin
 * ✔ easing-function  ="easeOutCubic"
 * ✘ display-multiple-items
 * ✘ snap-to-edge
 */
type EaseType = 'default' | 'linear' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
type StrTransType = 'translationX' | 'translationY'
type StrAbsoType = 'absoluteX' | 'absoluteY'
type StrVelocity = 'velocityX' | 'velocityY'
type EventDataType = {
  translation: number
}

interface SwiperProps {
  children?: ReactNode;
  circular?: boolean;
  current?: number;
  interval?: number;
  autoplay?: boolean;
  // scrollView 只有安卓可以设
  duration?: number;
  // 滑动过程中元素是否scale变化
  scale?: boolean;
  'indicator-dots'?: boolean;
  'indicator-color'?: string;
  'indicator-active-color'?: string;
  vertical?: boolean;
  style: {
    [key: string]: any
  };
  'easing-function'?: EaseType;
  'previous-margin'?: string;
  'next-margin'?: string;
  'enable-offset'?: boolean;
  'enable-var': boolean;
  'parent-font-size'?: number;
  'parent-width'?: number;
  'parent-height'?: number;
  'external-var-context'?: Record<string, any>;
  bindchange?: (event: NativeSyntheticEvent<TouchEvent> | unknown) => void;
}

/**
 * 默认的Style类型
 */
const styles: { [key: string]: Object } = {
  pagination_x: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pagination_y: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pagerWrapperx: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pagerWrappery: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  swiper: {
    overflow: 'scroll',
    display: 'flex',
    justifyContent: 'flex-start'
  }
}

const dotCommonStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  marginLeft: 3,
  marginRight: 3,
  marginTop: 3,
  marginBottom: 3,
  zIndex: 98
}
const activeDotStyle = {
  zIndex: 99
}
const longPressRatio = 100

const easeMap = {
  default: Easing.linear,
  linear: Easing.linear,
  easeInCubic: Easing.in(Easing.cubic),
  easeOutCubic: Easing.out(Easing.cubic),
  easeInOutCubic: Easing.inOut(Easing.cubic)
}

const SwiperWrapper = forwardRef<HandlerRef<View, SwiperProps>, SwiperProps>((props: SwiperProps, ref): JSX.Element => {
  const {
    'indicator-dots': showsPagination,
    'indicator-color': dotColor = 'rgba(0, 0, 0, .3)',
    'indicator-active-color': activeDotColor = '#000000',
    'enable-var': enableVar = false,
    'parent-font-size': parentFontSize,
    'parent-width': parentWidth,
    'parent-height': parentHeight,
    'external-var-context': externalVarContext,
    style = {}
  } = props
  const previousMargin = props['previous-margin'] ? parseInt(props['previous-margin']) : 0
  const nextMargin = props['next-margin'] ? parseInt(props['next-margin']) : 0
  const easeingFunc = props['easing-function'] || 'default'
  const easeDuration = props.duration || 500
  const horizontal = props.vertical !== undefined ? !props.vertical : true
  // 默认前后补位的元素个数
  const patchElementNum = props.circular ? (previousMargin ? 2 : 1) : 0
  const nodeRef = useRef<View>(null)
  useNodesRef<View, SwiperProps>(props, ref, nodeRef, {})

  // 计算transfrom之类的
  const {
    normalStyle,
    hasVarDec,
    varContextRef,
    hasSelfPercent,
    setWidth,
    setHeight
  } = useTransformStyle(style, {
    enableVar,
    externalVarContext,
    parentFontSize,
    parentWidth,
    parentHeight
  })
  const { textStyle } = splitStyle(normalStyle)
  const { textProps } = splitProps(props)
  const children = Array.isArray(props.children) ? props.children.filter(child => child) : (props.children ? [props.children] : [])
  const initWidth = typeof normalStyle?.width === 'number' ? normalStyle.width - previousMargin - nextMargin : normalStyle.width
  const initHeight = typeof normalStyle?.height === 'number' ? normalStyle.height - previousMargin - nextMargin : normalStyle.height
  const dir = useSharedValue(horizontal === false ? 'y' : 'x')
  const pstep = dir.value === 'x' ? initWidth : initHeight
  const initStep: number = isNaN(pstep) ? 0 : pstep
  // 每个元素的宽度 or 高度
  const step = useSharedValue(initStep)
  const totalElements = useSharedValue(children.length)
  // 记录选中元素的索引值
  const currentIndex = useSharedValue(0)
  // 记录元素的偏移量
  const offset = useSharedValue(0)
  const strAbso = 'absolute' + dir.value.toUpperCase() as StrAbsoType
  const arrPages: Array<ReactNode> | ReactNode = renderItems()
  // 标识手指触摸和抬起, 起点在onBegin
  const touchfinish = useSharedValue(true)
  // 记录上一帧的绝对定位坐标
  const preAbsolutePos = useSharedValue(0)
  // 记录从onBegin 到 onTouchesUp 时移动的距离
  const moveTranstion = useSharedValue(0)
  // 记录从onBegin 到 onTouchesUp 的时间
  const moveTime = useSharedValue(0)
  const timerId = useRef(0 as number | ReturnType<typeof setTimeout>)
  // 用户点击未移动状态下,记录用户上一次操作的transtion 的 direction
  const customTrans = useSharedValue(0)
  const intervalTimer = props.interval || 500
  totalElements.value = children.length
  const {
    // 存储layout布局信息
    layoutRef,
    layoutProps,
    layoutStyle
  } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef, onLayout: onWrapperLayout })

  const innerProps = useInnerProps(props, {
    ref: nodeRef
  }, [
    'style',
    'indicator-dots',
    'indicator-color',
    'indicator-active-color',
    'previous-margin',
    'vertical',
    'previous-margin',
    'next-margin',
    'easing-function',
    'autoplay',
    'circular',
    'interval',
    'easing-function'
  ], { layoutRef: layoutRef })

  function onWrapperLayout (e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout
    const realWidth = dir.value === 'x' ? width - previousMargin - nextMargin : width
    const realHeight = dir.value === 'y' ? height - previousMargin - nextMargin : height
    step.value = dir.value === 'x' ? realWidth : realHeight
    if (touchfinish.value) {
      runOnUI(() => {
        offset.value = getOffset(currentIndex.value)
      })()
      pauseLoop()
      resumeLoop()
    }
  }

  const dotAnimatedStyle = useAnimatedStyle(() => {
    if (!step.value) return {}
    const dotStep = dotCommonStyle.width + dotCommonStyle.marginRight + dotCommonStyle.marginLeft
    if (dir.value === 'x') {
      return { transform: [{ translateX: currentIndex.value * dotStep }] }
    } else {
      return { transform: [{ translateY: currentIndex.value * dotStep }] }
    }
  })

  function renderPagination () {
    if (totalElements.value <= 1) return null
    const activeColor = activeDotColor || '#007aff'
    const unActionColor = dotColor || 'rgba(0,0,0,.2)'
    // 正常渲染所有dots
    const dots: Array<ReactNode> = []
    for (let i = 0; i < totalElements.value; i++) {
      dots.push(<View style={[dotCommonStyle, { backgroundColor: unActionColor }]} key={i}></View>)
    }
    return (
      <View pointerEvents="none" style = {styles['pagination_' + dir.value]}>
        <View style = {[styles['pagerWrapper' + dir.value]]}>
          <Animated.View style={[
            dotCommonStyle,
            activeDotStyle,
            {
              backgroundColor: activeColor,
              position: 'absolute',
              left: 0,
              top: 0
            },
            dotAnimatedStyle
          ]}
          />
          {dots}
      </View>
    </View>)
  }

  function renderItems () {
    const itemAnimatedStyles = useAnimatedStyle(() => {
      return dir.value === 'x' ? { width: step.value, height: '100%' } : { width: '100%', height: step.value }
    })
    let renderChild = children.slice()
    if (props.circular && totalElements.value > 1) {
      // 最前面加最后一个元素
      const lastChild = React.cloneElement(children[totalElements.value - 1] as ReactElement)
      // 最后面加第一个元素
      const firstChild = React.cloneElement(children[0] as ReactElement)
      if (previousMargin) {
        const lastChild1 = React.cloneElement(children[totalElements.value - 2] as ReactElement)
        const firstChild1 = React.cloneElement(children[1] as ReactElement)
        renderChild = [lastChild1, lastChild].concat(renderChild).concat([firstChild, firstChild1])
      } else {
        renderChild = [lastChild].concat(renderChild).concat([firstChild])
      }
    }
    const arrChilds = renderChild.map((child, index) => {
      const extraStyle = {} as { [key: string]: any }
      if (index === 0 && !props.circular) {
        previousMargin && dir.value === 'x' && (extraStyle.marginLeft = previousMargin)
        previousMargin && dir.value === 'y' && (extraStyle.marginTop = previousMargin)
      }
      if (index === totalElements.value - 1 && !props.circular) {
        nextMargin && dir.value === 'x' && (extraStyle.marginRight = nextMargin)
        nextMargin && dir.value === 'y' && (extraStyle.marginBottom = nextMargin)
      }
      const newChild = React.cloneElement(child, {
        itemIndex: index,
        customStyle: [itemAnimatedStyles, extraStyle],
        key: 'page' + index
      })
      return newChild
    })
    const contextValue = {
      offset,
      step,
      scale: props.scale
    }
    return (<SwiperContext.Provider value={contextValue}>{arrChilds}</SwiperContext.Provider>)
  }

  function createAutoPlay () {
    let targetOffset = 0
    let nextIndex = currentIndex.value
    if (!props.circular) {
      // 获取下一个位置的坐标, 循环到最后一个元素,直接停止, 取消定时器
      if (currentIndex.value === totalElements.value - 1) {
        pauseLoop()
        return
      }
      nextIndex += 1
      targetOffset = -nextIndex * step.value - previousMargin
      offset.value = withTiming(targetOffset, {
        duration: easeDuration,
        easing: easeMap[easeingFunc]
      }, () => {
        currentIndex.value = nextIndex
        runOnJS(loop)()
      })
    } else {
      // 默认向右, 向下
      if (nextIndex === totalElements.value - 1) {
        nextIndex = 0
        targetOffset = -(totalElements.value + patchElementNum) * step.value + previousMargin
        // 执行动画到下一帧
        offset.value = withTiming(targetOffset, {
          duration: easeDuration
        }, () => {
          const initOffset = -step.value * patchElementNum + previousMargin
          // 将开始位置设置为真正的位置
          offset.value = initOffset
          currentIndex.value = nextIndex
          runOnJS(loop)()
        })
      } else {
        nextIndex = currentIndex.value + 1
        targetOffset = -(nextIndex + patchElementNum) * step.value + previousMargin
        // 执行动画到下一帧
        offset.value = withTiming(targetOffset, {
          duration: easeDuration,
          easing: easeMap[easeingFunc]
        }, () => {
          currentIndex.value = nextIndex
          runOnJS(loop)()
        })
      }
    }
  }

  function handleSwiperChange (current: number) {
    if (props.current !== currentIndex.value) {
      const eventData = getCustomEvent('change', {}, { detail: { current, source: 'touch' }, layoutRef: layoutRef })
      props.bindchange && props.bindchange(eventData)
    }
  }

  function getOffset (index?: number) {
    'worklet'
    if (!step.value) return 0
    let targetOffset = 0
    if (props.circular && totalElements.value > 1) {
      const targetIndex = (index || props.current || 0) + patchElementNum
      targetOffset = -(step.value * targetIndex - previousMargin)
    } else {
      targetOffset = -(index || props?.current || 0) * step.value
    }
    return targetOffset
  }

  function loop () {
    timerId.current = setTimeout(() => {
      createAutoPlay()
    }, intervalTimer)
  }

  function pauseLoop () {
    timerId.current && clearTimeout(timerId.current)
  }

  function resumeLoop () {
    if (props.autoplay) {
      loop()
    }
  }

  useAnimatedReaction(() => currentIndex.value, (newIndex, preIndex) => {
    // 这里必须传递函数名, 直接写()=> {}形式会报 访问了未sharedValue信息
    const isInit = !preIndex && newIndex === 0
    if (!isInit && newIndex !== preIndex && props.bindchange) {
      runOnJS(handleSwiperChange)(newIndex)
    }
  })
  useEffect(() => {
    if (!step.value) {
      return
    }
    const targetOffset = getOffset()
    if (props.current !== undefined && props.current !== currentIndex.value) {
      offset.value = withTiming(targetOffset, {
        duration: easeDuration,
        easing: easeMap[easeingFunc]
      }, () => {
        currentIndex.value = props.current || 0
      })
    }
  }, [props.current])

  useEffect(() => {
    if (!step.value) {
      return
    }
    if (props.autoplay) {
      resumeLoop()
    } else {
      pauseLoop()
    }
    return () => {
      if (props.autoplay) {
        pauseLoop()
      }
    }
  }, [props.autoplay])

  function getTargetPosition (eventData: EventDataType) {
    'worklet'
    // 移动的距离
    const { translation } = eventData
    let resetOffsetPos = 0
    let selectedIndex = currentIndex.value
    // 是否临界点
    let isCriticalItem = false
    // 真实滚动到的偏移量坐标
    let moveToTargetPos = 0
    const currentOffset = translation < 0 ? offset.value - previousMargin : offset.value + previousMargin
    const computedIndex = Math.abs(currentOffset) / step.value
    const moveToIndex = translation < 0 ? Math.ceil(computedIndex) : Math.floor(computedIndex)
    // 实际应该定位的索引值
    if (!props.circular) {
      selectedIndex = moveToIndex
      moveToTargetPos = selectedIndex * step.value
    } else {
      if (moveToIndex >= totalElements.value + patchElementNum) {
        selectedIndex = moveToIndex - (totalElements.value + patchElementNum)
        resetOffsetPos = (selectedIndex + patchElementNum) * step.value - previousMargin
        moveToTargetPos = moveToIndex * step.value - previousMargin
        isCriticalItem = true
      } else if (moveToIndex <= patchElementNum - 1) {
        selectedIndex = moveToIndex === 0 ? totalElements.value - patchElementNum : totalElements.value - 1
        resetOffsetPos = (selectedIndex + patchElementNum) * step.value - previousMargin
        moveToTargetPos = moveToIndex * step.value - previousMargin
        isCriticalItem = true
      } else {
        selectedIndex = moveToIndex - patchElementNum
        moveToTargetPos = moveToIndex * step.value - previousMargin
      }
    }
    return {
      selectedIndex,
      isCriticalItem,
      resetOffset: -resetOffsetPos,
      targetOffset: -moveToTargetPos
    }
  }

  function canMove (eventData: EventDataType) {
    'worklet'
    const { translation } = eventData
    const currentOffset = Math.abs(offset.value)
    if (!props.circular) {
      if (translation < 0) {
        return currentOffset < step.value * (totalElements.value - 1)
      } else {
        return currentOffset > 0
      }
    } else {
      return true
    }
  }

  function handleEnd (eventData: EventDataType) {
    'worklet'
    const { isCriticalItem, targetOffset, resetOffset, selectedIndex } = getTargetPosition(eventData)
    if (isCriticalItem) {
      offset.value = withTiming(targetOffset, {
        duration: easeDuration,
        easing: easeMap[easeingFunc]
      }, () => {
        if (touchfinish.value !== false) {
          currentIndex.value = selectedIndex
          offset.value = resetOffset
          runOnJS(resumeLoop)()
        }
      })
    } else {
      offset.value = withTiming(targetOffset, {
        duration: easeDuration,
        easing: easeMap[easeingFunc]
      }, () => {
        if (touchfinish.value !== false) {
          currentIndex.value = selectedIndex
          runOnJS(resumeLoop)()
        }
      })
    }
  }

  function handleBack (eventData: EventDataType) {
    'worklet'
    const { translation } = eventData
    // 向右滑动的back:trans < 0， 向左滑动的back: trans < 0
    let currentOffset = Math.abs(offset.value)
    if (props.circular) {
      currentOffset += translation < 0 ? previousMargin : -previousMargin
    }
    const curIndex = currentOffset / step.value
    const moveToIndex = (translation < 0 ? Math.floor(curIndex) : Math.ceil(curIndex)) - patchElementNum
    const targetOffset = -(moveToIndex + patchElementNum) * step.value + (props.circular ? -previousMargin : 0)
    offset.value = withTiming(targetOffset, {
      duration: easeDuration,
      easing: easeMap[easeingFunc]
    }, () => {
      if (touchfinish.value !== false) {
        currentIndex.value = moveToIndex
        runOnJS(resumeLoop)()
      }
    })
  }

  function handleLongPress (eventData: EventDataType) {
    'worklet'
    const { translation } = eventData
    let currentOffset = Math.abs(offset.value)
    if (props.circular) {
      currentOffset += previousMargin
    }

    const half = currentOffset % step.value > step.value / 2
    // 向右trans < 0, 向左trans > 0
    const isExceedHalf = translation < 0 ? half : !half
    if (+translation === 0) {
      runOnJS(resumeLoop)()
    } else if (isExceedHalf) {
      handleEnd(eventData)
    } else {
      handleBack(eventData)
    }
  }

  function reachBoundary (eventData: EventDataType) {
    'worklet'
    // 移动的距离
    const { translation } = eventData
    const elementsLength = step.value * totalElements.value

    let isBoundary = false
    let resetOffset = 0
    // Y轴向下滚动, transDistance > 0, 向上滚动 < 0 X轴向左滚动, transDistance > 0
    const currentOffset = offset.value
    const moveStep = Math.ceil(translation / elementsLength)
    if (translation < 0) {
      const posEnd = (totalElements.value + patchElementNum + 1) * step.value
      const posReverseEnd = (patchElementNum - 1) * step.value
      if (currentOffset < -posEnd + step.value) {
        isBoundary = true
        resetOffset = Math.abs(moveStep) === 0 ? patchElementNum * step.value + translation : moveStep * elementsLength
      }
      if (currentOffset > -posReverseEnd) {
        isBoundary = true
        resetOffset = moveStep * elementsLength
      }
    } else if (translation > 0) {
      const posEnd = (patchElementNum - 1) * step.value
      const posReverseEnd = (patchElementNum + totalElements.value) * step.value
      if (currentOffset > -posEnd) {
        isBoundary = true
        resetOffset = moveStep * elementsLength + step.value + (moveStep === 1 ? translation : 0)
      }
      if (currentOffset < -posReverseEnd) {
        isBoundary = true
        resetOffset = moveStep * elementsLength + patchElementNum * step.value
      }
    }
    return {
      isBoundary,
      resetOffset: -resetOffset
    }
  }

  const gestureHandler = Gesture.Pan()
    .onBegin((e) => {
      'worklet'
      touchfinish.value = false
      cancelAnimation(offset)
      runOnJS(pauseLoop)()
      preAbsolutePos.value = e[strAbso]
      moveTranstion.value = e[strAbso]
      moveTime.value = new Date().getTime()
    })
    .onTouchesMove((e) => {
      'worklet'
      const touchEventData = e.changedTouches[0]
      const moveDistance = touchEventData[strAbso] - preAbsolutePos.value
      customTrans.value = moveDistance
      const eventData = {
        translation: moveDistance
      }
      // 处理用户一直拖拽到临界点的场景, 不会执行onEnd
      if (!props.circular && !canMove(eventData)) {
        return
      }
      const { isBoundary, resetOffset } = reachBoundary(eventData)
      if (isBoundary && props.circular && !touchfinish.value) {
        offset.value = resetOffset
      } else {
        offset.value = moveDistance + offset.value
      }
      preAbsolutePos.value = touchEventData[strAbso]
    })
    .onTouchesUp((e) => {
      'worklet'
      const touchEventData = e.changedTouches[0]
      const moveDistance = touchEventData[strAbso] - moveTranstion.value
      touchfinish.value = true
      const eventData = {
        translation: moveDistance
      }
      // 用户手指按下起来, 需要计算正确的位置, 比如在滑动过程中突然按下然后起来,需要计算到正确的位置
      if (!props.circular && !canMove(eventData)) {
        return
      }
      if (!moveDistance) {
        handleLongPress({ translation: customTrans.value })
      } else {
        const strVelocity = moveDistance / (new Date().getTime() - moveTime.value) * 1000
        if (Math.abs(strVelocity) < longPressRatio) {
          handleLongPress(eventData)
        } else {
          handleEnd(eventData)
        }
      }
    })

  const animatedStyles = useAnimatedStyle(() => {
    if (dir.value === 'x') {
      return { transform: [{ translateX: offset.value }], opacity: step.value > 0 ? 1 : 0 }
    } else {
      return { transform: [{ translateY: offset.value }], opacity: step.value > 0 ? 1 : 0 }
    }
  })

  function renderSwiper () {
    return (<View style={[normalStyle, layoutStyle, styles.swiper]} {...layoutProps} {...innerProps}>
        <Animated.View style={[{
          flexDirection: dir.value === 'x' ? 'row' : 'column',
          width: '100%',
          height: '100%'
        }, animatedStyles]}>
          {wrapChildren({
            children: arrPages
          }, {
            hasVarDec,
            varContext: varContextRef.current,
            textStyle,
            textProps
          })}
        </Animated.View>
        {showsPagination && renderPagination()}
    </View>)
  }

  if (totalElements.value === 1) {
    return renderSwiper()
  } else {
    return (<GestureDetector gesture={gestureHandler}>
      {renderSwiper()}
    </GestureDetector>)
  }
})
SwiperWrapper.displayName = 'MpxSwiperWrapper'

export default SwiperWrapper
