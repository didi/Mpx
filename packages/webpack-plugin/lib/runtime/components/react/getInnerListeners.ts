import { useRef, useMemo, RefObject } from 'react'
import { hasOwn, collectDataset } from '@mpxjs/utils'
import { omit, extendObject } from './utils'
import eventConfigMap from './event.config'
import {
  Props,
  AdditionalProps,
  RemoveProps,
  UseInnerPropsConfig,
  InnerRef,
  SetTimeoutReturnType,
  LayoutRef,
  NativeTouchEvent
} from './types/getInnerListeners'

const getTouchEvent = (
  type: string,
  event: NativeTouchEvent,
  props: Props,
  config: UseInnerPropsConfig
) => {
  const nativeEvent = event.nativeEvent
  const { timestamp, pageX, pageY, touches, changedTouches } = nativeEvent
  const { id } = props
  const { layoutRef } = config

  const currentTarget = extendObject({}, event.currentTarget, {
    id: id || '',
    dataset: collectDataset(props),
    offsetLeft: layoutRef?.current?.offsetLeft || 0,
    offsetTop: layoutRef?.current?.offsetTop || 0
  })

  const pendingProps = (event as any)._targetInst?.pendingProps || {}

  const target = extendObject(
    {},
    event.target,
    {
      id: pendingProps.parentId || pendingProps.nativeID || '',
      dataset: collectDataset(pendingProps)
    }
  )

  return extendObject({}, event, {
    type,
    timeStamp: timestamp,
    currentTarget,
    target,
    detail: {
      x: pageX,
      y: pageY
    },
    touches: touches.map((item) => {
      return {
        identifier: item.identifier,
        pageX: item.pageX,
        pageY: item.pageY,
        clientX: item.locationX,
        clientY: item.locationY
      }
    }),
    changedTouches: changedTouches.map((item) => {
      return {
        identifier: item.identifier,
        pageX: item.pageX,
        pageY: item.pageY,
        clientX: item.locationX,
        clientY: item.locationY
      }
    }),
    persist: event.persist,
    stopPropagation: event.stopPropagation,
    preventDefault: event.preventDefault
  })
}

export const getCustomEvent = (
  type = '',
  oe: any = {},
  {
    detail = {},
    layoutRef
  }: { detail?: Record<string, unknown>; layoutRef?: LayoutRef },
  props: Props = {}
) => {
  const targetInfo = extendObject({}, oe.target, {
    id: props.id || '',
    dataset: collectDataset(props),
    offsetLeft: layoutRef?.current?.offsetLeft || 0,
    offsetTop: layoutRef?.current?.offsetTop || 0
  })
  return extendObject({}, oe, {
    type,
    detail,
    target: targetInfo,
    persist: oe.persist,
    stopPropagation: oe.stopPropagation,
    preventDefault: oe.preventDefault
  })
}

function handleEmitEvent (
  events: string[],
  type: string,
  oe: NativeTouchEvent,
  propsRef: Record<string, any>,
  config: UseInnerPropsConfig
) {
  events.forEach((event) => {
    if (propsRef.current[event]) {
      const match = /^(catch|capture-catch):?(.*?)(?:\.(.*))?$/.exec(event)
      if (match) {
        oe.stopPropagation()
      }
      propsRef.current[event](
        getTouchEvent(type, oe, propsRef.current, config)
      )
    }
  })
}

function checkIsNeedPress (e: NativeTouchEvent, type: 'bubble' | 'capture', ref: RefObject<InnerRef>) {
  const tapDetailInfo = ref.current!.mpxPressInfo.detail || { x: 0, y: 0 }
  const nativeEvent = e.nativeEvent
  const currentPageX = nativeEvent.changedTouches[0].pageX
  const currentPageY = nativeEvent.changedTouches[0].pageY
  if (
    Math.abs(currentPageX - tapDetailInfo.x) > 3 ||
        Math.abs(currentPageY - tapDetailInfo.y) > 3
  ) {
    ref.current!.needPress[type] = false
    ref.current!.startTimer[type] &&
          clearTimeout(ref.current!.startTimer[type] as SetTimeoutReturnType)
    ref.current!.startTimer[type] = null
  }
}

