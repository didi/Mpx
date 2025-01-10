/**
 * ✔ src
 * ✘ duration
 * ✔ controls
 * ✘ danmu-list
 * ✘ danmu-btn
 * ✘ enable-danmu
 * ✔ autoplay
 * ✔ loop
 * ✔ muted
 * ✔ initial-time
 * ✘ page-gesture
 * ✘ direction
 * ✘ show-progress
 * ✘ show-fullscreen-btn
 * ✘ show-play-btn
 * ✘ show-center-play-btn
 * ✘ enable-progress-gesture
 * ✔ object-fit
 * ✔ poster
 * ✘ show-mute-btn
 * ✘ title
 * ✘ play-btn-position
 * ✘ enable-play-gesture
 * ✘ auto-pause-if-navigate
 * ✘ auto-pause-if-open-native
 * ✘ vslide-gesture
 * ✘ vslide-gesture-in-fullscreen
 * ✘ show-bottom-progress(use show-progress)
 * ✘ ad-unit-id
 * ✘ poster-for-crawler
 * ✘ show-casting-button
 * ✘ picture-in-picture-mode
 * ✘ picture-in-picture-show-progress
 * ✘ picture-in-picture-init-position
 * ✔ enable-auto-rotation (only ios)
 * ✘ show-screen-lock-button
 * ✘ show-snapshot-button
 * ✘ show-background-playback-button
 * ✘ background-poster
 * ✘ referrer-policy
 * ✔ is-drm
 * ✘ is-live
 * ✔ provision-url(android)
 * ✔ certificate-url(ios)
 * ✔ license-url
 * ✔ preferred-peak-bit-rate
 * ✔ bindplay
 * ✔ bindpause
 * ✔ bindended
 * ✘ bindtimeupdate
 * ✔ bindfullscreenchange
 * ✔ bindwaiting
 * ✔ binderror
 * ✘ bindprogress
 * ✔ bindloadedmetadata
 * ✔ bindcontrolstoggle(only android)
 * ✘ bindenterpictureinpicture
 * ✘ bindleavepictureinpicture
 * ✔ bindseekcomplete
 * ✘ bindcastinguserselect
 * ✘ bindcastingstatechange
 * ✘ bindcastinginterrupt
 */

import { JSX, useRef, forwardRef, createElement } from 'react'
import Video, { DRMType, ReactVideoSourceProperties, VideoRef, OnVideoErrorData, OnPlaybackRateChangeData, OnControlsVisibilityChange, OnBufferData, OnSeekData, OnProgressData } from 'react-native-video'
import { StyleSheet, View, Platform, ViewStyle } from 'react-native'
import {
  splitProps,
  useTransformStyle,
  useLayout,
  extendObject
} from './utils'
import useInnerProps, { getCustomEvent } from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef'

interface VideoProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
  style?: ViewStyle;
  'initial-time'?: number;
  'object-fit'?: null | 'contain' | 'fill' | 'cover';
  'is-drm'?: boolean;
  'provision-url'?: string;
  'certificate-url'?: string;
  'license-url'?: string;
  'preferred-peak-bit-rate'?: number;
  'enable-auto-rotation'?: number;
  'enable-var'?: boolean;
  'external-var-context'?: Record<string, any>;
  'parent-font-size'?: number;
  'parent-width'?: number;
  'parent-height'?: number;
  bindplay?: (event: Record<string, any>) => void;
  bindpause?: (event: Record<string, any>) => void;
  bindended?: (event: Record<string, any>) => void;
  bindtimeupdate?: (event: Record<string, any>) => void;
  bindfullscreenchange?: (event: Record<string, any>) => void;
  bindwaiting?: (event: Record<string, any>) => void;
  binderror?: (event: Record<string, any>) => void;
  bindloadedmetadata?: (event: Record<string, any>) => void;
  bindcontrolstoggle?: (event: Record<string, any>) => void;
  bindseekcomplete?: (event: Record<string, any>) => void;
}
interface VideoInfoData {
  naturalSize: {
    width: number
    height: number
  }
  duration: number
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 225
  },
  video: {
    flex: 1
  }
})

