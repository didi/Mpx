/**
 * ✔ direction
 * ✔ inertia
 * ✔ out-of-bounds
 * ✔ x
 * ✔ y
 * ✘ damping
 * ✘ friction
 * ✔ disabled
 * ✘ scale
 * ✘ scale-min
 * ✘ scale-max
 * ✘ scale-value
 * ✔ animation
 * ✔ bindchange
 * ✘ bindscale
 * ✔ htouchmove
 * ✔ vtouchmove
 */
import { useEffect, forwardRef, ReactNode, useContext, useCallback, useRef, useMemo, createElement } from 'react'
import { StyleSheet, NativeSyntheticEvent, View, LayoutChangeEvent } from 'react-native'
import { getCustomEvent } from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef'
import { MovableAreaContext } from './context'
import { useTransformStyle, splitProps, splitStyle, HIDDEN_STYLE, wrapChildren, GestureHandler, flatGesture, extendObject } from './utils'
import { GestureDetector, Gesture, GestureTouchEvent, GestureStateChangeEvent, PanGestureHandlerEventPayload, PanGesture } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  withSpring
} from 'react-native-reanimated'

interface MovableViewProps {
  children: ReactNode;
  style?: Record<string, any>;
  direction: 'all' | 'vertical' | 'horizontal' | 'none';
  x?: number;
  y?: number;
  disabled?: boolean;
  animation?: boolean;
  bindchange?: (event: unknown) => void;
  bindtouchstart?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  catchtouchstart?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  catchtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  catchtouchend?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchend?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindhtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindvtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  catchhtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  catchvtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  'out-of-bounds'?: boolean;
  'wait-for'?: Array<GestureHandler>;
  'simultaneous-handlers'?: Array<GestureHandler>;
  inertia?: boolean;
  'enable-var'?: boolean
  'external-var-context'?: Record<string, any>;
  'parent-font-size'?: number;
  'parent-width'?: number;
  'parent-height'?: number;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0
  }
})