function handleTouchstart (e: NativeTouchEvent, type: 'bubble' | 'capture', ref: RefObject<InnerRef>, propsRef: Record<string, any>, config: UseInnerPropsConfig) {
  e.persist()
  const bubbleTouchEvent = ['catchtouchstart', 'bindtouchstart']
  const bubblePressEvent = ['catchlongpress', 'bindlongpress']
  const captureTouchEvent = [
    'capture-catchtouchstart',
    'capture-bindtouchstart'
  ]
  const capturePressEvent = [
    'capture-catchlongpress',
    'capture-bindlongpress'
  ]
  ref.current!.startTimer[type] = null
  ref.current!.needPress[type] = true
  const nativeEvent = e.nativeEvent
  ref.current!.mpxPressInfo.detail = {
    x: nativeEvent.changedTouches[0].pageX,
    y: nativeEvent.changedTouches[0].pageY
  }
  const currentTouchEvent =
        type === 'bubble' ? bubbleTouchEvent : captureTouchEvent
  const currentPressEvent =
        type === 'bubble' ? bubblePressEvent : capturePressEvent
  handleEmitEvent(currentTouchEvent, 'touchstart', e, propsRef, config)
  const {
    catchlongpress,
    bindlongpress,
    'capture-catchlongpress': captureCatchlongpress,
    'capture-bindlongpress': captureBindlongpress
  } = propsRef.current
  if (
    catchlongpress ||
        bindlongpress ||
        captureCatchlongpress ||
        captureBindlongpress
  ) {
    ref.current!.startTimer[type] = setTimeout(() => {
      ref.current!.needPress[type] = false
      handleEmitEvent(currentPressEvent, 'longpress', e, propsRef, config)
    }, 350)
  }
}

function handleTouchmove (e: NativeTouchEvent, type: 'bubble' | 'capture', ref: RefObject<InnerRef>, propsRef: Record<string, any>, config: UseInnerPropsConfig) {
  const bubbleTouchEvent = ['catchtouchmove', 'bindtouchmove']
  const captureTouchEvent = [
    'capture-catchtouchmove',
    'capture-bindtouchmove'
  ]
  const currentTouchEvent =
        type === 'bubble' ? bubbleTouchEvent : captureTouchEvent
  handleEmitEvent(currentTouchEvent, 'touchmove', e, propsRef, config)
  checkIsNeedPress(e, type, ref)
}

function handleTouchend (e: NativeTouchEvent, type: 'bubble' | 'capture', ref: RefObject<InnerRef>, propsRef: Record<string, any>, config: UseInnerPropsConfig) {
  // move event may not be triggered
  checkIsNeedPress(e, type, ref)
  const bubbleTouchEvent = ['catchtouchend', 'bindtouchend']
  const bubbleTapEvent = ['catchtap', 'bindtap']
  const captureTouchEvent = [
    'capture-catchtouchend',
    'capture-bindtouchend'
  ]
  const captureTapEvent = ['capture-catchtap', 'capture-bindtap']
  const currentTouchEvent =
        type === 'bubble' ? bubbleTouchEvent : captureTouchEvent
  const currentTapEvent =
        type === 'bubble' ? bubbleTapEvent : captureTapEvent
  ref.current!.startTimer[type] &&
        clearTimeout(ref.current!.startTimer[type] as SetTimeoutReturnType)
  ref.current!.startTimer[type] = null
  handleEmitEvent(currentTouchEvent, 'touchend', e, propsRef, config)
  if (ref.current!.needPress[type]) {
    if (type === 'bubble' && config.disableTap) {
      return
    }
    handleEmitEvent(currentTapEvent, 'tap', e, propsRef, config)
  }
}

function handleTouchcancel (
  e: NativeTouchEvent,
  type: 'bubble' | 'capture',
  ref: RefObject<InnerRef>, propsRef: Record<string, any>, config: UseInnerPropsConfig
) {
  const bubbleTouchEvent = ['catchtouchcancel', 'bindtouchcancel']
  const captureTouchEvent = [
    'capture-catchtouchcancel',
    'capture-bindtouchcancel'
  ]
  const currentTouchEvent =
        type === 'bubble' ? bubbleTouchEvent : captureTouchEvent
  ref.current!.startTimer[type] &&
        clearTimeout(ref.current!.startTimer[type] as SetTimeoutReturnType)
  ref.current!.startTimer[type] = null
  handleEmitEvent(currentTouchEvent, 'touchcancel', e, propsRef, config)
}