const MpxVideo = forwardRef<HandlerRef<View, VideoProps>, VideoProps>((videoProps: VideoProps, ref): JSX.Element => {
  const { innerProps: props = {} } = splitProps(videoProps)
  const {
    src,
    autoplay = false,
    loop = false,
    muted = false,
    controls = true,
    poster = '',
    bindplay,
    bindpause,
    bindended,
    bindtimeupdate,
    bindfullscreenchange,
    bindwaiting,
    binderror,
    bindloadedmetadata,
    bindcontrolstoggle,
    bindseekcomplete,
    style,
    'initial-time': initialTime = 0,
    'object-fit': objectFit = 'contain',
    'is-drm': isDrm = false,
    'provision-url': provisionUrl,
    'certificate-url': certificateUrl,
    'license-url': licenseUrl,
    'preferred-peak-bit-rate': preferredPeakBitRate = 0,
    'enable-auto-rotation': enableAutoRotation = false,
    'enable-var': enableVar,
    'external-var-context': externalVarContext,
    'parent-font-size': parentFontSize,
    'parent-width': parentWidth,
    'parent-height': parentHeight
  } = props

  const videoRef = useRef<VideoRef>(null)

  const viewRef = useRef(null)

  const videoInfoRef = useRef({} as VideoInfoData)

  const propsRef = useRef({})

  propsRef.current = props

  const { normalStyle, hasSelfPercent, setWidth, setHeight } =
    useTransformStyle(extendObject({}, styles.container, style), {
      enableVar,
      externalVarContext,
      parentFontSize,
      parentWidth,
      parentHeight
    })

  const { layoutRef, layoutStyle, layoutProps } = useLayout({
    props,
    hasSelfPercent,
    setWidth,
    setHeight,
    nodeRef: viewRef
  })

  useNodesRef(props, ref, viewRef, {
    style: normalStyle,
    node: {
      play,
      pause,
      stop,
      seek,
      requestFullScreen,
      exitFullScreen
    }
  })

  function handleProgress (data: OnProgressData) {
    const { currentTime } = data
    bindtimeupdate && bindtimeupdate(
      getCustomEvent('timeupdate',
        {},
        {
          detail: {
            currentTime,
            duration: videoInfoRef.current.duration
          },
          layoutRef
        },
        propsRef.current
      )
    )
  }

  function handleEnd () {
    bindended!(getCustomEvent('end', {}, { layoutRef }, propsRef.current))
  }

  function handleWaiting ({ isBuffering }: OnBufferData) {
    if (isBuffering) {
      bindwaiting!(getCustomEvent('waiting', {}, { layoutRef }, propsRef.current))
    }
  }

  function handleSeekcomplete ({ seekTime }: OnSeekData) {
    // 手动拖拽进度条场景，android 可以触发，ios 不可以
    bindseekcomplete!(
      getCustomEvent('seekcomplete',
        {},
        {
          detail: {
            position: Platform.OS === 'android' ? seekTime * 1000 : seekTime
          },
          layoutRef
        },
        propsRef.current
      ))
  }

  function handleEnterFullScreen () {
    bindfullscreenchange && bindfullscreenchange(
      getCustomEvent('fullscreenchange', {}, { detail: { fullScreen: 1 }, layoutRef }, propsRef.current)
    )
  }

  function handleExitFullScreen () {
    bindfullscreenchange && bindfullscreenchange(
      getCustomEvent('fullscreenchange', {}, { detail: { fullScreen: 0 }, layoutRef }, propsRef.current)
    )
  }

  function handlePlaybackRateChange ({ playbackRate }: OnPlaybackRateChangeData) {
    if (playbackRate === 0) {
      bindpause && bindpause(getCustomEvent('pause', {}, { layoutRef }, propsRef.current))
    } else {
      bindplay && bindplay(getCustomEvent('play', {}, { layoutRef }, propsRef.current))
    }
  }

  function handleAndroidControlsVisibilityChange ({ isVisible }: OnControlsVisibilityChange) {
    bindcontrolstoggle!(
      getCustomEvent('progress',
        {},
        {
          detail: {
            show: isVisible
          },
          layoutRef
        },
        propsRef.current
      ))
  }

  function handleVideoLoad (data: VideoInfoData) {
    const { naturalSize, duration } = data
    if (initialTime) {
      videoRef.current && videoRef.current.seek(initialTime)
    }
    videoInfoRef.current = data
    bindloadedmetadata && bindloadedmetadata(getCustomEvent('loadedmetadata',
      {},
      {
        detail: {
          width: naturalSize.width,
          height: naturalSize.height,
          duration
        },
        layoutRef
      },
      propsRef.current
    ))
  }

  function handleError ({ error }: OnVideoErrorData) {
    binderror && binderror(getCustomEvent('play', {}, { detail: { errMsg: error.localizedFailureReason }, layoutRef }, propsRef.current))
  }

  function play () {
    videoRef.current && videoRef.current.resume()
  }
  function pause () {
    videoRef.current && videoRef.current.pause()
  }
  function seek (position: number) {
    videoRef.current && videoRef.current.seek(position)
  }
  function stop () {
    videoRef.current && videoRef.current.pause()
    seek(0)
  }
  function exitFullScreen () {
    videoRef.current && videoRef.current.setFullScreen(false)
  }

  function requestFullScreen () {
    videoRef.current && videoRef.current.setFullScreen(true)
  }

  const source: ReactVideoSourceProperties = {
    uri: src
  }
  if (isDrm) {
    source.drm = {
      type: DRMType.FAIRPLAY,
      certificateUrl: Platform.OS === 'android' ? provisionUrl : certificateUrl,
      licenseServer: licenseUrl
    }
  }

  const innerProps = useInnerProps(
    props,
    extendObject(
      {
        style: styles.video,
        ref: videoRef,
        source,
        paused: !autoplay,
        repeat: loop,
        muted,
        controls,
        maxBitRate: preferredPeakBitRate,
        fullscreenAutorotate: enableAutoRotation,
        resizeMode: objectFit === 'fill' ? 'stretch' : objectFit,
        poster: controls ? poster : '',
        onProgress: bindtimeupdate && handleProgress,
        onEnd: bindended && handleEnd,
        onError: binderror && handleError,
        onBuffer: bindwaiting && handleWaiting,
        onSeek: bindseekcomplete && handleSeekcomplete,
        onPlaybackRateChange:
          (bindpause || bindplay) && handlePlaybackRateChange,
        onFullscreenPlayerDidPresent:
          bindfullscreenchange && handleEnterFullScreen,
        onFullscreenPlayerWillDismiss:
          bindfullscreenchange && handleExitFullScreen,
        onControlsVisibilityChange:
          bindcontrolstoggle && handleAndroidControlsVisibilityChange,
        onLoad: handleVideoLoad
      },
      layoutProps
    ),
    [
      'src',
      'autoplay',
      'loop',
      'bindplay',
      'bindpause',
      'bindended',
      'bindtimeupdate',
      'bindfullscreenchange',
      'bindwaiting',
      'binderror',
      'bindloadedmetadata',
      'bindcontrolstoggle',
      'bindseekcomplete'
    ],
    { layoutRef }
  )
  return createElement(View, { style: extendObject({}, normalStyle, layoutStyle), ref: viewRef },
    createElement(Video, innerProps)
  )
})

export default MpxVideo
