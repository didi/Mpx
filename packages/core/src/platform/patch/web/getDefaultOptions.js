import builtInKeysMap from '../builtInKeysMap'
import mergeOptions from '../../../core/mergeOptions'
import { diffAndCloneA, hasOwn } from '@mpxjs/utils'
import { getCurrentInstance as getCurrentVueInstance } from '../../export/index'
import MpxProxy, { setCurrentInstance, unsetCurrentInstance } from '../../../core/proxy'
import {
  BEFORECREATE,
  BEFOREUPDATE,
  UPDATED,
  BEFOREUNMOUNT,
  UNMOUNTED,
  SERVERPREFETCH
} from '../../../core/innerLifecycle'

function filterOptions (options) {
  const newOptions = {}
  Object.keys(options).forEach(key => {
    if (builtInKeysMap[key]) {
      return
    }
    if (key === 'data' || key === 'dataFn') {
      if (!hasOwn(newOptions, 'data')) {
        newOptions.data = function mergeFn () {
          return Object.assign(
            diffAndCloneA(options.data || {}).clone,
            options.dataFn && options.dataFn.call(this)
          )
        }
      }
    } else {
      newOptions[key] = options[key]
    }
  })
  return newOptions
}

function initProxy (context, rawOptions) {
  if (!context.__mpxProxy) {
    context.__mpxProxy = new MpxProxy(rawOptions, context)
    context.__mpxProxy.callHook(BEFORECREATE)
  } else if (context.__mpxProxy.isUnmounted()) {
    context.__mpxProxy = new MpxProxy(rawOptions, context, true)
    context.__mpxProxy.callHook(BEFORECREATE)
  }
}

export function getDefaultOptions ({ type, rawOptions = {} }) {
  const rawSetup = rawOptions.setup
  if (rawSetup) {
    rawOptions.setup = (props) => {
      const instance = getCurrentVueInstance().proxy
      initProxy(instance, rawOptions)
      setCurrentInstance(instance.__mpxProxy)
      const newContext = {
        triggerEvent: instance.triggerEvent.bind(instance),
        refs: instance.$refs,
        forceUpdate: instance.$forceUpdate.bind(instance),
        selectComponent: instance.selectComponent.bind(instance),
        selectAllComponents: instance.selectAllComponents.bind(instance),
        createSelectorQuery: instance.createSelectorQuery.bind(instance),
        createIntersectionObserver: instance.createIntersectionObserver.bind(instance)
      }
      const setupRes = rawSetup(props, newContext)
      unsetCurrentInstance(instance.__mpxProxy)
      return setupRes
    }
  }
  const rootMixins = [{
    data: {
      _data_v_id: '' // template 透传scoped样式用
    },
    beforeCreate () {
      const _scopeId = this.$vnode.componentOptions.Ctor?.options?._scopeId
      this._data_v_id = _scopeId
      initProxy(this, rawOptions)
    },
    created () {
      if (this.__mpxProxy) this.__mpxProxy.created()
    },
    mounted () {
      if (this.__mpxProxy) this.__mpxProxy.mounted()
    },
    beforeUpdate () {
      if (this.__mpxProxy) this.__mpxProxy.callHook(BEFOREUPDATE)
    },
    updated () {
      if (this.__mpxProxy) this.__mpxProxy.callHook(UPDATED)
    },
    beforeDestroy () {
      if (this.__mpxProxy) this.__mpxProxy.callHook(BEFOREUNMOUNT)
    },
    destroyed () {
      if (this.__mpxProxy) {
        this.__mpxProxy.state = UNMOUNTED
        this.__mpxProxy.callHook(UNMOUNTED)
      }
    },
    serverPrefetch () {
      if (this.__mpxProxy) return this.__mpxProxy.callHook(SERVERPREFETCH)
    }
  }]
  // 为了在builtMixin中可以使用某些rootMixin实现的特性（如数据响应等），此处builtInMixin在rootMixin之后执行，但是当builtInMixin使用存在对应内建生命周期的目标平台声明周期写法时，可能会出现用户生命周期比builtInMixin中的生命周期先执行的情况，为了避免这种情况发生，builtInMixin应该尽可能使用内建生命周期来编写
  rawOptions.mixins = rawOptions.mixins ? rootMixins.concat(rawOptions.mixins) : rootMixins
  rawOptions = mergeOptions(rawOptions, type, false)
  return filterOptions(rawOptions)
}