const _MovableView = forwardRef<HandlerRef<View, MovableViewProps>, MovableViewProps>((movableViewProps: MovableViewProps, ref): JSX.Element => {
  const { textProps, innerProps: props = {} } = splitProps(movableViewProps)
  const movableGestureRef = useRef<PanGesture>()
  const layoutRef = useRef<any>({})
  const changeSource = useRef<any>('')
  const hasLayoutRef = useRef(false)

  const propsRef = useRef<any>({})
  propsRef.current = (props || {}) as MovableViewProps

  const {
    x = 0,
    y = 0,
    inertia = false,
    disabled = false,
    animation = true,
    'out-of-bounds': outOfBounds = false,
    'enable-var': enableVar,
    'external-var-context': externalVarContext,
    'parent-font-size': parentFontSize,
    'parent-width': parentWidth,
    'parent-height': parentHeight,
    direction = 'none',
    'simultaneous-handlers': originSimultaneousHandlers = [],
    'wait-for': waitFor = [],
    style = {},
    bindtouchstart,
    catchtouchstart,
    bindhtouchmove,
    bindvtouchmove,
    bindtouchmove,
    catchhtouchmove,
    catchvtouchmove,
    catchtouchmove,
    bindtouchend,
    catchtouchend
  } = props

  const {
    hasSelfPercent,
    normalStyle,
    hasVarDec,
    varContextRef,
    setWidth,
    setHeight
  } = useTransformStyle(Object.assign({}, style, styles.container), { enableVar, externalVarContext, parentFontSize, parentWidth, parentHeight })

  const prevSimultaneousHandlersRef = useRef<Array<GestureHandler>>(originSimultaneousHandlers || [])
  const prevWaitForHandlersRef = useRef<Array<GestureHandler>>(waitFor || [])
  const gestureSwitch = useRef(false)
  const { textStyle, innerStyle } = splitStyle(normalStyle)

  const offsetX = useSharedValue(x)
  const offsetY = useSharedValue(y)

  const startPosition = useSharedValue({
    x: 0,
    y: 0
  })
  const draggableXRange = useSharedValue<[min: number, max: number]>([0, 0])
  const draggableYRange = useSharedValue<[min: number, max: number]>([0, 0])
  const isMoving = useSharedValue(false)
  const xInertialMotion = useSharedValue(false)
  const yInertialMotion = useSharedValue(false)
  const isFirstTouch = useSharedValue(true)
  const touchEvent = useSharedValue<string>('')

  const MovableAreaLayout = useContext(MovableAreaContext)

  const simultaneousHandlers = flatGesture(originSimultaneousHandlers)
  const waitForHandlers = flatGesture(waitFor)

  const nodeRef = useRef<View>(null)

  useNodesRef(props, ref, nodeRef, {
    style: normalStyle,
    gestureRef: movableGestureRef
  })

  const hasSimultaneousHandlersChanged = prevSimultaneousHandlersRef.current.length !== (originSimultaneousHandlers?.length || 0) ||
  (originSimultaneousHandlers || []).some((handler, index) => handler !== prevSimultaneousHandlersRef.current[index])

  const hasWaitForHandlersChanged = prevWaitForHandlersRef.current.length !== (waitFor?.length || 0) ||
  (waitFor || []).some((handler, index) => handler !== prevWaitForHandlersRef.current[index])

  if (hasSimultaneousHandlersChanged || hasWaitForHandlersChanged) {
    gestureSwitch.current = !gestureSwitch.current
  }

  prevSimultaneousHandlersRef.current = originSimultaneousHandlers || []
  prevWaitForHandlersRef.current = waitFor || []

  const handleTriggerChange = useCallback(({ x, y, type }: { x: number; y: number; type?: string }) => {
    const { bindchange } = propsRef.current
    if (!bindchange) return
    let source = ''
    if (type !== 'setData') {
      source = getTouchSource(x, y)
    } else {
      changeSource.current = ''
    }
    bindchange(
      getCustomEvent('change', {}, {
        detail: {
          x,
          y,
          source
        },
        layoutRef
      }, propsRef.current)
    )
  }, [])

  useEffect(() => {
    runOnUI(() => {
      if (offsetX.value !== x || offsetY.value !== y) {
        const { x: newX, y: newY } = checkBoundaryPosition({ positionX: Number(x), positionY: Number(y) })
        if (direction === 'horizontal' || direction === 'all') {
          offsetX.value = animation
            ? withSpring(newX, {
              duration: 1500,
              dampingRatio: 0.8
            })
            : newX
        }
        if (direction === 'vertical' || direction === 'all') {
          offsetY.value = animation
            ? withSpring(newY, {
              duration: 1500,
              dampingRatio: 0.8
            })
            : newY
        }
        runOnJS(handleTriggerChange)({
          x: newX,
          y: newY,
          type: 'setData'
        })
      }
    })()
  }, [x, y])

  useEffect(() => {
    const { width, height } = layoutRef.current
    if (width && height) {
      resetBoundaryAndCheck({ width, height })
    }
  }, [MovableAreaLayout.height, MovableAreaLayout.width])

  useAnimatedReaction(
    () => ({
      offsetX: offsetX.value,
      offsetY: offsetY.value
    }),
    (currentValue: { offsetX: any; offsetY: any; }) => {
      const { offsetX, offsetY } = currentValue
      runOnJS(handleTriggerChange)({
        x: offsetX,
        y: offsetY
      })
    })

  const getTouchSource = useCallback((offsetX: number, offsetY: number) => {
    const hasOverBoundary = offsetX < draggableXRange.value[0] || offsetX > draggableXRange.value[1] ||
      offsetY < draggableYRange.value[0] || offsetY > draggableYRange.value[1]
    let source = changeSource.current
    if (hasOverBoundary) {
      if (isMoving.value) {
        source = 'touch-out-of-bounds'
      } else {
        source = 'out-of-bounds'
      }
    } else {
      if (isMoving.value) {
        source = 'touch'
      } else if ((xInertialMotion.value || yInertialMotion.value) && (changeSource.current === 'touch' || changeSource.current === 'friction')) {
        source = 'friction'
      }
    }
    changeSource.current = source
    return source
  }, [])

  const setBoundary = useCallback(({ width, height }: { width: number; height: number }) => {
    const top = (style.position === 'absolute' && style.top) || 0
    const left = (style.position === 'absolute' && style.left) || 0

    const scaledWidth = width || 0
    const scaledHeight = height || 0

    const maxY = MovableAreaLayout.height - scaledHeight - top
    const maxX = MovableAreaLayout.width - scaledWidth - left

    let xRange: [min: number, max: number]
    let yRange: [min: number, max: number]

    if (MovableAreaLayout.width < scaledWidth) {
      xRange = [maxX, 0]
    } else {
      xRange = [left === 0 ? 0 : -left, maxX < 0 ? 0 : maxX]
    }

    if (MovableAreaLayout.height < scaledHeight) {
      yRange = [maxY, 0]
    } else {
      yRange = [top === 0 ? 0 : -top, maxY < 0 ? 0 : maxY]
    }
    draggableXRange.value = xRange
    draggableYRange.value = yRange
  }, [MovableAreaLayout.height, MovableAreaLayout.width, style.position, style.top, style.left])

  const checkBoundaryPosition = useCallback(({ positionX, positionY }: { positionX: number; positionY: number }) => {
    'worklet'
    let x = positionX
    let y = positionY
    // 计算边界限制
    if (x > draggableXRange.value[1]) {
      x = draggableXRange.value[1]
    } else if (x < draggableXRange.value[0]) {
      x = draggableXRange.value[0]
    }

    if (y > draggableYRange.value[1]) {
      y = draggableYRange.value[1]
    } else if (y < draggableYRange.value[0]) {
      y = draggableYRange.value[0]
    }

    return { x, y }
  }, [])

  const resetBoundaryAndCheck = ({ width, height }: { width: number; height: number }) => {
    setBoundary({ width, height })
    runOnUI(() => {
      const positionX = offsetX.value
      const positionY = offsetY.value
      const { x: newX, y: newY } = checkBoundaryPosition({ positionX, positionY })
      if (positionX !== newX) {
        offsetX.value = newX
      }
      if (positionY !== newY) {
        offsetY.value = newY
      }
    })()
  }

  const onLayout = (e: LayoutChangeEvent) => {
    hasLayoutRef.current = true
    if (hasSelfPercent) {
      const { width, height } = e?.nativeEvent?.layout || {}
      setWidth(width || 0)
      setHeight(height || 0)
    }
    nodeRef.current?.measure((x: number, y: number, width: number, height: number) => {
      layoutRef.current = { x, y, width, height, offsetLeft: 0, offsetTop: 0 }
      resetBoundaryAndCheck({ width, height })
    })
    props.onLayout && props.onLayout(e)
  }

  const extendEvent = useCallback((e: any) => {
    'worklet'
    const touchArr = [e.changedTouches, e.allTouches]
    touchArr.forEach(touches => {
      touches && touches.forEach((item: { absoluteX: number; absoluteY: number; pageX: number; pageY: number }) => {
        item.pageX = item.absoluteX
        item.pageY = item.absoluteY
      })
    })
    e.touches = e.allTouches
  }, [])

  const gesture = useMemo(() => {
    const handleTriggerStart = (e: any) => {
      'worklet'
      extendEvent(e)
      bindtouchstart && runOnJS(bindtouchstart)(e)
      catchtouchstart && runOnJS(catchtouchstart)(e)
    }

    const handleTriggerMove = (e: any) => {
      'worklet'
      extendEvent(e)
      const hasTouchmove = !!bindhtouchmove || !!bindvtouchmove || !!bindtouchmove
      const hasCatchTouchmove = !!catchhtouchmove || !!catchvtouchmove || !!catchtouchmove

      if (hasTouchmove) {
        if (touchEvent.value === 'htouchmove') {
          bindhtouchmove && runOnJS(bindhtouchmove)(e)
        } else if (touchEvent.value === 'vtouchmove') {
          bindvtouchmove && runOnJS(bindvtouchmove)(e)
        }
        bindtouchmove && runOnJS(bindtouchmove)(e)
      }

      if (hasCatchTouchmove) {
        if (touchEvent.value === 'htouchmove') {
          catchhtouchmove && runOnJS(catchhtouchmove)(e)
        } else if (touchEvent.value === 'vtouchmove') {
          catchvtouchmove && runOnJS(catchvtouchmove)(e)
        }
        catchtouchmove && runOnJS(catchtouchmove)(e)
      }
    }

    const handleTriggerEnd = (e: any) => {
      'worklet'
      extendEvent(e)
      bindtouchend && runOnJS(bindtouchend)(e)
      catchtouchend && runOnJS(catchtouchend)(e)
    }
    const gesturePan = Gesture.Pan()
      .onTouchesDown((e: GestureTouchEvent) => {
        'worklet'
        const changedTouches = e.changedTouches[0] || { x: 0, y: 0 }
        isMoving.value = false
        startPosition.value = {
          x: changedTouches.x,
          y: changedTouches.y
        }
        handleTriggerStart(e)
      })
      .onTouchesMove((e: GestureTouchEvent) => {
        'worklet'
        isMoving.value = true
        const changedTouches = e.changedTouches[0] || { x: 0, y: 0 }
        if (isFirstTouch.value) {
          touchEvent.value = Math.abs(changedTouches.x - startPosition.value.x) > Math.abs(changedTouches.y - startPosition.value.y) ? 'htouchmove' : 'vtouchmove'
          isFirstTouch.value = false
        }
        handleTriggerMove(e)
        if (disabled) return
        const changeX = changedTouches.x - startPosition.value.x
        const changeY = changedTouches.y - startPosition.value.y
        if (direction === 'horizontal' || direction === 'all') {
          const newX = offsetX.value + changeX
          if (!outOfBounds) {
            const { x } = checkBoundaryPosition({ positionX: newX, positionY: offsetY.value })
            offsetX.value = x
          } else {
            offsetX.value = newX
          }
        }
        if (direction === 'vertical' || direction === 'all') {
          const newY = offsetY.value + changeY
          if (!outOfBounds) {
            const { y } = checkBoundaryPosition({ positionX: offsetX.value, positionY: newY })
            offsetY.value = y
          } else {
            offsetY.value = newY
          }
        }
      })
      .onTouchesUp((e: GestureTouchEvent) => {
        'worklet'
        isFirstTouch.value = true
        isMoving.value = false
        handleTriggerEnd(e)
        if (disabled) return
        if (!inertia) {
          const { x, y } = checkBoundaryPosition({ positionX: offsetX.value, positionY: offsetY.value })
          if (x !== offsetX.value) {
            offsetX.value = animation
              ? withSpring(x, {
                duration: 1500,
                dampingRatio: 0.8
              })
              : x
          }
          if (y !== offsetY.value) {
            offsetY.value = animation
              ? withSpring(y, {
                duration: 1500,
                dampingRatio: 0.8
              })
              : y
          }
        }
      })
      .onFinalize((e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        'worklet'
        if (!inertia || disabled || !animation) return
        isMoving.value = false
        if (direction === 'horizontal' || direction === 'all') {
          xInertialMotion.value = true
          offsetX.value = withDecay({
            velocity: e.velocityX / 10,
            rubberBandEffect: outOfBounds,
            clamp: draggableXRange.value
          }, () => {
            xInertialMotion.value = false
          })
        }
        if (direction === 'vertical' || direction === 'all') {
          yInertialMotion.value = true
          offsetY.value = withDecay({
            velocity: e.velocityY / 10,
            rubberBandEffect: outOfBounds,
            clamp: draggableYRange.value
          }, () => {
            yInertialMotion.value = false
          })
        }
      })
      .withRef(movableGestureRef)
    if (simultaneousHandlers && simultaneousHandlers.length) {
      gesturePan.simultaneousWithExternalGesture(...simultaneousHandlers)
    }

    if (waitForHandlers && waitForHandlers.length) {
      gesturePan.requireExternalGestureToFail(...waitForHandlers)
    }
    return gesturePan
  }, [disabled, direction, inertia, outOfBounds, gestureSwitch.current])

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value }
      ]
    }
  })

  const injectCatchEvent = (props: Record<string, any>) => {
    const eventHandlers: Record<string, any> = {}
    const catchEventList = [
      { name: 'onTouchStart', value: ['catchtouchstart'] },
      { name: 'onTouchMove', value: ['catchtouchmove', 'catchvtouchmove', 'catchhtouchmove'] },
      { name: 'onTouchEnd', value: ['catchtouchend'] }
    ]
    catchEventList.forEach(event => {
      event.value.forEach(name => {
        if (props[name] && !eventHandlers[event.name]) {
          eventHandlers[event.name] = (e: NativeSyntheticEvent<TouchEvent>) => {
            e.stopPropagation()
          }
        }
      })
    })
    return eventHandlers
  }

  const catchEventHandlers = injectCatchEvent(props)
  const layoutStyle = !hasLayoutRef.current && hasSelfPercent ? HIDDEN_STYLE : {}

  return createElement(GestureDetector, { gesture: gesture }, createElement(
    Animated.View,
    extendObject({
      ref: nodeRef,
      onLayout: onLayout,
      style: [innerStyle, animatedStyles, layoutStyle]
    }, catchEventHandlers),
    wrapChildren(
      props,
      {
        hasVarDec,
        varContext: varContextRef.current,
        textStyle,
        textProps
      }
    )
  ))
})

_MovableView.displayName = 'MpxMovableView'

export default _MovableView
