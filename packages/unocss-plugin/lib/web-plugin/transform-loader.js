import { applyTransformers, isCssId } from './utils.js'
import parseComponent from '@mpxjs/webpack-plugin/lib/parser.js'
import genComponentTag from '@mpxjs/webpack-plugin/lib/utils/gen-component-tag.js'
import * as path from 'path'

async function transform (code, map) {
  const callback = this.async()
  const ctx = this._compiler.__unoCtx
  const mpx = this.getMpx()
  if (!ctx || !mpx) return callback(null, code, map)
  // 使用resourcePath而不是resource作为id，规避query的影响
  const id = this.resourcePath
  const { extract, transformCache } = ctx
  let res
  // 通过transformCache减少不必要的重复的transform/extract行为，如对于.mpx/.vue文件及其block request(template/style/script)进行重复transform/extract
  if (transformCache.has(id)) {
    res = transformCache.get(id)
  } else {
    const extname = path.extname(id)
    if (extname === '.mpx') {
      const { mode, env } = mpx
      const parts = parseComponent(code, {
        id,
        needMap: false,
        mode,
        env
      })
      let output = ''
      if (parts.styles.length) {
        await Promise.all(parts.styles.map(async (style, index) => {
          const content = style.content.trim()
          // id中添加index query避免缓存设计
          const styleRes = await applyTransformers(ctx, content, id + '.css?index=' + index)
          output += genComponentTag(style, {
            content () {
              if (styleRes) {
                return styleRes.code
              }
              return content
            }
          })
        }))
      }
      if (parts.template) {
        const content = parts.template.content.trim()
        const templateRes = await applyTransformers(ctx, content, id + '.html')
        output += genComponentTag(parts.template, {
          content () {
            if (templateRes) {
              return templateRes.code
            }
            return content
          }
        })
      }
      if (parts.script) output += genComponentTag(parts.script)
      if (parts.json) output += genComponentTag(parts.json)
      res = {
        code: output
      }
    } else {
      res = await applyTransformers(ctx, code, id)
    }

    if (!isCssId(id)) {
      await extract.call(this, res == null ? code : res.code, id)
    }
    transformCache.set(id, res)
  }

  if (res == null) {
    callback(null, code, map)
  } else if (typeof res !== 'string') {
    callback(null, res.code, map == null ? map : (res.map || map))
  } else {
    callback(null, res, map)
  }
}

export default transform
