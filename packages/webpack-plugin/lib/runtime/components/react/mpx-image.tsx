/**
 * ✔ src
 * ✔ mode
 * ✘ show-menu-by-longpress
 * ✔ binderror
 * ✔ bindload
 * ✘ fade-in
 * ✔ webp
 * ✘ lazy-load
 * ✔ bindtap
 * ✔ DEFAULT_SIZE
 */
import { useEffect, useMemo, useState, useRef, forwardRef } from 'react'
import {
  Image as RNImage,
  View,
  ImageStyle,
  ImageResizeMode,
  NativeSyntheticEvent,
  ImageErrorEventData,
  LayoutChangeEvent,
  DimensionValue,
  ImageLoadEventData
} from 'react-native'
import { SvgCssUri } from 'react-native-svg/css'
import useInnerProps, { getCustomEvent } from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef'
import { SVG_REGEXP, useLayout, useTransformStyle, extendObject } from './utils'

export type Mode =
  | 'scaleToFill'
  | 'aspectFit'
  | 'aspectFill'
  | 'widthFix'
  | 'heightFix'
  | 'top'
  | 'bottom'
  | 'center'
  | 'left'
  | 'right'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right'

export interface ImageProps {
  src?: string
  mode?: Mode
  svg?: boolean
  style?: ImageStyle & Record<string, any>
  'enable-offset'?: boolean;
  'enable-var'?: boolean
  'external-var-context'?: Record<string, any>
  'parent-font-size'?: number
  'parent-width'?: number
  'parent-height'?: number
  bindload?: (evt: NativeSyntheticEvent<ImageLoadEventData> | unknown) => void
  binderror?: (evt: NativeSyntheticEvent<ImageErrorEventData> | unknown) => void
}

const DEFAULT_IMAGE_WIDTH = 320
const DEFAULT_IMAGE_HEIGHT = 240

const cropMode: Mode[] = [
  'top',
  'bottom',
  'center',
  'right',
  'left',
  'top left',
  'top right',
  'bottom left',
  'bottom right'
]

const ModeMap = new Map<Mode, ImageResizeMode | undefined>([
  ['scaleToFill', 'stretch'],
  ['aspectFit', 'contain'],
  ['aspectFill', 'cover'],
  ['widthFix', 'stretch'],
  ['heightFix', 'stretch'],
  ...cropMode.map<[Mode, ImageResizeMode]>(mode => [mode, 'stretch'])
])

const isNumber = (value: DimensionValue) => typeof value === 'number'

const relativeCenteredSize = (viewSize: number, imageSize: number) => (viewSize - imageSize) / 2

function noMeetCalcRule (isSvg: boolean, mode: Mode, viewWidth: number, viewHeight: number, ratio: number) {
  const isMeetSize = viewWidth && viewHeight && ratio
  if (isSvg && !isMeetSize) return true
  if (!isSvg && !['scaleToFill', 'aspectFit', 'aspectFill'].includes(mode) && !isMeetSize) return true
  return false
}

