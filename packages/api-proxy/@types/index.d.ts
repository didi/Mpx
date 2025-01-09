/// <reference types="miniprogram-api-typings" />

type AddPromise<W> = {
  [K in keyof W]: W[K] extends (...args: any) => any
      ? Parameters<W[K]> extends [{ success?: (res: infer R) => any }?, ...any[]]
          ? (...args: Parameters<W[K]>) => ReturnType<W[K]> & Promise<R>
          : W[K]
      : W[K]
}

type AddParam<O, V extends (...args: any) => any> =
    Parameters<V> extends [{ success?: (res: infer R) => any }, ...any[]]
        ? (options: O) => ReturnType<V> & Promise<R>
        : (options: O) => ReturnType<V>

type PickApiValue<T extends keyof WechatMiniprogram.Wx> = Pick<WechatMiniprogram.Wx, T>[T]

interface GetLocationInterface extends WechatMiniprogram.GetLocationOption {
  aliType?: number
}

interface RequestPaymentInterface extends WechatMiniprogram.RequestPaymentOption {
  tradeNO?: string
}

declare module '@mpxjs/core' {
  interface Mpx extends AddPromise<WechatMiniprogram.Wx> {
    getLocation: AddParam<GetLocationInterface, PickApiValue<'getLocation'>>
    requestPayment: AddParam<RequestPaymentInterface, PickApiValue<'requestPayment'>>
  }
}

export const getProxy: (...args: any) => void

export const promisify: (listObj: object, whiteList?: string[], customBlackList?: string[]) => Record<string, any>

