/**
 * ✔ scroll-x
 * ✔ scroll-y
 * ✔ upper-threshold
 * ✔ lower-threshold
 * ✔ scroll-top
 * ✔ scroll-left
 * ✘ scroll-into-view
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

import { ScrollView, RefreshControl, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent, ViewStyle } from 'react-native';
import React, { useRef, useState, useEffect, forwardRef } from 'react';
import useInnerProps, { getCustomEvent } from './getInnerListeners';
import useNodesRef from '../../useNodesRef'

interface ScrollViewProps {
  children?: Array<HTMLElement>;
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
}
type ScrollAdditionalProps = {
  pinchGestureEnabled: boolean;
  horizontal: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onContentSizeChange: (width: number, height: number) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  scrollEventThrottle: number;
  scrollsToTop: boolean;
  showsHorizontalScrollIndicator: boolean;
  showsVerticalScrollIndicator: boolean;
  scrollEnabled: boolean;
  ref: React.RefObject<ScrollView>;
  bounces?: boolean;
  pagingEnabled?: boolean;
  style?: ViewStyle;
  bindtouchstart?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchend?: (event: NativeSyntheticEvent<TouchEvent>) => void;
};
const _ScrollView = forwardRef((props: ScrollViewProps = {}, ref: React.ForwardedRef): React.JSX.Element => {
  const {
    children,
    enhanced,
    bounces,
    'scroll-x': scrollX,
    'enable-back-to-top': enableBackToTop,
    'paging-enabled': pagingEnabled,
    'upper-threshold': upperThreshold = 50,
    'lower-threshold': lowerThreshold = 50,
    'scroll-with-animation': scrollWithAnimation,
    'refresher-enabled': refresherEnabled,
    'refresher-default-style': refresherDefaultStyle,
    'refresher-background': refresherBackground
  } = props;
  const [snapScrollTop, setSnapScrollTop] = useState(0);
  const [snapScrollLeft, setSnapScrollLeft] = useState(0);
  const [refreshing, setRefreshing] = useState(true);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [showScrollbar, setShowScrollbar] = useState(true);
  const layoutRef = useRef({})
  const scrollOptions = useRef({
    contentLength: 0,
    offset: 0,
    scrollLeft: 0,
    scrollTop: 0,
    visibleLength: 0,
  });

  const scrollEventThrottle = 50;
  const hasCallScrollToUpper = useRef(true);
  const hasCallScrollToLower = useRef(false);
  const initialTimeout = useRef(null)

  const { nodeRef: scrollViewRef } = useNodesRef(props, ref, {
    scrollOffset: scrollOptions,
    node: {
      scrollEnabled,
      bounces: !!bounces,
      showScrollbar,
      pagingEnabled: !!pagingEnabled,
      fastDeceleration: false,
      decelerationDisabled: false,
      scrollTo: scrollToOffset
    }
  })

  useEffect(() => {
    if (
      snapScrollTop !== props['scroll-top'] ||
      snapScrollLeft !== props['scroll-left']
    ) {
      setSnapScrollTop(props['scroll-top'] || 0);
      setSnapScrollLeft(props['scroll-left'] || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props['scroll-top'], props['scroll-left']]);

  useEffect(() => {
    if (refreshing !== props['refresher-triggered']) {
      setRefreshing(!!props['refresher-triggered']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props['refresher-triggered']]);

  useEffect(() => {
    if (!props['scroll-x'] && !props['scroll-y']) {
      setScrollEnabled(false);
    } else {
      setScrollEnabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props['scroll-x'], props['scroll-y']]);

  useEffect(() => {
    if (props['show-scrollbar'] === undefined) {
      setShowScrollbar(true)
    } else{
      setShowScrollbar(!!props['show-scrollbar'])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props['show-scrollbar']]);
  
  useEffect(() => {
    if (snapScrollTop || snapScrollLeft) {
      initialTimeout.current = setTimeout(() => {
        scrollToOffset(snapScrollLeft, snapScrollTop);
      }, 0);
    }

    return () => {
      initialTimeout.current && clearTimeout(initialTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapScrollTop, snapScrollLeft]);

  function selectLength(size: { height: number; width: number }) {
    return !scrollX ? size.height : size.width;
  }

  function selectOffset(position: { x: number; y: number }) {
    return !scrollX ? position.y : position.x;
  }

  function onStartReached(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { bindscrolltoupper } = props;
    const { offset } = scrollOptions.current;
    if (bindscrolltoupper && (offset <= upperThreshold)) {
      if (!hasCallScrollToUpper.current) {
        bindscrolltoupper(
          getCustomEvent('scrolltoupper', e, {
            detail: {
              direction: scrollX ? 'left' : 'top',
            },
            layoutRef
          }, props),
        );
        hasCallScrollToUpper.current = true;
      }
    } else {
      hasCallScrollToUpper.current = false;
    }
  }

  function onEndReached(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { bindscrolltolower } = props;
    const { contentLength, visibleLength, offset } = scrollOptions.current;
    const distanceFromEnd = contentLength - visibleLength - offset;
    if (bindscrolltolower && (distanceFromEnd < lowerThreshold)) {
      if (!hasCallScrollToLower.current) {
        hasCallScrollToLower.current = true;
        bindscrolltolower(
          getCustomEvent('scrolltolower', e, {
            detail: {
              direction: scrollX ? 'right' : 'botttom',
            },
            layoutRef
          }, props),
        );
      }
    } else {
      hasCallScrollToLower.current = false;
    }
  }

  function onContentSizeChange(width: number, height: number) {
    scrollOptions.current.contentLength = selectLength({ height, width });
  }

  function onLayout(e) {
    scrollOptions.current.visibleLength = selectLength(e.nativeEvent.layout);
    scrollViewRef.current.measure((x, y, width, height, offsetLeft, offsetTop) => {
      layoutRef.current = { x, y, width, height, offsetLeft, offsetTop }
    })
  }

  function onScroll(e) {
    const { bindscroll } = props;
    const { x: scrollLeft, y: scrollTop } = e.nativeEvent.contentOffset;
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
            deltaY: scrollTop - scrollOptions.current.scrollTop,
          },
          layoutRef
        }, props)
      );

    const visibleLength = selectLength(e.nativeEvent.layoutMeasurement);
    const contentLength = selectLength(e.nativeEvent.contentSize);
    const offset = selectOffset(e.nativeEvent.contentOffset);
    scrollOptions.current = {
      ...scrollOptions.current,
      contentLength,
      offset,
      scrollLeft,
      scrollTop,
      visibleLength,
    };
    onStartReached(e);
    onEndReached(e);
  }

  function scrollToOffset(x = 0, y = 0) {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x, y, animated: !!scrollWithAnimation });
      scrollOptions.current.scrollLeft = x
      scrollOptions.current.scrollTop = y
    }
  }

  function onRefresh() {
    const { bindrefresherrefresh } = props;
    bindrefresherrefresh &&
      bindrefresherrefresh(
        getCustomEvent('refresherrefresh', {}, { layoutRef }, props),
      );
  }

  function onScrollTouchStart(e: NativeSyntheticEvent<TouchEvent>) {
    const { binddragstart, bindtouchstart, enhanced } = props;
    bindtouchstart && bindtouchstart(e)
    if (enhanced) {
      binddragstart &&
        binddragstart(
          getCustomEvent('dragstart', e, {
            detail: {
              scrollLeft: scrollOptions.current.scrollLeft || 0,
              scrollTop: scrollOptions.current.scrollTop || 0,
            },
            layoutRef
          }, props)
        )
    }
  }

  function onScrollTouchMove(e: NativeSyntheticEvent<TouchEvent>) {
    const { binddragging, bindtouchmove, enhanced } = props;
    bindtouchmove && bindtouchmove(e)
    if (enhanced) {
      binddragging &&
        binddragging(
          getCustomEvent('dragging', e, {
            detail: {
              scrollLeft: scrollOptions.current.scrollLeft || 0,
              scrollTop: scrollOptions.current.scrollTop || 0,
            },
            layoutRef
          }, props)
        )
    }
  }

  function onScrollTouchEnd(e: NativeSyntheticEvent<TouchEvent>) {
    const { binddragend, bindtouchend, enhanced } = props;
    bindtouchend && bindtouchend(e);
    if (enhanced) {
      binddragend &&
        binddragend(
          getCustomEvent('dragend', e, {
            detail: {
              scrollLeft: scrollOptions.current.scrollLeft || 0,
              scrollTop: scrollOptions.current.scrollTop || 0,
            },
            layoutRef
          }, props)
        )
    }
  }

  let scrollAdditionalProps: ScrollAdditionalProps = {
    pinchGestureEnabled: false,
    horizontal: !!scrollX,
    scrollEventThrottle: scrollEventThrottle,
    scrollsToTop: !!enableBackToTop,
    showsHorizontalScrollIndicator: !!(scrollX && showScrollbar),
    showsVerticalScrollIndicator: !scrollX && showScrollbar,
    scrollEnabled: scrollEnabled,
    ref: scrollViewRef,
    onScroll: onScroll,
    onContentSizeChange: onContentSizeChange,
    onLayout: onLayout,
    bindtouchstart: onScrollTouchStart,
    bindtouchend: onScrollTouchEnd,
    bindtouchmove: onScrollTouchMove,
  };
  if (enhanced) {
    scrollAdditionalProps = {
      ...scrollAdditionalProps,
      bounces: !!bounces,
      pagingEnabled: !!pagingEnabled,
    };
  }
  const innerProps = useInnerProps(props, scrollAdditionalProps, [
      'scroll-x',
      'scroll-y',
      'enable-back-to-top',
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
  ], { layoutRef });

  const refreshColor = {
    'black': ['#000'],
    'white': ['#fff']
  }

  return (
    <ScrollView
      {...innerProps}
      refreshControl={refresherEnabled ? (
        <RefreshControl
          progressBackgroundColor={refresherBackground}
          refreshing={refreshing}
          onRefresh={onRefresh}
          {...(refresherDefaultStyle && refresherDefaultStyle !== 'none' ? { colors: refreshColor[refresherDefaultStyle] } : {})}
        />
      ) : null}
    >
      {children}
    </ScrollView>
  );
})

_ScrollView.displayName = 'mpx-scroll-view';

export default _ScrollView
