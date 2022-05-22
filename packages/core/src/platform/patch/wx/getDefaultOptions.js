import { hasOwn } from '../../../helper/utils'
import MpxProxy from '../../../core/proxy'
import builtInKeysMap from '../builtInKeysMap'
import mergeOptions from '../../../core/mergeOptions'
import { queuePostFlushCb } from '../../../observer/scheduler'

function transformProperties (properties) {
  if (!properties) {
    return {}
  }
  const newProps = {}
  Object.keys(properties).forEach(key => {
    let rawFiled = properties[key]
    let newFiled = null
    if (rawFiled === null) {
      rawFiled = {
        type: null
      }
    }
    if (typeof rawFiled === 'function') {
      newFiled = {
        type: rawFiled
      }
    } else {
      newFiled = Object.assign({}, rawFiled)
    }
    newFiled.observer = function (value) {
      if (this.__mpxProxy) {
        this[key] = value
        queuePostFlushCb(() => {
          // 只有当当前没有渲染任务时，属性更新才需要单独触发updated，否则可以由渲染任务结束后触发updated
          if (this.__mpxProxy.currentRenderTask && this.__mpxProxy.currentRenderTask.state === 'finished') {
            this.__mpxProxy.updated()
          }
        })
      }
    }
    newProps[key] = newFiled
  })
  return newProps
}

function transformApiForProxy (context, currentInject) {
  const rawSetData = context.setData.bind(context)
  Object.defineProperties(context, {
    setData: {
      get () {
        return function (data, callback) {
          return context.__mpxProxy.forceUpdate(data, { sync: true }, callback)
        }
      },
      configurable: true
    },
    __getProps: {
      get () {
        return (options) => {
          const props = {}
          const validProps = Object.assign({}, options.properties, options.props)
          Object.keys(context.data).forEach((key) => {
            if (hasOwn(validProps, key)) {
              props[key] = context.data[key]
            }
          })
          return props
        }
      },
      configurable: false
    },
    __getInitialData: {
      get () {
        return (options) => {
          const data = {}
          const validData = Object.assign({}, options.data, options.properties, options.props)
          for (const key in context.data) {
            if (hasOwn(validData, key)) {
              data[key] = context.data[key]
            }
          }
          return data
        }
      },
      configurable: false
    },
    __render: {
      get () {
        return rawSetData
      },
      configurable: false
    }
  })
  // 绑定注入的render
  if (currentInject) {
    if (currentInject.render) {
      Object.defineProperties(context, {
        __injectedRender: {
          get () {
            return currentInject.render.bind(context)
          },
          configurable: false
        }
      })
    }
    if (currentInject.getRefsData) {
      Object.defineProperties(context, {
        __getRefsData: {
          get () {
            return currentInject.getRefsData
          },
          configurable: false
        }
      })
    }
  }
}

export function filterOptions (options) {
  const newOptions = {}
  Object.keys(options).forEach(key => {
    if (builtInKeysMap[key]) {
      return
    }
    if (key === 'properties' || key === 'props') {
      newOptions.properties = transformProperties(Object.assign({}, options.properties, options.props))
    } else if (key === 'methods' && options.__pageCtor__) {
      // 构造器为Page时抽取所有methods方法到顶层
      Object.assign(newOptions, options[key])
    } else {
      newOptions[key] = options[key]
    }
  })
  return newOptions
}

export function initProxy (context, rawOptions, currentInject) {
  if (!context.__mpxProxy) {
    // 提供代理对象需要的api
    transformApiForProxy(context, currentInject)
    // 创建proxy对象
    context.__mpxProxy = new MpxProxy(rawOptions, context)
    context.__mpxProxy.created()
  } else if (context.__mpxProxy.isDestroyed()) {
    context.__mpxProxy.reCreated()
  }
}

export function getDefaultOptions (type, { rawOptions = {}, currentInject }) {
  let hookNames = ['attached', 'ready', 'detached']
  // 当用户传入page作为构造器构造页面时，修改所有关键hooks
  if (rawOptions.__pageCtor__) {
    hookNames = ['onLoad', 'onReady', 'onUnload']
  }
  const rootMixins = [{
    [hookNames[0]] () {
      initProxy(this, rawOptions, currentInject)
    },
    [hookNames[1]] () {
      if (this.__mpxProxy) this.__mpxProxy.mounted()
    },
    [hookNames[2]] () {
      if (this.__mpxProxy) this.__mpxProxy.destroyed()
    }
  }]
  rawOptions.mixins = rawOptions.mixins ? rootMixins.concat(rawOptions.mixins) : rootMixins
  rawOptions = mergeOptions(rawOptions, type, false)
  return filterOptions(rawOptions)
}
