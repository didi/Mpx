import { useEffect, useLayoutEffect, useSyncExternalStore, useRef, useMemo, useState, useCallback, createElement, memo, forwardRef, useImperativeHandle, useContext, Fragment, cloneElement } from 'react'
import * as ReactNative from 'react-native'
import { ReactiveEffect } from '../../observer/effect'
import { watch } from '../../observer/watch'
import { reactive, set, del } from '../../observer/reactive'
import { hasOwn, isFunction, noop, isObject, isArray, getByPath, collectDataset, hump2dash, dash2hump, callWithErrorHandling, wrapMethodsWithErrorHandling } from '@mpxjs/utils'
import MpxProxy from '../../core/proxy'
import { BEFOREUPDATE, ONLOAD, UPDATED, ONSHOW, ONHIDE, ONRESIZE, REACTHOOKSEXEC } from '../../core/innerLifecycle'
import mergeOptions from '../../core/mergeOptions'
import { queueJob, hasPendingJob } from '../../observer/scheduler'
import { createSelectorQuery, createIntersectionObserver } from '@mpxjs/api-proxy'
import { IntersectionObserverContext, RouteContext, KeyboardAvoidContext } from '@mpxjs/webpack-plugin/lib/runtime/components/react/dist/context'

function getSystemInfo () {
  const window = ReactNative.Dimensions.get('window')
  const screen = ReactNative.Dimensions.get('screen')
  return {
    deviceOrientation: window.width > window.height ? 'landscape' : 'portrait',
    size: {
      screenWidth: screen.width,
      screenHeight: screen.height,
      windowWidth: window.width,
      windowHeight: window.height
    }
  }
}

function createEffect (proxy, components) {
  const update = proxy.update = () => {
    // react update props in child render(async), do not need exec pre render
    // if (proxy.propsUpdatedFlag) {
    //   proxy.updatePreRender()
    // }
    if (proxy.isMounted()) {
      proxy.callHook(BEFOREUPDATE)
      proxy.pendingUpdatedFlag = true
    }
    proxy.stateVersion = Symbol()
    proxy.onStoreChange && proxy.onStoreChange()
  }
  update.id = proxy.uid
  const getComponent = (tagName) => {
    if (!tagName) return null
    if (tagName === 'block') return Fragment
    return components[tagName] || getByPath(ReactNative, tagName)
  }
  const innerCreateElement = (type, ...rest) => {
    if (!type) return null
    return createElement(type, ...rest)
  }

  proxy.effect = new ReactiveEffect(() => {
    // reset instance
    proxy.target.__resetInstance()
    return callWithErrorHandling(proxy.target.__injectedRender.bind(proxy.target), proxy, 'render function', [innerCreateElement, getComponent])
  }, () => queueJob(update), proxy.scope)
  // render effect允许自触发
  proxy.toggleRecurse(true)
}

function getRootProps (props, validProps) {
  const rootProps = {}
  for (const key in props) {
    const altKey = dash2hump(key)
    if (!hasOwn(validProps, key) && !hasOwn(validProps, altKey) && key !== 'children') {
      rootProps[key] = props[key]
    }
  }
  return rootProps
}

