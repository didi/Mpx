import { forwardRef, useRef, useContext, useMemo, useState, createElement, useCallback, useEffect } from 'react'
import { warn, getFocusedNavigation, isFunction } from '@mpxjs/utils'
import Portal from './mpx-portal'
import { getCustomEvent } from './getInnerListeners'
import { promisify, redirectTo, navigateTo, navigateBack, reLaunch, switchTab } from '@mpxjs/api-proxy'
import { WebView } from 'react-native-webview'
import useNodesRef, { HandlerRef } from './useNodesRef'
import { getCurrentPage, extendObject } from './utils'
import { WebViewNavigationEvent, WebViewErrorEvent, WebViewMessageEvent, WebViewNavigation, WebViewProgressEvent, WebViewSource } from 'react-native-webview/lib/WebViewTypes'
import { RouteContext } from './context'
import { BackHandler, StyleSheet, View, Text, Platform } from 'react-native'

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
  [x: string]: any
}

type MessageData = {
  payload?: PayloadData,
  args?: Array<any>,
  type?: string,
  callbackId?: number
}

type LanguageCode = 'zh-CN' | 'en-US'; // 支持的语言代码

interface ErrorText {
  text: string;
  button: string;
}

type ErrorTextMap = Record<LanguageCode, ErrorText>

const styles = StyleSheet.create({
  loadErrorContext: {
    display: 'flex',
    alignItems: 'center'
  },
  loadErrorText: {
    fontSize: 12,
    color: '#666666',
    paddingTop: '40%',
    paddingBottom: 20,
    paddingLeft: '10%',
    paddingRight: '10%',
    textAlign: 'center'
  },
  loadErrorButton: {
    color: '#666666',
    textAlign: 'center',
    padding: 10,
    borderColor: '#666666',
    borderStyle: 'solid',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10
  }
})

