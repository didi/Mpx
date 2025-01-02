import WebpackSources from 'webpack-sources'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import nodePath, { dirname } from 'path'
import process from 'process'
import fs from 'fs'
import {
  createContext,
  getPath,
  normalizeAbsolutePath
} from './utils.js'
import {
  LAYER_MARK_ALL,
  LAYER_PLACEHOLDER_RE,
  RESOLVED_ID_RE,
  getLayerPlaceholder,
  resolveId,
  resolveLayer
} from './consts.js'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PLUGIN_NAME = 'unocss:webpack'
const VIRTUAL_MODULE_PREFIX = nodePath.resolve(process.cwd(), '_virtual_')

function WebpackPlugin (configOrPath, defaults) {
  return {
    apply (compiler) {
      const entries = new Set()
      const __vfsModules = new Set()
      let __vfs = null
      for (const plugin of compiler.options.plugins) {
        if (plugin instanceof VirtualModulesPlugin) {
          __vfs = plugin
          break
        }
      }
      if (!__vfs) {
        __vfs = new VirtualModulesPlugin()
        compiler.options.plugins.push(__vfs)
      }

      // 添加解析虚拟模块插件 import 'uno.css' 并且注入layer代码
      const resolverPlugin = {
        apply (resolver) {
          const target = resolver.ensureHook('resolve')

          resolver
            .getHook('resolve')
            .tapAsync(PLUGIN_NAME, async (request, resolveContext, callback) => {
              if (!request.request || normalizeAbsolutePath(request.request).startsWith(VIRTUAL_MODULE_PREFIX)) { return callback() }

              const id = normalizeAbsolutePath(request.request)
              let resolved = resolveId(id)
              if (!resolved || resolved === id) {
                return callback()
              }
              let query = ''
              const queryIndex = id.indexOf('?')
              if (queryIndex >= 0) {
                query = id.slice(queryIndex)
              }
              entries.add(resolved)
              resolved = resolved + query

              if (!fs.existsSync(resolved)) {
                resolved = normalizeAbsolutePath(
                  VIRTUAL_MODULE_PREFIX +
                  encodeURIComponent(resolved)
                )
                if (!__vfsModules.has(resolved)) {
                  const layer = getLayer(id)
                  __vfs.writeModule(resolved, getLayerPlaceholder(layer))
                  __vfsModules.add(resolved)
                }
              }
              const newRequest = {
                ...request,
                request: resolved
              }
              resolver.doResolve(target, newRequest, null, resolveContext, callback)
            })
        }
      }
      compiler.options.resolve.plugins = compiler.options.resolve.plugins || []
      compiler.options.resolve.plugins.push(resolverPlugin)
      // transform 提取tokens
      compiler.options.module.rules.unshift({
        enforce: 'pre',
        use: (data) => {
          if (data.resource == null) { return [] }

          const id = normalizeAbsolutePath(data.resource + (data.resourceQuery || ''))
          if (compiler.__unoCtx.filter('', id) && !id.match(/\.html$/) && !RESOLVED_ID_RE.test(id)) {
            return [{
              loader: nodePath.resolve(__dirname, './transform-loader')
            }]
          }

          return []
        }
      })

      compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.hooks.optimizeAssets.tapPromise(PLUGIN_NAME, async () => {
          const ctx = compiler.__unoCtx
          const uno = ctx.uno
          // 清空transformCache避免watch修改不生效
          ctx.transformCache.clear()
          const tokens = new Set()
          for (const module of compilation.modules) {
            const assetsInfo = module.buildInfo.assetsInfo || new Map()
            for (const [, { unocssTokens } = {}] of assetsInfo) {
              if (unocssTokens) {
                for (const token of unocssTokens) {
                  tokens.add(token)
                }
              }
            }
          }
          const result = await uno.generate(tokens, { minify: true })
          const files = Object.keys(compilation.assets)
          for (const file of files) {
            if (file === '*') { return }
            let code = compilation.assets[file].source().toString()
            let replaced = false
            code = code.replace(LAYER_PLACEHOLDER_RE, (_, quote, layer) => {
              replaced = true
              const css = layer === LAYER_MARK_ALL ? result.getLayers(undefined, Array.from(entries).map((i) => resolveLayer(i)).filter((i) => !!i)) : result.getLayer(layer) || ''
              if (!quote) { return css }
              let escaped = JSON.stringify(css).slice(1, -1)
              if (quote === '\\"') { escaped = JSON.stringify(escaped).slice(1, -1) }
              return quote + escaped
            })
            if (replaced) { compilation.assets[file] = new WebpackSources.RawSource(code) }
          }
        })
      })

      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        const mpx = compilation.__mpx__
        mpx.unoCtx = compiler.__unoCtx.uno
      })

      compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async (compilation) => {
        const ctx = await createContext(configOrPath, defaults)
        compiler.__unoCtx = ctx
        return ctx
      })
    }
  }
}

function getLayer (id) {
  let layer = resolveLayer(getPath(id))
  if (!layer) {
    const entry = resolveId(id)
    if (entry) { layer = resolveLayer(entry) }
  }
  return layer
}

export {
  WebpackPlugin as UnoCSSWebpackPlugin
}
