const path = require('path')
const stringifyQuery = require('../utils/stringify-query')
const parseQuery = require('loader-utils').parseQuery
const addInfix = require('../utils/add-infix')
const { matchCondition } = require('../utils/match-condition')
const { JSON_JS_EXT } = require('../utils/const')

module.exports = class AddEnvPlugin {
  constructor (source, env, fileConditionRules, target) {
    this.source = source
    this.target = target
    this.env = env
    this.fileConditionRules = fileConditionRules
  }

  apply (resolver) {
    const target = resolver.ensureHook(this.target)
    const env = this.env
    resolver.getHook(this.source).tapAsync('AddEnvPlugin', (request, resolveContext, callback) => {
      if (request.env) {
        return callback()
      }
      const obj = {
        env
      }
      const resourcePath = request.path
      let extname = ''
      if (resourcePath.endsWith(JSON_JS_EXT)) {
        extname = JSON_JS_EXT
      } else {
        extname = path.extname(resourcePath)
      }
      // 当前资源没有后缀名或者路径不符合fileConditionRules规则时，直接返回
      if (!extname || !matchCondition(resourcePath, this.fileConditionRules)) return callback()
      const queryObj = parseQuery(request.query || '?')
      queryObj.infix = `${queryObj.infix || ''}.${env}`
      // css | stylus | less | sass 中 import file 过滤query，避免在对应的 loader 中无法读取到文件
      obj.query = stringifyQuery(queryObj)
      obj.path = addInfix(resourcePath, env, extname)
      obj.relativePath = request.relativePath && addInfix(request.relativePath, env, extname)
      resolver.doResolve(target, Object.assign({}, request, obj), 'add env: ' + env, resolveContext, callback)
    })
  }
}
