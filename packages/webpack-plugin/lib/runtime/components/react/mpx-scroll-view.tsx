/**
 * ✔ scroll-x
 * ✔ scroll-y
 * ✔ upper-threshold
 * ✔ lower-threshold
 * ✔ scroll-top
 * ✔ scroll-left
 * ✔ scroll-into-view
 * ✔ scroll-with-animation
 * ✔ enable-back-to-top
 * ✘ enable-passive
 * ✔ refresher-enabled
 * ✘ refresher-threshold
 * ✔ refresher-default-style(仅 android 支持)
 * ✔ refresher-background(仅 android 支持)
 * ✔ refresher-triggered
 * ✘ enable-flex(scroll-x，rn 默认支持)
 * ✘ scroll-anchoring
 * ✔ paging-enabled
 * ✘ using-sticky
 * ✔ show-scrollbar
 * ✘ fast-deceleration
 * ✔ binddragstart
 * ✔ binddragging
 * ✔ binddragend
 * ✔ bindrefresherrefresh
 * ✘ bindrefresherpulling
 * ✘ bindrefresherrestore
 * ✘ bindrefresherabort
 * ✔ bindscrolltoupper
 * ✔ bindscrolltolower
 * ✔ bindscroll
 */
import { ScrollView } from 'react-native-gesture-handler'
import { View, RefreshControl, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent, ViewStyle, Platform } from 'react-native'
import { JSX, ReactNode, RefObject, useRef, useState, useEffect, forwardRef, useContext, createElement, useMemo } from 'react'
import { useAnimatedRef } from 'react-native-reanimated'
import { warn } from '@mpxjs/utils'
import useInnerProps, { getCustomEvent } from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef'
import { splitProps, splitStyle, useTransformStyle, useLayout, wrapChildren, extendObject, flatGesture, GestureHandler } from './utils'
import { IntersectionObserverContext, ScrollViewContext } from './context'
interface ScrollViewProps {
  children?: ReactNode;
  enhanced?: boolean;
  bounces?: boolean;
  style?: ViewStyle;
  'scroll-x'?: boolean;
  'scroll-y'?: boolean;
  'enable-back-to-top'?: boolean;
  'show-scrollbar'?: boolean;
  'paging-enabled'?: boolean;
  'upper-threshold'?: number;
  'lower-threshold'?: number;
  'scroll-with-animation'?: boolean;
  'refresher-triggered'?: boolean;
  'refresher-enabled'?: boolean;
  'refresher-default-style'?: 'black' | 'white' | 'none';
  'refresher-background'?: string;
  'scroll-top'?: number;
  'scroll-left'?: number;
  'enable-offset'?: boolean;
  'scroll-into-view'?: string;
  'enable-trigger-intersection-observer'?: boolean;
  'enable-var'?: boolean;
  'external-var-context'?: Record<string, any>;
  'parent-font-size'?: number;
  'parent-width'?: number;
  'parent-height'?: number;
  'wait-for'?: Array<GestureHandler>;
  'simultaneous-handlers'?: Array<GestureHandler>;
  bindscrolltoupper?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  bindscrolltolower?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  bindscroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  bindrefresherrefresh?: (event: NativeSyntheticEvent<unknown>) => void;
  binddragstart?: (event: NativeSyntheticEvent<DragEvent>) => void;
  binddragging?: (event: NativeSyntheticEvent<DragEvent>) => void;
  binddragend?: (event: NativeSyntheticEvent<DragEvent>) => void;
  bindtouchstart?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchend?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindscrollend?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  __selectRef?: (selector: string, nodeType: 'node' | 'component', all?: boolean) => HandlerRef<any, any>
}
type ScrollAdditionalProps = {
  pinchGestureEnabled: boolean;
  horizontal: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onContentSizeChange: (width: number, height: number) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  scrollEventThrottle: number;
  scrollsToTop: boolean;
  showsHorizontalScrollIndicator: boolean;
  showsVerticalScrollIndicator: boolean;
  scrollEnabled: boolean;
  ref: RefObject<ScrollView>;
  bounces?: boolean;
  pagingEnabled?: boolean;
  style?: ViewStyle;
  bindtouchstart?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchend?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};
