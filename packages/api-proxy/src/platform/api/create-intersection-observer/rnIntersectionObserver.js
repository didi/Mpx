import { isArray, isObject, isString, noop } from '@mpxjs/utils'
import throttle from 'lodash/throttle'
import { Dimensions } from 'react-native'
import { getFocusedNavigation } from '../../../common/js'
const WindowRefStr = 'window'
const IgnoreTarget = 'ignore'
const DefaultMargin = { top: 0, bottom: 0, left: 0, right: 0 }
let idCount = 0

class RNIntersectionObserver {
  constructor (component, options, intersectionCtx) {
    this.id = idCount++
    this.component = component
    this.options = Object.assign({
      thresholds: [0],
      initialRatio: 0,
      observeAll: false
    }, options || {})
    this.thresholds = this.options.thresholds.sort((a, b) => a - b) || [0]
    this.initialRatio = this.options.initialRatio
    this.observeAll = this.options.observeAll

    // 组件上挂载对应的observers，用于在组件销毁的时候进行批量disconnect
    this.component._intersectionObservers = this.component.__intersectionObservers || []
    this.component._intersectionObservers.push(this)

    this.observerRefs = null
    this.relativeRef = null
    this.margins = DefaultMargin
    this.callback = noop

    this.throttleMeasure = this.getThrottleMeasure(this.options.throttleTime || 100)

    // 记录上一次相交的比例
    this.previousIntersectionRatio = []

     // 添加实例添加到上下文中，滚动组件可以获取到上下文内的实例从而触发滚动
    if (intersectionCtx && isObject(intersectionCtx)) {
      this.intersectionCtx = intersectionCtx
      this.intersectionCtx[this.id] = this
    }
    return this
  }

    // 支持传递ref 或者 selector
  relativeTo (selector, margins = {}) {
    let relativeRef
    if (isString(selector)) {
      relativeRef = this.component.__selectRef(selector, 'node')
    }
    if (isObject(selector)) {
      relativeRef = selector.nodeRefs?.[0]
    }
    if (relativeRef) {
      this.relativeRef = relativeRef
      this.margins = Object.assign({}, DefaultMargin, margins)
    } else {
      console.warn(`node ${selector}is not found. The relative node for intersection observer will be ignored`)
    }
    return this
  }

  relativeToViewport (margins = {}) {
    this.relativeRef = WindowRefStr
    this.margins = Object.assign({}, DefaultMargin, margins)
    return this
  }

  observe (selector, callback) {
    if (this.observerRefs) {
      console.warn('"observe" call can be only called once in IntersectionObserver')
      return
    }
    let targetRef = null
    if (this.observeAll) {
      targetRef = this.component.__selectRef(selector, 'node', true)
    } else {
      targetRef = this.component.__selectRef(selector, 'node')
    }
    if (!targetRef || targetRef.length === 0) {
      console.warn('intersection observer target not found')
      return
    }
    this.observerRefs = isArray(targetRef) ? targetRef : [targetRef]
    this.callback = callback
    this._measureTarget(true)
  }

  _getWindowRect () {
    if (this.windowRect) return this.windowRect
    const navigation = getFocusedNavigation() || {}
    const screen = Dimensions.get('screen')
    const navigationLayout = navigation.layout  || {
      x: 0,
      y: 0,
      width: screen.width,
      height: screen.height
    }

    const windowRect = {
      top: navigationLayout.y - this.margins.top,
      left: 0 - this.margins.left,
      right: navigationLayout.width + this.margins.right,
      bottom: navigationLayout.y + navigationLayout.height + this.margins.bottom
    }

    this.windowRect = windowRect
    return this.windowRect
  }

