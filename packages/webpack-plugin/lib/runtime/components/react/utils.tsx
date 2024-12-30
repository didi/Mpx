import { useEffect, useCallback, useMemo, useRef, ReactNode, ReactElement, isValidElement, useContext, useState, Dispatch, SetStateAction, Children, cloneElement } from 'react'
import { LayoutChangeEvent, TextStyle, ImageProps, Image, Platform } from 'react-native'
import { isObject, isFunction, isNumber, hasOwn, diffAndCloneA, error, warn, getFocusedNavigation } from '@mpxjs/utils'
import { VarContext, ScrollViewContext } from './context'
import { ExpressionParser, parseFunc, ReplaceSource } from './parser'
import { initialWindowMetrics } from 'react-native-safe-area-context'
import FastImage, { FastImageProps } from '@d11/react-native-fast-image'
import type { AnyFunc, ExtendedFunctionComponent, ExtendedViewStyle } from './types/common'
import { runOnJS } from 'react-native-reanimated'
import { Gesture } from 'react-native-gesture-handler'

export const TEXT_STYLE_REGEX = /color|font.*|text.*|letterSpacing|lineHeight|includeFontPadding|writingDirection/
export const PERCENT_REGEX = /^\s*-?\d+(\.\d+)?%\s*$/
export const URL_REGEX = /^\s*url\(["']?(.*?)["']?\)\s*$/
export const SVG_REGEXP = /https?:\/\/.*\.(?:svg)/i
export const BACKGROUND_REGEX = /^background(Image|Size|Repeat|Position)$/
export const TEXT_PROPS_REGEX = /ellipsizeMode|numberOfLines|allowFontScaling/
export const DEFAULT_FONT_SIZE = 16
export const HIDDEN_STYLE = {
  opacity: 0
}

export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'

const varDecRegExp = /^--.*/
const varUseRegExp = /var\(/
const calcUseRegExp = /calc\(/
const envUseRegExp = /env\(/

const safeAreaInsetMap: Record<string, 'top' | 'right' | 'bottom' | 'left'> = {
  'safe-area-inset-top': 'top',
  'safe-area-inset-right': 'right',
  'safe-area-inset-bottom': 'bottom',
  'safe-area-inset-left': 'left'
}

function getSafeAreaInset (name: string) {
  const navigation = getFocusedNavigation()
  const insets = extendObject({}, initialWindowMetrics?.insets, navigation?.insets)
  return insets[safeAreaInsetMap[name]]
}

export function omit<T, K extends string> (obj: T, fields: K[]): Omit<T, K> {
  const shallowCopy: any = Object.assign({}, obj)
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i]
    delete shallowCopy[key]
  }
  return shallowCopy
}

/**
 * 用法等同于 useEffect，但是会忽略首次执行，只在依赖更新时执行
 */
export const useUpdateEffect = (effect: any, deps: any) => {
  const isMounted = useRef(false)

  // for react-refresh
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      return effect()
    }
  }, deps)
}

/**
 * 解析行内样式
 * @param inlineStyle
 * @returns
 */
export const parseInlineStyle = (inlineStyle = ''): Record<string, string> => {
  return inlineStyle.split(';').reduce((styleObj, style) => {
    const [k, v, ...rest] = style.split(':')
    if (rest.length || !v || !k) return styleObj
    const key = k.trim().replace(/-./g, c => c.substring(1).toUpperCase())
    return Object.assign(styleObj, { [key]: global.__formatValue(v.trim()) })
  }, {})
}

export const parseUrl = (cssUrl = '') => {
  if (!cssUrl) return
  const match = cssUrl.match(URL_REGEX)
  return match?.[1]
}

export const getRestProps = (transferProps: any = {}, originProps: any = {}, deletePropsKey: any = []) => {
  return extendObject(
    {},
    transferProps,
    omit(originProps, deletePropsKey)
  )
}

export function isText (ele: ReactNode): ele is ReactElement {
  if (isValidElement(ele)) {
    const displayName = (ele.type as ExtendedFunctionComponent)?.displayName
    const isCustomText = (ele.type as ExtendedFunctionComponent)?.isCustomText
    return displayName === 'MpxText' || displayName === 'MpxSimpleText' || displayName === 'Text' || !!isCustomText
  }
  return false
}

export function every (children: ReactNode, callback: (children: ReactNode) => boolean) {
  const childrenArray = Array.isArray(children) ? children : [children]
  return childrenArray.every((child) => callback(child))
}