const instanceProto = {
  setData (data, callback) {
    return this.__mpxProxy.forceUpdate(data, { sync: true }, callback)
  },
  triggerEvent (eventName, eventDetail) {
    const props = this.__props
    const handler = props && (props['bind' + eventName] || props['catch' + eventName] || props['capture-bind' + eventName] || props['capture-catch' + eventName])
    if (handler && typeof handler === 'function') {
      const timeStamp = +new Date()
      const dataset = collectDataset(props)
      const id = props.id || ''
      const eventObj = {
        type: eventName,
        timeStamp,
        target: {
          id,
          dataset,
          targetDataset: dataset
        },
        currentTarget: {
          id,
          dataset
        },
        detail: eventDetail
      }
      handler.call(this, eventObj)
    }
  },
  getPageId () {
    return this.__pageId
  },
  selectComponent (selector) {
    return this.__selectRef(selector, 'component')
  },
  selectAllComponents (selector) {
    return this.__selectRef(selector, 'component', true)
  },
  createSelectorQuery () {
    return createSelectorQuery().in(this)
  },
  createIntersectionObserver (opt) {
    return createIntersectionObserver(this, opt, this.__intersectionCtx)
  },
  __resetInstance () {
    this.__refs = {}
    this.__dispatchedSlotSet = new WeakSet()
  },
  __iter (val, fn) {
    let i, l, keys, key
    const result = []
    if (isArray(val) || typeof val === 'string') {
      for (i = 0, l = val.length; i < l; i++) {
        result.push(fn.call(this, val[i], i))
      }
    } else if (typeof val === 'number') {
      for (i = 0; i < val; i++) {
        result.push(fn.call(this, i + 1, i))
      }
    } else if (isObject(val)) {
      keys = Object.keys(val)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        result.push(fn.call(this, val[key], key, i))
      }
    }
    return result
  },
  __getProps () {
    const props = this.__props
    const validProps = this.__validProps
    const propsData = {}
    Object.keys(validProps).forEach((key) => {
      if (hasOwn(props, key)) {
        propsData[key] = props[key]
      } else {
        const altKey = hump2dash(key)
        if (hasOwn(props, altKey)) {
          propsData[key] = props[altKey]
        } else {
          let field = validProps[key]
          if (isFunction(field) || field === null) {
            field = {
              type: field
            }
          }
          // 处理props默认值
          propsData[key] = field.value
        }
      }
    })
    return propsData
  },
  __getSlot (name, slot) {
    const { children } = this.__props
    if (children) {
      let result = []
      if (isArray(children) && !hasOwn(children, '__slot')) {
        children.forEach(child => {
          if (hasOwn(child, '__slot')) {
            if (child.__slot === name) result.push(...child)
          } else if (child?.props?.slot === name) {
            result.push(child)
          }
        })
      } else {
        if (hasOwn(children, '__slot')) {
          if (children.__slot === name) result.push(...children)
        } else if (children?.props?.slot === name) {
          result.push(children)
        }
      }
      result = result.filter(item => {
        if (!isObject(item) || this.__dispatchedSlotSet.has(item)) return false
        this.__dispatchedSlotSet.add(item)
        return true
      })
      if (!result.length) return null
      result.__slot = slot
      return result
    }
    return null
  }
}

function createInstance ({ propsRef, type, rawOptions, currentInject, validProps, components, pageId, intersectionCtx }) {
  const instance = Object.create(instanceProto, {
    dataset: {
      get () {
        const props = propsRef.current
        return collectDataset(props)
      },
      enumerable: true
    },
    id: {
      get () {
        const props = propsRef.current
        return props.id
      },
      enumerable: true
    },
    __props: {
      get () {
        return propsRef.current
      },
      enumerable: false
    },
    __pageId: {
      get () {
        return pageId
      },
      enumerable: false
    },
    __intersectionCtx: {
      get () {
        return intersectionCtx
      },
      enumerable: false
    },
    __validProps: {
      get () {
        return validProps
      },
      enumerable: false
    },
    __injectedRender: {
      get () {
        return currentInject.render || noop
      },
      enumerable: false
    },
    __getRefsData: {
      get () {
        return currentInject.getRefsData || noop
      },
      enumerable: false
    }
  })

  // bind this & assign methods
  if (rawOptions.methods) {
    Object.entries(rawOptions.methods).forEach(([key, method]) => {
      instance[key] = method.bind(instance)
    })
  }

  if (type === 'page') {
    const props = propsRef.current
    instance.route = props.route.name
    global.__mpxPagesMap = global.__mpxPagesMap || {}
    global.__mpxPagesMap[props.route.key] = [instance, props.navigation]
  }

  const proxy = instance.__mpxProxy = new MpxProxy(rawOptions, instance)
  proxy.created()

  Object.assign(proxy, {
    onStoreChange: null,
    stateVersion: Symbol(),
    subscribe: (onStoreChange) => {
      if (!proxy.effect) {
        createEffect(proxy, components)
        proxy.stateVersion = Symbol()
      }
      proxy.onStoreChange = onStoreChange
      return () => {
        proxy.effect && proxy.effect.stop()
        proxy.effect = null
        proxy.onStoreChange = null
      }
    },
    getSnapshot: () => {
      return proxy.stateVersion
    }
  })
  // react数据响应组件更新管理器
  if (!proxy.effect) {
    createEffect(proxy, components)
  }

  return instance
}

function hasPageHook (mpxProxy, hookNames) {
  const options = mpxProxy.options
  const type = options.__type__
  return hookNames.some(h => {
    if (mpxProxy.hasHook(h)) {
      return true
    }
    if (type === 'page') {
      return isFunction(options.methods && options.methods[h])
    } else if (type === 'component') {
      return options.pageLifetimes && isFunction(options.pageLifetimes[h])
    }
    return false
  })
}