function createTouchEventHandler (eventName: 'onTouchStart'|'onTouchMove'|'onTouchEnd'|'onTouchCancel', type: 'bubble' | 'capture') {
  return (e: NativeTouchEvent, ref: RefObject<InnerRef>, propsRef: Record<string, any>, config: UseInnerPropsConfig) => {
    const handlerMap = {
      onTouchStart: handleTouchstart,
      onTouchMove: handleTouchmove,
      onTouchEnd: handleTouchend,
      onTouchCancel: handleTouchcancel
    }

    const handler = handlerMap[eventName]
    if (handler) {
      handler(e, type, ref, propsRef, config)
    }
  }
}

const touchEventList = [
  { eventName: 'onTouchStart', handler: createTouchEventHandler('onTouchStart', 'bubble') },
  { eventName: 'onTouchMove', handler: createTouchEventHandler('onTouchMove', 'bubble') },
  { eventName: 'onTouchEnd', handler: createTouchEventHandler('onTouchEnd', 'bubble') },
  { eventName: 'onTouchCancel', handler: createTouchEventHandler('onTouchCancel', 'bubble') },
  { eventName: 'onTouchStartCapture', handler: createTouchEventHandler('onTouchStart', 'capture') },
  { eventName: 'onTouchMoveCapture', handler: createTouchEventHandler('onTouchMove', 'capture') },
  { eventName: 'onTouchEndCapture', handler: createTouchEventHandler('onTouchEnd', 'capture') },
  { eventName: 'onTouchCancelCapture', handler: createTouchEventHandler('onTouchCancel', 'capture') }
]

const useInnerProps = (
  props: Props = {},
  additionalProps: AdditionalProps = {},
  userRemoveProps: RemoveProps = [],
  rawConfig?: UseInnerPropsConfig
) => {
  const ref = useRef<InnerRef>({
    startTimer: {
      bubble: null,
      capture: null
    },
    needPress: {
      bubble: false,
      capture: false
    },
    mpxPressInfo: {
      detail: {
        x: 0,
        y: 0
      }
    }
  })

  const propsRef = useRef<Record<string, any>>({})
  const eventConfig: { [key: string]: string[] } = {}
  const config = rawConfig || {
    layoutRef: { current: {} },
    disableTap: false
  }
  const removeProps = [
    'children',
    'enable-background',
    'enable-offset',
    'enable-var',
    'external-var-context',
    'parent-font-size',
    'parent-width',
    'parent-height',
    ...userRemoveProps
  ]

  propsRef.current = extendObject({}, props, additionalProps)

  let hashEventKey = ''
  const rawEventKeys: Array<string> = []

  for (const key in eventConfigMap) {
    if (hasOwn(propsRef.current, key)) {
      eventConfig[key] = eventConfigMap[key].events
      hashEventKey = hashEventKey + eventConfigMap[key].bitFlag
      rawEventKeys.push(key)
    }
  }

  const events = useMemo(() => {
    if (!rawEventKeys.length) {
      return {}
    }
    const transformedEventKeys = rawEventKeys.reduce((acc: string[], key) => {
      if (propsRef.current[key]) {
        return acc.concat(eventConfig[key])
      }
      return acc
    }, [])
    const finalEventKeys = [...new Set(transformedEventKeys)]
    const events: Record<string, (e: NativeTouchEvent) => void> = {}

    touchEventList.forEach((item) => {
      if (finalEventKeys.includes(item.eventName)) {
        events[item.eventName] = (e: NativeTouchEvent) =>
          item.handler(e, ref, propsRef, config)
      }
    })

    return events
  }, [hashEventKey])

  return extendObject(
    {},
    events,
    omit(propsRef.current, [...rawEventKeys, ...removeProps])
  )
}
export default useInnerProps