type GroupData<T> = Record<string, Partial<T>>
export function groupBy<T extends Record<string, any>> (
  obj: T,
  callback: (key: string, val: T[keyof T]) => string,
  group: GroupData<T> = {}
): GroupData<T> {
  Object.entries(obj).forEach(([key, val]) => {
    const groupKey = callback(key, val)
    group[groupKey] = group[groupKey] || {}
    group[groupKey][key as keyof T] = val
  })
  return group
}

export function splitStyle<T extends Record<string, any>> (styleObj: T): {
  textStyle?: Partial<T>
  backgroundStyle?: Partial<T>
  innerStyle?: Partial<T>
} {
  return groupBy(styleObj, (key) => {
    if (TEXT_STYLE_REGEX.test(key)) {
      return 'textStyle'
    } else if (BACKGROUND_REGEX.test(key)) {
      return 'backgroundStyle'
    } else {
      return 'innerStyle'
    }
  }) as {
    textStyle: Partial<T>
    backgroundStyle: Partial<T>
    innerStyle: Partial<T>
  }
}

const selfPercentRule: Record<string, 'height' | 'width'> = {
  translateX: 'width',
  translateY: 'height',
  borderTopLeftRadius: 'width',
  borderBottomLeftRadius: 'width',
  borderBottomRightRadius: 'width',
  borderTopRightRadius: 'width',
  borderRadius: 'width'
}

const parentHeightPercentRule: Record<string, boolean> = {
  height: true,
  top: true,
  bottom: true
}

interface PercentConfig {
  fontSize?: number | string
  width?: number
  height?: number
  parentFontSize?: number
  parentWidth?: number
  parentHeight?: number
}

function resolvePercent (value: string | number | undefined, key: string, percentConfig: PercentConfig): string | number | undefined {
  if (!(typeof value === 'string' && PERCENT_REGEX.test(value))) return value
  let base
  let reason
  if (key === 'fontSize') {
    base = percentConfig.parentFontSize
    reason = 'parent-font-size'
  } else if (key === 'lineHeight') {
    base = resolvePercent(percentConfig.fontSize, 'fontSize', percentConfig)
    reason = 'font-size'
  } else if (selfPercentRule[key]) {
    base = percentConfig[selfPercentRule[key]]
    reason = selfPercentRule[key]
  } else if (parentHeightPercentRule[key]) {
    base = percentConfig.parentHeight
    reason = 'parent-height'
  } else {
    base = percentConfig.parentWidth
    reason = 'parent-width'
  }
  if (typeof base !== 'number') {
    error(`[${key}] can not contain % unit unless you set [${reason}] with a number for the percent calculation.`)
    return value
  } else {
    return parseFloat(value) / 100 * base
  }
}

function transformPercent (styleObj: Record<string, any>, percentKeyPaths: Array<Array<string>>, percentConfig: PercentConfig) {
  percentKeyPaths.forEach((percentKeyPath) => {
    setStyle(styleObj, percentKeyPath, ({ target, key, value }) => {
      target[key] = resolvePercent(value, key, percentConfig)
    })
  })
}

function resolveVar (input: string, varContext: Record<string, any>) {
  const parsed = parseFunc(input, 'var')
  const replaced = new ReplaceSource(input)

  parsed.forEach(({ start, end, args }) => {
    const varName = args[0]
    const fallback = args[1] || ''
    let varValue = hasOwn(varContext, varName) ? varContext[varName] : fallback
    if (varUseRegExp.test(varValue)) {
      varValue = '' + resolveVar(varValue, varContext)
    } else {
      varValue = '' + global.__formatValue(varValue)
    }
    replaced.replace(start, end - 1, varValue)
  })
  return global.__formatValue(replaced.source())
}

function transformVar (styleObj: Record<string, any>, varKeyPaths: Array<Array<string>>, varContext: Record<string, any>) {
  varKeyPaths.forEach((varKeyPath) => {
    setStyle(styleObj, varKeyPath, ({ target, key, value }) => {
      target[key] = resolveVar(value, varContext)
    })
  })
}

function transformEnv (styleObj: Record<string, any>, envKeyPaths: Array<Array<string>>) {
  envKeyPaths.forEach((envKeyPath) => {
    setStyle(styleObj, envKeyPath, ({ target, key, value }) => {
      const parsed = parseFunc(value, 'env')
      const replaced = new ReplaceSource(value)
      parsed.forEach(({ start, end, args }) => {
        const name = args[0]
        const fallback = args[1] || ''
        const value = '' + (getSafeAreaInset(name) ?? global.__formatValue(fallback))
        replaced.replace(start, end - 1, value)
      })
      target[key] = global.__formatValue(replaced.source())
    })
  })
}