const triggerPageStatusHook = (mpxProxy, event) => {
  mpxProxy.callHook(event === 'show' ? ONSHOW : ONHIDE)
  const pageLifetimes = mpxProxy.options.pageLifetimes
  if (pageLifetimes) {
    const instance = mpxProxy.target
    isFunction(pageLifetimes[event]) && pageLifetimes[event].call(instance)
  }
}

const triggerResizeEvent = (mpxProxy) => {
  const type = mpxProxy.options.__type__
  const systemInfo = getSystemInfo()
  const target = mpxProxy.target
  mpxProxy.callHook(ONRESIZE, [systemInfo])
  if (type === 'page') {
    target.onResize && target.onResize(systemInfo)
  } else {
    const pageLifetimes = mpxProxy.options.pageLifetimes
    pageLifetimes && isFunction(pageLifetimes.resize) && pageLifetimes.resize.call(target, systemInfo)
  }
}

function usePageEffect (mpxProxy, pageId) {
  useEffect(() => {
    let unWatch
    const hasShowHook = hasPageHook(mpxProxy, [ONSHOW, 'show'])
    const hasHideHook = hasPageHook(mpxProxy, [ONHIDE, 'hide'])
    const hasResizeHook = hasPageHook(mpxProxy, [ONRESIZE, 'resize'])
    if (hasShowHook || hasHideHook || hasResizeHook) {
      if (hasOwn(pageStatusMap, pageId)) {
        unWatch = watch(() => pageStatusMap[pageId], (newVal) => {
          if (newVal === 'show' || newVal === 'hide') {
            triggerPageStatusHook(mpxProxy, newVal)
          } else if (/^resize/.test(newVal)) {
            triggerResizeEvent(mpxProxy)
          }
        })
      }
    }
    return () => {
      unWatch && unWatch()
    }
  }, [])
}

let pageId = 0
const pageStatusMap = global.__mpxPageStatusMap = reactive({})

function usePageStatus (navigation, pageId) {
  navigation.pageId = pageId
  set(pageStatusMap, pageId, '')
  useEffect(() => {
    const focusSubscription = navigation.addListener('focus', () => {
      pageStatusMap[pageId] = 'show'
    })
    const blurSubscription = navigation.addListener('blur', () => {
      pageStatusMap[pageId] = 'hide'
    })

    return () => {
      focusSubscription()
      blurSubscription()
      del(pageStatusMap, pageId)
    }
  }, [navigation])
}