const _ScrollView = forwardRef<HandlerRef<ScrollView & View, ScrollViewProps>, ScrollViewProps>((scrollViewProps: ScrollViewProps = {}, ref): JSX.Element => {
  const { textProps, innerProps: props = {} } = splitProps(scrollViewProps)
  const {
    enhanced = false,
    bounces = true,
    style = {},
    binddragstart,
    binddragging,
    binddragend,
    bindtouchstart,
    bindtouchmove,
    bindtouchend,
    'scroll-x': scrollX = false,
    'scroll-y': scrollY = false,
    'enable-back-to-top': enableBackToTop = false,
    'enable-trigger-intersection-observer': enableTriggerIntersectionObserver = false,
    'paging-enabled': pagingEnabled = false,
    'upper-threshold': upperThreshold = 50,
    'lower-threshold': lowerThreshold = 50,
    'scroll-with-animation': scrollWithAnimation,
    'refresher-enabled': refresherEnabled,
    'refresher-default-style': refresherDefaultStyle,
    'refresher-background': refresherBackground,
    'show-scrollbar': showScrollbar = true,
    'scroll-into-view': scrollIntoView = '',
    'scroll-top': scrollTop = 0,
    'scroll-left': scrollLeft = 0,
    'refresher-triggered': refresherTriggered,
    'enable-var': enableVar,
    'external-var-context': externalVarContext,
    'parent-font-size': parentFontSize,
    'parent-width': parentWidth,
    'parent-height': parentHeight,
    'simultaneous-handlers': originSimultaneousHandlers,
    'wait-for': waitFor,
    __selectRef
  } = props

  const simultaneousHandlers = flatGesture(originSimultaneousHandlers)
  const waitForHandlers = flatGesture(waitFor)

  const [refreshing, setRefreshing] = useState(true)

  const snapScrollTop = useRef(0)
  const snapScrollLeft = useRef(0)

  const scrollOptions = useRef({
    contentLength: 0,
    offset: 0,
    scrollLeft: 0,
    scrollTop: 0,
    visibleLength: 0
  })

  const scrollEventThrottle = 50
  const hasCallScrollToUpper = useRef(true)
  const hasCallScrollToLower = useRef(false)
  const initialTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intersectionObservers = useContext(IntersectionObserverContext)

  const firstScrollIntoViewChange = useRef<boolean>(false)

  const {
    normalStyle,
    hasVarDec,
    varContextRef,
    hasSelfPercent,
    setWidth,
    setHeight
  } = useTransformStyle(style, { enableVar, externalVarContext, parentFontSize, parentWidth, parentHeight })

  const { textStyle, innerStyle = {} } = splitStyle(normalStyle)

  const scrollViewRef = useAnimatedRef<ScrollView>()
  useNodesRef(props, ref, scrollViewRef, {
    style: normalStyle,
    scrollOffset: scrollOptions,
    node: {
      scrollEnabled: scrollX || scrollY,
      bounces,
      showScrollbar,
      pagingEnabled,
      fastDeceleration: false,
      decelerationDisabled: false,
      scrollTo: scrollToOffset
    },
    gestureRef: scrollViewRef
  })

  const contextValue = useMemo(() => {
    return {
      gestureRef: scrollViewRef
    }
  }, [])

  const { layoutRef, layoutStyle, layoutProps } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef: scrollViewRef, onLayout })

  if (scrollX && scrollY) {
    warn('scroll-x and scroll-y cannot be set to true at the same time, Mpx will use the value of scroll-y as the criterion')
  }
  useEffect(() => {
    if (
      snapScrollTop.current !== scrollTop || snapScrollLeft.current !== scrollLeft
    ) {
      initialTimeout.current = setTimeout(() => {
        scrollToOffset(scrollLeft, scrollTop)
      }, 0)

      return () => {
        initialTimeout.current && clearTimeout(initialTimeout.current)
      }
    }
  }, [scrollTop, scrollLeft])

  useEffect(() => {
    if (refreshing !== refresherTriggered) {
      setRefreshing(!!refresherTriggered)
    }
  }, [refresherTriggered])

  useEffect(() => {
    if (scrollIntoView && __selectRef) {
      if (!firstScrollIntoViewChange.current) {
        setTimeout(handleScrollIntoView)
      } else {
        handleScrollIntoView()
      }
    }
    firstScrollIntoViewChange.current = true
  }, [scrollIntoView])

  function handleScrollIntoView () {
    const refs = __selectRef!(`#${scrollIntoView}`, 'node')
    if (!refs) return
    const { nodeRef } = refs.getNodeInstance()
    nodeRef.current?.measureLayout(
      scrollViewRef.current,
      (left: number, top:number) => {
        scrollToOffset(left, top)
      }
    )
  }

  function selectLength (size: { height: number; width: number }) {
    return !scrollX ? size.height : size.width
  }

  function selectOffset (position: { x: number; y: number }) {
    return !scrollX ? position.y : position.x
  }

  function onStartReached (e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { bindscrolltoupper } = props
    const { offset } = scrollOptions.current
    if (bindscrolltoupper && (offset <= upperThreshold)) {
      if (!hasCallScrollToUpper.current) {
        bindscrolltoupper(
          getCustomEvent('scrolltoupper', e, {
            detail: {
              direction: scrollX ? 'left' : 'top'
            },
            layoutRef
          }, props)
        )
        hasCallScrollToUpper.current = true
      }
    } else {
      hasCallScrollToUpper.current = false
    }
  }

  function onEndReached (e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { bindscrolltolower } = props
    const { contentLength, visibleLength, offset } = scrollOptions.current
    const distanceFromEnd = contentLength - visibleLength - offset
    if (bindscrolltolower && (distanceFromEnd < lowerThreshold)) {
      if (!hasCallScrollToLower.current) {
        hasCallScrollToLower.current = true
        bindscrolltolower(
          getCustomEvent('scrolltolower', e, {
            detail: {
              direction: scrollX ? 'right' : 'botttom'
            },
            layoutRef
          }, props)
        )
      }
    } else {
      hasCallScrollToLower.current = false
    }
  }

  function onContentSizeChange (width: number, height: number) {
    scrollOptions.current.contentLength = selectLength({ height, width })
  }

  function onLayout (e: LayoutChangeEvent) {
    const layout = e.nativeEvent.layout || {}
    scrollOptions.current.visibleLength = selectLength(layout)
  }

  function updateScrollOptions (e: NativeSyntheticEvent<NativeScrollEvent>, position: Record<string, any>) {
    const visibleLength = selectLength(e.nativeEvent.layoutMeasurement)
    const contentLength = selectLength(e.nativeEvent.contentSize)
    const offset = selectOffset(e.nativeEvent.contentOffset)
    extendObject(scrollOptions.current, {
      contentLength,
      offset,
      scrollLeft: position.scrollLeft,
      scrollTop: position.scrollTop,
      visibleLength
    })
  }

  function onScroll (e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { bindscroll } = props
    const { x: scrollLeft, y: scrollTop } = e.nativeEvent.contentOffset
    const { width: scrollWidth, height: scrollHeight } = e.nativeEvent.contentSize
    bindscroll &&
      bindscroll(
        getCustomEvent('scroll', e, {
          detail: {
            scrollLeft,
            scrollTop,
            scrollHeight,
            scrollWidth,
            deltaX: scrollLeft - scrollOptions.current.scrollLeft,
            deltaY: scrollTop - scrollOptions.current.scrollTop
          },
          layoutRef
        }, props)
      )
    updateScrollOptions(e, { scrollLeft, scrollTop })
  }

  function onScrollEnd (e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { bindscrollend } = props
    const { x: scrollLeft, y: scrollTop } = e.nativeEvent.contentOffset
    const { width: scrollWidth, height: scrollHeight } = e.nativeEvent.contentSize
    bindscrollend &&
      bindscrollend(
        getCustomEvent('scrollend', e, {
          detail: {
            scrollLeft,
            scrollTop,
            scrollHeight,
            scrollWidth
          },
          layoutRef
        }, props)
      )
    updateScrollOptions(e, { scrollLeft, scrollTop })
    onStartReached(e)
    onEndReached(e)
    updateIntersection()
  }
  function updateIntersection () {
    if (enableTriggerIntersectionObserver && intersectionObservers) {
      for (const key in intersectionObservers) {
        intersectionObservers[key].throttleMeasure();
      }
    }
  }
  function scrollToOffset (x = 0, y = 0) {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x, y, animated: !!scrollWithAnimation })
      scrollOptions.current.scrollLeft = x
      scrollOptions.current.scrollTop = y
      snapScrollLeft.current = x
      snapScrollTop.current = y
    }
  }

  function onRefresh () {
    const { bindrefresherrefresh } = props
    bindrefresherrefresh &&
      bindrefresherrefresh(
        getCustomEvent('refresherrefresh', {}, { layoutRef }, props)
      )
  }

  function onScrollTouchStart (e: NativeSyntheticEvent<TouchEvent>) {
    const { bindtouchstart } = props
    bindtouchstart && bindtouchstart(e)
    if (enhanced) {
      binddragstart &&
        binddragstart(
          getCustomEvent('dragstart', e, {
            detail: {
              scrollLeft: scrollOptions.current.scrollLeft,
              scrollTop: scrollOptions.current.scrollTop
            },
            layoutRef
          }, props)
        )
    }
  }
  function onScrollTouchMove (e: NativeSyntheticEvent<TouchEvent>) {
    bindtouchmove && bindtouchmove(e)
    if (enhanced) {
      binddragging &&
        binddragging(
          getCustomEvent('dragging', e, {
            detail: {
              scrollLeft: scrollOptions.current.scrollLeft || 0,
              scrollTop: scrollOptions.current.scrollTop || 0
            },
            layoutRef
          }, props)
        )
    }
  }

  function onScrollTouchEnd (e: NativeSyntheticEvent<TouchEvent>) {
    bindtouchend && bindtouchend(e)
    if (enhanced) {
      binddragend &&
        binddragend(
          getCustomEvent('dragend', e, {
            detail: {
              scrollLeft: scrollOptions.current.scrollLeft || 0,
              scrollTop: scrollOptions.current.scrollTop || 0
            },
            layoutRef
          }, props)
        )
    }
  }

  function onScrollDrag (e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { x: scrollLeft, y: scrollTop } = e.nativeEvent.contentOffset
    updateScrollOptions(e, { scrollLeft, scrollTop })
    updateIntersection()
  }

  const scrollAdditionalProps: ScrollAdditionalProps = extendObject(
    {
      style: extendObject({}, innerStyle, layoutStyle),
      pinchGestureEnabled: false,
      horizontal: scrollX && !scrollY,
      scrollEventThrottle: scrollEventThrottle,
      scrollsToTop: enableBackToTop,
      showsHorizontalScrollIndicator: scrollX && showScrollbar,
      showsVerticalScrollIndicator: scrollY && showScrollbar,
      scrollEnabled: scrollX || scrollY,
      ref: scrollViewRef,
      onScroll: onScroll,
      onContentSizeChange: onContentSizeChange,
      bindtouchstart: ((enhanced && binddragstart) || bindtouchstart) && onScrollTouchStart,
      bindtouchmove: ((enhanced && binddragging) || bindtouchend) && onScrollTouchMove,
      bindtouchend: ((enhanced && binddragend) || bindtouchend) && onScrollTouchEnd,
      onScrollBeginDrag: onScrollDrag,
      onScrollEndDrag: onScrollDrag,
      onMomentumScrollEnd: onScrollEnd
    },
    (simultaneousHandlers ? { simultaneousHandlers } : {}),
    (waitForHandlers ? { waitFor: waitForHandlers } : {}),
    layoutProps
  )

  if (enhanced) {
    Object.assign(scrollAdditionalProps, {
      bounces,
      pagingEnabled
    })
  }

  const innerProps = useInnerProps(props, scrollAdditionalProps, [
    'id',
    'scroll-x',
    'scroll-y',
    'enable-back-to-top',
    'enable-trigger-intersection-observer',
    'paging-enabled',
    'show-scrollbar',
    'upper-threshold',
    'lower-threshold',
    'scroll-top',
    'scroll-left',
    'scroll-with-animation',
    'refresher-triggered',
    'refresher-enabled',
    'refresher-default-style',
    'refresher-background',
    'children',
    'enhanced',
    'binddragstart',
    'binddragging',
    'binddragend',
    'bindscroll',
    'bindscrolltoupper',
    'bindscrolltolower',
    'bindrefresherrefresh'
  ], { layoutRef })

  const refreshColor = {
    black: ['#000'],
    white: ['#fff']
  }

  return createElement(
    ScrollView,
    extendObject({}, innerProps, {
      refreshControl: refresherEnabled
        ? createElement(RefreshControl, extendObject({
          progressBackgroundColor: refresherBackground,
          refreshing: refreshing,
          onRefresh: onRefresh
        }, (refresherDefaultStyle && refresherDefaultStyle !== 'none' ? { colors: refreshColor[refresherDefaultStyle] } : null)))
        : undefined
    }),
    createElement(ScrollViewContext.Provider,
      { value: contextValue },
      wrapChildren(
        props,
        {
          hasVarDec,
          varContext: varContextRef.current,
          textStyle,
          textProps
        }
      )
    )
  )
})

_ScrollView.displayName = 'MpxScrollView'

export default _ScrollView