function transformCalc (styleObj: Record<string, any>, calcKeyPaths: Array<Array<string>>, formatter: (value: string, key: string) => number) {
  calcKeyPaths.forEach((calcKeyPath) => {
    setStyle(styleObj, calcKeyPath, ({ target, key, value }) => {
      const parsed = parseFunc(value, 'calc')
      const replaced = new ReplaceSource(value)
      parsed.forEach(({ start, end, args }) => {
        const exp = args[0]
        try {
          const result = new ExpressionParser(exp, (value) => {
            return formatter(value, key)
          }).parse()
          replaced.replace(start, end - 1, '' + result.value)
        } catch (e) {
          error(`calc(${exp}) parse error.`, undefined, e)
        }
      })
      target[key] = global.__formatValue(replaced.source())
    })
  })
}

const stringifyProps = ['fontWeight']
function transformStringify (styleObj: Record<string, any>) {
  stringifyProps.forEach((prop) => {
    if (isNumber(styleObj[prop])) {
      styleObj[prop] = '' + styleObj[prop]
    }
  })
}

interface TransformStyleConfig {
  enableVar?: boolean
  externalVarContext?: Record<string, any>
  parentFontSize?: number
  parentWidth?: number
  parentHeight?: number
}

export function useTransformStyle (styleObj: Record<string, any> = {}, { enableVar, externalVarContext, parentFontSize, parentWidth, parentHeight }: TransformStyleConfig) {
  const varStyle: Record<string, any> = {}
  const normalStyle: Record<string, any> = {}
  let hasVarDec = false
  let hasVarUse = false
  let hasSelfPercent = false
  const varKeyPaths: Array<Array<string>> = []
  const percentKeyPaths: Array<Array<string>> = []
  const calcKeyPaths: Array<Array<string>> = []
  const envKeyPaths: Array<Array<string>> = []
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  function varVisitor ({ key, value, keyPath }: VisitorArg) {
    if (keyPath.length === 1) {
      if (varDecRegExp.test(key)) {
        hasVarDec = true
        varStyle[key] = value
      } else {
        // clone对象避免set值时改写到props
        normalStyle[key] = isObject(value) ? diffAndCloneA(value).clone : value
      }
    }
    // 对于var定义中使用的var无需替换值，可以通过resolveVar递归解析出值
    if (!varDecRegExp.test(key) && varUseRegExp.test(value)) {
      hasVarUse = true
      varKeyPaths.push(keyPath.slice())
    }
  }

  // traverse var
  traverseStyle(styleObj, [varVisitor])
  hasVarDec = hasVarDec || !!externalVarContext
  enableVar = enableVar || hasVarDec || hasVarUse
  const enableVarRef = useRef(enableVar)
  if (enableVarRef.current !== enableVar) {
    error('css variable use/declare should be stable in the component lifecycle, or you can set [enable-var] with true.')
  }
  // apply var
  const varContextRef = useRef({})
  if (enableVarRef.current) {
    const varContext = useContext(VarContext)
    const newVarContext = Object.assign({}, varContext, externalVarContext, varStyle)
    // 缓存比较newVarContext是否发生变化
    if (diffAndCloneA(varContextRef.current, newVarContext).diff) {
      varContextRef.current = newVarContext
    }
    transformVar(normalStyle, varKeyPaths, varContextRef.current)
  }

  function envVisitor ({ value, keyPath }: VisitorArg) {
    if (envUseRegExp.test(value)) {
      envKeyPaths.push(keyPath.slice())
    }
  }

  function calcVisitor ({ value, keyPath }: VisitorArg) {
    if (calcUseRegExp.test(value)) {
      calcKeyPaths.push(keyPath.slice())
    }
  }

  function percentVisitor ({ key, value, keyPath }: VisitorArg) {
    if (hasOwn(selfPercentRule, key) && PERCENT_REGEX.test(value)) {
      hasSelfPercent = true
      percentKeyPaths.push(keyPath.slice())
    } else if ((key === 'fontSize' || key === 'lineHeight') && PERCENT_REGEX.test(value)) {
      percentKeyPaths.push(keyPath.slice())
    }
  }

  // traverse env & calc & percent
  traverseStyle(normalStyle, [envVisitor, percentVisitor, calcVisitor])

  const percentConfig = {
    width,
    height,
    fontSize: normalStyle.fontSize,
    parentWidth,
    parentHeight,
    parentFontSize
  }

  // apply env
  transformEnv(normalStyle, envKeyPaths)
  // apply percent
  transformPercent(normalStyle, percentKeyPaths, percentConfig)
  // apply calc
  transformCalc(normalStyle, calcKeyPaths, (value: string, key: string) => {
    if (PERCENT_REGEX.test(value)) {
      const resolved = resolvePercent(value, key, percentConfig)
      return typeof resolved === 'number' ? resolved : 0
    } else {
      const formatted = global.__formatValue(value)
      if (typeof formatted === 'number') {
        return formatted
      } else {
        warn('calc() only support number, px, rpx, % temporarily.')
        return 0
      }
    }
  })
  // transform number enum stringify
  transformStringify(normalStyle)

  return {
    normalStyle,
    hasSelfPercent,
    hasVarDec,
    enableVarRef,
    varContextRef,
    setWidth,
    setHeight
  }
}

