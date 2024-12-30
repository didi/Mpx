/**
 * ✔ size
 * ✔ type
 * ✔ plain
 * ✔ disabled
 * ✔ loading
 * ✔ form-type
 * - open-type: Partially. Only support `share`、`getUserInfo`
 * ✔ hover-class: Convert hoverClass to hoverStyle.
 * ✔ hover-style
 * ✘ hover-stop-propagation
 * ✔ hover-start-time
 * ✔ hover-stay-time
 * ✘ lang
 * ✘ session-from
 * ✘ send-message-title
 * ✘ send-message-path
 * ✘ send-message-img
 * ✘ app-parameter
 * ✘ show-message-card
 * ✘ phone-number-no-quota-toast
 * ✘ bindgetuserinfo
 * ✘ bindcontact
 * ✘ createliveactivity
 * ✘ bindgetphonenumber
 * ✘ bindgetphonenumber
 * ✘ bindgetrealtimephonenumber
 * ✘ binderror
 * ✘ bindopensetting
 * ✘ bindlaunchapp
 * ✘ bindlaunchapp
 * ✘ bindchooseavatar
 * ✘ bindchooseavatar
 * ✘ bindagreeprivacyauthorization
 * ✔ bindtap
 */
import { createElement, useEffect, useRef, ReactNode, forwardRef, useContext, JSX } from 'react'
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
  NativeSyntheticEvent
} from 'react-native'
import { warn } from '@mpxjs/utils'
import { GestureDetector } from 'react-native-gesture-handler'
import { getCurrentPage, splitProps, splitStyle, useLayout, useTransformStyle, wrapChildren, extendObject, useHoverStyle } from './utils'
import useInnerProps, { getCustomEvent } from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef'
import { RouteContext, FormContext } from './context'
import type { ExtendedViewStyle } from './types/common'

export type Type = 'default' | 'primary' | 'warn'

/**
 * normal、hover、plain、disabled
 */
type TypeColor = [string, string, string, string]

export type OpenType = 'share' | 'getUserInfo'

export type OpenTypeEvent = 'onShareAppMessage' | 'onUserInfo'

export interface ButtonProps {
  size?: string
  type?: Type
  plain?: boolean
  disabled?: boolean
  loading?: boolean
  'hover-class'?: string
  'hover-style'?: ExtendedViewStyle
  'hover-start-time'?: number
  'hover-stay-time'?: number
  'open-type'?: OpenType
  'form-type'?: 'submit' | 'reset'
  'enable-offset'?: boolean,
  'enable-var'?: boolean
  'external-var-context'?: Record<string, any>
  'parent-font-size'?: number
  'parent-width'?: number
  'parent-height'?: number
  style?: ViewStyle & TextStyle & Record<string, any>
  children: ReactNode
  bindgetuserinfo?: (userInfo: any) => void
  bindtap?: (evt: NativeSyntheticEvent<TouchEvent> | unknown) => void
}

const LOADING_IMAGE_URI =
  'data:image/png;base64,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'

const TypeColorMap: Record<Type, TypeColor> = {
  default: ['#F8F8F8', '#DEDEDE', '35,35,35', '#F7F7F7'],
  primary: ['#1AAD19', '#179B16', '26,173,25', '#9ED99D'],
  warn: ['#E64340', '#CE3C39', '230,67,64', '#EC8B89']
}

const OpenTypeEventsMap = new Map<OpenType, OpenTypeEvent>([
  ['share', 'onShareAppMessage'],
  ['getUserInfo', 'onUserInfo']
])

const styles = StyleSheet.create({
  button: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    borderRadius: 5,
    backgroundColor: '#F8F8F8',
    marginHorizontal: 'auto' // 按钮默认居中
  },
  buttonMini: {
    height: 30
  },
  text: {
    fontSize: 18,
    color: '#000000'
  },
  textMini: {
    fontSize: 13
  },
  loading: {
    width: 20,
    height: 20
  }
})

const getOpenTypeEvent = (openType?: OpenType) => {
  if (!openType) return
  if (!global.__mpx?.config?.rnConfig) {
    warn('Environment not supported')
    return
  }
  const eventName = OpenTypeEventsMap.get(openType)
  if (!eventName) {
    warn(`open-type not support ${openType}`)
    return
  }

  const event = global.__mpx.config.rnConfig.openTypeHandler?.[eventName]
  if (!event) {
    warn(`Unregistered ${eventName} event`)
    return
  }

  return event
}

const timer = (data: any, time = 3000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(data)
  }, time)
})

const Loading = ({ alone = false }: { alone: boolean }): JSX.Element => {
  const image = useRef(new Animated.Value(0)).current

  const rotate = image.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(image, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false
      })
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [])

  const loadingStyle = extendObject(
    {},
    styles.loading,
    {
      transform: [{ rotate }],
      marginRight: alone ? 0 : 5
    }
  )

  return <Animated.Image testID="loading" style={loadingStyle} source={{ uri: LOADING_IMAGE_URI }} />
}

