import {changeOpts, error, getEnvObj, handleSuccess, warn} from '../../../common/js'

const ALI_OBJ = getEnvObj()
const TIPS_NAME = '支付宝环境 mpx'

function getUserInfo (options = {}) {
  if (options.withCredentials === true) {
    warn(`支付宝不支持在 ${TIPS_NAME}.getUserInfo 使用 withCredentials 参数中获取等敏感信息`)
  }
  if (options.lang) {
    warn(`支付宝不支持在 ${TIPS_NAME}.getUserInfo 中使用 lang 参数`)
  }

  ALI_OBJ.getOpenUserInfo(options)
}

export {
  getUserInfo
}
