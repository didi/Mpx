/**
 * ✔ hover-class
 * ✘ hover-stop-propagation
 * ✔ hover-start-time
 * ✔ hover-stay-time
 */
import { View, TextStyle, NativeSyntheticEvent, ViewProps, ImageStyle, StyleSheet, Image, LayoutChangeEvent } from 'react-native'
import { useRef, useState, useEffect, forwardRef, ReactNode, JSX, createElement } from 'react'
import useInnerProps from './getInnerListeners'
import Animated from 'react-native-reanimated'
import useAnimationHooks from './useAnimationHooks'
import type { AnimationProp } from './useAnimationHooks'
import { ExtendedViewStyle } from './types/common'
import useNodesRef, { HandlerRef } from './useNodesRef'
import { parseUrl, PERCENT_REGEX, splitStyle, splitProps, useTransformStyle, wrapChildren, useLayout, renderImage, pickStyle, extendObject, useHoverStyle } from './utils'
import { error } from '@mpxjs/utils'
import LinearGradient from 'react-native-linear-gradient'
import { GestureDetector } from 'react-native-gesture-handler'

export interface _ViewProps extends ViewProps {
  style?: ExtendedViewStyle
  animation?: AnimationProp
  children?: ReactNode | ReactNode[]
  'hover-style'?: ExtendedViewStyle
  'hover-start-time'?: number
  'hover-stay-time'?: number
  'enable-background'?: boolean
  'enable-var'?: boolean
  'enable-fast-image'?: boolean
  'external-var-context'?: Record<string, any>
  'parent-font-size'?: number
  'parent-width'?: number
  'parent-height'?: number
  'enable-animation'?: boolean
  bindtouchstart?: (event: NativeSyntheticEvent<TouchEvent> | unknown) => void
  bindtouchmove?: (event: NativeSyntheticEvent<TouchEvent> | unknown) => void
  bindtouchend?: (event: NativeSyntheticEvent<TouchEvent> | unknown) => void
}

type Handler = (...args: any[]) => void

type Size = {
  width: number
  height: number
}

type DimensionValue = number | `${number}%` | 'auto' | 'contain' | 'cover'

type Position = {
  left?: number
  right?: number
  top?: number
  bottom?: number
}

type PositionKey = keyof Position

type NumberVal = number | `${number}%`

type PositionVal = PositionKey | NumberVal

type backgroundPositionList = ['left' | 'right', NumberVal, 'top' | 'bottom', NumberVal] | []

type LinearInfo = {
  colors: Array<string>,
  locations: Array<number>,
  direction?: string
}

type PreImageInfo = {
  src?: string,
  sizeList: DimensionValue[]
  type?: 'image' | 'linear'
  linearInfo?: LinearInfo
  // containPercentSymbol?: boolean
  backgroundPosition: backgroundPositionList
}

type ImageProps = {
  style: ImageStyle,
  src?: string,
  source?: {uri: string },
  colors: Array<string>,
  locations?: Array<number>
  angle?: number
  resizeMode?: 'cover' | 'stretch'
}

const linearMap = new Map([
  ['top', 0],
  ['bottom', 180],
  ['left', 270],
  ['right', 90]
])

// 对角线角度
const diagonalAngleMap: Record<string, (width: number, height: number) => any> = {
  'top right': (width: number, height: number) => {
    return Math.acos(
      (width / 2) /
      (Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2)
    )
  },
  'right top': (width, height) => { return diagonalAngleMap['top right'](width, height) },

  'bottom right': (width, height) => Math.PI - diagonalAngleMap['top right'](width, height),
  'right bottom': (width, height) => { return diagonalAngleMap['bottom right'](width, height) },

  'bottom left': (width, height) => Math.PI + diagonalAngleMap['top right'](width, height),
  'left bottom': (width, height) => { return diagonalAngleMap['bottom left'](width, height) },

  'top left': (width, height) => (2 * Math.PI) - diagonalAngleMap['top right'](width, height),
  'left top': (width, height) => { return diagonalAngleMap['top left'](width, height) }
}

