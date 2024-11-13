/**
 * swiper 实现
 */
import { Animated, View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, NativeScrollPoint, Platform, LayoutChangeEvent } from 'react-native'
import { JSX, forwardRef, useState, useRef, useEffect, ReactNode } from 'react'
import { CarouseProps, CarouseState } from './type'
import { getCustomEvent } from '../getInnerListeners'
import useNodesRef, { HandlerRef } from '../useNodesRef' // 引入辅助函数
import { useTransformStyle, splitStyle, splitProps, useLayout, wrapChildren } from '../utils'

/**
 * 默认的Style类型
 */
const styles: { [key: string]: Object } = {
  slide: {
    backgroundColor: 'transparent'
  },
  container_x: {
    position: 'relative'
  },
  container_y: {
    position: 'relative'
  },
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
  }
}

const _Carouse = forwardRef<HandlerRef<ScrollView & View, CarouseProps>, CarouseProps>((props, ref): JSX.Element => {
  // 默认取水平方向的width
  const { width } = Dimensions.get('window')
  const {
    style,
    previousMargin = 0,
    nextMargin = 0,
    enableVar,
    externalVarContext,
    parentFontSize,
    parentWidth,
    parentHeight
  } = props
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
  const { textStyle, innerStyle } = splitStyle(normalStyle)
  const { textProps } = splitProps(props)
  const newChild = Array.isArray(props.children) ? props.children.filter(child => child) : props.children
  const totalElements = Array.isArray(newChild) ? newChild.length : (newChild ? 1 : 0)
  const defaultHeight = (normalStyle?.height || 150)
  const defaultWidth = (normalStyle?.width || width || 375)
  const dir = props.horizontal === false ? 'y' : 'x'
  // state的offset默认值
  // const initIndex = props.circular ? props.current + 1: (props.current || 0)
  // 记录真正的下标索引, 不包括循环前后加入的索引, 游标
  const initIndex = props.current || 0
  // 这里要排除超过元素个数的设置
  const initOffsetIndex = initIndex + (props.circular && totalElements > 1 ? 1 : 0)
  const defaultX = (defaultWidth * initOffsetIndex) || 0
  const defaultY = (defaultHeight * initOffsetIndex) || 0
  // 主动scorllTo时是否要出发onScrollEnd
  const needTriggerScrollEnd = useRef(true)
  // 内部存储上一次的offset值
  const autoplayTimerRef = useRef<ReturnType <typeof setTimeout> | null>(null)
  const scrollViewRef = useRef<ScrollView & View>(null)
  useNodesRef<ScrollView & View, CarouseProps>(props, ref, scrollViewRef, {})
  const {
    // 存储layout布局信息
    layoutRef,
    layoutProps,
    layoutStyle
  } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef: scrollViewRef, onLayout: onWrapperLayout })
  // 内部存储上一次的偏移量
  const internalsRef = useRef({
    offset: {
      x: 0,
      y: 0
    },
    isScrolling: false
  })
  const isDragRef = useRef(false)
  const [state, setState] = useState({
    width: dir === 'x' && typeof defaultWidth === 'number' ? defaultWidth - previousMargin - nextMargin : defaultWidth,
    height: dir === 'y' && typeof defaultHeight === 'number' ? defaultHeight - previousMargin - nextMargin : defaultHeight,
    // 真正的游标索引, 从0开始
    index: initIndex,
    total: totalElements,
    offset: {
      x: 0,
      y: 0
    },
    dir
  } as CarouseState)
  /**
   * @desc: 开启下一次自动轮播
  */
  function createAutoPlay () {
    autoplayTimerRef.current && clearTimeout(autoplayTimerRef.current)
    autoplayTimerRef.current = setTimeout(() => {
      startAutoPlay()
    }, props.interval || 500)
  }

  useEffect(() => {
    // 确认这个是变化的props变化的时候才执行，还是初始化的时候就执行
    if (props.autoplay) {
      createAutoPlay()
    }
  }, [props.autoplay, props.current, state.index, state.width, state.height])

  useEffect(() => {
    // 确认这个是变化的props变化的时候才执行，还是初始化的时候就执行
    if (!props.autoplay && props.current !== undefined && props.current !== state.index) {
      const initIndex = props.current || 0
      // 这里要排除超过元素个数的设置
      const { nextIndex, nextOffset } = getMultiNextConfig(props.current)
      // 1. 安卓需要主动更新下内部状态, 2. IOS不能触发完wcrollTo之后立即updateState, 会造成滑动两次
      // 2. setTimeout 是fix 当再渲染过程中触发scrollTo失败的问题
      if (Platform.OS === 'ios') {
        needTriggerScrollEnd.current = false
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            ...nextOffset,
            animated: true
          })
        }, 50)
      } else {
        updateState(nextIndex, nextOffset)
      }
    }
  }, [props.current, state.width, state.height])

  function getMultiNextConfig (target: number) {
    const step = state.dir === 'x' ? state.width : state.height
    const targetPos = step * props.current
    const targetOffset = {
      x: dir === 'x' ? targetPos : 0,
      y: dir === 'y' ? targetPos : 0
    }
    return {
      nextIndex: target,
      nextOffset: targetOffset
    }
  }
  /**
   * @desc: 更新状态: index和offset, 并响应索引变化的事件
   * scrollViewOffset: 移动到的目标位置
  */
  function updateIndex (scrollViewOffset: NativeScrollPoint, useIndex = false) {
    const { nextIndex, nextOffset } = getNextConfig(scrollViewOffset)
    updateState(nextIndex, nextOffset)
    // 更新完状态之后, 开启新的loop
  }

  /**
   * 更新索引状态
  */
  function updateState (index: number, offset: { x: number, y: number}) {
    internalsRef.current.offset = offset
    setState((preState) => {
      const newState = {
        ...preState,
        index: index,
        // offset用来指示当前scrollView的偏移量
        offset: offset
      }
      return newState
    })
    internalsRef.current.isScrolling = false
    // getCustomEvent
    const eventData = getCustomEvent('change', {}, { detail: { current: index, source: 'touch' }, layoutRef: layoutRef })
    props.bindchange && props.bindchange(eventData)
  }

  /**
   * @desc: 获取下一个位置的索引、scrollView的contentOffset、scrollTo到的offset
   * @desc: 包括正循环、反向循环、不循环
   * 其中循环模式为了实现无缝链接, 会将结合contentOffset, 和 scrollTo的offset,
   * 先scrollTo一个位置的坐标, 然后通过updateIndex设置真正的index和内容的offset,视觉上是无缝
  */
  function getNextConfig (scrollViewOffset: NativeScrollPoint) {
    const step = state.dir === 'x' ? state.width : state.height
    const currentOffset = state.offset
    let nextIndex = state.index + 1
    let nextOffset = currentOffset
    // autoMoveOffset scrollView 滚动到前后增加的位置
    let autoMoveOffset = currentOffset
    let isBack = false
    let isAutoEnd = false
    // 如果是循环反向的
    if (scrollViewOffset?.[state.dir] < currentOffset[state.dir]) {
      isBack = true
      nextIndex = isBack ? nextIndex - 2 : nextIndex
    }
    if (!props.circular) {
      nextOffset = Object.assign({}, currentOffset, { [state.dir]: step * nextIndex })
    } else {
      if (isBack) {
        if (nextIndex < 0) {
          // 反向: scollView 滚动到虚拟的位置
          autoMoveOffset = Object.assign({}, currentOffset, { [state.dir]: 0 })
          nextIndex = state.total - 1
          // 反向: 数组最后一个index
          nextOffset = Object.assign({}, currentOffset, { [state.dir]: step * state.total })
          isAutoEnd = true
        } else {
          // 反向非最后一个
          nextOffset = Object.assign({}, currentOffset, { [state.dir]: (nextIndex + 1) * step })
        }
      } else {
        if (nextIndex > state.total - 1) {
          autoMoveOffset = Object.assign({}, currentOffset, { [state.dir]: step * (nextIndex + 1) })
          nextIndex = 0
          nextOffset = Object.assign({}, currentOffset, { [state.dir]: step })
          isAutoEnd = true
        } else {
          // nextIndex =  nextIndex,
          nextOffset = Object.assign({}, currentOffset, { [state.dir]: (nextIndex + 1) * step })
        }
      }
    }
    return {
      // 下一个要滚动到的实际元素的索引
      nextIndex,
      // 下一个要滚动到实际元素的offset
      nextOffset,
      // scrollTo一个位置的坐标, 虚拟元素的位置
      autoMoveOffset,
      isAutoEnd
    }
  }

  /**
   * @desc: 开启自动轮播
  */
  function startAutoPlay () {
    if (state.width && isNaN(+state.width)) {
      createAutoPlay()
      return
    }
    if (!Array.isArray(props.children)) {
      return
    }
    const step = state.dir === 'x' ? state.width : state.height
    const { nextOffset, autoMoveOffset, isAutoEnd } = getNextConfig(state.offset)
    // 这里可以scroll到下一个元素, 但是把scrollView的偏移量在设置为content,视觉效果就没了吧
    if (Platform.OS === 'ios') {
      if (!isAutoEnd) {
        scrollViewRef.current?.scrollTo({ x: nextOffset.x, y: nextOffset.y, animated: true })
      } else {
        if (state.dir === 'x') {
          scrollViewRef.current?.scrollTo({ x: autoMoveOffset.x, y: autoMoveOffset.x, animated: true })
        } else {
          scrollViewRef.current?.scrollTo({ x: autoMoveOffset.y, y: autoMoveOffset.y, animated: true })
        }
      }
    } else {
      if (!isAutoEnd) {
        scrollViewRef.current?.scrollTo({ x: nextOffset.x, y: nextOffset.y, animated: true })
        onScrollEnd({
          nativeEvent: {
            contentOffset: {
              x: +nextOffset.x,
              y: +nextOffset.y
            }
          }
        } as NativeSyntheticEvent<NativeScrollEvent>)
      } else {
        // 安卓无法实现视觉的无缝连接, 只能回到真正的位置, 且安卓调用scrollTo不能触发onMomentumScrollEnd,还未找到为啥
        if (state.dir === 'x') {
          scrollViewRef.current?.scrollTo({ x: step, y: step, animated: true })
        } else {
          scrollViewRef.current?.scrollTo({ x: autoMoveOffset.x, y: step, animated: true })
        }
        updateState(0, nextOffset)
      }
    }
  }

  /**
   * 当用户开始拖动此视图时调用此函数, 更新当前在滚动态
   */
  function onScrollBegin () {
    internalsRef.current.isScrolling = true
  }

  /**
   * 当用户开始拖动结束
   * 注意: 当手动调用scrollTo的时候, 安卓不会触发onMomentumScrollEnd, IOS会触发onMomentumScrollEnd
   */
  function onScrollEnd (event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (Platform.OS === 'ios' && !needTriggerScrollEnd.current) {
      const { nextIndex, nextOffset } = getMultiNextConfig(props.current)
      updateState(nextIndex, nextOffset)
      needTriggerScrollEnd.current = true
      return
    }
    if (totalElements === 1) {
      return
    }
    internalsRef.current.isScrolling = false
    // 用户手动滑动更新索引后，如果开启了自动轮播等重新开始
    updateIndex(event.nativeEvent.contentOffset, true)
  }

  /**
   * 当拖拽结束时，检测是否可滚动
  */
  function onScrollEndDrag (event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset } = event.nativeEvent
    const { index, total } = state
    isDragRef.current = true
    const internalOffset = internalsRef.current.offset
    const previousOffset = props.horizontal ? internalOffset.x : internalOffset.y
    const moveOffset = props.horizontal ? contentOffset.x : contentOffset.y
    if (previousOffset === moveOffset && (index === 0 || index === total - 1)) {
      internalsRef.current.isScrolling = false
    }
  }

  /**
   * @desc: 水平方向时，获取元素的布局，更新, 其中如果传递100%时需要依赖measure计算元算的宽高
  */
  function onWrapperLayout (e: LayoutChangeEvent) {
    scrollViewRef.current?.measure((x: number, y: number, width: number, height: number, offsetLeft: number, offsetTop: number) => {
      layoutRef.current = { x, y, width, height, offsetLeft, offsetTop }
      const isWDiff = state.width !== width
      const isHDiff = state.height !== height
      if (isWDiff || isHDiff) {
        const changeState = {
          width: isWDiff ? width : state.width,
          height: isHDiff ? height : state.height
        }
        const attr = state.dir === 'x' ? 'width' : 'height'
        changeState[attr] = changeState[attr] - previousMargin - nextMargin
        const correctOffset = Object.assign({}, state.offset, {
          [state.dir]: initOffsetIndex * (state.dir === 'x' ? changeState.width : changeState.height)
        })
        state.width = changeState.width
        state.height = changeState.height
        // 这里setState之后,会再触发重新渲染, renderScrollView会再次触发onScrollEnd,
        setState((preState) => {
          return {
            ...preState,
            width: changeState.width,
            height: changeState.height
          }
        })
      }
      props.getInnerLayout && props.getInnerLayout(layoutRef)
    })
  }

  function getOffset (): Array<number> {
    const step = state.dir === 'x' ? state.width : state.height
    if (!step || Number.isNaN(+step)) return []
    const offsetArray = []
    for (let i = 0; i < totalElements; i++) {
      offsetArray.push(i * step)
    }
    return offsetArray
  }

  function renderScrollView (pages: ReactNode) {
    const offsetsArray = getOffset()
    const scrollElementProps = {
      ref: scrollViewRef,
      horizontal: props.horizontal,
      pagingEnabled: true,
      snapToOffsets: offsetsArray,
      decelerationRate: 0.99, // 'fast'
      showsHorizontalScrollIndicator: false,
      showsVerticalScrollIndicator: false,
      bounces: false,
      scrollsToTop: false,
      removeClippedSubviews: true,
      automaticallyAdjustContentInsets: false
    }
    const layoutStyle = dir === 'x' ? { width: defaultWidth, height: defaultHeight } : { width: defaultWidth }
    return (
      <Animated.ScrollView
        {...scrollElementProps}
        style={[layoutStyle]}
        overScrollMode="always"
        contentOffset={state.offset}
        onScrollBeginDrag={onScrollBegin}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
      >
        {pages}
      </Animated.ScrollView>
    )
  }

  function renderPagination () {
    if (state.total <= 1) return null
    const dots: Array<ReactNode> = []
    const activeDotStyle = [{
      backgroundColor: props.activeDotColor || '#007aff',
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 3,
      marginRight: 3,
      marginTop: 3,
      marginBottom: 3
    }]
    const dotStyle = [{
      backgroundColor: props.dotColor || 'rgba(0,0,0,.2)',
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 3,
      marginRight: 3,
      marginTop: 3,
      marginBottom: 3
    }]
    for (let i = 0; i < state.total; i++) {
      if (i === state.index) {
        dots.push(<View style={activeDotStyle} key={i}></View>)
      } else {
        dots.push(<View style={dotStyle} key={i}></View>)
      }
    }
    return (
      <View
        pointerEvents="none"
        style={[styles['pagination_' + state.dir]]}
      >
        {dots}
      </View>
    )
  }

  function renderPages () {
    const { width, height } = state
    const { children } = props
    const { circular } = props
    const pageStyle = { width: width, height: height }
    // 设置了previousMargin或者nextMargin,
    // 1. 元素的宽度是减去这两个数目之和
    // 2. previousMargin设置marginLeft正值, nextmargin设置marginRight负值
    // 3. 第一个元素设置previousMargin 和 nextMargin, 最后一个元素
    if (totalElements > 1 && Array.isArray(children)) {
      let arrElements: (Array<ReactNode>) = []
      // pages = ["2", "0", "1", "2", "0"]
      const pages = Array.isArray(children) ? Object.keys(children) : []
      /* 无限循环的时候 */
      if (circular) {
        pages.unshift(totalElements - 1 + '')
        pages.push('0')
      }
      arrElements = pages.map((page, i) => {
        const extraStyle = {} as {
          [key: string]: any
        }
        if (i === 0 && dir === 'x' && typeof width === 'number') {
          previousMargin && (extraStyle.marginLeft = previousMargin)
        } else if (i === pages.length - 1 && typeof width === 'number') {
          nextMargin && (extraStyle.marginRight = nextMargin)
        }
        return (<View style={[pageStyle, styles.slide, extraStyle]} key={ 'page' + i}>
          {wrapChildren(
            {
              children: children[+page]
            },
            {
              hasVarDec,
              varContext: varContextRef.current,
              textStyle,
              textProps
            }
          )}
        </View>)
      })
      return arrElements
    } else {
      const realElement = (
        <View style={pageStyle} key={0}>
          {children}
        </View>
      )
      return realElement
    }
  }

  const pages: Array<ReactNode> | ReactNode = renderPages()
  return (<View style={[normalStyle, innerStyle, layoutStyle]} {...layoutProps}>
      {renderScrollView(pages)}
      {props.showsPagination && renderPagination()}
  </View>)
})

_Carouse.displayName = '_Carouse'

export default _Carouse