export const showActionSheet: WechatMiniprogram.Wx['showActionSheet']
export const addPhoneContact: WechatMiniprogram.Wx['addPhoneContact']
export const onAppShow: WechatMiniprogram.Wx['onAppShow']
export const onAppHide: WechatMiniprogram.Wx['onAppHide']
export const offAppShow: WechatMiniprogram.Wx['offAppShow']
export const offAppHide: WechatMiniprogram.Wx['offAppHide']
export const onError: WechatMiniprogram.Wx['onError']
export const offError: WechatMiniprogram.Wx['offError']
export const createInnerAudioContext: WechatMiniprogram.Wx['createInnerAudioContext']
export const base64ToArrayBuffer: WechatMiniprogram.Wx['base64ToArrayBuffer']
export const arrayBufferToBase64: WechatMiniprogram.Wx['arrayBufferToBase64']
export const closeBLEConnection: WechatMiniprogram.Wx['closeBLEConnection']
export const createBLEConnection: WechatMiniprogram.Wx['createBLEConnection']
export const onBLEConnectionStateChange: WechatMiniprogram.Wx['onBLEConnectionStateChange']
export const createCanvasContext: WechatMiniprogram.Wx['createCanvasContext']
export const canvasToTempFilePath: WechatMiniprogram.Wx['canvasToTempFilePath']
export const canvasGetImageData: WechatMiniprogram.Wx['canvasGetImageData']
export const checkSession: WechatMiniprogram.Wx['checkSession']
export const setClipboardData: WechatMiniprogram.Wx['setClipboardData']
export const getClipboardData: WechatMiniprogram.Wx['getClipboardData']
export const createIntersectionObserver: WechatMiniprogram.Wx['createIntersectionObserver']
export const createSelectorQuery: WechatMiniprogram.Wx['createSelectorQuery']
export const getNetworkType: WechatMiniprogram.Wx['getNetworkType']
export const onNetworkStatusChange: WechatMiniprogram.Wx['onNetworkStatusChange']
export const offNetworkStatusChange: WechatMiniprogram.Wx['offNetworkStatusChange']
export const EventChannel: WechatMiniprogram.EventChannel
export const downloadFile: WechatMiniprogram.Wx['downloadFile']
export const uploadFile: WechatMiniprogram.Wx['uploadFile']
export const getUserInfo: WechatMiniprogram.Wx['getUserInfo']
export const previewImage: WechatMiniprogram.Wx['previewImage']
export const compressImage: WechatMiniprogram.Wx['compressImage']
export const getEnterOptionsSync: WechatMiniprogram.Wx['getEnterOptionsSync']
export const login: WechatMiniprogram.Wx['login']
export const makePhoneCall: WechatMiniprogram.Wx['makePhoneCall']
export const showModal: WechatMiniprogram.Wx['showModal']
export const nextTick: WechatMiniprogram.Wx['nextTick']
export const pageScrollTo: WechatMiniprogram.Wx['pageScrollTo']
export const stopPullDownRefresh: WechatMiniprogram.Wx['stopPullDownRefresh']
export const startPullDownRefresh:WechatMiniprogram.Wx['startPullDownRefresh']
export const request: WechatMiniprogram.Wx['request']
export const requestPayment: WechatMiniprogram.Wx['requestPayment']
export const redirectTo: WechatMiniprogram.Wx['redirectTo']
export const navigateTo: WechatMiniprogram.Wx['navigateTo']
export const navigateBack: WechatMiniprogram.Wx['navigateBack']
export const reLaunch: WechatMiniprogram.Wx['reLaunch']
export const switchTab: WechatMiniprogram.Wx['switchTab']
export const scanCode: WechatMiniprogram.Wx['scanCode']
export const setScreenBrightness: WechatMiniprogram.Wx['setScreenBrightness']
export const getScreenBrightness: WechatMiniprogram.Wx['getScreenBrightness']
export const setNavigationBarTitle: WechatMiniprogram.Wx['setNavigationBarTitle']
export const setNavigationBarColor: WechatMiniprogram.Wx['setNavigationBarColor']
export const connectSocket: WechatMiniprogram.Wx['connectSocket']
export const setStorage: WechatMiniprogram.Wx['setStorage']
export const setStorageSync: WechatMiniprogram.Wx['setStorageSync']
export const getStorage: WechatMiniprogram.Wx['getStorage']
export const removeStorage: WechatMiniprogram.Wx['removeStorage']
export const getStorageSync: WechatMiniprogram.Wx['getStorageSync']
export const getStorageInfo: WechatMiniprogram.Wx['getStorageInfo']
export const getStorageInfoSync: WechatMiniprogram.Wx['getStorageInfoSync']
export const removeStorageSync: WechatMiniprogram.Wx['removeStorageSync']
export const clearStorage: WechatMiniprogram.Wx['clearStorage']
export const clearStorageSync: WechatMiniprogram.Wx['clearStorageSync']
export const getSystemInfo: WechatMiniprogram.Wx['getSystemInfo']
export const getSystemInfoSync: WechatMiniprogram.Wx['getSystemInfoSync']
export const getWindowInfo: WechatMiniprogram.Wx['getWindowInfo']
export const setTabBarItem: WechatMiniprogram.Wx['setTabBarItem']
export const setTabBarStyle: WechatMiniprogram.Wx['setTabBarStyle']
export const showTabBar: WechatMiniprogram.Wx['showTabBar']
export const hideTabBar: WechatMiniprogram.Wx['hideTabBar']
export const showToast: WechatMiniprogram.Wx['showToast']
export const showLoading: WechatMiniprogram.Wx['showLoading']
export const hideToast: WechatMiniprogram.Wx['hideToast']
export const hideLoading: WechatMiniprogram.Wx['hideLoading']
export const createVideoContext: WechatMiniprogram.Wx['createVideoContext']
export const onWindowResize: WechatMiniprogram.Wx['onWindowResize']
export const offWindowResize: WechatMiniprogram.Wx['offWindowResize']
export const createAnimation: WechatMiniprogram.Wx['createAnimation']
export const hideHomeButton: WechatMiniprogram.Wx['hideHomeButton']
export const getSetting: WechatMiniprogram.Wx['getSetting']
export const openSetting: WechatMiniprogram.Wx['openSetting']
export const enableAlertBeforeUnload: WechatMiniprogram.Wx['enableAlertBeforeUnload']
export const disableAlertBeforeUnload: WechatMiniprogram.Wx['disableAlertBeforeUnload']
export const getMenuButtonBoundingClientRect: WechatMiniprogram.Wx['getMenuButtonBoundingClientRect']
export const getImageInfo: WechatMiniprogram.Wx['getImageInfo']
export const vibrateShort: WechatMiniprogram.Wx['vibrateShort']
export const vibrateLong: WechatMiniprogram.Wx['vibrateLong']
export const getExtConfig: WechatMiniprogram.Wx['getExtConfig']
export const getExtConfigSync: WechatMiniprogram.Wx['getExtConfigSync']
export const openLocation: WechatMiniprogram.Wx['openLocation']
export const chooseLocation: WechatMiniprogram.Wx['chooseLocation']

declare const install: (...args: any) => any

export default install
