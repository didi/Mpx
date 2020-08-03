import { error, getEnvObj, genFromMap, makeMap } from '../common/js'
import getWxToAliApi from './platform/wxToAli'

const fromMap = genFromMap()

function joinName (from = '', to = '') {
  return `${fromMap[from]}_${to}`
}

function transformApi (options) {
  const envObj = getEnvObj()
  const wxToAliApi = getWxToAliApi({ optimize: options.optimize })
  const platformMap = {
    'wx_ali': wxToAliApi,
    'qq_ali': wxToAliApi,
    'swan_ali': wxToAliApi,
    'tt_ali': wxToAliApi
  }
  const needProxy = {}
  const excludeMap = makeMap(options.exclude)
  // 后续不一定只转换ali，需要基于目标平台决定合并的自定义api集，例如输出快应用时需要定义并合并wxToQaApi
  Object.keys(envObj).concat(Object.keys(wxToAliApi)).forEach((key) => {
    if (!excludeMap[key]) {
      needProxy[key] = envObj[key] || wxToAliApi[key]
    }
  })
  const transedApi = Object.create(null)
  Object.keys(needProxy).forEach(api => {
    // 非函数不做转换
    if (typeof needProxy[api] !== 'function') {
      transedApi[api] = needProxy[api]
      return
    }

    transedApi[api] = (...args) => {
      const to = options.to
      let from = options.from

      if (args.length > 0) {
        from = args.pop()
        if (typeof from !== 'string' || !fromMap[from]) {
          args.push(from)
          from = options.from
        }
      }

      const fromTo = joinName(from, to)
      if (options.custom[fromTo] && options.custom[fromTo][api]) {
        return options.custom[fromTo][api].apply(this, args)
      } else if (
        platformMap[fromTo] &&
        platformMap[fromTo][api]
      ) {
        return platformMap[fromTo][api].apply(this, args)
      } else if (envObj[api]) {
        return envObj[api].apply(this, args)
      } else {
        error(`当前环境不存在 ${api} 方法`)
      }
    }
  })

  return transedApi
}

export default transformApi
