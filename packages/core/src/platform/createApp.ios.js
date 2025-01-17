import transferOptions from '../core/transferOptions'
import builtInKeysMap from './patch/builtInKeysMap'
import { makeMap, spreadProp, getFocusedNavigation, hasOwn } from '@mpxjs/utils'
import { mergeLifecycle } from '../convertor/mergeLifecycle'
import { LIFECYCLE } from '../platform/patch/lifecycle/index'
import Mpx from '../index'
import { createElement, memo, useRef, useEffect } from 'react'
import * as ReactNative from 'react-native'

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

export default function createApp (options) {
  const appData = {}

  const { NavigationContainer, createStackNavigator, SafeAreaProvider } = global.__navigationHelper
  // app选项目前不需要进行转换
  const { rawOptions, currentInject } = transferOptions(options, 'app', false)
  const defaultOptions = filterOptions(spreadProp(rawOptions, 'methods'), appData)
  // 在页面script执行前填充getApp()
  global.getApp = function () {
    return appData
  }

  // 模拟小程序appInstance在热启动时不会重新创建的行为，在外部创建跟随js context的appInstance
  const appInstance = Object.assign({}, appData, Mpx.prototype)

  defaultOptions.onShow && global.__mpxAppCbs.show.push(defaultOptions.onShow.bind(appInstance))
  defaultOptions.onHide && global.__mpxAppCbs.hide.push(defaultOptions.onHide.bind(appInstance))
  defaultOptions.onError && global.__mpxAppCbs.error.push(defaultOptions.onError.bind(appInstance))
  defaultOptions.onUnhandledRejection && global.__mpxAppCbs.rejection.push(defaultOptions.onUnhandledRejection.bind(appInstance))
  defaultOptions.onAppInit && defaultOptions.onAppInit()

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
  global.__mpxOptionsMap[currentInject.moduleId] = memo((props) => {
    const firstRef = useRef(true)
    const initialRouteRef = useRef({
      initialRouteName: firstPage,
      initialParams: {}
    })
    if (firstRef.current) {
      // 热启动情况下，app会被销毁重建，将__mpxAppHotLaunched重置保障路由等初始化逻辑正确执行
      global.__mpxAppHotLaunched = false
      // 热启动情况下重置__mpxPagesMap避免页面销毁函数未及时执行时错误地引用到之前的navigation
      global.__mpxPagesMap = {}
      firstRef.current = false
    }
    if (!global.__mpxAppHotLaunched) {
      const { initialRouteName, initialParams } = Mpx.config.rnConfig.parseAppProps?.(props) || {}
      initialRouteRef.current.initialRouteName = initialRouteName || initialRouteRef.current.initialRouteName
      initialRouteRef.current.initialParams = initialParams || initialRouteRef.current.initialParams

      global.__mpxAppOnLaunch = (navigation) => {
        const state = navigation.getState()
        Mpx.config.rnConfig.onStateChange?.(state)
        const current = state.routes[state.index]
        const options = {
          path: current.name,
          query: current.params,
          scene: 0,
          shareTicket: '',
          referrerInfo: {},
          isLaunch: true
        }
        global.__mpxEnterOptions = options
        if (!global.__mpxAppLaunched) {
          global.__mpxLaunchOptions = options
          defaultOptions.onLaunch && defaultOptions.onLaunch.call(appInstance, options)
        }
        global.__mpxAppCbs.show.forEach((cb) => {
          cb(options)
        })
        global.__mpxAppLaunched = true
        global.__mpxAppHotLaunched = true
      }
    }

    useEffect(() => {
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
            cb(options)
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
    const headerBackImageSource = Mpx.config.rnConfig.headerBackImageSource || null
    const navScreenOpts = {
      // 7.x替换headerBackTitleVisible
      // headerBackButtonDisplayMode: 'minimal',
      headerBackTitleVisible: false,
      // 安卓上会出现初始化时闪现导航条的问题
      headerShown: false,
      // 隐藏导航下的那条线
      headerShadowVisible: false
    }
    if (headerBackImageSource) {
      navScreenOpts.headerBackImageSource = headerBackImageSource
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