// 弧度转化为角度的公式
function radToAngle (r: number) {
  return r * 180 / Math.PI
}

const applyHandlers = (handlers: Handler[], args: any[]) => {
  for (const handler of handlers) {
    handler(...args)
  }
}

const normalizeStyle = (style: ExtendedViewStyle = {}) => {
  ['backgroundSize', 'backgroundPosition'].forEach(name => {
    if (style[name] && typeof style[name] === 'string') {
      if (style[name].trim()) {
        style[name] = style[name].split(' ')
      }
    }
  })
  return style
}

const isPercent = (val: string | number | undefined): val is string => typeof val === 'string' && PERCENT_REGEX.test(val)

const isBackgroundSizeKeyword = (val: string | number): boolean => typeof val === 'string' && /^cover|contain$/.test(val)

const isNeedLayout = (preImageInfo: PreImageInfo): boolean => {
  const { sizeList, backgroundPosition, linearInfo } = preImageInfo
  const [width, height] = sizeList
  const bp = backgroundPosition

  // 含有百分号，center 需计算布局
  return isBackgroundSizeKeyword(width) ||
    (isPercent(height) && width === 'auto') ||
    (isPercent(width) && height === 'auto') ||
    isPercent(bp[1]) ||
    isPercent(bp[3]) ||
    isDiagonalAngle(linearInfo)
}

const checkNeedLayout = (preImageInfo: PreImageInfo) => {
  const { sizeList } = preImageInfo
  const [width] = sizeList
  // 在渐变的时候，background-size的cover，contain, auto属性值，转化为100%, needLayout计算逻辑和原来保持一致，needImageSize始终为false
  return {
    // 是否开启layout的计算
    needLayout: isNeedLayout(preImageInfo),
    // 是否开启原始宽度的计算
    needImageSize: isBackgroundSizeKeyword(width) || sizeList.includes('auto')
  }
}

/**
* h - 用户设置的高度
* lh - 容器的高度
* ratio - 原始图片的宽高比
* **/
function calculateSize (h: number, ratio: number, lh?: number | boolean, reverse = false): Size | null {
  let height = 0; let width = 0

  if (typeof lh === 'boolean') {
    reverse = lh
  }

  if (isPercent(h)) { // auto  px/rpx
    if (!lh) return null
    height = (parseFloat(h) / 100) * (lh as number)
    width = height * ratio
  } else { // 2. auto px/rpx - 根据比例计算
    height = h
    width = height * ratio
  }
  return {
    width: reverse ? height : width,
    height: reverse ? width : height
  }
}

/**
 * 用户设置百分比后，转换为偏移量
 * h - 用户设置图片的高度
 * ch - 容器的高度
 * val - 用户设置的百分比
 * **/
function calculateSizePosition (h: number, ch: number, val: string): number {
  if (!h || !ch) return 0

  // 百分比需要单独的计算
  if (isPercent(h)) {
    h = ch * parseFloat(h) / 100
  }

  // (container width - image width) * (position x%) = (x offset value)
  return (ch - h) * parseFloat(val) / 100
}

/**
* 获取图片的展示宽高
* h - 用户设置的高度
* lh - 容器的高度
* **/
const calcPercent = (h: NumberVal, lh: number) => {
  return isPercent(h) ? parseFloat(h) / 100 * lh : +h
}

function backgroundPosition (imageProps: ImageProps, preImageInfo: PreImageInfo, imageSize: Size, layoutInfo: Size) {
  const bps = preImageInfo.backgroundPosition
  if (bps.length === 0) return
  const style: Position = {}
  const imageStyle: ImageStyle = imageProps.style || {}

  for (let i = 0; i < bps.length; i += 2) {
    const key = bps[i] as PositionKey; const val = bps[i + 1]
    // 需要获取 图片宽度 和 容器的宽度 进行计算
    if (isPercent(val)) {
      if (i === 0) {
        style[key] = calculateSizePosition(imageStyle.width as number, layoutInfo?.width, val)
      } else {
        style[key] = calculateSizePosition(imageStyle.height as number, layoutInfo?.height, val)
      }
    } else {
      style[key] = val as number
    }
  }

  extendObject(imageProps.style, style)
}

