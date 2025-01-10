# API支持列表

mpx转RN的对标微信api目前支持及部分的api转换，目前支持的能力可以参考下表：

| 支持方法                      |
|-----------------------------|
| showActionSheet             |
| createAnimation             |
| onAppShow                   |
| onAppHide                   |
| offAppShow                  |
| offAppHide                  |
| onError                     |
| offError                    |
| onUnhandledRejection        |
| offUnhandledRejection       |
| createIntersectionObserver  |
| createSelectorQuery         |
| getImageInfo                |
| onKeyboardHeightChange      |
| offKeyboardHeightChange     |
| hideKeyboard                |
| getLocation                 |
| makePhoneCall               |
| showModal                   |
| nextTick                    |
| getSystemInfo               |
| getSystemInfoSync           |
| getLaunchOptionsSync        |
| getEnterOptionsSync         |
| getDeviceInfo               |
| getWindowInfo               |
| request                     |
| redirectTo                  |
| navigateTo                  |
| navigateBack                |
| reLaunch                    |
| switchTab                   |
| getScreenBrightness         |
| setScreenBrightness         |
| setNavigationBarTitle       |
| setNavigationBarColor       |
| setStorage                  |
| removeStorage               |
| removeStorageSync           |
| getStorage                  |
| getStorageInfo              |
| clearStorage                |
| clearStorageSync            |
| setClipboardData            |
| getClipboardData            |
| makePhoneCall               |
| onWindowResize              |
| offWindowResize             |
| arrayBufferToBase64         |
| base64ToArrayBuffer         |
| connectSocket               |
| getNetworkType              |
| onNetworkStatusChange       |
| offNetworkStatusChange      |
| showToast                   |
| hideToast                   |
| showLoading                 |
| hideLoading                 |
| vibrateShort                |
| vibrateLong                 |

# 使用说明

对于一些api-proxy中没有提供的能力，用户可以搭配mpx对象方式传入custom使用即可示例如下：

```js
import mpx from '@mpxjs/core'
import apiProxy from '@mpxjs/api-proxy'
import { showModal } from '@test/showModal'

mpx.use(apiProxy, {
  custom: {
    ios: {
      showModal
    },
    android: {
      showModal
    }
  }
})

mpx.showModal({
  title: '标题',
  content: '这是一个弹窗',
  success (res) {
    console.log('弹框展示成功')
  }
})
```

# API抹平差异详情

对于一些微信独有的返回结果，或者RN目前不能支持的入参/返回结果，在下面会有详细说明：

### getImageInfo

| 不支持返回值                 |
|------------------------|
| path          |
| orientation          |
| type          |

### getLocation

| 不支持入参       |
|-------------|
| type        |
| altitude |
| highAccuracyExpireTime        |

| 不支持返回值                 |
|------------------------|
| horizontalAccuracy          |

### getSystemInfo/getSystemInfoSync

| 不支持返回值                 |
|------------------------|
| language          |
| version      |
| SDKVersion          |
| benchmarkLevel          |
| albumAuthorized                |
| cameraAuthorized             |
| locationAuthorized          |
| microphoneAuthorized          |
| notificationAuthorized          |
| phoneCalendarAuthorized          |
| host          |
| enableDebug          |
| notificationAlertAuthorized          |
| notificationBadgeAuthorized          |
| notificationSoundAuthorized          |
| bluetoothEnabled          |
| locationEnabled          |
| wifiEnabled          |
| locationReducedAccuracy          |
| theme          |

### getDeviceInfo

| 不支持返回值                 |
|------------------------|
| benchmarkLevel          |
| abi      |
| cpuType          |


### request

| 不支持入参     |
|-----------|
| useHighPerformanceMode |
| enableHttp2 |
| enableProfile |
| enableQuic |
| enableCache |
| enableHttpDNS |
| httpDNSServiceId |
| enableChunked |
| forceCellularNetwork |
| redirect |


| 不支持返回值                 |
|------------------------|
| cookies |
| profile            |
| exception          |

### setStorage/getStorage

| 不支持入参     |
|-----------|
| encrypt |

### getStorageInfo

| 不支持返回值     |
|-----------|
| currentSize |
| limitSize |

### connectSocket

| 不支持入参     |
|-----------|
| tcpNoDelay |
| perMessageDeflate |
| timeout |
| forceCellularNetwork |

### getNetworkType

| 不支持返回值               |
|----------------------|
| signalStrength           |
| hasSystemProxy    |
