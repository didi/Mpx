import { forwardRef, JSX, useEffect } from 'react'
// @ts-ignore
import { noop } from '@mpxjs/utils'
import { Portal } from '@ant-design/react-native'
import { getCustomEvent } from './getInnerListeners'
import { promisify, redirectTo, navigateTo, navigateBack, reLaunch, switchTab } from '@mpxjs/api-proxy'
// @ts-ignore
import { WebView } from 'react-native-webview'
import useNodesRef, { HandlerRef } from './useNodesRef'

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
  src: string
  bindmessage?: (event: OnMessageCallbackEvent) => void
  bindload?: (event: CommonCallbackEvent) => void
  binderror?: (event: CommonCallbackEvent) => void
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

interface LoadRes {
  timeStamp: string,
  nativeEvent: NativeEvent
}

interface FormRef {
  postMessage: (value: any) => void;
}

const _WebView = forwardRef<HandlerRef<WebView, WebViewProps>, WebViewProps>((props, ref): JSX.Element => {
  const { src, bindmessage = noop, bindload = noop, binderror = noop } = props

  const defaultWebViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }

  const { nodeRef: webViewRef } = useNodesRef<WebView, WebViewProps>(props, ref, {
    defaultStyle: defaultWebViewStyle
  })

  const _messageList: any[] = []
  const handleUnload = () => {
    // 这里是 WebView 销毁前执行的逻辑
    bindmessage(getCustomEvent('messsage', {}, {
      detail: {
        data: _messageList
      },
      layoutRef: webViewRef
    }))
  }

  useEffect(() => {
    // 组件卸载时执行
    return () => {
      handleUnload()
    }
  }, [])
  const _load = function (res: LoadRes) {
    const result = {
      type: 'load',
      timeStamp: res.timeStamp,
      detail: {
        src: res.nativeEvent?.url
      }
    }
    bindload(result)
  }
  const _error = function (res: LoadRes) {
    const result = {
      type: 'error',
      timeStamp: res.timeStamp,
      detail: {
        src: ''
      }
    }
    binderror(result)
  }
  const _message = function (res: LoadRes) {
    let data: MessageData
    let asyncCallback
    const navObj = promisify({ redirectTo, navigateTo, navigateBack, reLaunch, switchTab })
    try {
      const nativeEventData = res.nativeEvent?.data
      data = JSON.parse(nativeEventData)
    } catch (e) {
      data = {}
    }
    const postData: PayloadData = data.payload || {}
    switch (data.type) {
      case 'postMessage':
        _messageList.push(postData.data)
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
  return (<Portal>
    <WebView
      style={defaultWebViewStyle}
      source={{ uri: src }}
      ref={webViewRef}
      onLoad={_load}
      onError={_error}
      onMessage={_message}
      javaScriptEnabled={true}
    ></WebView>
  </Portal>)
})

_WebView.displayName = 'mpx-web-view'

export default _WebView