// background-size 转换
function backgroundSize (imageProps: ImageProps, preImageInfo: PreImageInfo, imageSize: Size, layoutInfo: Size) {
  const sizeList = preImageInfo.sizeList
  if (!sizeList) return
  const { width: layoutWidth, height: layoutHeight } = layoutInfo || {}
  const { width: imageSizeWidth, height: imageSizeHeight } = imageSize || {}
  const [width, height] = sizeList
  let dimensions: {
    width: NumberVal,
    height: NumberVal
  } | null = { width: 0, height: 0 }

  // 枚举值
  if (typeof width === 'string' && ['cover', 'contain'].includes(width)) {
    if (layoutInfo && imageSize) {
      const layoutRatio = layoutWidth / imageSizeWidth
      const eleRatio = imageSizeWidth / imageSizeHeight
      // 容器宽高比 大于 图片的宽高比，依据宽度作为基准，否则以高度为基准
      if ((layoutRatio <= eleRatio && (width as string) === 'contain') || (layoutRatio >= eleRatio && (width as string) === 'cover')) {
        dimensions = calculateSize(layoutWidth as number, imageSizeHeight / imageSizeWidth, true) as Size
      } else if ((layoutRatio > eleRatio && (width as string) === 'contain') || (layoutRatio < eleRatio && (width as string) === 'cover')) {
        dimensions = calculateSize(layoutHeight as number, imageSizeWidth / imageSizeHeight) as Size
      }
    }
  } else {
    if (width === 'auto' && height === 'auto') { // 均为auto
      if (!imageSize) return
      dimensions = {
        width: imageSizeWidth,
        height: imageSizeHeight
      }
    } else if (width === 'auto') { // auto px/rpx/%
      if (!imageSize) return
      dimensions = calculateSize(height as number, imageSizeWidth / imageSizeHeight, layoutInfo?.height)
      if (!dimensions) return
    } else if (height === 'auto') { // auto px/rpx/%
      if (!imageSize) return
      dimensions = calculateSize(width as number, imageSizeHeight / imageSizeWidth, layoutInfo?.width, true)
      if (!dimensions) return
    } else { // 数值类型      ImageStyle
      // 数值类型设置为 stretch
      imageProps.resizeMode = 'stretch'
      dimensions = {
        width: isPercent(width) ? width : +width,
        height: isPercent(height) ? height : +height
      } as { width: NumberVal, height: NumberVal }
    }
  }

  // 样式合并
  extendObject(imageProps.style, dimensions)
}

// background-image转换为source
function backgroundImage (imageProps: ImageProps, preImageInfo: PreImageInfo) {
  const src = preImageInfo.src
  if (src) {
    imageProps.source = { uri: src }
  }
}

// 渐变的转换
function linearGradient (imageProps: ImageProps, preImageInfo: PreImageInfo, imageSize: Size, layoutInfo: Size) {
  const { type, linearInfo } = preImageInfo
  const { colors = [], locations, direction = '' } = linearInfo || {}
  const { width, height } = imageSize || {}

  if (type !== 'linear') return

  // 角度计算
  let angle = +(linearMap.get(direction) || direction.match(/(-?\d+(\.\d+)?)deg/)?.[1] || 180) % 360

  // 对角线角度计算
  if (layoutInfo && diagonalAngleMap[direction] && imageSize && linearInfo) {
    angle = radToAngle(diagonalAngleMap[direction](width, height)) || 180
  }

  // 赋值
  imageProps.colors = colors
  imageProps.locations = locations
  imageProps.angle = angle
}

