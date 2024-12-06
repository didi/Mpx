import DeviceInfo from 'react-native-device-info'
import { PixelRatio } from 'react-native'
import { successHandle, failHandle, defineUnsupportedProps } from '../../../common/js'
import { getWindowInfo } from './rnWindowInfo'

const getSystemInfoSync = function () {
  const windowInfo = getWindowInfo()
  const { screenWidth, screenHeight } = windowInfo

  const result = {
    brand: DeviceInfo.getBrand(),
    model: DeviceInfo.getModel(),
    system: `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`,
    platform: DeviceInfo.isEmulatorSync() ? 'emulator' : DeviceInfo.getSystemName(),
    deviceOrientation: screenWidth > screenHeight ? 'portrait' : 'landscape',
    fontSizeSetting: PixelRatio.getFontScale(),
    ...windowInfo
  }
  defineUnsupportedProps(result, [
    'language',
    'version',
    'SDKVersion',
    'benchmarkLevel',
    'albumAuthorized',
    'cameraAuthorized',
    'locationAuthorized',
    'microphoneAuthorized',
    'notificationAuthorized',
    'phoneCalendarAuthorized',
    'host',
    'enableDebug',
    'notificationAlertAuthorized',
    'notificationBadgeAuthorized',
    'notificationSoundAuthorized',
    'bluetoothEnabled',
    'locationEnabled',
    'wifiEnabled',
    'locationReducedAccuracy',
    'theme'
  ])
  return result
}

const getSystemInfo = function (options = {}) {
  const { success, fail, complete } = options
  try {
    const systemInfo = getSystemInfoSync()
    Object.assign(systemInfo, {
      errMsg: 'setStorage:ok'
    })
    successHandle(systemInfo, success, complete)
  } catch (err) {
    const result = {
      errMsg: `getSystemInfo:fail ${err}`
    }
    failHandle(result, fail, complete)
  }
}

const getDeviceInfo = function () {
  const deviceInfo = {}
  if (__mpx_mode__ === 'android') {
    const deviceAbi = DeviceInfo.supported64BitAbisSync() || []
    deviceInfo.deviceAbi = deviceAbi[0] || null
  }
  defineUnsupportedProps(deviceInfo, ['benchmarkLevel', 'abi', 'cpuType'])
  Object.assign(deviceInfo, {
    brand: DeviceInfo.getBrand(),
    model: DeviceInfo.getModel(),
    system: `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`,
    platform: DeviceInfo.isEmulatorSync() ? 'emulator' : DeviceInfo.getSystemName(),
    memorySize: DeviceInfo.getTotalMemorySync() / (1024 * 1024)
  })
  return deviceInfo
}

const getLaunchOptionsSync = function () {
  const options = global.__mpxEnterOptions || {}
  const { path, scene, query } = options
  return {
    path,
    scene,
    query
  }
}

const getEnterOptionsSync = function () {
  const result = getLaunchOptionsSync()
  return result
}

export {
  getSystemInfo,
  getSystemInfoSync,
  getDeviceInfo,
  getWindowInfo,
  getLaunchOptionsSync,
  getEnterOptionsSync
}
