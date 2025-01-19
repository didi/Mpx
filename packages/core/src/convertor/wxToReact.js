import {
  error,
  isDev
} from '@mpxjs/utils'
import { implemented } from '../core/implement'

// 暂不支持的wx选项，后期需要各种花式支持
const unsupported = ['moved', 'definitionFilter']

function convertErrorDesc (key) {
  error(`Options.${key} is not supported in runtime conversion from wx to react native.`, global.currentResource)
}

function notSupportTip (options) {
  unsupported.forEach(key => {
    if (options[key]) {
      if (!implemented[key]) {
        isDev && convertErrorDesc(key)
        delete options[key]
      } else if (implemented[key].remove) {
        delete options[key]
      }
    }
  })
}

export default {
  convert (options) {
    notSupportTip(options)
  }
}
