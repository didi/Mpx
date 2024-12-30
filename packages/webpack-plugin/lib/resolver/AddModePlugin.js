const path = require('path')
const stringifyQuery = require('../utils/stringify-query')
const parseQuery = require('loader-utils').parseQuery
const { matchCondition } = require('../utils/match-condition')
const addInfix = require('../utils/add-infix')
const { JSON_JS_EXT } = require('../utils/const')

module.exports = class AddModePlugin {
  constructor (source, mode, options, target) {
    this.source = source
    this.target = target
    this.mode = mode
    this.options = options
  }

  apply (resolver) {
    const target = resolver.ensureHook(this.target)
    const { options = {}, mode } = this
    const { defaultMode, fileConditionRules, implicitMode } = options
    resolver.getHook(this.source).tapAsync('AddModePlugin', (request, resolveContext, callback) => {
      if (request.mode || request.env) {
        return callback()
      }
      const obj = {
        mode
      }
      const resourcePath = request.path
      let extname = ''
      if (resourcePath.endsWith(JSON_JS_EXT)) {
        extname = JSON_JS_EXT
      } else {
        extname = path.extname(resourcePath)
      }
      // 当前资源没有后缀名或者路径不符合fileConditionRules规则时，直接返回
      if (!extname || !matchCondition(resourcePath, fileConditionRules)) return callback()
      const queryObj = parseQuery(request.query || '?')
      const queryInfix = queryObj.infix
      if (!implicitMode) queryObj.mode = mode
      queryObj.infix = `${queryInfix || ''}.${mode}`
      obj.query = stringifyQuery(queryObj)
      obj.path = addInfix(resourcePath, mode, extname)
      obj.relativePath = request.relativePath && addInfix(request.relativePath, mode, extname)
      resolver.doResolve(target, Object.assign({}, request, obj), 'add mode: ' + mode, resolveContext, (err, result) => {
        if (defaultMode && !result) {
          queryObj.infix = `${queryInfix || ''}.${defaultMode}`
          // css | stylus | less | sass 中 import file 过滤query，避免在对应的 loader 中无法读取到文件
          obj.query = stringifyQuery(queryObj)
          obj.path = addInfix(resourcePath, defaultMode, extname)
          resolver.doResolve(target, Object.assign({}, request, obj), 'add mode: ' + defaultMode, resolveContext, (err, result) => {
            callback(err, result)
          })
          return
        }
        callback(err, result)
      })
    })
  }
}
