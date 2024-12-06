import { forwardRef, JSX, useEffect, useRef, useContext, useMemo } from 'react'
import { noop, warn } from '@mpxjs/utils'
import { Portal } from '@ant-design/react-native'
import { getCustomEvent } from './getInnerListeners'
import { promisify, redirectTo, navigateTo, navigateBack, reLaunch, switchTab } from '@mpxjs/api-proxy'
import { WebView } from 'react-native-webview'
import useNodesRef, { HandlerRef } from './useNodesRef'
import { getCurrentPage } from './utils'
import { WebViewNavigationEvent, WebViewErrorEvent, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'
import { RouteContext } from './context'

type OnMessageCallbackEvent = {
  detail: {
    data: any[]
  }
}

type CommonCallbackEvent = {
  detail: {
    src?: string
  }
}

interface WebViewProps {
  src?: string
  bindmessage?: (event: OnMessageCallbackEvent) => void
  bindload?: (event: CommonCallbackEvent) => void
  binderror?: (event: CommonCallbackEvent) => void
  [x: string]: any
}

interface PayloadData {
  data?: Record<string, any>
}

type MessageData = {
  payload?: PayloadData,
  type?: string,
  callbackId?: number
}

interface NativeEvent {
  url: string,
  data: string
}

interface FormRef {
  postMessage: (value: any) => void;
}

const _WebView = forwardRef<HandlerRef<WebView, WebViewProps>, WebViewProps>((props, ref): JSX.Element => {
  const { src = '', bindmessage = noop, bindload = noop, binderror = noop } = props
  if (props.style) {
    warn('The web-view component does not support the style prop.')
  }
  const pageId = useContext(RouteContext)
  const currentPage = useMemo(() => getCurrentPage(pageId), [pageId])

  const defaultWebViewStyle = {
    position: 'absolute' as 'absolute' | 'relative' | 'static',
    left: 0 as number,
    right: 0 as number,
    top: 0 as number,
    bottom: 0 as number
  }

  const webViewRef = useRef<WebView>(null)
  useNodesRef<WebView, WebViewProps>(props, ref, webViewRef, {
    defaultStyle: defaultWebViewStyle
  })

  const _messageList = useRef<any[]>([])
  const handleUnload = () => {
    // 这里是 WebView 销毁前执行的逻辑
    bindmessage(getCustomEvent('messsage', {}, {
      detail: {
        data: _messageList.current
      },
      layoutRef: webViewRef
    }))
  }

  useEffect(() => {
    if (currentPage) {
      currentPage.__webViewUrl = src
    }
  }, [src, currentPage])

  useEffect(() => {
    // 组件卸载时执行
    return () => {
      handleUnload()
    }
  }, [])
  const _load = function (res: WebViewNavigationEvent) {
    const result = {
      type: 'load',
      timeStamp: res.timeStamp,
      detail: {
        src: res.nativeEvent?.url
      }
    }
    bindload(result)
  }
  const _error = function (res: WebViewErrorEvent) {
    const result = {
      type: 'error',
      timeStamp: res.timeStamp,
      detail: {
        src: ''
      }
    }
    binderror(result)
  }
  const _changeUrl = function (navState: WebViewNavigation) {
    if (currentPage) {
      currentPage.__webViewUrl = navState.url
    }
  }
  const _message = function (res: WebViewMessageEvent) {
    let data: MessageData = {}
    let asyncCallback
    const navObj = promisify({ redirectTo, navigateTo, navigateBack, reLaunch, switchTab })
    try {
      const nativeEventData = res.nativeEvent?.data
      if (typeof nativeEventData === 'string') {
        data = JSON.parse(nativeEventData)
      }
    } catch (e) {
      data = {}
    }
    const postData: PayloadData = data.payload || {}
    switch (data.type) {
      case 'postMessage':
        _messageList.current.push(postData.data)
        asyncCallback = Promise.resolve({
          errMsg: 'invokeWebappApi:ok'
        })
        break
      case 'navigateTo':
        asyncCallback = navObj.navigateTo(postData)
        break
      case 'navigateBack':
        asyncCallback = navObj.navigateBack(postData)
        break
      case 'redirectTo':
        asyncCallback = navObj.redirectTo(postData)
        break
      case 'switchTab':
        asyncCallback = navObj.switchTab(postData)
        break
      case 'reLaunch':
        asyncCallback = navObj.reLaunch(postData)
        break
    }

    asyncCallback && asyncCallback.then((res: any) => {
      if (webViewRef.current?.postMessage) {
        const test = JSON.stringify({
          type: data.type,
          callbackId: data.callbackId,
          result: res
        })
        webViewRef.current.postMessage(test)
      }
    })
  }
  const events = {
    ...(bindload && { onLoad: _load }),
    ...(binderror && { onError: _error }),
    ...(bindmessage && { onMessage: _message })
  }
  return (<Portal>
    <WebView
      style={defaultWebViewStyle}
      source={{ uri: src }}
      ref={webViewRef}
      {...events}
      javaScriptEnabled={true}
    ></WebView>
  </Portal>)
})

_WebView.displayName = 'MpxWebview'

export default _WebView
