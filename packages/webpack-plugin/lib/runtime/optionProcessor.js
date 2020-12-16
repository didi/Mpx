export default function processOption (
  option,
  ctorType,
  firstPage,
  mpxCid,
  pageConfig,
  pagesMap,
  componentsMap,
  tabBarMap,
  componentGenerics,
  genericsInfo,
  Vue,
  VueRouter,
  i18n
) {
  if (ctorType === 'app') {
    // 对于app中的组件需要全局注册
    for (const componentName in componentsMap) {
      if (componentsMap.hasOwnProperty(componentName)) {
        const component = componentsMap[componentName]
        Vue.component(componentName, component)
      }
    }

    // 注册v-ex-classes自定义指令处理externalClasses
    Vue.directive('ex-classes', (el, binding, vnode) => {
      const context = vnode.context
      if (context) {
        const externalClasses = context.$options.externalClasses || []
        const classList = el.classList
        binding.value.forEach((className) => {
          const actualExternalClassNames = context.$attrs[className]
          if (externalClasses.indexOf(className) !== -1 && actualExternalClassNames) {
            classList.remove(className)
            actualExternalClassNames.split(' ').forEach((actualExternalClassName) => {
              classList.add(actualExternalClassName)
            })
          }
        })
      }
    })

    const routes = []

    for (const pagePath in pagesMap) {
      if (pagesMap.hasOwnProperty(pagePath)) {
        const page = pagesMap[pagePath]
        routes.push({
          path: pagePath,
          component: page
        })
      }
    }

    if (routes.length) {
      if (firstPage) {
        routes.push({
          path: '/',
          redirect: firstPage
        })
      }
      window.__mpxRouter = option.router = new VueRouter({
        routes: routes
      })
      window.__mpxRouter.stack = []
      window.__mpxRouter.needCache = null
      window.__mpxRouter.needRemove = []
      // 处理reLaunch中传递的url并非首页时的replace逻辑
      window.__mpxRouter.beforeEach(function (to, from, next) {
        let action = window.__mpxRouter.__mpxAction
        const stack = window.__mpxRouter.stack

        // 处理人为操作
        if (!action) {
          if (stack.length > 1 && stack[stack.length - 2].path === to.path) {
            action = {
              type: 'back',
              delta: 1
            }
          } else {
            action = {
              type: 'to'
            }
          }
        }

        const pageInRoutes = routes.some(item => item.path === to.path)
        if (!pageInRoutes) {
          if (stack.length < 1) {
            // onPageNotFound，仅首次进入时生效
            window.__mpxRouter.app.$options.onPageNotFound({
              path: to.path,
              query: to.query,
              isEntryPage: true
            })
          } else {
            let methods = ''
            switch (action.type) {
              case 'to':
                methods = 'navigateTo'
                break
              case 'redirect':
                methods = 'redirectTo'
                break
              case 'back':
                methods = 'navigateBack'
                break
              case 'reLaunch':
                methods = 'reLaunch'
                break
              default:
                methods = 'navigateTo'
            }
            throw new Error(`${methods}:fail page "${to.path}" is not found`)
          }
        }

        const insertItem = {
          path: to.path
        }
        // 构建历史栈
        switch (action.type) {
          case 'to':
            stack.push(insertItem)
            window.__mpxRouter.needCache = insertItem
            break
          case 'back':
            window.__mpxRouter.needRemove = stack.splice(stack.length - action.delta, action.delta)
            break
          case 'redirect':
            window.__mpxRouter.needRemove = stack.splice(stack.length - 1, 1, insertItem)
            window.__mpxRouter.needCache = insertItem
            break
          case 'switch':
            if (!action.replaced) {
              action.replaced = true
              return next({
                path: action.path,
                replace: true
              })
            } else {
              // 将非tabBar页面remove
              let tabItem = null
              window.__mpxRouter.needRemove = stack.filter((item) => {
                if (tabBarMap[item.path]) {
                  tabItem = item
                  return false
                }
                return true
              })
              if (tabItem) {
                window.__mpxRouter.stack = [tabItem]
              } else {
                window.__mpxRouter.stack = [insertItem]
                window.__mpxRouter.needCache = insertItem
              }
            }
            break
          case 'reLaunch':
            if (!action.replaced) {
              action.replaced = true
              return next({
                path: action.path,
                query: {
                  reLaunchCount: action.reLaunchCount
                },
                replace: true
              })
            } else {
              window.__mpxRouter.needRemove = stack
              window.__mpxRouter.stack = [insertItem]
              window.__mpxRouter.needCache = insertItem
            }
        }
        next()
      })
      // 处理visibilitychange时触发当前活跃页面组件的onshow/onhide
      document.addEventListener('visibilitychange', function () {
        const vnode = window.__mpxRouter.__mpxActiveVnode
        if (vnode && vnode.componentInstance) {
          const currentPage = vnode.tag.endsWith('mpx-tab-bar-container') ? vnode.componentInstance.$refs.tabBarPage : vnode.componentInstance
          if (document.hidden) {
            if (global.__mpxAppCbs && global.__mpxAppCbs.hide) {
              global.__mpxAppCbs.hide.forEach((cb) => {
                cb()
              })
            }
            if (currentPage) {
              currentPage.mpxPageStatus = 'hide'
              currentPage.onHide && currentPage.onHide()
            }
          } else {
            if (global.__mpxAppCbs && global.__mpxAppCbs.show) {
              global.__mpxAppCbs.show.forEach((cb) => {
                // todo 实现app.onShow参数
                /* eslint-disable standard/no-callback-literal */
                cb({})
              })
            }
            if (currentPage) {
              currentPage.mpxPageStatus = 'show'
              currentPage.onShow && currentPage.onShow()
            }
          }
        }
      })
      // 初始化length
      window.__mpxRouter.__mpxHistoryLength = window.history.length
    }

    if (i18n) {
      option.i18n = i18n
    }
  } else {
    // 局部注册页面和组件中依赖的组件
    for (const componentName in componentsMap) {
      if (componentsMap.hasOwnProperty(componentName)) {
        const component = componentsMap[componentName]
        if (!option.components) {
          option.components = {}
        }
        option.components[componentName] = component
      }
    }

    if (genericsInfo) {
      const genericHash = genericsInfo.hash
      window.__mpxGenericsMap[genericHash] = {}
      Object.keys(genericsInfo.map).forEach((genericValue) => {
        if (componentsMap[genericValue]) {
          window.__mpxGenericsMap[genericHash][genericValue] = componentsMap[genericValue]
        } else {
          console.log(option)
          console.warn(`[Mpx runtime warn]: generic value "${genericValue}" must be
registered in parent context!`)
        }
      })
    }

    if (componentGenerics) {
      option.props = option.props || {}
      option.props.generichash = String
      Object.keys(componentGenerics).forEach((genericName) => {
        if (componentGenerics[genericName].default) {
          option.props[`generic${genericName}`] = {
            type: String,
            default: `${genericName}default`
          }
        } else {
          option.props[`generic${genericName}`] = String
        }
      })
    }

    if (ctorType === 'page') {
      option.__mpxPageConfig = Object.assign({}, window.__mpxPageConfig, pageConfig)
    }
  }

  if (mpxCid) {
    option.mpxCid = mpxCid
  }

  return option
}

export function getComponent (component, extendOptions) {
  component = component.__esModule ? component.default : component
  // eslint-disable-next-line
  if (extendOptions) Object.assign(component, extendOptions)
  return component
}