  _getReferenceRect (targetRef) {
    const targetRefs = isArray(targetRef) ? targetRef : [targetRef]
    const targetPromiseQueue = []
    targetRefs.forEach((targetRefItem) => {
      if (targetRefItem === WindowRefStr) {
        targetPromiseQueue.push(this._getWindowRect())
        return
      }
      // 当节点前面存在后面移除的时候可能会存在拿不到target的情况，此处直接忽略留一个占位不用做计算即可
      // 测试节点移除之后 targetRefItem.getNodeInstance().nodeRef都存在，只是current不存在了
      if (!targetRefItem || !targetRefItem.getNodeInstance().nodeRef.current) {
        targetPromiseQueue.push(Promise.resolve(IgnoreTarget))
        return
      }
      const target = targetRefItem.getNodeInstance().nodeRef.current
      targetPromiseQueue.push(new Promise((resolve) => {
        target.measureInWindow(
          (x, y, width, height) => {
            const boundingClientRect = {
              left: x,
              top: y,
              right: x + width,
              bottom: y + height,
              width: width,
              height: height
            }
            resolve(boundingClientRect)
          }
        )
      }))
    })

    if (isArray(targetRef)) {
      return Promise.all(targetPromiseQueue)
    } else {
      return targetPromiseQueue[0]
    }
  }

  _restrictValueInRange (start = 0, end = 0, value = 0) {
    return Math.min(Math.max(start, value), end)
  }

  _isInsectedFn (intersectionRatio, previousIntersectionRatio, thresholds) {
  // console.log('nowintersectionRatio, previousIntersectionRatio', [intersectionRatio, previousIntersectionRatio])
    let nowIndex = -1
    let previousIndex = -1
    thresholds.forEach((item, index) => {
      if (intersectionRatio >= item) {
        nowIndex = index
      }
      if (previousIntersectionRatio >= item) {
        previousIndex = index
      }
    })
    return !(nowIndex === previousIndex)
  }

  // 计算相交区域
  _measureIntersection ({ observeRect, relativeRect, observeIndex, isInit }) {
    const visibleRect = {
      left: this._restrictValueInRange(relativeRect.left, relativeRect.right, observeRect.left),
      top: this._restrictValueInRange(relativeRect.top, relativeRect.bottom, observeRect.top),
      right: this._restrictValueInRange(relativeRect.left, relativeRect.right, observeRect.right),
      bottom: this._restrictValueInRange(relativeRect.top, relativeRect.bottom, observeRect.bottom)
    }

    const targetArea = (observeRect.bottom - observeRect.top) * (observeRect.right - observeRect.left)
    const visibleArea = (visibleRect.bottom - visibleRect.top) * (visibleRect.right - visibleRect.left)
    const intersectionRatio = targetArea ? visibleArea / targetArea : 0

    const isInsected = isInit ? intersectionRatio > this.initialRatio : this._isInsectedFn(intersectionRatio, this.previousIntersectionRatio[observeIndex], this.thresholds)
    this.previousIntersectionRatio[observeIndex] = intersectionRatio

    return {
      intersectionRatio,
      intersectionRect: {
        top: visibleRect.top,
        bottom: relativeRect.bottom,
        left: visibleRect.left,
        right: relativeRect.right
      },
      isInsected
    }
  }

  getThrottleMeasure (throttleTime) {
    return throttle(() => {
      this._measureTarget()
    }, throttleTime)
  }

  // 计算节点的rect信息
  _measureTarget (isInit = false) {
    Promise.all([
      this._getReferenceRect(this.observerRefs),
      this._getReferenceRect(this.relativeRef)
    ]).then(([observeRects, relativeRect]) => {
      if (relativeRect === IgnoreTarget) return
      observeRects.forEach((observeRect, index) => {
        if (observeRect === IgnoreTarget) return
        const { intersectionRatio, intersectionRect, isInsected } = this._measureIntersection({
          observeRect,
          observeIndex: index,
          relativeRect,
          isInit
        })
        // 初次调用的
        if (isInsected) {
          this.callback({
            // index: index,
            id: this.observerRefs[index].getNodeInstance().props?.current?.id,
            dataset: this.observerRefs[index].getNodeInstance().props?.current?.dataset || {},
            intersectionRatio: Math.round(intersectionRatio * 100) / 100,
            intersectionRect,
            boundingClientRect: observeRect,
            relativeRect: relativeRect,
            time: Date.now()
          })
        }
      })
    }).catch((e) => {
      console.log('_measureTarget fail', e)
    })
  }

  disconnect () {
    if (this.intersectionCtx) delete this.intersectionCtx[this.id]
  }
}

export default RNIntersectionObserver
