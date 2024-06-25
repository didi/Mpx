import { mergeInjectedMixins } from './injectMixins'
import mergeOptions from './mergeOptions'
import { getConvertMode } from '../convertor/getConvertMode'
import { warn, findItem } from '@mpxjs/utils'

export default function transferOptions (options, type, needConvert = true) {
  let currentInject
  // currentModuleId -> _mid
  // currentInject -> _cj
  if (global._cj && global._cj.moduleId === global._mid) {
    currentInject = global._cj
  }
  // 文件编译路径
  options.mpxFileResource = global.currentResource
  // 注入全局写入的mixins，原生模式下不进行注入
  if (!options.__nativeRender__) {
    options = mergeInjectedMixins(options, type)
  }
  if (currentInject && currentInject.injectComputed) {
    // 编译计算属性注入
    options.computed = Object.assign({}, currentInject.injectComputed, options.computed)
  }
  if (currentInject && currentInject.injectOptions) {
    // 编译option注入,优先微信中的单独配置
    options.options = Object.assign({}, currentInject.injectOptions, options.options)
  }
  if (currentInject && currentInject.pageEvents) {
    options.mixins = options.mixins || []
    // 驱动层视作用户本地逻辑，作为最后的mixin来执行
    options.mixins.push(currentInject.pageEvents)
  }
  // 转换mode
  // currentSrcMode -> _sm
  options.mpxConvertMode = options.mpxConvertMode || getConvertMode(global._sm)
  const rawOptions = mergeOptions(options, type, needConvert)

  if (currentInject && currentInject.propKeys) {
    const computedKeys = Object.keys(rawOptions.computed || {})
    // 头条和百度小程序由于props传递为异步操作，通过props向子组件传递computed数据时，子组件无法在初始时(created/attached)获取到computed数据，如需进一步处理数据建议通过watch获取
    currentInject.propKeys.forEach(key => {
      if (findItem(computedKeys, key)) {
        warn(`由于平台机制原因，子组件无法在初始时(created/attached)获取到通过props传递的计算属性[${key}]，该问题一般不影响渲染，如需进一步处理数据建议通过watch获取。`, global.currentResource)
      }
    })
  }
  return {
    rawOptions,
    currentInject
  }
}