const imageStyleToProps = (preImageInfo: PreImageInfo, imageSize: Size, layoutInfo: Size) => {
  // 初始化
  const imageProps: ImageProps = {
    resizeMode: 'cover',
    style: {
      position: 'absolute'
      // ...StyleSheet.absoluteFillObject
    },
    colors: []
  }
  applyHandlers([backgroundSize, backgroundImage, backgroundPosition, linearGradient], [imageProps, preImageInfo, imageSize, layoutInfo])

  return imageProps
}

function isHorizontal (val: PositionVal): val is 'left' | 'right' {
  return typeof val === 'string' && /^(left|right)$/.test(val)
}

function isVertical (val: PositionVal): val is 'top' | 'bottom' {
  return typeof val === 'string' && /^(top|bottom)$/.test(val)
}

function normalizeBackgroundPosition (parts: PositionVal[]): backgroundPositionList {
  if (parts.length === 0) return []

  // 定义默认值
  let hStart: 'left' | 'right' = 'left'
  let hOffset: PositionVal = 0
  let vStart: 'top' | 'bottom' = 'top'
  let vOffset: PositionVal = 0

  if (parts.length === 4) return parts as backgroundPositionList

  // 归一化
  if (parts.length === 1) {
    // 1. center
    // 2. 2px - hOffset, vOffset(center) - center为50%
    // 3. 10% - hOffset, vOffset(center) - center为50%
    // 4. left - hStart, vOffset(center) - center为50%
    // 5. top - hOffset(center), vStart - center为50%

    if (isHorizontal(parts[0])) {
      hStart = parts[0]
      vOffset = '50%'
    } else if (isVertical(parts[0])) {
      vStart = parts[0]
      hOffset = '50%'
    } else {
      hOffset = parts[0]
      vOffset = '50%'
    }
  } else if (parts.length === 2) {
    // 1. center center - hOffset, vOffset
    // 2. 10px center - hOffset, vStart
    // 3. left center - hStart, vOffset
    // 4. right center - hStart, vOffset
    // 5. 第一位是 left right 覆盖的是 hStart
    //             center, 100% 正常的px 覆盖的是 hOffset
    //     第二位是 top bottom 覆盖的是 vStart
    //             center, 100% 覆盖的是 vOffset
    //
    // 水平方向
    if (isHorizontal(parts[0])) {
      hStart = parts[0]
    } else { // center, 100% 正常的px 覆盖的是 hOffset
      hOffset = parts[0]
    }
    // 垂直方向
    if (isVertical(parts[1])) {
      vStart = parts[1]
    } else { // center, 100% 正常的px 覆盖的是 hOffset
      vOffset = parts[1]
    }
  } else if (parts.length === 3) {
    // 1. center top 10px / top 10px center 等价 - center为50%
    // 2. right 10px center / center right 10px 等价 - center为50%
    // 2. bottom 50px right
    if (typeof parts[0] === 'string' && typeof parts[1] === 'string' && /^left|bottom|right|top$/.test(parts[0]) && /^left|bottom|right|top$/.test(parts[1])) {
      [hStart, vStart, vOffset] = parts as ['left' | 'right', 'top' | 'bottom', number]
    } else {
      [hStart, hOffset, vStart] = parts as ['left' | 'right', number, 'top' | 'bottom']
    }
  }

  return [hStart, hOffset, vStart, vOffset] as backgroundPositionList
}

/**
 *
 * calcSteps - 计算起始位置和终点位置之间的差值
 *    startVal - 起始位置距离
 *    endVal - 终点位置距离
 *    len - 数量
 * **/
function calcSteps (startVal: number, endVal: number, len: number) {
  const diffVal = endVal - startVal
  const step = diffVal / len
  const newArr: Array<number> = []
  for (let i = 1; i < len; i++) {
    const val = startVal + step * i
    newArr.push(+val.toFixed(2))
  }

  return newArr
}

