import { isObject, type } from '@mpxjs/utils'
import { mutableHandlers } from './baseHandlers'

export const reactiveMap = new WeakMap()

export function reactive (target) {
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

export const ReactiveFlags = {
  SKIP: '__mpx_skip',
  IS_REACTIVE: '__mpx_isReactive',
  IS_READONLY: '__mpx_isReadonly',
  IS_SHALLOW: '__mpx_isShallow',
  RAW: '__mpx_raw'
}

const TargetType = {
  INVALID: 0,
  COMMON: 1
}

function getTargetType (value) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
    ? TargetType.INVALID
    : targetTypeMap(type(value))
}

function targetTypeMap (rawType) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    default:
      return TargetType.INVALID
  }
}

function createReactiveObject (target, baseHandlers, proxyMap) {
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // when target is already a Proxy, return it
  if (
    target[ReactiveFlags.RAW]
  ) {
    return target
  }
  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // only specific value types can be observed.
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}

export function isReactive (value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

export function isReadonly (value) {
  return !!(value && value[ReactiveFlags.IS_READONLY])
}

export function toRaw(observed) {
  const raw = observed && observed[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}