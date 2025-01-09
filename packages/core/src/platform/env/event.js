import { isBrowser } from '@mpxjs/utils'

function extendEvent (e, extendObj = {}) {
  Object.keys(extendObj).forEach((key) => {
    Object.defineProperty(e, key, {
      value: extendObj[key],
      enumerable: true,
      configurable: true,
      writable: true
    })
  })
}

function createMpxEvent (layer) {
  let startTimer = null
  let needTap = true
  let touchStartX = 0
  let touchStartY = 0
  let targetElement = null
  const isTouchDevice = document && 'ontouchstart' in document.documentElement

  const onTouchStart = (event) => {
    if (event.targetTouches?.length > 1) {
      return true
    }
    const touches = event.targetTouches
    targetElement = event.target
    needTap = true
    startTimer = null
    touchStartX = touches[0].pageX
    touchStartY = touches[0].pageY
    startTimer = setTimeout(() => {
      needTap = false
      sendEvent(targetElement, 'longpress', event)
      sendEvent(targetElement, 'longtap', event)
    }, 350)
  }

  const onTouchMove = (event) => {
    const touch = event.changedTouches[0]
    if (
      Math.abs(touch.pageX - touchStartX) > 1 ||
      Math.abs(touch.pageY - touchStartY) > 1
    ) {
      needTap = false
      startTimer && clearTimeout(startTimer)
      startTimer = null
    }
  }

  const onTouchEnd = (event) => {
    if (event.targetTouches?.length > 1) {
      return true
    }
    startTimer && clearTimeout(startTimer)
    startTimer = null
    if (needTap) {
      sendEvent(targetElement, 'tap', event)
    }
  }

  const onClick = (event) => {
    targetElement = event.target
    sendEvent(targetElement, 'tap', event)
  }

  const sendEvent = (targetElement, type, event) => {
    const touchEvent = new CustomEvent(type, {
      bubbles: true,
      cancelable: true
    })
    const changedTouches = event.changedTouches || []
    extendEvent(touchEvent, {
      timeStamp: event.timeStamp,
      changedTouches,
      touches: changedTouches,
      detail: {
        x: changedTouches[0]?.pageX || event.pageX || 0,
        y: changedTouches[0]?.pageY || event.pageY || 0
      }
    })
    targetElement && targetElement.dispatchEvent(touchEvent)
  }

  if (isTouchDevice) {
    layer.addEventListener('touchstart', onTouchStart, true)
    layer.addEventListener('touchmove', onTouchMove, true)
    layer.addEventListener('touchend', onTouchEnd, true)
  } else {
    layer.addEventListener('click', onClick, true)
  }
}

export function initEvent () {
  if (isBrowser && !global.__mpxCreatedEvent) {
    global.__mpxCreatedEvent = true
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      createMpxEvent(document.body)
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        createMpxEvent(document.body)
      }, false)
    }
  }
}
