import { useEffect, useMemo, useRef } from 'react'
import { TransformsStyle } from 'react-native'
import {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withSequence,
  withDelay,
  makeMutable,
  cancelAnimation,
  SharedValue,
  WithTimingConfig,
  AnimationCallback
} from 'react-native-reanimated'
import { error } from '@mpxjs/utils'
import { ExtendedViewStyle } from './types/common'
import type { _ViewProps } from './mpx-view'

type AnimatedOption = {
  duration: number
  delay: number
  useNativeDriver: boolean
  timingFunction: 'linear' | 'ease' | 'ease-in' | 'ease-in-out'| 'ease-out'
  transformOrigin: string
}
type ExtendWithTimingConfig = WithTimingConfig & {
  delay: number
}
export type AnimationStepItem = {
  animatedOption: AnimatedOption
  rules: Map<string, number | string>
  transform: Map<string, number>
}
export type AnimationProp = {
  id: number,
  actions: AnimationStepItem[]
}

// 微信 timingFunction 和 RN Easing 对应关系
const EasingKey = {
  linear: Easing.linear,
  ease: Easing.ease,
  'ease-in': Easing.in(Easing.ease),
  'ease-in-out': Easing.inOut(Easing.ease),
  'ease-out': Easing.out(Easing.ease)
  // 'step-start': '',
  // 'step-end': ''
}
const TransformInitial: ExtendedViewStyle = {
  // matrix: 0,
  // matrix3d: 0,
  rotate: '0deg',
  rotateX: '0deg',
  rotateY: '0deg',
  rotateZ: '0deg',
  // rotate3d:[0,0,0]
  scale: 1,
  // scale3d: [1, 1, 1],
  scaleX: 1,
  scaleY: 1,
  // scaleZ: 1,
  skew: 0,
  skewX: '0deg',
  skewY: '0deg',
  translate: 0,
  // translate3d: 0,
  translateX: 0,
  translateY: 0
  // translateZ: 0,
}
// 动画默认初始值
const InitialValue: ExtendedViewStyle = Object.assign({
  opacity: 1,
  backgroundColor: 'transparent',
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  transformOrigin: ['50%', '50%', 0]
}, TransformInitial)
const TransformOrigin = 'transformOrigin'
// transform
const isTransform = (key: string) => Object.keys(TransformInitial).includes(key)
// 多value解析
const parseValues = (str: string, char = ' ') => {
  let stack = 0
  let temp = ''
  const result = []
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') {
      stack++
    } else if (str[i] === ')') {
      stack--
    }
    // 非括号内 或者 非分隔字符且非空
    if (stack !== 0 || (str[i] !== char && str[i] !== ' ')) {
      temp += str[i]
    }
    if ((stack === 0 && str[i] === char) || i === str.length - 1) {
      result.push(temp)
      temp = ''
    }
  }
  return result
}
// parse string transform, eg: transform: 'rotateX(45deg) rotateZ(0.785398rad)'
const parseTransform = (transformStr: string) => {
  const values = parseValues(transformStr)
  const transform: {[propName: string]: string|number|number[]}[] = []
  values.forEach(item => {
    const match = item.match(/([/\w]+)\((.+)\)/)
    if (match && match.length >= 3) {
      let key = match[1]
      const val = match[2]
      switch (key) {
        case 'translateX':
        case 'translateY':
        case 'scaleX':
        case 'scaleY':
        case 'rotateX':
        case 'rotateY':
        case 'rotateZ':
        case 'rotate':
        case 'skewX':
        case 'skewY':
        case 'perspective':
          // 单个值处理
          transform.push({ [key]: global.__formatValue(val) })
          break
        case 'matrix':
        case 'matrix3d':
          transform.push({ [key]: parseValues(val, ',').map(val => +val) })
          break
        case 'translate':
        case 'scale':
        case 'skew':
        case 'rotate3d': // x y z angle
        case 'translate3d': // x y 支持 z不支持
        case 'scale3d': // x y 支持 z不支持
        {
          // 2 个以上的值处理
          key = key.replace('3d', '')
          const vals = parseValues(val, ',').splice(0, key === 'rotate' ? 4 : 3)
          // scale(.5) === scaleX(.5) scaleY(.5)
          if (vals.length === 1 && key === 'scale') {
            vals.push(vals[0])
          }
          const xyz = ['X', 'Y', 'Z']
          transform.push(...vals.map((v, index) => {
            return { [`${key}${xyz[index] || ''}`]: global.__formatValue(v.trim()) }
          }))
          break
        }
      }
    }
  })
  return transform
}
// format style
const formatStyle = (style: ExtendedViewStyle): ExtendedViewStyle => {
  if (!style.transform || Array.isArray(style.transform)) return style
  return Object.assign({}, style, {
    transform: parseTransform(style.transform)
  })
}

