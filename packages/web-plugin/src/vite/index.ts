import { parseRequest, stringify, stringifyObject } from '@mpxjs/compile-utils'
import createVuePlugin from '@vitejs/plugin-vue2'
import { createFilter, Plugin, UserConfig } from 'vite'
import { Options, processOptions } from '../options'
import { resolvedConfig } from './config'
import handleHotUpdate from './handle-hot-update'
import {
  APP_HELPER_CODE,
  I18N_HELPER_CODE,
  renderAppHelpCode,
  renderI18nCode,
  renderTabBarPageCode,
  TAB_BAR_PAGE_HELPER_CODE
} from './helper'
import mpxGlobal from './mpx'
import {
  customExtensionsPlugin,
  esbuildCustomExtensionsPlugin
} from './plugins/add-extensions-plugin'
import { createMpxOutSideJsPlugin } from './plugins/outside-js'
import { createResolveEntryPlugin } from './plugins/resolve-entry-plugin'
import { createSplitPackageChunkPlugin } from './plugins/split-package-chunk-plugin'
import { createWxsPlugin } from './plugins/wxs-plugin'
import { transformMain } from './transformer/main'
import { transformStyle } from './transformer/style'
import { getDescriptor } from './utils/descriptor-cache'

function createMpxWebPlugin(options: Options, userConfig?: UserConfig): Plugin {
  const { include, exclude } = options
  const filter = createFilter(include, exclude)

  return {
    name: 'vite:mpx',

    config() {
      return {
        ...userConfig,
        define: {
          global: 'globalThis', // polyfill node global
          'process.env.NODE_ENV': stringify(
            resolvedConfig.isProduction ? '"production"' : '"development"'
          ),
          ...userConfig?.define,
          ...stringifyObject(options.defs)
        }
      }
    },

    configResolved(c) {
      Object.assign(resolvedConfig, {
        base: c.base,
        sourceMap: c.command === 'build' ? !!c.build.sourcemap : true,
        isProduction: c.isProduction
      })
    },

    handleHotUpdate(ctx) {
      return handleHotUpdate(ctx)
    },

    async resolveId(id) {
      if (
        id === APP_HELPER_CODE ||
        id === I18N_HELPER_CODE ||
        id === TAB_BAR_PAGE_HELPER_CODE
      ) {
        return id
      }
    },

    load(id) {
      if (id === APP_HELPER_CODE && mpxGlobal.entry) {
        const { resourcePath: filename } = parseRequest(mpxGlobal.entry)
        const descriptor = getDescriptor(filename)
        if (descriptor) {
          return renderAppHelpCode(options, descriptor, this)
        }
      }
      if (id === TAB_BAR_PAGE_HELPER_CODE && mpxGlobal.entry) {
        const { resourcePath: filename } = parseRequest(mpxGlobal.entry)
        const descriptor = getDescriptor(filename)
        if (descriptor) {
          return renderTabBarPageCode(options, descriptor, this)
        }
      }
      if (id === I18N_HELPER_CODE) {
        return renderI18nCode(options)
      }
    },

    async transform(code, id) {
      const { queryObj: query, resourcePath: filename } = parseRequest(id)
      if (!filter(filename)) return
      if (!!query.resolve) return
      if (query.vue === undefined) {
        // mpx file => vue file
        return await transformMain(code, filename, query, options, this)
      } else {
        if (query.type === 'style') {
          // mpx style => vue style
          const descriptor = getDescriptor(filename)
          if (descriptor) {
            return await transformStyle(
              code,
              filename,
              descriptor,
              options,
              this
            )
          }
        }
        if (query.type === 'hot') {
          // 来自于热更新的请求，转换新的代码并缓存vueSfc到descriptor
          await transformMain(code, filename, query, options, this)
          return 'export default {}'
        }
      }
    }
  }
}

export default function mpx (options: Partial<Options> = {}): Plugin[] {
  const baseOptions = processOptions({ ...options })
  const { mode = '', env = '', fileConditionRules } = baseOptions
  const customExtensions = [mode, env, env && `${mode}.${env}`].filter(Boolean)
  const plugins = [
    // split subpackage chunk
    createSplitPackageChunkPlugin(),
    // add custom extensions
    customExtensionsPlugin({
      include: /@mpxjs|\.mpx/,
      fileConditionRules,
      extensions: customExtensions
    }),
    // ensure mpx entry point
    createResolveEntryPlugin(baseOptions),
    // wxs => js
    createWxsPlugin(),
    // 外联js/ts增加globalDefine
    createMpxOutSideJsPlugin(),
    // mpx => vue
    createMpxWebPlugin(baseOptions, {
      optimizeDeps: {
        esbuildOptions: {
          plugins: [
            // prebuild for addExtensions
            esbuildCustomExtensionsPlugin({
              include: /@mpxjs|api-proxy|core/,
              fileConditionRules,
              extensions: customExtensions
            })
          ]
        }
      }
    }),
    // vue support for mpxjs/rumtime
    createVuePlugin({
      include: /\.vue|\.mpx$/
    })
  ]

  return plugins
}
