import { setByPath, error, dash2hump, collectDataset } from '@mpxjs/utils'
import Mpx from '../../index'
import contextMap from '../../dynamic/vnode/context'

function logCallbackNotFound (context, callbackName) {
  const location = context.__mpxProxy && context.__mpxProxy.options.mpxFileResource
  error(
    `Instance property [${callbackName}] is not function, please check.`,
    location
  )
}

function handleEvent (context, $event, isCapture) {
  if (typeof Mpx.config.proxyEventHandler === 'function') {
    try {
      Mpx.config.proxyEventHandler($event)
    } catch (e) {}
  }
  const location = context.__mpxProxy.options.mpxFileResource
  const type = $event.type
  // thanos 平台特殊事件标识
  const emitMode = $event.detail && $event.detail.mpxEmit
  if (!type) {
    error('Event object must have [type] property!', location)
    return
  }
  let fallbackType = ''
  if (type === 'begin' || type === 'end') {
    // 地图的 regionchange 事件会派发 e.type 为 begin 和 end 的事件
    fallbackType = __mpx_mode__ === 'ali' ? 'regionChange' : 'regionchange'
  } else if (/-([a-z])/.test(type)) {
    fallbackType = dash2hump(type)
  } else if (__mpx_mode__ === 'ali') {
    fallbackType = type.replace(/^./, (i) => i.toLowerCase())
  }
  const target = $event.currentTarget || $event.target
  if (!target) {
    error(
      `[${type}] event object must have [currentTarget/target] property!`,
      location
    )
    return
  }
  const mode = isCapture ? 'capture' : 'bubble'
  const eventConfigs = target.dataset.eventconfigs?.[mode] || {}
  const curEventConfig = eventConfigs[type] || eventConfigs[fallbackType] || []
  // 如果有 mpxuid 说明是运行时组件，那么需要设置对应的上下文
  const rootRuntimeContext = contextMap.get(target.dataset.mpxuid)
  const runtimeContext = rootRuntimeContext || context
  let returnedValue
  curEventConfig.forEach((item) => {
    const callbackName = item[0]
    if (emitMode) {
      // thanos 平台特殊事件标识处理
      $event = $event.detail.data
    }
    if (callbackName) {
      const params =
        item.length > 1
          ? item.slice(1).map((item) => {
              if (item === '__mpx_event__') {
                return $event
              } else {
                return item
              }
            })
          : [$event]
      if (typeof runtimeContext[callbackName] === 'function') {
        returnedValue = runtimeContext[callbackName].apply(
          runtimeContext,
          params
        )
      } else {
        logCallbackNotFound(runtimeContext, callbackName)
      }
    }
  })
  return returnedValue
}

export default function proxyEventMixin () {
  const methods = {
    __invoke ($event) {
       return handleEvent(this, $event, false)
    },
    __captureInvoke ($event) {
       return handleEvent(this, $event, true)
    },
    __model (expr, $event, valuePath = ['value'], filterMethod) {
      const innerFilter = {
        trim: val => typeof val === 'string' && val.trim()
      }
      const originValue = valuePath.reduce((acc, cur) => acc[cur], $event.detail)
      const value = filterMethod ? (innerFilter[filterMethod] ? innerFilter[filterMethod](originValue) : typeof this[filterMethod] === 'function' ? this[filterMethod](originValue) : originValue) : originValue
      setByPath(this, expr, value)
    }
  }
  if (__mpx_mode__ === 'ali') {
    Object.assign(methods, {
      triggerEvent (eventName, eventDetail) {
        const handlerName = eventName.replace(/^./, matched => matched.toUpperCase()).replace(/-([a-z])/g, (match, p1) => p1.toUpperCase())
        const handler = this.props && (this.props['on' + handlerName] || this.props['catch' + handlerName])
        if (handler && typeof handler === 'function') {
          const dataset = collectDataset(this.props)
          const id = this.props.id || ''
          const timeStamp = +new Date()
          const eventObj = {
            type: eventName,
            timeStamp,
            target: { id, dataset, targetDataset: dataset },
            currentTarget: { id, dataset },
            detail: eventDetail
          }
          handler.call(this, eventObj)
        }
      }
    })
  }
  return {
    methods
  }
}