const Image = forwardRef<HandlerRef<RNImage, ImageProps>, ImageProps>((props, ref): JSX.Element => {
  const {
    src = '',
    mode = 'scaleToFill',
    style = {},
    'enable-var': enableVar,
    'external-var-context': externalVarContext,
    'parent-font-size': parentFontSize,
    'parent-width': parentWidth,
    'parent-height': parentHeight,
    bindload,
    binderror
  } = props

  const defaultStyle = {
    width: DEFAULT_IMAGE_WIDTH,
    height: DEFAULT_IMAGE_HEIGHT
  }

  const styleObj = extendObject(
    {},
    defaultStyle,
    style,
    { overflow: 'hidden' }
  )

  const nodeRef = useRef(null)

  const onLayout = ({ nativeEvent: { layout: { width, height } } }: LayoutChangeEvent) => {
    setViewWidth(width)
    setViewHeight(height)
  }

  const { normalStyle, hasSelfPercent, setWidth, setHeight } = useTransformStyle(styleObj, { enableVar, externalVarContext, parentFontSize, parentWidth, parentHeight })

  useNodesRef(props, ref, nodeRef, {
    style: normalStyle
  })

  const { layoutRef, layoutStyle, layoutProps } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef, onLayout })

  const { width, height } = normalStyle

  const isSvg = SVG_REGEXP.test(src)
  const isWidthFixMode = mode === 'widthFix'
  const isHeightFixMode = mode === 'heightFix'
  const isCropMode = cropMode.includes(mode)
  const isLayoutMode = isWidthFixMode || isHeightFixMode || isCropMode
  const resizeMode: ImageResizeMode = ModeMap.get(mode) || 'stretch'

  const [viewWidth, setViewWidth] = useState(isNumber(width) ? width : 0)
  const [viewHeight, setViewHeight] = useState(isNumber(height) ? height : 0)
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)
  const [ratio, setRatio] = useState(0)

  const fixedHeight = useMemo(() => {
    const fixed = viewWidth * ratio
    return !fixed ? viewHeight : fixed
  }, [ratio, viewWidth, viewHeight])

  const fixedWidth = useMemo(() => {
    if (!ratio) return viewWidth
    const fixed = viewHeight / ratio
    return !fixed ? viewWidth : fixed
  }, [ratio, viewWidth, viewHeight])

  const modeStyle: ImageStyle = useMemo(() => {
    if (noMeetCalcRule(isSvg, mode, viewWidth, viewHeight, ratio)) return {}
    switch (mode) {
      case 'scaleToFill':
      case 'aspectFit':
        if (isSvg) {
          const scale = ratio <= 1
            ? imageWidth >= viewWidth ? viewWidth / imageWidth : imageWidth / viewWidth
            : imageHeight >= viewHeight ? viewHeight / imageHeight : imageHeight / viewHeight
          return {
            transform: [
              { scale },
              ratio <= 1 ? { translateY: -(imageHeight * scale - viewHeight) / 2 / scale } : { translateX: -(imageWidth * scale - viewWidth) / 2 / scale }
            ]
          }
        }
        return {}
      case 'aspectFill':
        if (isSvg) {
          const scale = ratio >= 1
            ? imageWidth >= viewWidth ? viewWidth / imageWidth : imageWidth / viewWidth
            : imageHeight >= viewHeight ? viewHeight / imageHeight : imageHeight / viewHeight
          return {
            transform: [
              { scale },
              ratio >= 1 ? { translateY: -(imageHeight * scale - viewHeight) / 2 / scale } : { translateX: -(imageWidth * scale - viewWidth) / 2 / scale }
            ]
          }
        }
        return {}
      case 'widthFix':
      case 'heightFix':
        if (isSvg) {
          const scale = ratio >= 1
            ? imageWidth >= fixedWidth ? fixedWidth / imageWidth : imageWidth / fixedWidth
            : imageHeight >= fixedHeight ? fixedHeight / imageHeight : imageHeight / fixedHeight
          return {
            transform: [{ scale }]
          }
        }
        return {}
      case 'top':
        return {
          transform: [
            { translateX: relativeCenteredSize(viewWidth, imageWidth) }
          ]
        }
      case 'bottom':
        return {
          transform: [
            { translateY: viewHeight - imageHeight },
            { translateX: relativeCenteredSize(viewWidth, imageWidth) }
          ]
        }
      case 'center':
        return {
          transform: [
            { translateY: relativeCenteredSize(viewHeight, imageHeight) },
            { translateX: relativeCenteredSize(viewWidth, imageWidth) }
          ]
        }
      case 'left':
        return {
          transform: [
            { translateY: relativeCenteredSize(viewHeight, imageHeight) }
          ]
        }
      case 'right':
        return {
          transform: [
            { translateY: relativeCenteredSize(viewHeight, imageHeight) },
            { translateX: viewWidth - imageWidth }
          ]
        }
      case 'top left':
        return {}
      case 'top right':
        return {
          transform: [
            { translateX: viewWidth - imageWidth }
          ]
        }
      case 'bottom left':
        return {
          transform: [
            { translateY: viewHeight - imageHeight }
          ]
        }
      case 'bottom right':
        return {
          transform: [
            { translateY: viewHeight - imageHeight },
            { translateX: viewWidth - imageWidth }
          ]
        }
      default:
        return {}
    }
  }, [isSvg, mode, viewWidth, viewHeight, imageWidth, imageHeight, ratio, fixedWidth, fixedHeight])

  const onSvgLoad = (evt: LayoutChangeEvent) => {
    const { width, height } = evt.nativeEvent.layout
    setRatio(!width ? 0 : height / width)
    setImageWidth(width)
    setImageHeight(height)

    bindload && bindload(
      getCustomEvent(
        'load',
        evt,
        {
          detail: { width, height },
          layoutRef
        },
        props
      )
    )
  }

  const onSvgError = (evt: Error) => {
    binderror!(
      getCustomEvent(
        'error',
        evt,
        {
          detail: { errMsg: evt?.message },
          layoutRef
        },
        props
      )
    )
  }

  const onImageLoad = (evt: NativeSyntheticEvent<ImageLoadEventData>) => {
    evt.persist()
    RNImage.getSize(src, (width: number, height: number) => {
      bindload!(
        getCustomEvent(
          'load',
          evt,
          {
            detail: { width, height },
            layoutRef
          },
          props
        )
      )
    })
  }

  const onImageError = (evt: NativeSyntheticEvent<ImageErrorEventData>) => {
    binderror!(
      getCustomEvent(
        'error',
        evt,
        {
          detail: { errMsg: evt.nativeEvent.error },
          layoutRef
        },
        props
      )
    )
  }

  useEffect(() => {
    if (!isSvg && isLayoutMode) {
      RNImage.getSize(src, (width: number, height: number) => {
        setRatio(!width ? 0 : height / width)
        setImageWidth(width)
        setImageHeight(height)
      })
    }
  }, [src, isSvg, isLayoutMode])

  const innerProps = useInnerProps(
    props,
    extendObject(
      {
        ref: nodeRef,
        style: extendObject(
          {},
          normalStyle,
          layoutStyle,
          isHeightFixMode ? { width: fixedWidth } : {},
          isWidthFixMode ? { height: fixedHeight } : {}
        )
      },
      layoutProps
    ),
    [
      'src',
      'mode',
      'svg'
    ],
    {
      layoutRef
    }
  )

  return (
    <View {...innerProps}>
      {
        isSvg
          ? <SvgCssUri
              uri={src}
              onLayout={onSvgLoad}
              onError={binderror && onSvgError}
              style={extendObject(
                { transformOrigin: 'top left' },
                modeStyle
              )}
            />
          : <RNImage
              source={{ uri: src }}
              resizeMode={resizeMode}
              onLoad={bindload && onImageLoad}
              onError={binderror && onImageError}
              style={extendObject(
                {
                  transformOrigin: 'top left',
                  width: isCropMode ? imageWidth : '100%',
                  height: isCropMode ? imageHeight : '100%'
                },
                isCropMode ? modeStyle : {}
              )}
            />
      }
    </View>
  )
})

Image.displayName = 'mpx-image'

export default Image