export function getDefaultOptions ({ type, rawOptions = {}, currentInject }) {
  rawOptions = mergeOptions(rawOptions, type, false)
  const components = Object.assign({}, rawOptions.components, currentInject.getComponents())
  const validProps = Object.assign({}, rawOptions.props, rawOptions.properties)
  if (rawOptions.methods) rawOptions.methods = wrapMethodsWithErrorHandling(rawOptions.methods)
  const defaultOptions = memo(forwardRef((props, ref) => {
    const instanceRef = useRef(null)
    const propsRef = useRef(null)
    const intersectionCtx = useContext(IntersectionObserverContext)
    const pageId = useContext(RouteContext)
    propsRef.current = props
    let isFirst = false
    if (!instanceRef.current) {
      isFirst = true
      instanceRef.current = createInstance({ propsRef, type, rawOptions, currentInject, validProps, components, pageId, intersectionCtx })
    }
    const instance = instanceRef.current
    useImperativeHandle(ref, () => {
      return instance
    })

    const proxy = instance.__mpxProxy

    let hooksResult = proxy.callHook(REACTHOOKSEXEC, [props])
    if (isObject(hooksResult)) {
      hooksResult = wrapMethodsWithErrorHandling(hooksResult, proxy)
      if (isFirst) {
        const onConflict = proxy.createProxyConflictHandler('react hooks result')
        Object.keys(hooksResult).forEach((key) => {
          if (key in proxy.target) {
            onConflict(key)
          }
          proxy.target[key] = hooksResult[key]
        })
      } else {
        Object.assign(proxy.target, hooksResult)
      }
    }

    if (!isFirst) {
      // 处理props更新
      Object.keys(validProps).forEach((key) => {
        if (hasOwn(props, key)) {
          instance[key] = props[key]
        } else {
          const altKey = hump2dash(key)
          if (hasOwn(props, altKey)) {
            instance[key] = props[altKey]
          }
        }
      })
    }

    useEffect(() => {
      if (proxy.pendingUpdatedFlag) {
        proxy.pendingUpdatedFlag = false
        proxy.callHook(UPDATED)
      }
    })

    usePageEffect(proxy, pageId)

    useEffect(() => {
      if (type === 'page') {
        if (!global.__mpxAppHotLaunched && global.__mpxAppOnLaunch) {
          global.__mpxAppOnLaunch(props.navigation)
        }
        const loadParams = {}
        // 此处拿到的props.route.params内属性的value被进行过了一次decode, 不符合预期，此处额外进行一次encode来与微信对齐
        if (isObject(props.route.params)) {
          for (const key in props.route.params) {
            loadParams[key] = encodeURIComponent(props.route.params[key])
          }
        }
        proxy.callHook(ONLOAD, [loadParams])
      }
      proxy.mounted()
      return () => {
        proxy.unmounted()
        proxy.target.__resetInstance()
        if (type === 'page') {
          delete global.__mpxPagesMap[props.route.key]
        }
      }
    }, [])

    useSyncExternalStore(proxy.subscribe, proxy.getSnapshot)

    if ((rawOptions.options?.disableMemo)) {
      proxy.memoVersion = Symbol()
    }

    const finalMemoVersion = useMemo(() => {
      if (!hasPendingJob(proxy.update)) {
        proxy.finalMemoVersion = Symbol()
      }
      return proxy.finalMemoVersion
    }, [proxy.stateVersion, proxy.memoVersion])

    const root = useMemo(() => proxy.effect.run(), [finalMemoVersion])
    if (root && root.props.ishost) {
      // 对于组件未注册的属性继承到host节点上，如事件、样式和其他属性等
      const rootProps = getRootProps(props, validProps)
      rootProps.style = Object.assign({}, root.props.style, rootProps.style)
      // update root props
      return cloneElement(root, rootProps)
    }
    return root
  }))

  if (rawOptions.options?.isCustomText) {
    defaultOptions.isCustomText = true
  }

  if (type === 'page') {
    const { Provider, useSafeAreaInsets, GestureHandlerRootView } = global.__navigationHelper
    const pageConfig = Object.assign({}, global.__mpxPageConfig, currentInject.pageConfig)
    const Page = ({ navigation, route }) => {
      const [enabled, setEnabled] = useState(false)
      const currentPageId = useMemo(() => ++pageId, [])
      const intersectionObservers = useRef({})
      usePageStatus(navigation, currentPageId)

      useLayoutEffect(() => {
        const isCustom = pageConfig.navigationStyle === 'custom'
        navigation.setOptions({
          headerShown: !isCustom,
          title: pageConfig.navigationBarTitleText || '',
          headerStyle: {
            backgroundColor: pageConfig.navigationBarBackgroundColor || '#000000'
          },
          headerTintColor: pageConfig.navigationBarTextStyle || 'white'
        })
        if (__mpx_mode__ === 'android') {
          ReactNative.StatusBar.setBarStyle(pageConfig.barStyle || 'dark-content')
          ReactNative.StatusBar.setTranslucent(isCustom) // 控制statusbar是否占位
          const color = isCustom ? 'transparent' : pageConfig.statusBarColor
          color && ReactNative.StatusBar.setBackgroundColor(color)
        }
      }, [])

      const rootRef = useRef(null)
      const onLayout = useCallback(() => {
        rootRef.current?.measureInWindow((x, y, width, height) => {
          navigation.layout = { x, y, width, height }
        })
      }, [])

      const withKeyboardAvoidingView = (element) => {
        if (__mpx_mode__ === 'ios') {
          return createElement(KeyboardAvoidContext.Provider,
            {
              value: setEnabled
            },
            createElement(ReactNative.KeyboardAvoidingView,
              {
                style: {
                  flex: 1
                },
                contentContainerStyle: {
                  flex: 1
                },
                behavior: 'position',
                enabled
              },
              element
            )
          )
        }
        return element
      }

      navigation.insets = useSafeAreaInsets()

      return createElement(GestureHandlerRootView,
        {
          style: {
            flex: 1
          }
        },
        withKeyboardAvoidingView(
          createElement(ReactNative.View,
            {
              style: {
                flex: 1,
                backgroundColor: pageConfig.backgroundColor || '#ffffff'
              },
              ref: rootRef,
              onLayout
            },
            createElement(RouteContext.Provider,
              {
                value: currentPageId
              },
              createElement(IntersectionObserverContext.Provider,
                {
                  value: intersectionObservers.current
                },
                createElement(Provider,
                  null,
                  createElement(defaultOptions,
                    {
                      navigation,
                      route,
                      id: currentPageId
                    }
                  )
                )
              )
            )
          )
        )
      )
      // todo custom portal host for active route
    }
    return Page
  }
  return defaultOptions
}
