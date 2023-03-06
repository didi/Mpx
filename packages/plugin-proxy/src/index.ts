/* eslint-disable @typescript-eslint/no-empty-function */
import { TransformPluginContext } from 'rollup'
import { LoaderDefinition } from 'webpack'

export interface ProxyPluginContext {
  resolve(context: string, request: string): Promise<{ id: string } | null>
  addDependency(filename: string): void
  addBuildDependency(filename: string): void
  addMissingDependency(filename: string): void
  addContextDependency(filename: string): void
  cacheable(): void
  async(): any
  resource?: string
  resourcePath?: string
  sourceMap?: boolean
  warn(warn: any): void
  error(err: any): void
  emitFile(name: any, content?: string | Buffer, sourceMap?: string | undefined, assetInfo?: any): void
}

/**
 * 代理webpack loader 和 vite plugin 的上下文，并返回统一的格式
 * @param pluginContext
 * @param rollupOptions
 * @returns
 */
export function proxyPluginContext (
  pluginContext: TransformPluginContext | ThisParameterType<LoaderDefinition>,
  rollupOptions?: {
    moduleId: string
    sourceMap: boolean
  }
): ProxyPluginContext {
  if ('mode' in pluginContext) {
    return {
      resolve: (request: string, context: string) =>
        new Promise((resolve, reject) => {
          pluginContext.resolve(context, request, (err, res) => {
            if (err) return reject(err)
            resolve({
              id: res as string
            })
          })
        }),
      addDependency: pluginContext.addDependency.bind(pluginContext),
      addBuildDependency: pluginContext.addBuildDependency.bind(pluginContext),
      addMissingDependency: pluginContext.addMissingDependency.bind(pluginContext),
      addContextDependency: pluginContext.addContextDependency.bind(pluginContext),
      cacheable: pluginContext.cacheable.bind(pluginContext),
      async: pluginContext.async.bind(pluginContext),
      resource: pluginContext.resource,
      sourceMap: pluginContext.sourceMap,
      warn: pluginContext.emitWarning.bind(pluginContext),
      error: pluginContext.emitError.bind(pluginContext),
      emitFile: pluginContext.emitFile.bind(pluginContext)
    }
  } else {
    return {
      resolve: pluginContext.resolve.bind(pluginContext),
      addDependency: pluginContext.addWatchFile.bind(pluginContext),
      warn: pluginContext.warn.bind(pluginContext),
      error: pluginContext.error.bind(pluginContext),
      cacheable: function () {},
      async: function () {},
      resource: rollupOptions?.moduleId,
      sourceMap: rollupOptions?.sourceMap,
      addBuildDependency: function () {},
      addMissingDependency: function () {},
      addContextDependency: function () {},
      emitFile: pluginContext.emitFile.bind(pluginContext)
    }
  }
}