const _WebView = forwardRef<HandlerRef<WebView, WebViewProps>, WebViewProps>((props, ref): JSX.Element | null => {
  const { src, bindmessage, bindload, binderror } = props
  const mpx = global.__mpx
  const errorText: ErrorTextMap = {
    'zh-CN': {
      text: '网络不可用，请检查网络设置',
      button: '重新加载'
    },
    'en-US': {
      text: 'The network is not available. Please check the network settings',
      button: 'Reload'
    }
  }
  const currentErrorText = errorText[(mpx.i18n.locale as LanguageCode) || 'zh-CN']

  if (props.style) {
    warn('The web-view component does not support the style prop.')
  }
  const pageId = useContext(RouteContext)
  const [pageLoadErr, setPageLoadErr] = useState<boolean>(false)
  const currentPage = useMemo(() => getCurrentPage(pageId), [pageId])
  const webViewRef = useRef<WebView>(null)
  const defaultWebViewStyle = {
    position: 'absolute' as 'absolute' | 'relative' | 'static',
    left: 0 as number,
    right: 0 as number,
    top: 0 as number,
    bottom: 0 as number
  }
  const canGoBack = useRef<boolean>(false)

  const onAndroidBackPress = useCallback(() => {
    if (canGoBack.current) {
      webViewRef.current?.goBack()
      return true
    }
    return false
  }, [canGoBack])

  const beforeRemoveHandle = useCallback((e: Event) => {
    if (canGoBack.current) {
      webViewRef.current?.goBack()
      e.preventDefault()
    }
  }, [canGoBack])

  const navigation = getFocusedNavigation()

  // ios 16以下版本 的hash会被转义，因此对于iOS环境下在页面load之后再注入hash部分的逻辑
  let [baseUrl, hashParams = ''] = src.split('#')
  if (hashParams) hashParams = '#' + hashParams
  const source = useMemo<WebViewSource>(() => {
    if (Platform.OS === 'ios') {
      return { uri: baseUrl };
    }
    return { uri: baseUrl + hashParams };
  }, [baseUrl, hashParams])

  const hashInjectedJavascript = useMemo(() => {
    if (Platform.OS === 'ios' && hashParams) {
      return `(function() {
        try {
          location.hash = '${hashParams}';
        } catch(e) {
        }
      })()`;
    }
    return '';
  }, [hashParams]);

  navigation?.addListener('beforeRemove', beforeRemoveHandle)

  useEffect(() => {
    if (__mpx_mode__ === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress)
        navigation?.removeListener('beforeRemove', beforeRemoveHandle)
      }
    }
  }, [])

  useNodesRef<WebView, WebViewProps>(props, ref, webViewRef, {
    style: defaultWebViewStyle
  })

  if (!src) {
    return null
  }

  const _load = function (res: WebViewNavigationEvent) {
    const result = {
      type: 'load',
      timeStamp: res.timeStamp,
      detail: {
        src: res.nativeEvent?.url
      }
    }
    bindload?.(result)
  }
  const _error = function (res: WebViewErrorEvent) {
    setPageLoadErr(true)
    const result = {
      type: 'error',
      timeStamp: res.timeStamp,
      detail: {
        src: ''
      }
    }
    binderror && binderror(result)
  }

  const _reload = function () {
    setPageLoadErr(false)
  }
  

  const injectedJavaScript = `
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      var _documentTitle = document.title;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'setTitle',
        payload: {
          _documentTitle: _documentTitle
        }
      }))
      Object.defineProperty(document, 'title', {
        set (val) {
          _documentTitle = val
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'setTitle',
            payload: {
              _documentTitle: _documentTitle
            }
          }))
        },
        get () {
          return _documentTitle
        }
      });
      ${hashInjectedJavascript}
    }
    true;
  `
  const sendMessage = function (params: string) {
    return `
      window.mpxWebviewMessageCallback(${params})
      true;
    `
  }
  const _changeUrl = function (navState: WebViewNavigation) {
    if (navState.navigationType) { // navigationType这个事件在页面开始加载时和页面加载完成时都会被触发所以判断这个避免其他无效触发执行该逻辑
      canGoBack.current = navState.canGoBack
      currentPage.__webViewUrl = navState.url
    }
  }

  const _onLoadProgress = function (event: WebViewProgressEvent) {
    if (__mpx_mode__ === 'android') {
      canGoBack.current = event.nativeEvent.canGoBack
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
    } catch (e) {}
    const args = data.args
    const postData: PayloadData = data.payload || {}
    const params = Array.isArray(args) ? args : [postData]
    const type = data.type
    switch (type) {
      case 'setTitle':
        { // case下不允许直接声明，包个块解决该问题
          const title = postData._documentTitle
          if (title) {
            navigation && navigation.setOptions({ title })
          }
        }
        break
      case 'postMessage':
        bindmessage && bindmessage(getCustomEvent('messsage', {}, { // RN组件销毁顺序与小程序不一致，所以改成和支付宝消息一致
          detail: {
            data: params[0]?.data
          }
        }))
        asyncCallback = Promise.resolve({
          errMsg: 'invokeWebappApi:ok'
        })
        break
      case 'navigateTo':
        asyncCallback = navObj.navigateTo(...params)
        break
      case 'navigateBack':
        asyncCallback = navObj.navigateBack(...params)
        break
      case 'redirectTo':
        asyncCallback = navObj.redirectTo(...params)
        break
      case 'switchTab':
        asyncCallback = navObj.switchTab(...params)
        break
      case 'reLaunch':
        asyncCallback = navObj.reLaunch(...params)
        break
      default:
        if (type) {
          const implement = mpx.config.webviewConfig.apiImplementations && mpx.config.webviewConfig.apiImplementations[type]
          if (isFunction(implement)) {
            asyncCallback = Promise.resolve(implement(...params))
          } else {
            /* eslint-disable prefer-promise-reject-errors */
            asyncCallback = Promise.reject({
              errMsg: `未在apiImplementations中配置${type}方法`
            })
          }
        }
        break
    }

    asyncCallback && asyncCallback.then((res: any) => {
      if (webViewRef.current?.postMessage) {
        const result = JSON.stringify({
          type,
          callbackId: data.callbackId,
          result: res
        })
        webViewRef.current.injectJavaScript(sendMessage(result))
      }
    }).catch((error: any) => {
      if (webViewRef.current?.postMessage) {
        const result = JSON.stringify({
          type,
          callbackId: data.callbackId,
          error
        })
        webViewRef.current.injectJavaScript(sendMessage(result))
      }
    })
  }
  const events = {}

  if (bindload) {
    extendObject(events, {
      onLoad: _load
    })
  }

  extendObject(events, {
    onError: _error
  })

  return (
      <Portal key={pageLoadErr ? 'error' : 'webview'}>
        {pageLoadErr
          ? (
            <View style={[styles.loadErrorContext, defaultWebViewStyle]}>
              <View style={styles.loadErrorText}><Text style={{ fontSize: 14, color: '#999999' }}>{currentErrorText.text}</Text></View>
              <View style={styles.loadErrorButton} onTouchEnd={_reload}><Text style={{ fontSize: 12, color: '#666666' }}>{currentErrorText.button}</Text></View>
            </View>
            )
          : (<WebView
        style={defaultWebViewStyle}
        source={source}
        ref={webViewRef}
        javaScriptEnabled={true}
        onNavigationStateChange={_changeUrl}
        onMessage={_message}
        injectedJavaScript={injectedJavaScript}
        onLoadProgress={_onLoadProgress}
        allowsBackForwardNavigationGestures={true}
        {...events}
      ></WebView>)}
      </Portal>
  )
})

_WebView.displayName = 'MpxWebview'

export default _WebView