const Button = forwardRef<HandlerRef<View, ButtonProps>, ButtonProps>((buttonProps, ref): JSX.Element => {
  const { textProps, innerProps: props = {} } = splitProps(buttonProps)

  const {
    size = 'default',
    type = 'default',
    plain = false,
    disabled = false,
    loading = false,
    'hover-class': hoverClass,
    'hover-style': hoverStyle = {},
    'hover-start-time': hoverStartTime = 20,
    'hover-stay-time': hoverStayTime = 70,
    'open-type': openType,
    'form-type': formType,
    'enable-var': enableVar,
    'external-var-context': externalVarContext,
    'parent-font-size': parentFontSize,
    'parent-width': parentWidth,
    'parent-height': parentHeight,
    style = {},
    children,
    bindgetuserinfo,
    bindtap
  } = props

  const pageId = useContext(RouteContext)

  const formContext = useContext(FormContext)

  const { isHover, enableHoverStyle, gesture } = useHoverStyle({ hoverStyle, hoverStartTime, hoverStayTime, disabled })

  let submitFn: () => void | undefined
  let resetFn: () => void | undefined

  if (formContext) {
    submitFn = formContext.submit
    resetFn = formContext.reset
  }

  const isMiniSize = size === 'mini'

  const applyHoverEffect = isHover && hoverClass !== 'none'

  const [color, hoverColor, plainColor, disabledColor] = TypeColorMap[type]

  const normalBackgroundColor = disabled ? disabledColor : applyHoverEffect || loading ? hoverColor : color

  const plainBorderColor = disabled
    ? 'rgba(0, 0, 0, .2)'
    : applyHoverEffect
      ? `rgba(${plainColor},.6)`
      : `rgb(${plainColor})`

  const normalBorderColor = type === 'default' ? 'rgba(0, 0, 0, .2)' : normalBackgroundColor

  const plainTextColor = disabled
    ? 'rgba(0, 0, 0, .2)'
    : applyHoverEffect
      ? `rgba(${plainColor}, .6)`
      : `rgb(${plainColor})`

  const normalTextColor =
    type === 'default'
      ? `rgba(0, 0, 0, ${disabled ? 0.3 : applyHoverEffect || loading ? 0.6 : 1})`
      : `rgba(255 ,255 ,255 , ${disabled || applyHoverEffect || loading ? 0.6 : 1})`

  const viewStyle = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: plain ? plainBorderColor : normalBorderColor,
    backgroundColor: plain ? 'transparent' : normalBackgroundColor
  }

  const defaultViewStyle = extendObject(
    {},
    styles.button,
    isMiniSize ? styles.buttonMini : null,
    viewStyle
  )

  const defaultTextStyle = extendObject(
    {},
    styles.text,
    isMiniSize ? styles.textMini : {},
    { color: plain ? plainTextColor : normalTextColor }
  )

  const defaultStyle = extendObject({}, defaultViewStyle, defaultTextStyle)

  const styleObj = extendObject(
    {},
    defaultStyle,
    style,
    applyHoverEffect ? hoverStyle : {}
  )

  const {
    hasSelfPercent,
    normalStyle,
    hasVarDec,
    varContextRef,
    setWidth,
    setHeight
  } = useTransformStyle(styleObj, { enableVar, externalVarContext, parentFontSize, parentWidth, parentHeight })

  const nodeRef = useRef(null)

  useNodesRef(props, ref, nodeRef, { style: normalStyle })

  const { layoutRef, layoutStyle, layoutProps } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef })

  const { textStyle, backgroundStyle, innerStyle = {} } = splitStyle(normalStyle)

  if (backgroundStyle) {
    warn('Button does not support background image-related styles!')
  }

  const handleOpenTypeEvent = (evt: NativeSyntheticEvent<TouchEvent>) => {
    const handleEvent = getOpenTypeEvent(openType)
    if (!handleEvent) return

    if (openType === 'share') {
      const currentPage = getCurrentPage(pageId)
      const event = {
        from: 'button',
        target: getCustomEvent('tap', evt, { layoutRef }, props).target,
        webViewUrl: currentPage?.__webViewUrl
      }
      if (currentPage) {
        const defaultMessage = {
          title: global.__mpx.config.rnConfig.projectName || 'AwesomeProject',
          path: currentPage.route || ''
        }
        if (currentPage.onShareAppMessage) {
          const { promise, ...message } = currentPage.onShareAppMessage(event) || {}
          if (promise) {
            Promise.race([Promise.resolve(promise), timer(message)])
              .then((msg) => {
                handleEvent(Object.assign({}, defaultMessage, msg))
              })
          } else {
            handleEvent(Object.assign({}, defaultMessage, message))
          }
        } else {
          handleEvent(defaultMessage)
        }
      } else {
        warn('Current page not found')
        // Todo handleEvent(event)
      }
    }

    if (openType === 'getUserInfo' && bindgetuserinfo) {
      Promise.resolve(handleEvent)
        .then((userInfo) => {
          if (typeof userInfo === 'object') {
            bindgetuserinfo(userInfo)
          }
        })
    }
  }

  const handleFormTypeFn = () => {
    if (formType === 'submit') {
      submitFn && submitFn()
    } else if (formType === 'reset') {
      resetFn && resetFn()
    }
  }

  const onTap = (evt: NativeSyntheticEvent<TouchEvent>) => {
    if (disabled) return
    bindtap && bindtap(getCustomEvent('tap', evt, { layoutRef }, props))
    handleOpenTypeEvent(evt)
    handleFormTypeFn()
  }

  const innerProps = useInnerProps(
    props,
    extendObject(
      {
        ref: nodeRef,
        style: extendObject({}, innerStyle, layoutStyle)
      },
      layoutProps,
      {
        bindtap: !disabled && onTap
      }
    ),
    [
      'disabled',
      'size',
      'type',
      'plain',
      'loading',
      'hover-class',
      'hover-style',
      'hover-start-time',
      'hover-stay-time',
      'open-type',
      'form-type'
    ],
    {
      layoutRef,
      disableTap: disabled
    }
  )

  const baseButton = createElement(View, innerProps, loading && createElement(Loading, { alone: !children }),
    wrapChildren(
      props,
      {
        hasVarDec,
        varContext: varContextRef.current,
        textStyle,
        textProps
      }
    )
  )

  return enableHoverStyle
    ? createElement(GestureDetector, { gesture }, baseButton)
    : baseButton
})

Button.displayName = 'MpxButton'

export default Button