export default function useAnimationHooks<T, P> (props: _ViewProps & { enableAnimation?: boolean }) {
  const { style = {}, animation, enableAnimation } = props

  const enableStyleAnimation = enableAnimation || !!animation
  const enableAnimationRef = useRef(enableStyleAnimation)
  if (enableAnimationRef.current !== enableStyleAnimation) {
    error('[Mpx runtime error]: animation use should be stable in the component lifecycle, or you can set [enable-animation] with true.')
  }

  if (!enableStyleAnimation) return { enableStyleAnimation }

  const originalStyle = formatStyle(style)
  // id 标识
  const id = animation?.id || -1
  // 有动画样式的 style key
  const animatedStyleKeys = useSharedValue([] as (string|string[])[])
  // 记录动画key的style样式值 没有的话设置为false
  const animatedKeys = useRef({} as {[propName: keyof ExtendedViewStyle]: boolean})
  // const animatedKeys = useRef({} as {[propName: keyof ExtendedViewStyle]: boolean|number|string})
  // ** 全量 style prop sharedValue
  // 不能做增量的原因：
  // 1 尝试用 useRef，但 useAnimatedStyle 访问后的 ref 不能在增加新的值，被冻结
  // 2 尝试用 useSharedValue，因为实际触发的 style prop 需要是 sharedValue 才能驱动动画，若外层 shareValMap 也是 sharedValue，动画无法驱动。
  const shareValMap = useMemo(() => {
    return Object.keys(InitialValue).reduce((valMap, key) => {
      const defaultVal = getInitialVal(key, isTransform(key))
      valMap[key] = makeMutable(defaultVal)
      return valMap
    }, {} as { [propName: keyof ExtendedViewStyle]: SharedValue<string|number> })
  }, [])
  // ** 获取动画样式prop & 驱动动画
  useEffect(() => {
    if (id === -1) return
    // 更新动画样式 key map
    animatedKeys.current = getAnimatedStyleKeys()
    const keys = Object.keys(animatedKeys.current)
    animatedStyleKeys.value = formatAnimatedKeys([TransformOrigin, ...keys])
    // 驱动动画
    createAnimation(keys)
  }, [id])
  // 同步style更新
  // useEffect(() => {
  //   Object.keys(animatedKeys.current).forEach(key => {
  //     const originVal = getOriginalStyleVal(key, isTransform(key))
  //     if (originVal && animatedKeys.current[key] !== originVal) {
  //       animatedKeys.current[key] = originVal
  //       shareValMap[key].value = originVal
  //     }
  //   })
  // }, [style])
  // ** 清空动画
  useEffect(() => {
    return () => {
      Object.values(shareValMap).forEach((value) => {
        cancelAnimation(value)
      })
    }
  }, [])
  // 根据 animation action 创建&驱动动画 key => wi
  function createAnimation (animatedKeys: string[] = []) {
    const actions = animation?.actions || []
    const sequence = {} as { [propName: keyof ExtendedViewStyle]: (string|number)[] }
    const lastValueMap = {} as { [propName: keyof ExtendedViewStyle]: string|number }
    actions.forEach(({ animatedOption, rules, transform }, index) => {
      const { delay, duration, timingFunction, transformOrigin } = animatedOption
      const easing = EasingKey[timingFunction] || Easing.inOut(Easing.quad)
      let needSetCallback = true
      const setTransformOrigin: AnimationCallback = (finished: boolean) => {
        'worklet'
        // 动画结束后设置下一次transformOrigin
        if (finished) {
          if (index < actions.length - 1) {
            const transformOrigin = actions[index + 1].animatedOption?.transformOrigin
            transformOrigin && (shareValMap[TransformOrigin].value = transformOrigin)
          }
        }
      }
      if (index === 0) {
        // 设置当次中心
        shareValMap[TransformOrigin].value = transformOrigin
      }
      // 添加每个key的多次step动画
      animatedKeys.forEach(key => {
        // key不存在，第一轮取shareValMap[key]value，非第一轮取上一轮的
        const toVal = rules.get(key) !== undefined
          ? rules.get(key)
          : transform.get(key) !== undefined
            ? transform.get(key)
            : index > 0
              ? lastValueMap[key]
              : shareValMap[key].value
        const animation = getAnimation({ key, value: toVal! }, { delay, duration, easing }, needSetCallback ? setTransformOrigin : undefined)
        needSetCallback = false
        if (!sequence[key]) {
          sequence[key] = [animation]
        } else {
          sequence[key].push(animation)
        }
        // 更新一下 lastValueMap
        lastValueMap[key] = toVal!
      })
      // 赋值驱动动画
      animatedKeys.forEach((key) => {
        const animations = sequence[key]
        shareValMap[key].value = withSequence(...animations)
      })
    })
  }
  // 创建单个animation
  function getAnimation ({ key, value }: { key: string, value: string|number }, { delay, duration, easing }: ExtendWithTimingConfig, callback?: AnimationCallback) {
    const animation = typeof callback === 'function'
      ? withTiming(value, { duration, easing }, callback)
      : withTiming(value, { duration, easing })
    return delay ? withDelay(delay, animation) : animation
  }
  function getInitialVal (key: keyof ExtendedViewStyle, isTransform = false) {
    if (isTransform && Array.isArray(originalStyle.transform)) {
      let initialVal = InitialValue[key]
      // 仅支持 { transform: [{rotateX: '45deg'}, {rotateZ: '0.785398rad'}] } 格式的初始样式
      originalStyle.transform.forEach(item => {
        if (item[key] !== undefined) initialVal = item[key]
      })
      return initialVal
    }
    return originalStyle[key] === undefined ? InitialValue[key] : originalStyle[key]
  }
  // 从 prop style 中获取样式初始值 没有为undefined
  // function getOriginalStyleVal (key: keyof ExtendedViewStyle, isTransform = false) {
  //   if (isTransform && Array.isArray(originalStyle.transform)) {
  //     let initialVal = undefined // InitialValue[key]
  //     // 仅支持 { transform: [{rotateX: '45deg'}, {rotateZ: '0.785398rad'}] } 格式的初始样式
  //     originalStyle.transform.forEach(item => {
  //       if (item[key] !== undefined) initialVal = item[key]
  //     })
  //     return initialVal
  //   }
  //   return originalStyle[key] // === undefined ? InitialValue[key] : originalStyle[key]
  // }
  // 获取动画shareVal初始值（prop style or 默认值）
  // function getInitialVal (key: keyof ExtendedViewStyle, isTransform = false) {
  //   const originalVal = getOriginalStyleVal(key, isTransform)
  //   return originalVal === undefined ? InitialValue[key] : originalStyle[key]
  // }
  // 循环 animation actions 获取所有有动画的 style prop name
  function getAnimatedStyleKeys () {
    return (animation?.actions || []).reduce((keyMap, action) => {
      const { rules, transform } = action
      const ruleArr = [...rules.keys(), ...transform.keys()]
      ruleArr.forEach(key => {
        // const originalVal = getOriginalStyleVal(key, isTransform(key))
        // if (!keyMap[key]) keyMap[key] = originalVal === undefined ? false : originalVal
        if (!keyMap[key]) keyMap[key] = true
      })
      return keyMap
    }, animatedKeys.current)
  }
  // animated key transform 格式化
  function formatAnimatedKeys (keys: string[] = []) {
    const animatedKeys = [] as (string|string[])[]
    const transforms = [] as string[]
    keys.forEach(key => {
      if (isTransform(key)) {
        transforms.push(key)
      } else {
        animatedKeys.push(key)
      }
    })
    if (transforms.length) animatedKeys.push(transforms)
    return animatedKeys
  }
  // transform 数组转对象
  function getTransformObj () {
    'worklet'
    const transforms = originalStyle.transform || []
    return transforms.reduce((transformObj, item) => {
      return Object.assign(transformObj, item)
    }, {} as { [propName: string]: string | number })
  }
  // ** 生成动画样式

  const animationStyle = useAnimatedStyle(() => {
    // console.info(`useAnimatedStyle styles=`, originalStyle)
    return animatedStyleKeys.value.reduce((styles, key) => {
      // console.info('getAnimationStyles', key, shareValMap[key].value)
      if (Array.isArray(key)) {
        const transformStyle = getTransformObj()
        key.forEach((transformKey) => {
          transformStyle[transformKey] = shareValMap[transformKey].value
        })
        styles.transform = Object.entries(transformStyle).map(([key, value]) => {
          return { [key]: value }
        }) as Extract<'transform', TransformsStyle>
      } else {
        styles[key] = shareValMap[key].value
      }
      return styles
    }, {} as ExtendedViewStyle)
  })

  return {
    enableStyleAnimation,
    animationStyle
  }
}
