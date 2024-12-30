import transferOptions from '../core/transferOptions'
import builtInKeysMap from './patch/builtInKeysMap'
import { makeMap, spreadProp, getFocusedNavigation, hasOwn, extend } from '@mpxjs/utils'
import { mergeLifecycle } from '../convertor/mergeLifecycle'
import { LIFECYCLE } from '../platform/patch/lifecycle/index'
import Mpx from '../index'
import { createElement, memo, useRef, useEffect } from 'react'
import * as ReactNative from 'react-native'
import { Image } from 'react-native'
import { ref } from '../observer/ref'

const appHooksMap = makeMap(mergeLifecycle(LIFECYCLE).app)

function getOrientation (window = ReactNative.Dimensions.get('window')) {
  return window.width > window.height ? 'landscape' : 'portrait'
}

function filterOptions (options, appData) {
  const newOptions = {}
  Object.keys(options).forEach(key => {
    if (builtInKeysMap[key]) {
      return
    }
    if (!appHooksMap[key]) {
      appData[key] = options[key]
    } else {
      newOptions[key] = options[key]
    }
  })
  return newOptions
}

function createAppInstance (appData) {
  return extend({}, Mpx.prototype, appData)
}

export default function createApp (option, config = {}) {
  const appData = {}

  const { NavigationContainer, createStackNavigator, SafeAreaProvider } = global.__navigationHelper
  // app选项目前不需要进行转换
  const { rawOptions, currentInject } = transferOptions(option, 'app', false)
  const defaultOptions = filterOptions(spreadProp(rawOptions, 'methods'), appData)
  defaultOptions.onAppInit && defaultOptions.onAppInit()
  // 在页面script执行前填充getApp()
  global.getApp = function () {
    return appData
  }
  const pages = currentInject.getPages() || {}
  const firstPage = currentInject.firstPage
  const Stack = createStackNavigator()
  const getPageScreens = (initialRouteName, initialParams) => {
    return Object.entries(pages).map(([key, item]) => {
      if (key === initialRouteName) {
        return createElement(Stack.Screen, {
          name: key,
          component: item,
          initialParams
        })
      }
      return createElement(Stack.Screen, {
        name: key,
        component: item
      })
    })
  }
  global.__mpxOptionsMap = global.__mpxOptionsMap || {}
  const onStateChange = (state) => {
    Mpx.config.rnConfig.onStateChange?.(state)
    if (global.__navigationHelper.lastSuccessCallback) {
      global.__navigationHelper.lastSuccessCallback()
      global.__navigationHelper.lastSuccessCallback = null
    }
  }
  const onUnhandledAction = (action) => {
    const payload = action.payload
    const message = `The action '${action.type}'${payload ? ` with payload ${JSON.stringify(action.payload)}` : ''} was not handled by any navigator.`
    if (global.__navigationHelper.lastFailCallback) {
      global.__navigationHelper.lastFailCallback(message)
      global.__navigationHelper.lastFailCallback = null
    }
  }

  global.__mpxAppLaunched = false

  global.__mpxAppFocusedState = ref('show')
  global.__mpxOptionsMap[currentInject.moduleId] = memo((props) => {
    const instanceRef = useRef(null)
    if (!instanceRef.current) {
      instanceRef.current = createAppInstance(appData)
    }
    const instance = instanceRef.current
    const initialRouteRef = useRef({
      initialRouteName: firstPage,
      initialParams: {}
    })

    if (!global.__mpxAppLaunched) {
      const { initialRouteName, initialParams } = Mpx.config.rnConfig.parseAppProps?.(props) || {}
      initialRouteRef.current.initialRouteName = initialRouteName || initialRouteRef.current.initialRouteName
      initialRouteRef.current.initialParams = initialParams || initialRouteRef.current.initialParams

      global.__mpxAppOnLaunch = (navigation) => {
        global.__mpxAppLaunched = true
        const state = navigation.getState()
        Mpx.config.rnConfig.onStateChange?.(state)
        const current = state.routes[state.index]
        global.__mpxEnterOptions = {
          path: current.name,
          query: current.params,
          scene: 0,
          shareTicket: '',
          referrerInfo: {}
        }
        defaultOptions.onLaunch && defaultOptions.onLaunch.call(instance, global.__mpxEnterOptions)
        defaultOptions.onShow && defaultOptions.onShow.call(instance, global.__mpxEnterOptions)
      }
    }

    useEffect(() => {
      if (defaultOptions.onShow) {
        global.__mpxAppCbs.show.push(defaultOptions.onShow.bind(instance))
      }
      if (defaultOptions.onHide) {
        global.__mpxAppCbs.hide.push(defaultOptions.onHide.bind(instance))
      }
      if (defaultOptions.onError) {
        global.__mpxAppCbs.error.push(defaultOptions.onError.bind(instance))
      }
      if (defaultOptions.onUnhandledRejection) {
        global.__mpxAppCbs.rejection.push(defaultOptions.onUnhandledRejection.bind(instance))
      }

      const changeSubscription = ReactNative.AppState.addEventListener('change', (currentState) => {
        if (currentState === 'active') {
          let options = global.__mpxEnterOptions
          const navigation = getFocusedNavigation()
          if (navigation) {
            const state = navigation.getState()
            const current = state.routes[state.index]
            options = {
              path: current.name,
              query: current.params,
              scene: 0,
              shareTicket: '',
              referrerInfo: {}
            }
          }
          global.__mpxAppCbs.show.forEach((cb) => {
            cb(options || {})
          })
          if (navigation && hasOwn(global.__mpxPageStatusMap, navigation.pageId)) {
            global.__mpxPageStatusMap[navigation.pageId] = 'show'
          }
        } else if (currentState === 'inactive' || currentState === 'background') {
          global.__mpxAppCbs.hide.forEach((cb) => {
            cb()
          })
          const navigation = getFocusedNavigation()
          if (navigation && hasOwn(global.__mpxPageStatusMap, navigation.pageId)) {
            global.__mpxPageStatusMap[navigation.pageId] = 'hide'
          }
        }
      })

      let count = 0
      let lastOrientation = getOrientation()
      const resizeSubScription = ReactNative.Dimensions.addEventListener('change', ({ window }) => {
        const orientation = getOrientation(window)
        if (orientation === lastOrientation) return
        lastOrientation = orientation
        const navigation = getFocusedNavigation()
        if (navigation && hasOwn(global.__mpxPageStatusMap, navigation.pageId)) {
          global.__mpxPageStatusMap[navigation.pageId] = `resize${count++}`
        }
      })
      return () => {
        changeSubscription && changeSubscription.remove()
        resizeSubScription && resizeSubScription.remove()
      }
    }, [])

    const { initialRouteName, initialParams } = initialRouteRef.current
    const headerBackImageProps = Mpx.config.rnConfig.headerBackImageProps || null
    const navScreenOpts = {
      // 7.x替换headerBackTitleVisible
      // headerBackButtonDisplayMode: 'minimal',
      headerBackTitleVisible: false,
      // 安卓上会出现初始化时闪现导航条的问题
      headerShown: false
    }
    if (headerBackImageProps) {
      navScreenOpts.headerBackImage = () => {
        return createElement(Image, headerBackImageProps)
      }
    }
    return createElement(SafeAreaProvider,
      null,
      createElement(NavigationContainer,
        {
          onStateChange,
          onUnhandledAction
        },
        createElement(Stack.Navigator,
          {
            initialRouteName,
            screenOptions: navScreenOpts
          },
          ...getPageScreens(initialRouteName, initialParams)
        )
      )
    )
  })

  global.getCurrentPages = function () {
    const navigation = getFocusedNavigation()
    if (navigation) {
      return navigation.getState().routes.map((route) => {
        return global.__mpxPagesMap[route.key] && global.__mpxPagesMap[route.key][0]
      }).filter(item => item)
    }
    return []
  }

  global.setCurrentPageStatus = function (status) {
    const navigation = getFocusedNavigation()
    if (navigation && hasOwn(global.__mpxPageStatusMap, navigation.pageId)) {
      global.__mpxPageStatusMap[navigation.pageId] = status
    }
  }
}
