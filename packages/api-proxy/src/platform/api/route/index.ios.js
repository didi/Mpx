import { successHandle, failHandle } from '../../../common/js'
import { parseUrlQuery as parseUrl } from '@mpxjs/utils'
import { nextTick } from '../next-tick'

function getBasePath (navigation) {
  if (navigation) {
    const state = navigation.getState()
    return '/' + state.routes[state.index].name
  }
  return '/'
}

function resolvePath (relative, base) {
  const firstChar = relative.charAt(0)
  if (firstChar === '/') {
    return relative
  }
  const stack = base.split('/')
  stack.pop()
  // resolve relative path
  const segments = relative.replace(/^\//, '').split('/')
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (segment === '..') {
      stack.pop()
    } else if (segment !== '.') {
      stack.push(segment)
    }
  }
  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('')
  }
  return stack.join('/')
}

let toPending = false
function navigateTo (options = {}) {
  if (toPending) {
    return
  }
  toPending = true
  const navigation = Object.values(global.__mpxPagesMap || {})[0]?.[1]
  const navigationHelper = global.__navigationHelper
  if (navigation && navigationHelper) {
    const { path, queryObj } = parseUrl(options.url)
    const basePath = getBasePath(navigation)
    const finalPath = resolvePath(path, basePath).slice(1)
    navigation.push(finalPath, queryObj)
    navigationHelper.lastSuccessCallback = () => {
      const res = { errMsg: 'navigateTo:ok' }
      successHandle(res, options.success, options.complete)
    }
    navigationHelper.lastFailCallback = (msg) => {
      const res = { errMsg: `navigateTo:fail ${msg}` }
      failHandle(res, options.fail, options.complete)
    }
    navigationHelper.transitionEndCallback = () => {
      toPending = false
    }
  }
}
let redirectPending = false
function redirectTo (options = {}) {
  if (redirectPending) {
    return
  }
  redirectPending = true
  const navigation = Object.values(global.__mpxPagesMap || {})[0]?.[1]
  const navigationHelper = global.__navigationHelper
  if (navigation && navigationHelper) {
    const { path, queryObj } = parseUrl(options.url)
    const basePath = getBasePath(navigation)
    const finalPath = resolvePath(path, basePath).slice(1)
    navigation.replace(finalPath, queryObj)
    navigationHelper.lastSuccessCallback = () => {
      const res = { errMsg: 'redirectTo:ok' }
      successHandle(res, options.success, options.complete)
    }
    navigationHelper.lastFailCallback = (msg) => {
      const res = { errMsg: `redirectTo:fail ${msg}` }
      failHandle(res, options.fail, options.complete)
    }
    navigationHelper.transitionEndCallback = () => {
      redirectPending = false
    }
  }
}
let backPending = false
function navigateBack (options = {}) {
  if (backPending) {
    return
  }
  backPending = true
  const navigation = Object.values(global.__mpxPagesMap || {})[0]?.[1]
  const navigationHelper = global.__navigationHelper
  if (navigation && navigationHelper) {
    const delta = options.delta || 1
    const routeLength = navigation.getState().routes.length
    if (delta >= routeLength && global.__mpx?.config.rnConfig.onAppBack?.(delta - routeLength + 1)) {
      nextTick(() => {
        backPending = false
        const res = { errMsg: 'navigateBack:ok' }
        successHandle(res, options.success, options.complete)
      })
    } else {
      navigation.pop(delta)
      navigationHelper.lastSuccessCallback = () => {
        const res = { errMsg: 'navigateBack:ok' }
        successHandle(res, options.success, options.complete)
      }
      navigationHelper.lastFailCallback = (msg) => {
        const res = { errMsg: `navigateBack:fail ${msg}` }
        failHandle(res, options.fail, options.complete)
      }
    }
    navigationHelper.transitionEndCallback = () => {
      backPending = false
    }
  }
}
let reLaunchPending = false
function reLaunch (options = {}) {
  if (reLaunchPending) {
    return
  }
  reLaunchPending = true
  const navigation = Object.values(global.__mpxPagesMap || {})[0]?.[1]
  const navigationHelper = global.__navigationHelper
  if (navigation && navigationHelper) {
    const { path, queryObj } = parseUrl(options.url)
    const basePath = getBasePath(navigation)
    const finalPath = resolvePath(path, basePath).slice(1)
    navigation.reset({
      index: 0,
      routes: [
        {
          name: finalPath,
          params: queryObj
        }
      ]
    })
    navigationHelper.lastSuccessCallback = () => {
      const res = { errMsg: 'redirectTo:ok' }
      successHandle(res, options.success, options.complete)
    }
    navigationHelper.lastFailCallback = (msg) => {
      const res = { errMsg: `redirectTo:fail ${msg}` }
      failHandle(res, options.fail, options.complete)
    }
    navigationHelper.transitionEndCallback = () => {
      reLaunchPending = false
    }
  }
}

function switchTab () {

}

export {
  redirectTo,
  navigateTo,
  navigateBack,
  reLaunch,
  switchTab
}
