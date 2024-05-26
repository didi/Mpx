/**
 * swiper 实现
 */
import React, { forwardRef, useState, useRef, useEffect, ReactNode  } from 'react'
import { View, ScrollView, Dimensions } from 'react-native'
import { CarouseProps, CarouseState } from './type'
import { getCustomEvent } from '../getInnerListeners'
import useNodesRef from '../../../useNodesRef'

/**
 * 默认的Style类型
 */
const styles = {
  container_x: {
    // backgroundColor: '#fffffa',
    position: 'relative',
    // flex: 1
  },
  container_y: {
    // backgroundColor: '#fffffa', // 测试用
    position: 'relative',
  },

  wrapperIOS: {
    // backgroundColor: 'transparent'
  },

  wrapperAndroid: {
    // backgroundColor: 'transparent',
    flex: 1
  },

  pagination_x: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'transparent'
  },

  pagination_y: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'transparent'
  }
}

const _Carouse = forwardRef((props: CarouseProps, ref) => {
  // 默认取水平方向的width
  const { width } = Dimensions.get('window')
  const defaultHeight = 150
  const dir = props.horizontal === false ? 'y' : 'x'
  // state的offset默认值
  const defaultX = width * (props.circular ? props.current + 1 : props.current) || 0
  const defaultY = defaultHeight * (props.circular ? props.current + 1 : props.current) || 0
  // 内部存储上一次的offset值
  const newChild = Array.isArray(props.children) ? props.children.filter(child => child) : props.children
  // 默认设置为初次渲染
  const initRenderRef = useRef(true)
  const autoplayTimerRef = useRef<ReturnType <typeof setTimeout>>(null)
  const loopJumpTimerRef = useRef<ReturnType <typeof setTimeout>>(null) 
  // const scrollViewRef = useRef<ScrollView>(null);
  const { nodeRef: scrollViewRef } = useNodesRef(props, ref, {
  })
  const autoplayEndRef = useRef(false)
  // 存储layout布局信息
  const layoutRef = useRef({})
  // 内部存储上一次的偏移量
  const internalsRef = useRef({
    offset: {
      x: defaultX || 0,
      y: defaultY || 0
    },
    isScrolling: false
  })
  const [state, setState] = useState({
    children: newChild,
    width: width || 375,
    height: defaultHeight,
    index: 0,
    total: Array.isArray(newChild) ? newChild.length : ( newChild ? 1 : 0),
    offset: {
      x: dir === 'x' ? defaultX : 0,
      y: dir === 'y' ? defaultY: 0
    },
    loopJump: false,
    dir
  } as CarouseState);

  useEffect(() => {
    // 确认这个是变化的props变化的时候才执行，还是初始化的时候就执行
    if (props.autoplay) {
      startAutoPlay()
    } else {
      startSwiperLoop()
    }
  }, [props.autoplay, props.current, state.index]);

  /**
   * 更新index，以视图的offset计算当前的索引
  */
  function updateIndex (scrollViewOffset) {
    const diff = scrollViewOffset[dir] - internalsRef.current.offset[state.dir]
    if (!diff) return

    const step = dir === 'x' ? state.width : state.height
    let loopJump = false
    let newIndex = state.index + Math.round(diff / step)
    // 若是循环circular
    // 1. 当前索引-1, 初始化为最后一个索引, 且scrollView的偏移量设置为 每个元素的步长 * 一共多少个元素， 这里为什么不减一呢
    // 2. 当前索引>total, 初始化为第一个元素，且scrollView的偏移量设置为一个元素的步长
    if (props.circular) {
      if (state.index <= -1) {
        newIndex = state.total - 1
        scrollViewOffset[state.dir] = step * state.total
        loopJump = true
      } else if (newIndex >= state.total) {
        newIndex = 0
        scrollViewOffset[state.dir] = step
        loopJump = true
      }
    }
    // 存储当前的偏移量
    internalsRef.current.offset = scrollViewOffset
    // 这里需不需要区分是否loop，初始化？？？？
    setState((preState) => {
      const newState =  {
        ...preState,
        index: newIndex,
        offset: scrollViewOffset,
        loopJump
      }
      return newState
    })
    internalsRef.current.isScrolling = false
    // getCustomEvent
    const eventData = getCustomEvent('change', {}, { detail: {current: newIndex, source: 'touch' }, layoutRef: layoutRef })
    props.bindchange && props.bindchange(eventData)
    // 更新完状态之后, 开启新的loop
  }

  /**
   * 用户手动点击播放
   * 触发scrollView的onScrollEnd事件 => 然后更新索引 => 通过useEffect事件 => startSwiperLoop => 主动更新scrollView到指定的位置
   * 若是circular, 到最后一个索引会更新为0，但是视觉要scrollView到下一个
   * 若是circular, 到第一个再往前索引会更新为total-1, 但是视觉是展示的最后一个
  */
  function startSwiperLoop () {
    loopJumpTimerRef.current = setTimeout(() => {
      let offset = { x: 0, y: 0, animated: false}
      if (state.index > 0){
        offset = props.horizontal ? { x: state.width * state.index, y: 0, animated: false } : { x: 0, y: state.height * state.index, animated: false }
      }
      if (props.circular) {
        offset = props.horizontal ? { x: state.width * (state.index + 1), y: 0, animated: false } : { x: 0, y: state.height * (state.index + 1), animated: false }
      }
      scrollViewRef.current?.scrollTo(offset)
      internalsRef.current.offset = offset
    }, props.duration || 500)
  }

  /**
   * 开启自动轮播
   * 每间隔interval scrollView的offset更改到下一个位置，通过onScrollEnd来获取contentOffset再计算要更新的索引index
  */
  function startAutoPlay () {
    // 已经开启过autopaly则不重新创建
    if (!Array.isArray(state.children) || !props.autoplay || internalsRef.current.isScrolling || autoplayEndRef.current) {
      return
    }
    autoplayTimerRef.current && clearTimeout(autoplayTimerRef.current)
    // 非循环自动播放的形式下 到最后一帧 结束自动播放
    if (!props.circular && state.index === state.total -1) {
      autoplayEndRef.current = true
      return
    }
    
    // 开启自动播放
    autoplayTimerRef.current = setTimeout(() => {
      if (state.total < 2) return
      const nexStep = 1
      const toIndex = (props.circular ? 1 : 0) + nexStep + state.index
      let x = 0
      let y = 0
      if (state.dir === 'x') x = toIndex * state.width
      if (state.dir === 'y') y = toIndex * state.height
      // animated会影响切换的offset，先改为false
      scrollViewRef.current?.scrollTo({ x, y, animated: false })

      internalsRef.current.isScrolling = true

      autoplayEndRef.current = false
      updateIndex({ x, y, animated: false})
    }, props.interval || 5000)
  }

  /**
   * 当用户开始拖动此视图时调用此函数, 更新当前在滚动态
   */
  function onScrollBegin () {
    internalsRef.current.isScrolling = true
  }

  function onScrollEnd (event) {
    internalsRef.current.isScrolling = false
    // 用户手动滑动更新索引后，如果开启了自动轮播等重新开始
    updateIndex(event.nativeEvent.contentOffset)
  }

  /**
   * 当拖拽结束时，检测是否可滚动
  */
  function onScrollEndDrag (event) {
    const { contentOffset } = event.nativeEvent
    const { children, index, total } = state

    const internalOffset = internalsRef.current.offset
    const previousOffset = props.horizontal ? internalOffset.x : internalOffset.y
    const newOffset = props.horizontal ? contentOffset.x : contentOffset.y

    if (previousOffset === newOffset && (index === 0 || index === total - 1)) {
      internalsRef.current.isScrolling = false
    }
  }
  /**
   * 垂直方向时，获取单个元素的布局，更新
  */
  function onItemLayout (event) {
    if (!initRenderRef.current || state.dir === 'x') return
    const { width, height } = event.nativeEvent.layout
    if (state.total > 1) {
      internalsRef.current.offset[state.dir] = (state.dir === 'y' ? height * state.index : state.width * state.index)
    }

    if (!state.offset.x && !state.offset.y) {
      state.offset = internalsRef.current.offset
    }

    if (initRenderRef.current && state.total > 1) {
      scrollViewRef.current?.scrollTo({ ...internalsRef.current.offset, animated: false })
      initRenderRef.current = false
    }
    setState((preState) => {
      return {
        ...preState,
        height
      }
    })
  }
  /**
   * 水平方向时，获取单个元素的布局，更新
  */
  function onWrapperLayout (event) {
    // const { width, height } = event.nativeEvent.layout
    // layoutRef.current = event.nativeEvent.layout
    scrollViewRef.current.measure((x, y, width, height, offsetLeft, offsetTop) => {
      // console.log('--------------measure------', x, y, offsetLeft, offsetTop)
      layoutRef.current = { x, y, width, height, offsetLeft, offsetTop }
      props.getInnerLayout && props.getInnerLayout(layoutRef)
    })
    if (state.dir === 'y') return
    if (!state.offset.x && !state.offset.y) {
      state.offset = internalsRef.current.offset
    }
    if (!initRenderRef.current && state.total > 1) {
      scrollViewRef.current?.scrollTo({ ...state.offset, animated: false })
      initRenderRef.current = false
    }
  }

  function renderScrollView (pages: ReactNode) {
    let scrollElementProps = {
      ref: scrollViewRef,
      horizontal: props.horizontal,
      pagingEnabled: true,
      showsHorizontalScrollIndicator: false,
      showsVerticalScrollIndicator: false,
      bounces: false,
      scrollsToTop: false,
      removeClippedSubviews: true,
      automaticallyAdjustContentInsets: false
    }
    return (
      <ScrollView
        {...scrollElementProps}
        overScrollMode="always"
        contentContainerStyle={[styles.wrapperIOS]}
        contentOffset={state.offset}
        onScrollBeginDrag={onScrollBegin}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
      >
        {pages}
      </ScrollView>
    )
  }

  function renderPagination () {
    if (state.total <= 1) return null
    let dots: Array<ReactNode> = []
    const ActiveDot = (
      <View
        style={[
          {
            backgroundColor: props.activeDotColor || '#007aff',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3
          }
        ]}
      />
    )
    const Dot = (
      <View
        style={[
          {
            backgroundColor: props.dotColor || 'rgba(0,0,0,.2)',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3
          }
        ]}
      />
    )
    for (let i = 0; i < state.total; i++) {
      let curDot = (i === state.index ? React.cloneElement(ActiveDot, { key: i }) : React.cloneElement(Dot, { key: i }))
      dots.push(curDot)
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
    const { width, height, total, children } = state
    const { circular, previousMargin, nextMargin } = props
    const pageStyle = { width: width, height: height }
    if (total > 1 && Array.isArray(children)) {
      let pages: (Array<ReactNode>) = []
      pages = Array.isArray(children) && Object.keys(children) || []
      /* 无限循环的时候 */
      if (circular) {
        pages.unshift(total - 1 + '')
        pages.push('0')
      }
      pages = pages.map((page, i) => {
        let pageStyle2 = { width: width, height: height }
        const extraStyle = {} as {
          left? : number;
          marginLeft?: number;
          paddingLeft?: number
        }

        if (previousMargin) {
            extraStyle.left = +previousMargin
        }
        if (nextMargin && state.index === i - 1) {
          const half = Math.floor(+nextMargin / 2)
          extraStyle.marginLeft = - half
          extraStyle.paddingLeft = half
        }
        return (
          <View style={[pageStyle2, extraStyle]} key={ 'page' + i} onLayout={onItemLayout}>
            {children[page]}
          </View>
        )
      })
      return pages
    } else {
      return (
        <View style={pageStyle} key={0}>
          {children}
        </View>
      )
    }
  }

  const vStyle = {} as { height: number }
  if (dir === 'y') {
    vStyle.height = defaultHeight
  }
  let pages = renderPages()
  const strStyle = 'container_' + state.dir
  return (
    <View style={[styles[strStyle], vStyle]} onLayout={onWrapperLayout}>
    {renderScrollView(pages)}
    {props.showsPagination && renderPagination()}
  </View>)
  
})

_Carouse.displayName = '_Carouse';

export default _Carouse
