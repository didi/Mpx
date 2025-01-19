import { callWithErrorHandling, isFunction, isObject, isReact, warn } from '@mpxjs/utils'
import { currentInstance } from '../../core/proxy'

/** 全局 scope */
let appProvides = Object.create(null)

/** @internal createApp() 初始化应用层 scope provide */
export function initAppProvides (provideOpt, instance) {
  if (provideOpt) {
    const provided = isFunction(provideOpt)
      ? callWithErrorHandling(provideOpt.bind(instance), instance, 'createApp provide function')
      : provideOpt
    if (isObject(provided)) {
      appProvides = provided
    } else {
      warn('App provides must be an object or a function that returns an object.')
    }
  }
}

function resolveProvidesRN (vm) {
  const provides = vm.provides
  if (!provides) {
    const parentProvides = vm.parentProvides || null
    return (vm.provides = Object.create(parentProvides))
  }
  return provides
}

function resolveProvides (vm) {
  const provides = vm.provides
  const parentProvides = vm.parent && vm.parent.provides
  if (parentProvides === provides) {
    return (vm.provides = Object.create(parentProvides))
  }
  return provides
}

export function provide (key, value) {
  const instance = currentInstance
  if (!instance) {
    warn('provide() can only be used inside setup().')
    return
  }
  const provides = isReact
    ? resolveProvidesRN(instance)
    : resolveProvides(instance)
  provides[key] = value
}

export function inject (key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance
  if (!instance) {
    warn('inject() can only be used inside setup()')
    return
  }
  const provides = isReact
    ? instance.parentProvides
    : instance.parent && instance.parent.provides
  if (provides && key in provides) {
    return provides[key]
  } else if (key in appProvides) {
    return appProvides[key]
  } else if (arguments.length > 1) {
    return treatDefaultAsFactory && isFunction(defaultValue)
      ? defaultValue.call(instance && instance.target)
      : defaultValue
  } else {
    warn(`injection "${String(key)}" not found.`)
  }
}