export interface VisitorArg {
  target: Record<string, any>
  key: string
  value: any
  keyPath: Array<string>
}

export function traverseStyle (styleObj: Record<string, any>, visitors: Array<(arg: VisitorArg) => void>) {
  const keyPath: Array<string> = []
  function traverse<T extends Record<string, any>> (target: T) {
    if (Array.isArray(target)) {
      target.forEach((value, index) => {
        const key = String(index)
        keyPath.push(key)
        visitors.forEach(visitor => visitor({
          target,
          key,
          value,
          keyPath
        }))
        traverse(value)
        keyPath.pop()
      })
    } else if (isObject(target)) {
      Object.entries(target).forEach(([key, value]) => {
        keyPath.push(key)
        visitors.forEach(visitor => visitor({ target, key, value, keyPath }))
        traverse(value)
        keyPath.pop()
      })
    }
  }
  traverse(styleObj)
}

export function setStyle (styleObj: Record<string, any>, keyPath: Array<string>, setter: (arg: VisitorArg) => void) {
  let target = styleObj
  const lastKey = keyPath[keyPath.length - 1]
  for (let i = 0; i < keyPath.length - 1; i++) {
    target = target[keyPath[i]]
    if (!target) return
  }
  setter({
    target,
    key: lastKey,
    value: target[lastKey],
    keyPath
  })
}

export function splitProps<T extends Record<string, any>> (props: T): {
  textProps?: Partial<T>
  innerProps?: Partial<T>
} {
  return groupBy(props, (key) => {
    if (TEXT_PROPS_REGEX.test(key)) {
      return 'textProps'
    } else {
      return 'innerProps'
    }
  }) as {
    textProps: Partial<T>
    innerProps: Partial<T>
  }
}

interface LayoutConfig {
  props: Record<string, any>
  hasSelfPercent: boolean
  setWidth: Dispatch<SetStateAction<number>>
  setHeight: Dispatch<SetStateAction<number>>
  onLayout?: (event?: LayoutChangeEvent) => void
  nodeRef: React.RefObject<any>
}
export const useLayout = ({ props, hasSelfPercent, setWidth, setHeight, onLayout, nodeRef }: LayoutConfig) => {
  const layoutRef = useRef({})
  const hasLayoutRef = useRef(false)
  const layoutStyle = useMemo(() => { return !hasLayoutRef.current && hasSelfPercent ? HIDDEN_STYLE : {} }, [hasLayoutRef.current])
  const layoutProps: Record<string, any> = {}
  const enableOffset = props['enable-offset']
  if (hasSelfPercent || onLayout || enableOffset) {
    layoutProps.onLayout = (e: LayoutChangeEvent) => {
      hasLayoutRef.current = true
      if (hasSelfPercent) {
        const { width, height } = e?.nativeEvent?.layout || {}
        setWidth(width || 0)
        setHeight(height || 0)
      }
      if (enableOffset) {
        nodeRef.current?.measure((x: number, y: number, width: number, height: number, offsetLeft: number, offsetTop: number) => {
          layoutRef.current = { x, y, width, height, offsetLeft, offsetTop }
        })
      }
      onLayout && onLayout(e)
      props.onLayout && props.onLayout(e)
    }
  }

  return {
    layoutRef,
    layoutStyle,
    layoutProps
  }
}

export interface WrapChildrenConfig {
  hasVarDec: boolean
  varContext?: Record<string, any>
  textStyle?: TextStyle
  textProps?: Record<string, any>
}

export function wrapChildren (props: Record<string, any> = {}, { hasVarDec, varContext, textStyle, textProps }: WrapChildrenConfig) {
  let { children } = props
  if (textStyle || textProps) {
    children = Children.map(children, (child) => {
      if (isText(child)) {
        const style = extendObject({}, textStyle, child.props.style)
        return cloneElement(child, extendObject({}, textProps, { style }))
      }
      return child
    })
  }
  if (hasVarDec && varContext) {
    children = <VarContext.Provider value={varContext} key='varContextWrap'>{children}</VarContext.Provider>
  }
  return children
}