function parseLinearGradient (text: string): LinearInfo | undefined {
  let linearText = text.trim().match(/linear-gradient\((.*)\)/)?.[1]
  if (!linearText) return

  // 添加默认的角度
  if (!/^to|^-?\d+deg/.test(linearText)) {
    linearText = '180deg ,' + linearText
  } else {
    linearText = linearText.replace('to', '')
  }

  // 把 0deg, red 10%, blue 20% 解析为 ['0deg', 'red, 10%', 'blue, 20%']
  const [direction, ...colorList] = linearText.split(/,(?![^(#]*\))/)
  // 记录需要填充起点的起始位置
  let startIdx = 0; let startVal = 0
  // 把 ['red, 10%', 'blue, 20%']解析为 [[red, 10%], [blue, 20%]]
  const linearInfo = colorList.map(item => item.trim().split(/(?<!,)\s+/))
    .reduce<LinearInfo>((prev, cur, idx, self) => {
      const { colors, locations } = prev
      const [color, val] = cur
      let numberVal: number = parseFloat(val) / 100

      // 处理渐变默认值
      if (idx === 0) {
        numberVal = numberVal || 0
      } else if (self.length - 1 === idx) {
        numberVal = numberVal || 1
      }

      // 出现缺省值时进行填充
      if (idx - startIdx > 1 && !isNaN(numberVal)) {
        locations.push(...calcSteps(startVal, numberVal, idx - startIdx))
      }

      if (!isNaN(numberVal)) {
        startIdx = idx
        startVal = numberVal
      }

      // 添加color的数组
      colors.push(color.trim())

      !isNaN(numberVal) && locations.push(numberVal)
      return prev
    }, { colors: [], locations: [] })

  return extendObject({}, linearInfo, {
    direction: direction.trim()
  })
}

function parseBgImage (text: string): {
  linearInfo?: LinearInfo;
  direction?: string;
  type?: 'image' | 'linear'
  src?: string
} {
  if (!text) return {}

  const src = parseUrl(text)
  if (src) return { src, type: 'image' }

  const linearInfo = parseLinearGradient(text)
  if (!linearInfo) return {}
  return {
    linearInfo,
    type: 'linear'
  }
}

function normalizeBackgroundSize (backgroundSize: Exclude<ExtendedViewStyle['backgroundSize'], undefined>, type: 'image' | 'linear' | undefined) {
  const sizeList = backgroundSize.slice()
  if (sizeList.length === 1) sizeList.push('auto')

  if (type === 'linear') {
    // 处理当使用渐变的时候，background-size出现cover, contain, auto，当作100%处理
    for (const i in sizeList) {
      const val = sizeList[i]
      sizeList[i] = /^cover|contain|auto$/.test(val as string) ? '100%' : val
    }
  }

  return sizeList
}

function preParseImage (imageStyle?: ExtendedViewStyle) {
  const { backgroundImage = '', backgroundSize = ['auto'], backgroundPosition = [0, 0] } = normalizeStyle(imageStyle) || {}
  const { type, src, linearInfo } = parseBgImage(backgroundImage)

  return {
    src,
    linearInfo,
    type,
    sizeList: normalizeBackgroundSize(backgroundSize, type),
    backgroundPosition: normalizeBackgroundPosition(backgroundPosition)
  }
}

function isDiagonalAngle (linearInfo?: LinearInfo): boolean {
  return !!(linearInfo?.direction && diagonalAngleMap[linearInfo.direction])
}

function inheritStyle (innerStyle: ExtendedViewStyle = {}) {
  const { borderWidth, borderRadius } = innerStyle
  const borderStyles = ['borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']
  return pickStyle(innerStyle,
    borderStyles,
    borderWidth && borderRadius
      ? (key, val) => {
        // 盒子内圆角borderWith与borderRadius的关系
        // 当borderRadius 小于 当borderWith 内边框为直角
        // 当borderRadius 大于等于 当borderWith 内边框为圆角
          if (borderStyles.includes(key)) {
            const borderVal = +val - borderWidth
            return borderVal > 0 ? borderVal : 0
          }
          return val
        }
      : undefined)
}

function wrapImage (imageStyle?: ExtendedViewStyle, innerStyle?: Record<string, any>, enableFastImage?: boolean) {
  // 预处理数据
  const preImageInfo: PreImageInfo = preParseImage(imageStyle)
  // 预解析
  const { src, sizeList, type } = preImageInfo

  // 判断是否可挂载onLayout
  const { needLayout, needImageSize } = checkNeedLayout(preImageInfo)

  const [show, setShow] = useState<boolean>(((type === 'image' && !!src) || type === 'linear') && !needLayout && !needImageSize)
  const [, setImageSizeWidth] = useState<number | null>(null)
  const [, setImageSizeHeight] = useState<number | null>(null)
  const [, setLayoutInfoWidth] = useState<number | null>(null)
  const [, setLayoutInfoHeight] = useState<number | null>(null)
  const sizeInfo = useRef<Size | null>(null)
  const layoutInfo = useRef<Size | null>(null)
  useEffect(() => {
    sizeInfo.current = null
    if (type === 'linear') {
      if (!needLayout) setShow(true)
      return
    }

    if (!src) {
      setShow(false)
      return
    // 一开始未出现，数据改变时出现
    } else if (!(needLayout || needImageSize)) {
      setShow(true)
      return
    }

    if (needImageSize) {
      Image.getSize(src, (width, height) => {
        sizeInfo.current = {
          width,
          height
        }
        // 1. 当需要绑定onLayout 2. 获取到布局信息
        if (!needLayout || layoutInfo.current) {
          setImageSizeWidth(width)
          setImageSizeHeight(height)
          if (layoutInfo.current) {
            setLayoutInfoWidth(layoutInfo.current.width)
            setLayoutInfoHeight(layoutInfo.current.height)
          }
          setShow(true)
        }
      })
    }
  // type 添加type 处理无渐变 有渐变的场景
  }, [src, type])

  if (!type) return null

  const onLayout = (res: LayoutChangeEvent) => {
    const { width, height } = res?.nativeEvent?.layout || {}
    layoutInfo.current = {
      width,
      height
    }
    if (!needImageSize) {
      setLayoutInfoWidth(width)
      setLayoutInfoHeight(height)
      // 有渐变角度的时候，才触发渲染组件
      if (type === 'linear') {
        sizeInfo.current = {
          width: calcPercent(sizeList[0] as NumberVal, width),
          height: calcPercent(sizeList[1] as NumberVal, height)
        }
        setImageSizeWidth(sizeInfo.current.width)
        setImageSizeHeight(sizeInfo.current.height)
      }
      setShow(true)
    } else if (sizeInfo.current) {
      setLayoutInfoWidth(width)
      setLayoutInfoHeight(height)
      setImageSizeWidth(sizeInfo.current.width)
      setImageSizeHeight(sizeInfo.current.height)
      setShow(true)
    }
  }

  return <View key='backgroundImage' {...needLayout ? { onLayout } : null} style={{ ...inheritStyle(innerStyle), ...StyleSheet.absoluteFillObject, overflow: 'hidden' }}>
    {show && type === 'linear' && <LinearGradient useAngle={true} {...imageStyleToProps(preImageInfo, sizeInfo.current as Size, layoutInfo.current as Size)} /> }
    {show && type === 'image' && (renderImage(imageStyleToProps(preImageInfo, sizeInfo.current as Size, layoutInfo.current as Size), enableFastImage))}
  </View>
}

interface WrapChildrenConfig {
  hasVarDec: boolean
  enableBackground?: boolean
  textStyle?: TextStyle
  backgroundStyle?: ExtendedViewStyle
  varContext?: Record<string, any>
  textProps?: Record<string, any>
  innerStyle?: Record<string, any>
  enableFastImage?: boolean
}

function wrapWithChildren (props: _ViewProps, { hasVarDec, enableBackground, textStyle, backgroundStyle, varContext, textProps, innerStyle, enableFastImage }: WrapChildrenConfig) {
  enableBackground = enableBackground || !!backgroundStyle
  const enableBackgroundRef = useRef(enableBackground)
  if (enableBackgroundRef.current !== enableBackground) {
    error('[Mpx runtime error]: background use should be stable in the component lifecycle, or you can set [enable-background] with true.')
  }
  const children = wrapChildren(props, {
    hasVarDec,
    varContext,
    textStyle,
    textProps
  })

  return [
    enableBackground ? wrapImage(backgroundStyle, innerStyle, enableFastImage) : null,
    children
  ]
}

const _View = forwardRef<HandlerRef<View, _ViewProps>, _ViewProps>((viewProps, ref): JSX.Element => {
  const { textProps, innerProps: props = {} } = splitProps(viewProps)
  const {
    style = {},
    'hover-style': hoverStyle,
    'hover-start-time': hoverStartTime = 50,
    'hover-stay-time': hoverStayTime = 400,
    'enable-var': enableVar,
    'external-var-context': externalVarContext,
    'enable-background': enableBackground,
    'enable-fast-image': enableFastImage,
    'enable-animation': enableAnimation,
    'parent-font-size': parentFontSize,
    'parent-width': parentWidth,
    'parent-height': parentHeight,
    animation
  } = props

  // 默认样式
  const defaultStyle: ExtendedViewStyle = style.display === 'flex'
    ? {
        flexDirection: 'row',
        flexBasis: 'auto',
        flexShrink: 1,
        flexWrap: 'nowrap'
      }
    : {}

  const { isHover, enableHoverStyle, gesture } = useHoverStyle({ hoverStyle, hoverStartTime, hoverStayTime })

  const styleObj: ExtendedViewStyle = extendObject({}, defaultStyle, style, isHover ? hoverStyle as ExtendedViewStyle : {})

  const {
    normalStyle,
    hasSelfPercent,
    hasVarDec,
    varContextRef,
    setWidth,
    setHeight
  } = useTransformStyle(styleObj, {
    enableVar,
    externalVarContext,
    parentFontSize,
    parentWidth,
    parentHeight
  })

  const { textStyle, backgroundStyle, innerStyle = {} } = splitStyle(normalStyle)

  const nodeRef = useRef(null)
  useNodesRef<View, _ViewProps>(props, ref, nodeRef, {
    style: normalStyle
  })

  const {
    layoutRef,
    layoutStyle,
    layoutProps
  } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef })

  const viewStyle = extendObject({}, innerStyle, layoutStyle)

  const { enableStyleAnimation, animationStyle } = useAnimationHooks({
    enableAnimation,
    animation,
    style: viewStyle
  })

  const innerProps = useInnerProps(
    props,
    extendObject({
      ref: nodeRef,
      style: enableStyleAnimation ? [viewStyle, animationStyle] : viewStyle
    },
    layoutProps
    ), [
      'hover-start-time',
      'hover-stay-time',
      'hover-style',
      'hover-class'
    ], {
      layoutRef
    })

  const childNode = wrapWithChildren(props, {
    hasVarDec,
    enableBackground,
    textStyle,
    backgroundStyle,
    varContext: varContextRef.current,
    textProps,
    innerStyle,
    enableFastImage
  })

  const BaseComponent = enableStyleAnimation
    ? createElement(Animated.View, innerProps, childNode)
    : createElement(View, innerProps, childNode)

  return enableHoverStyle
    ? createElement(GestureDetector, { gesture }, BaseComponent)
    : BaseComponent
})

_View.displayName = 'MpxView'

export default _View