export const debounce = <T extends AnyFunc> (
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { clear: () => void } => {
  let timer: any
  const wrapper = (...args: ReadonlyArray<any>) => {
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, delay)
  }
  wrapper.clear = () => {
    timer && clearTimeout(timer)
    timer = null
  }
  return wrapper
}

export const useDebounceCallback = <T extends AnyFunc> (
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { clear: () => void } => {
  const debounced = useMemo(() => debounce(func, delay), [func])
  return debounced
}

export const useStableCallback = <T extends AnyFunc | null | undefined> (
  callback: T
): T extends AnyFunc ? T : () => void => {
  const ref = useRef<T>(callback)
  ref.current = callback
  return useCallback<any>(
    (...args: any[]) => ref.current?.(...args),
    []
  )
}

export const usePrevious = <T, > (value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined)
  const prev = ref.current
  ref.current = value
  return prev
}

export interface GestureHandler {
  nodeRefs?: Array<{ getNodeInstance: () => { nodeRef: unknown } }>
  current?: unknown
}

export function flatGesture (gestures: Array<GestureHandler> = []) {
  return (gestures && gestures.flatMap((gesture: GestureHandler) => {
    if (gesture && gesture.nodeRefs) {
      return gesture.nodeRefs
        .map((item: { getNodeInstance: () => any }) => item.getNodeInstance()?.instance?.gestureRef || {})
    }
    return gesture?.current ? [gesture] : []
  })) || []
}

export const extendObject = Object.assign

export function getCurrentPage (pageId: number | null) {
  if (!global.getCurrentPages) return
  const pages = global.getCurrentPages()
  return pages.find((page: any) => isFunction(page.getPageId) && page.getPageId() === pageId)
}

export function renderImage (
  imageProps: ImageProps | FastImageProps,
  enableFastImage = false
) {
  const Component: React.ComponentType<ImageProps | FastImageProps> = enableFastImage ? FastImage : Image
  return <Component {...imageProps} />
}

export function pickStyle (styleObj: Record<string, any> = {}, pickedKeys: Array<string>, callback?: (key: string, val: number | string) => number | string) {
  return pickedKeys.reduce<Record<string, any>>((acc, key) => {
    if (key in styleObj) {
      acc[key] = callback ? callback(key, styleObj[key]) : styleObj[key]
    }
    return acc
  }, {})
}

export function useHoverStyle ({ hoverStyle, hoverStartTime, hoverStayTime, disabled } : { hoverStyle?: ExtendedViewStyle, hoverStartTime: number, hoverStayTime: number, disabled?: boolean }) {
  const enableHoverStyle = !!hoverStyle
  const enableHoverStyleRef = useRef(enableHoverStyle)
  if (enableHoverStyleRef.current !== enableHoverStyle) {
    throw new Error('[Mpx runtime error]: hover-class use should be stable in the component lifecycle.')
  }

  if (!enableHoverStyle) return { enableHoverStyle }

  const gestureRef = useContext(ScrollViewContext).gestureRef
  const [isHover, setIsHover] = useState(false)
  const dataRef = useRef<{
    startTimer?: ReturnType<typeof setTimeout>
    stayTimer?: ReturnType<typeof setTimeout>
  }>({})

  useEffect(() => {
    return () => {
      dataRef.current.startTimer && clearTimeout(dataRef.current.startTimer)
      dataRef.current.stayTimer && clearTimeout(dataRef.current.stayTimer)
    }
  }, [])

  const setStartTimer = () => {
    dataRef.current.startTimer && clearTimeout(dataRef.current.startTimer)
    dataRef.current.startTimer = setTimeout(() => {
      setIsHover(true)
    }, +hoverStartTime)
  }

  const setStayTimer = () => {
    dataRef.current.stayTimer && clearTimeout(dataRef.current.stayTimer)
    dataRef.current.startTimer && clearTimeout(dataRef.current.startTimer)
    dataRef.current.stayTimer = setTimeout(() => {
      setIsHover(false)
    }, +hoverStayTime)
  }

  const gesture = useMemo(() => {
    return Gesture.Pan()
      .onTouchesDown(() => {
        'worklet'
        if (disabled) return
        runOnJS(setStartTimer)()
      })
      .onTouchesUp(() => {
        'worklet'
        if (disabled) return
        runOnJS(setStayTimer)()
      })
  }, [disabled])

  if (gestureRef) {
    gesture.simultaneousWithExternalGesture(gestureRef)
  }

  return {
    isHover,
    gesture,
    enableHoverStyle
  }
}
