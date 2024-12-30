'use strict'

const path = require('path')
const { ConcatSource, RawSource } = require('webpack').sources
const ResolveDependency = require('./dependencies/ResolveDependency')
const InjectDependency = require('./dependencies/InjectDependency')
const ReplaceDependency = require('./dependencies/ReplaceDependency')
const NullFactory = require('webpack/lib/NullFactory')
const CommonJsVariableDependency = require('./dependencies/CommonJsVariableDependency')
const CommonJsAsyncDependency = require('./dependencies/CommonJsAsyncDependency')
const CommonJsExtractDependency = require('./dependencies/CommonJsExtractDependency')
const NormalModule = require('webpack/lib/NormalModule')
const EntryPlugin = require('webpack/lib/EntryPlugin')
const JavascriptModulesPlugin = require('webpack/lib/javascript/JavascriptModulesPlugin')
const FlagEntryExportAsUsedPlugin = require('webpack/lib/FlagEntryExportAsUsedPlugin')
const FileSystemInfo = require('webpack/lib/FileSystemInfo')
const ImportDependency = require('webpack/lib/dependencies/ImportDependency')
const ImportDependencyTemplate = require('./dependencies/ImportDependencyTemplate')
const AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock')
const normalize = require('./utils/normalize')
const toPosix = require('./utils/to-posix')
const addQuery = require('./utils/add-query')
const hasOwn = require('./utils/has-own')
const { every } = require('./utils/set')
const DefinePlugin = require('webpack/lib/DefinePlugin')
const ExternalsPlugin = require('webpack/lib/ExternalsPlugin')
const AddModePlugin = require('./resolver/AddModePlugin')
const AddEnvPlugin = require('./resolver/AddEnvPlugin')
const PackageEntryPlugin = require('./resolver/PackageEntryPlugin')
const DynamicRuntimePlugin = require('./resolver/DynamicRuntimePlugin')
const FixDescriptionInfoPlugin = require('./resolver/FixDescriptionInfoPlugin')
// const CommonJsRequireDependency = require('webpack/lib/dependencies/CommonJsRequireDependency')
// const HarmonyImportSideEffectDependency = require('webpack/lib/dependencies/HarmonyImportSideEffectDependency')
// const RequireHeaderDependency = require('webpack/lib/dependencies/RequireHeaderDependency')
// const RemovedModuleDependency = require('./dependencies/RemovedModuleDependency')
const AppEntryDependency = require('./dependencies/AppEntryDependency')
const RecordResourceMapDependency = require('./dependencies/RecordResourceMapDependency')
const RecordGlobalComponentsDependency = require('./dependencies/RecordGlobalComponentsDependency')
const RecordIndependentDependency = require('./dependencies/RecordIndependentDependency')
const DynamicEntryDependency = require('./dependencies/DynamicEntryDependency')
const FlagPluginDependency = require('./dependencies/FlagPluginDependency')
const RemoveEntryDependency = require('./dependencies/RemoveEntryDependency')
const RecordLoaderContentDependency = require('./dependencies/RecordLoaderContentDependency')
const RecordRuntimeInfoDependency = require('./dependencies/RecordRuntimeInfoDependency')
const SplitChunksPlugin = require('webpack/lib/optimize/SplitChunksPlugin')
const fixRelative = require('./utils/fix-relative')
const parseRequest = require('./utils/parse-request')
const { matchCondition } = require('./utils/match-condition')
const processDefs = require('./utils/process-defs')
const config = require('./config')
const hash = require('hash-sum')
const nativeLoaderPath = normalize.lib('native-loader')
const wxssLoaderPath = normalize.lib('wxss/index')
const wxmlLoaderPath = normalize.lib('wxml/loader')
const wxsLoaderPath = normalize.lib('wxs/loader')
const styleCompilerPath = normalize.lib('style-compiler/index')
const styleStripConditaionalPath = normalize.lib('style-compiler/strip-conditional-loader')
const templateCompilerPath = normalize.lib('template-compiler/index')
const jsonCompilerPath = normalize.lib('json-compiler/index')
const jsonThemeCompilerPath = normalize.lib('json-compiler/theme')
const jsonPluginCompilerPath = normalize.lib('json-compiler/plugin')
const extractorPath = normalize.lib('extractor')
const selectorPath = normalize.lib('selector')
const async = require('async')
const { parseQuery } = require('loader-utils')
const stringifyLoadersAndResource = require('./utils/stringify-loaders-resource')
const emitFile = require('./utils/emit-file')
const { MPX_PROCESSED_FLAG, MPX_DISABLE_EXTRACTOR_CACHE, MPX_APP_MODULE_ID } = require('./utils/const')
const isEmptyObject = require('./utils/is-empty-object')
const DynamicPlugin = require('./resolver/DynamicPlugin')
const { isReact, isWeb } = require('./utils/env')
const VirtualModulesPlugin = require('webpack-virtual-modules')
require('./utils/check-core-version-match')

const isProductionLikeMode = options => {
  return options.mode === 'production' || !options.mode
}

const isStaticModule = module => {
  if (!module.resource) return false
  const { queryObj } = parseRequest(module.resource)
  let isStatic = queryObj.isStatic || false
  if (module.loaders) {
    for (const loader of module.loaders) {
      if (/(url-loader|file-loader)/.test(loader.loader)) {
        isStatic = true
        break
      }
    }
  }
  return isStatic
}

const outputFilename = '[name].js'
const publicPath = '/'

const isChunkInPackage = (chunkName, packageName) => {
  return (new RegExp(`^${packageName}\\/`)).test(chunkName)
}

const externalsMap = {
  weui: /^weui-miniprogram/
}

const warnings = []
const errors = []

class EntryNode {
  constructor (module, type) {
    this.module = module
    this.type = type
    this.parents = new Set()
    this.children = new Set()
  }

  addChild (node) {
    this.children.add(node)
    node.parents.add(this)
  }
}

class MpxWebpackPlugin {
  constructor (options = {}) {
    options.mode = options.mode || 'wx'
    options.env = options.env || ''
    options.srcMode = options.srcMode || options.mode
    if (options.mode !== options.srcMode && options.srcMode !== 'wx') {
      errors.push('MpxWebpackPlugin supports srcMode to be "wx" only temporarily!')
    }
    if (isWeb(options.mode) && options.srcMode !== 'wx') {
      errors.push('MpxWebpackPlugin supports mode to be "web" only when srcMode is set to "wx"!')
    }
    if (isReact(options.mode) && options.srcMode !== 'wx') {
      errors.push('MpxWebpackPlugin supports mode to be "ios" or "android" only when srcMode is set to "wx"!')
    }
    if (options.dynamicComponentRules && !options.dynamicRuntime) {
      errors.push('Please make sure you have set dynamicRuntime true in mpx webpack plugin config because you have use the dynamic runtime feature.')
    }
    options.externalClasses = options.externalClasses || ['custom-class', 'i-class']
    options.resolveMode = options.resolveMode || 'webpack'
    options.writeMode = options.writeMode || 'changed'
    options.autoScopeRules = options.autoScopeRules || {}
    options.autoVirtualHostRules = options.autoVirtualHostRules || {}
    options.customTextRules = options.customTextRules || {}
    options.forceDisableProxyCtor = options.forceDisableProxyCtor || false
    options.transMpxRules = options.transMpxRules || {
      include: () => true
    }
    // 通过默认defs配置实现mode及srcMode的注入，简化内部处理逻辑
    options.defs = Object.assign({}, options.defs, {
      __mpx_mode__: options.mode,
      __mpx_src_mode__: options.srcMode,
      __mpx_env__: options.env,
      __mpx_dynamic_runtime__: options.dynamicRuntime
    })
    // 批量指定源码mode
    options.modeRules = options.modeRules || {}
    options.generateBuildMap = options.generateBuildMap || false
    options.attributes = options.attributes || []
    options.externals = (options.externals || []).map((external) => {
      return externalsMap[external] || external
    })
    options.projectRoot = options.projectRoot || process.cwd()
    options.forceUsePageCtor = options.forceUsePageCtor || false
    options.postcssInlineConfig = options.postcssInlineConfig || {}
    options.transRpxRules = options.transRpxRules || null
    options.auditResource = options.auditResource || false
    options.decodeHTMLText = options.decodeHTMLText || false
    options.i18n = options.i18n || null
    options.checkUsingComponentsRules = options.checkUsingComponentsRules || (options.checkUsingComponents ? { include: () => true } : { exclude: () => true })
    options.reportSize = options.reportSize || null
    options.pathHashMode = options.pathHashMode || 'absolute'
    options.forceDisableBuiltInLoader = options.forceDisableBuiltInLoader || false
    options.useRelativePath = options.useRelativePath || false
    options.subpackageModulesRules = options.subpackageModulesRules || {}
    options.forceMainPackageRules = options.forceMainPackageRules || {}
    options.forceProxyEventRules = options.forceProxyEventRules || {}
    options.disableRequireAsync = options.disableRequireAsync || false
    options.miniNpmPackages = options.miniNpmPackages || []
    options.fileConditionRules = options.fileConditionRules || {
      include: () => true
    }
    options.customOutputPath = options.customOutputPath || null
    options.customComponentModuleId = options.customComponentModuleId || null
    options.nativeConfig = Object.assign({
      cssLangs: ['css', 'less', 'stylus', 'scss', 'sass']
    }, options.nativeConfig)
    options.webConfig = options.webConfig || {}
    options.rnConfig = options.rnConfig || {}
    options.partialCompileRules = options.partialCompileRules || null
    options.asyncSubpackageRules = options.asyncSubpackageRules || []
    options.optimizeRenderRules = options.optimizeRenderRules ? (Array.isArray(options.optimizeRenderRules) ? options.optimizeRenderRules : [options.optimizeRenderRules]) : []
    options.retryRequireAsync = options.retryRequireAsync || false
    options.optimizeSize = options.optimizeSize || false
    options.dynamicComponentRules = options.dynamicComponentRules || {}// 运行时组件配置
    this.options = options
    // Hack for buildDependencies
    const rawResolveBuildDependencies = FileSystemInfo.prototype.resolveBuildDependencies
    FileSystemInfo.prototype.resolveBuildDependencies = function (context, deps, rawCallback) {
      return rawResolveBuildDependencies.call(this, context, deps, (err, result) => {
        if (result && typeof options.hackResolveBuildDependencies === 'function') options.hackResolveBuildDependencies(result)
        return rawCallback(err, result)
      })
    }
  }

  static loader (options = {}) {
    if (options.transRpx) {
      warnings.push('Mpx loader option [transRpx] is deprecated now, please use mpx webpack plugin config [transRpxRules] instead!')
    }
    return {
      loader: normalize.lib('loader'),
      options
    }
  }

  static nativeLoader (options = {}) {
    return {
      loader: nativeLoaderPath,
      options
    }
  }

  static wxssLoader (options) {
    return {
      loader: normalize.lib('wxss/index'),
      options
    }
  }

  static wxmlLoader (options) {
    return {
      loader: normalize.lib('wxml/loader'),
      options
    }
  }

  static pluginLoader (options = {}) {
    return {
      loader: normalize.lib('json-compiler/plugin'),
      options
    }
  }

  static wxsPreLoader (options = {}) {
    return {
      loader: normalize.lib('wxs/pre-loader'),
      options
    }
  }

  static urlLoader (options = {}) {
    return {
      loader: normalize.lib('url-loader'),
      options
    }
  }

  static fileLoader (options = {}) {
    return {
      loader: normalize.lib('file-loader'),
      options
    }
  }

  static getPageEntry (request) {
    return addQuery(request, { isPage: true })
  }

  static getComponentEntry (request) {
    return addQuery(request, { isComponent: true })
  }

  static getNativeEntry (request) {
    return `!!${nativeLoaderPath}!${request}`
  }

  static getPluginEntry (request) {
    return addQuery(request, {
      mpx: true,
      extract: true,
      isPlugin: true,
      asScript: true,
      type: 'json'
    })
  }

  runModeRules (data) {
    const { resourcePath, queryObj } = parseRequest(data.resource)
    if (queryObj.mode) {
      return
    }
    const mode = this.options.mode
    const modeRule = this.options.modeRules[mode]
    if (!modeRule) {
      return
    }
    if (matchCondition(resourcePath, modeRule)) {
      data.resource = addQuery(data.resource, { mode })
      data.request = addQuery(data.request, { mode })
    }
  }

  apply (compiler) {
    if (!compiler.__mpx__) {
      compiler.__mpx__ = true
    } else {
      errors.push('Multiple MpxWebpackPlugin instances exist in webpack compiler, please check webpack plugins config!')
    }

    // 将entry export标记为used且不可mangle，避免require.async生成的js chunk在生产环境下报错
    new FlagEntryExportAsUsedPlugin(true, 'entry').apply(compiler)

    let __vfs = null
    if (isWeb(this.options.mode)) {
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
    }

    if (!isWeb(this.options.mode) && !isReact(this.options.mode)) {
      // 强制设置publicPath为'/'
      if (compiler.options.output.publicPath && compiler.options.output.publicPath !== publicPath) {
        warnings.push(`webpack options: MpxWebpackPlugin accept options.output.publicPath to be ${publicPath} only, custom options.output.publicPath will be ignored!`)
      }
      compiler.options.output.publicPath = publicPath
      if (compiler.options.output.filename && compiler.options.output.filename !== outputFilename) {
        warnings.push(`webpack options: MpxWebpackPlugin accept options.output.filename to be ${outputFilename} only, custom options.output.filename will be ignored!`)
      }
      compiler.options.output.filename = compiler.options.output.chunkFilename = outputFilename
      if (this.options.optimizeSize && isProductionLikeMode(compiler.options)) {
        compiler.options.optimization.chunkIds = 'total-size'
        compiler.options.optimization.moduleIds = 'natural'
        compiler.options.optimization.mangleExports = 'size'
        compiler.options.output.globalObject = 'g'
        // todo chunkLoadingGlobal不具备项目唯一性，在多构建产物混编时可能存在问题，尤其在支付宝使用全局对象传递的情况下
        compiler.options.output.chunkLoadingGlobal = 'c'
      }
    }

    if (!compiler.options.node || !compiler.options.node.global) {
      compiler.options.node = compiler.options.node || {}
      compiler.options.node.global = true
    }

    const addModeOptions = {
      fileConditionRules: this.options.fileConditionRules
    }
    const mode = this.options.mode
    if (mode === 'web' || mode === 'ios' || mode === 'android' || mode === 'harmony') {
      // 'web' | 'ios' | 'android' | 'harmony' 下，使用implicitMode强制进行平台转换
      addModeOptions.implicitMode = true
    }
    if (mode === 'android' || mode === 'harmony') {
      // 'android' | 'harmony' 下，使用 mode = 'ios' 进行兼容兜底
      addModeOptions.defaultMode = 'ios'
    }
    const addModePlugin = new AddModePlugin('before-file', this.options.mode, addModeOptions, 'file')
    const addEnvPlugin = new AddEnvPlugin('before-file', this.options.env, this.options.fileConditionRules, 'file')
    const packageEntryPlugin = new PackageEntryPlugin('before-file', this.options.miniNpmPackages, 'file')
    const dynamicPlugin = new DynamicPlugin('result', this.options.dynamicComponentRules)

    if (Array.isArray(compiler.options.resolve.plugins)) {
      compiler.options.resolve.plugins.push(addModePlugin)
    } else {
      compiler.options.resolve.plugins = [addModePlugin]
    }
    if (this.options.env) {
      compiler.options.resolve.plugins.push(addEnvPlugin)
    }
    if (this.options.dynamicRuntime) {
      compiler.options.resolve.plugins.push(new DynamicRuntimePlugin('before-file', 'file'))
    }
    compiler.options.resolve.plugins.push(packageEntryPlugin)
    compiler.options.resolve.plugins.push(new FixDescriptionInfoPlugin())
    compiler.options.resolve.plugins.push(dynamicPlugin)

    const optimization = compiler.options.optimization
    if (!isWeb(this.options.mode) && !isReact(this.options.mode)) {
      optimization.runtimeChunk = {
        name: (entrypoint) => {
          for (const packageName in mpx.independentSubpackagesMap) {
            if (hasOwn(mpx.independentSubpackagesMap, packageName) && isChunkInPackage(entrypoint.name, packageName)) {
              return `${packageName}/bundle`
            }
          }
          return 'bundle'
        }
      }
    }

    let splitChunksOptions = null
    let splitChunksPlugin = null
    // 输出web ssr需要将optimization.splitChunks设置为false以关闭splitChunks
    if (optimization.splitChunks !== false && !isReact(this.options.mode)) {
      splitChunksOptions = Object.assign({
        chunks: 'all',
        usedExports: optimization.usedExports === true,
        minChunks: 1,
        minSize: 1000,
        enforceSizeThreshold: Infinity,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '-',
        cacheGroups: {}
      }, optimization.splitChunks)
      splitChunksOptions.defaultSizeTypes = ['javascript', 'unknown']
      delete optimization.splitChunks
      splitChunksPlugin = new SplitChunksPlugin(splitChunksOptions)
      splitChunksPlugin.apply(compiler)
    }

    // 代理writeFile
    if (this.options.writeMode === 'changed') {
      const writedFileContentMap = new Map()
      const originalWriteFile = compiler.outputFileSystem.writeFile
      // fs.writeFile(file, data[, options], callback)
      compiler.outputFileSystem.writeFile = (filePath, content, ...args) => {
        const lastContent = writedFileContentMap.get(filePath)
        if (Buffer.isBuffer(lastContent) ? lastContent.equals(content) : lastContent === content) {
          const callback = args[args.length - 1]
          if (typeof callback === 'function') {
            callback()
          }
          return
        }
        writedFileContentMap.set(filePath, content)
        originalWriteFile(filePath, content, ...args)
      }
    }

    const defs = this.options.defs

    const typeExtMap = config[this.options.mode].typeExtMap

    const defsOpt = {
      __mpx_wxs__: DefinePlugin.runtimeValue(({ module }) => {
        return JSON.stringify(!!module.wxs)
      })
    }

    Object.keys(defs).forEach((key) => {
      defsOpt[key] = JSON.stringify(defs[key])
    })

    // define mode & defs
    new DefinePlugin(defsOpt).apply(compiler)

    new ExternalsPlugin('commonjs2', this.options.externals).apply(compiler)

    let mpx

    if (this.options.partialCompileRules) {
      function isResolvingPage (obj) {
        // valid query should start with '?'
        const query = parseQuery(obj.query || '?')
        return query.isPage && !query.type
      }

      // new PartialCompilePlugin(this.options.partialCompile).apply(compiler)
      compiler.resolverFactory.hooks.resolver.intercept({
        factory: (type, hook) => {
          hook.tap('MpxPartialCompilePlugin', (resolver) => {
            resolver.hooks.result.tapAsync({
              name: 'MpxPartialCompilePlugin',
              stage: -100
            }, (obj, resolverContext, callback) => {
              if (obj.path.startsWith(require.resolve('./runtime/components/wx/default-page.mpx'))) {
                return callback(null, obj)
              }
              if (isResolvingPage(obj) && !matchCondition(obj.path, this.options.partialCompileRules)) {
                const infix = obj.query ? '&' : '?'
                obj.query += `${infix}resourcePath=${obj.path}`
                obj.path = require.resolve('./runtime/components/wx/default-page.mpx')
              }
              callback(null, obj)
            })
          })
          return hook
        }
      })
    }

    const getPackageCacheGroup = packageName => {
      if (packageName === 'main') {
        return {
          // 对于独立分包模块不应用该cacheGroup
          test: (module) => {
            let isIndependent = false
            if (module.resource) {
              const { queryObj } = parseRequest(module.resource)
              isIndependent = !!queryObj.independent
            } else {
              const identifier = module.identifier()
              isIndependent = /\|independent=/.test(identifier)
            }
            return !isIndependent
          },
          name: 'bundle',
          minChunks: 2,
          chunks: 'all'
        }
      } else {
        return {
          test: (module, { chunkGraph }) => {
            const chunks = chunkGraph.getModuleChunksIterable(module)
            return chunks.size && every(chunks, (chunk) => {
              return isChunkInPackage(chunk.name, packageName)
            })
          },
          name: `${packageName}/bundle`,
          minChunks: 2,
          priority: 100,
          chunks: 'all'
        }
      }
    }

    const processSubpackagesEntriesMap = (subPackageEntriesType, compilation, callback) => {
      const mpx = compilation.__mpx__
      if (mpx && !isEmptyObject(mpx[subPackageEntriesType])) {
        const subpackagesEntriesMap = mpx[subPackageEntriesType]
        // 执行分包队列前清空 mpx[subPackageEntriesType]
        mpx[subPackageEntriesType] = {}
        async.eachOfSeries(subpackagesEntriesMap, (deps, packageRoot, callback) => {
          mpx.currentPackageRoot = packageRoot
          mpx.componentsMap[packageRoot] = mpx.componentsMap[packageRoot] || {}
          mpx.staticResourcesMap[packageRoot] = mpx.staticResourcesMap[packageRoot] || {}
          mpx.subpackageModulesMap[packageRoot] = mpx.subpackageModulesMap[packageRoot] || {}
          async.each(deps, (dep, callback) => {
            dep.addEntry(compilation, (err, result) => {
              if (err) return callback(err)
              dep.resultPath = mpx.replacePathMap[dep.key] = result.resultPath
              callback()
            })
          }, callback)
        }, (err) => {
          if (err) return callback(err)
          // 如果执行完当前队列后产生了新的分包执行队列（一般由异步分包组件造成），则继续执行
          processSubpackagesEntriesMap(subPackageEntriesType, compilation, callback)
        })
      } else {
        callback()
      }
    }

    const checkDynamicEntryInfo = (compilation) => {
      for (const packageName in mpx.dynamicEntryInfo) {
        const entryMap = mpx.dynamicEntryInfo[packageName]
        if (packageName !== 'main' && !entryMap.hasPage) {
          // 引用未注册分包的所有资源
          const resources = entryMap.entries.map(info => info.resource).join(',')
          compilation.errors.push(new Error(`资源${resources}通过分包异步声明为${packageName}分包, 但${packageName}分包未注册或不存在相关页面！`))
        }
      }
    }
    // 构建分包队列，在finishMake钩子当中最先执行，stage传递-1000
    compiler.hooks.finishMake.tapAsync({
      name: 'MpxWebpackPlugin',
      stage: -1000
    }, (compilation, callback) => {
      async.series([
        (callback) => {
          processSubpackagesEntriesMap('subpackagesEntriesMap', compilation, callback)
        },
        (callback) => {
          processSubpackagesEntriesMap('postSubpackageEntriesMap', compilation, callback)
        }
      ], (err) => {
        if (err) return callback(err)
        if (mpx.supportRequireAsync && mpx.mode !== 'tt') {
          // 字节小程序异步分包中不能包含page，忽略该检查
          checkDynamicEntryInfo(compilation)
        }
        callback()
      })
    })

    compiler.hooks.compilation.tap({
      name: 'MpxWebpackPlugin',
      stage: 100
    }, (compilation, { normalModuleFactory }) => {
      NormalModule.getCompilationHooks(compilation).loader.tap('MpxWebpackPlugin', (loaderContext) => {
        // 设置loaderContext的minimize
        if (isProductionLikeMode(compiler.options)) {
          loaderContext.minimize = true
        }

        loaderContext.getMpx = () => {
          return mpx
        }
      })
      compilation.dependencyFactories.set(ResolveDependency, new NullFactory())
      compilation.dependencyTemplates.set(ResolveDependency, new ResolveDependency.Template())

      compilation.dependencyFactories.set(InjectDependency, new NullFactory())
      compilation.dependencyTemplates.set(InjectDependency, new InjectDependency.Template())

      compilation.dependencyFactories.set(ReplaceDependency, new NullFactory())
      compilation.dependencyTemplates.set(ReplaceDependency, new ReplaceDependency.Template())

      compilation.dependencyFactories.set(AppEntryDependency, new NullFactory())
      compilation.dependencyTemplates.set(AppEntryDependency, new AppEntryDependency.Template())

      compilation.dependencyFactories.set(DynamicEntryDependency, new NullFactory())
      compilation.dependencyTemplates.set(DynamicEntryDependency, new DynamicEntryDependency.Template())

      compilation.dependencyFactories.set(FlagPluginDependency, new NullFactory())
      compilation.dependencyTemplates.set(FlagPluginDependency, new FlagPluginDependency.Template())

      compilation.dependencyFactories.set(RemoveEntryDependency, new NullFactory())
      compilation.dependencyTemplates.set(RemoveEntryDependency, new RemoveEntryDependency.Template())

      compilation.dependencyFactories.set(RecordResourceMapDependency, new NullFactory())
      compilation.dependencyTemplates.set(RecordResourceMapDependency, new RecordResourceMapDependency.Template())

      compilation.dependencyFactories.set(RecordGlobalComponentsDependency, new NullFactory())
      compilation.dependencyTemplates.set(RecordGlobalComponentsDependency, new RecordGlobalComponentsDependency.Template())

      compilation.dependencyFactories.set(RecordIndependentDependency, new NullFactory())
      compilation.dependencyTemplates.set(RecordIndependentDependency, new RecordIndependentDependency.Template())

      compilation.dependencyFactories.set(CommonJsVariableDependency, normalModuleFactory)
      compilation.dependencyTemplates.set(CommonJsVariableDependency, new CommonJsVariableDependency.Template())

      compilation.dependencyFactories.set(CommonJsAsyncDependency, normalModuleFactory)
      compilation.dependencyTemplates.set(CommonJsAsyncDependency, new CommonJsAsyncDependency.Template())

      compilation.dependencyFactories.set(CommonJsExtractDependency, normalModuleFactory)
      compilation.dependencyTemplates.set(CommonJsExtractDependency, new CommonJsExtractDependency.Template())

      compilation.dependencyFactories.set(RecordLoaderContentDependency, new NullFactory())
      compilation.dependencyTemplates.set(RecordLoaderContentDependency, new RecordLoaderContentDependency.Template())

      compilation.dependencyFactories.set(RecordRuntimeInfoDependency, new NullFactory())
      compilation.dependencyTemplates.set(RecordRuntimeInfoDependency, new RecordRuntimeInfoDependency.Template())

      compilation.dependencyTemplates.set(ImportDependency, new ImportDependencyTemplate())
    })

    compiler.hooks.thisCompilation.tap('MpxWebpackPlugin', (compilation, { normalModuleFactory }) => {
      compilation.warnings.push(...warnings)
      compilation.errors.push(...errors)
      const moduleGraph = compilation.moduleGraph

      if (!compilation.__mpx__) {
        // init mpx
        mpx = compilation.__mpx__ = {
          // 用于使用webpack-virtual-modules功能，目前仅输出web时下支持使用
          __vfs,
          // app信息，便于获取appName
          appInfo: {},
          // pages全局记录，无需区分主包分包
          pagesMap: {},
          // 组件资源记录，依照所属包进行记录
          componentsMap: {
            main: {}
          },
          // 静态资源(图片，字体，独立样式)等，依照所属包进行记录
          staticResourcesMap: {
            main: {}
          },
          // 用于记录命中subpackageModulesRules的js模块分包归属，用于js多分包冗余输出
          subpackageModulesMap: {
            main: {}
          },
          // 记录其他资源，如pluginMain、pluginExport，无需区分主包分包
          otherResourcesMap: {},
          // 记录独立分包
          independentSubpackagesMap: {},
          subpackagesEntriesMap: {},
          postSubpackageEntriesMap: {},
          replacePathMap: {},
          exportModules: new Set(),
          // 记录动态添加入口的分包信息
          dynamicEntryInfo: {},
          // 记录entryModule与entryNode的对应关系，用于体积分析
          entryNodeModulesMap: new Map(),
          // 记录与asset相关联的modules，用于体积分析
          assetsModulesMap: new Map(),
          // 记录与asset相关联的ast，用于体积分析和esCheck，避免重复parse
          assetsASTsMap: new Map(),
          globalComponents: {},
          globalComponentsInfo: {},
          // todo es6 map读写性能高于object，之后会逐步替换
          wxsAssetsCache: new Map(),
          addEntryPromiseMap: new Map(),
          currentPackageRoot: '',
          wxsContentMap: {},
          forceUsePageCtor: this.options.forceUsePageCtor,
          resolveMode: this.options.resolveMode,
          mode: this.options.mode,
          srcMode: this.options.srcMode,
          env: this.options.env,
          externalClasses: this.options.externalClasses,
          projectRoot: this.options.projectRoot,
          autoScopeRules: this.options.autoScopeRules,
          autoVirtualHostRules: this.options.autoVirtualHostRules,
          customTextRules: this.options.customTextRules,
          transRpxRules: this.options.transRpxRules,
          postcssInlineConfig: this.options.postcssInlineConfig,
          decodeHTMLText: this.options.decodeHTMLText,
          // native文件专用配置
          nativeConfig: this.options.nativeConfig,
          // 输出web专用配置
          webConfig: this.options.webConfig,
          // 输出rn专用配置
          rnConfig: this.options.rnConfig,
          loaderContentCache: new Map(),
          tabBarMap: {},
          defs: processDefs(this.options.defs),
          i18n: this.options.i18n,
          checkUsingComponentsRules: this.options.checkUsingComponentsRules,
          forceDisableBuiltInLoader: this.options.forceDisableBuiltInLoader,
          appTitle: 'Mpx homepage',
          attributes: this.options.attributes,
          externals: this.options.externals,
          useRelativePath: this.options.useRelativePath,
          removedChunks: [],
          forceProxyEventRules: this.options.forceProxyEventRules,
          // 若配置disableRequireAsync=true, 则全平台构建不支持异步分包
          supportRequireAsync: !this.options.disableRequireAsync && (this.options.mode === 'wx' || this.options.mode === 'ali' || this.options.mode === 'tt' || isWeb(this.options.mode)),
          partialCompileRules: this.options.partialCompileRules,
          collectDynamicEntryInfo: ({ resource, packageName, filename, entryType, hasAsync }) => {
            const curInfo = mpx.dynamicEntryInfo[packageName] = mpx.dynamicEntryInfo[packageName] || {
              hasPage: false,
              entries: []
            }
            if (entryType === 'page') curInfo.hasPage = true
            curInfo.entries.push({
              entryType,
              resource,
              filename,
              hasAsync
            })
          },
          asyncSubpackageRules: this.options.asyncSubpackageRules,
          optimizeRenderRules: this.options.optimizeRenderRules,
          pathHash: (resourcePath) => {
            if (this.options.pathHashMode === 'relative' && this.options.projectRoot) {
              return hash(path.relative(this.options.projectRoot, resourcePath))
            }
            return hash(resourcePath)
          },
          addEntry: (request, name, callback) => {
            const dep = EntryPlugin.createDependency(request, { name })
            compilation.addEntry(compiler.context, dep, { name }, callback)
            return dep
          },
          getModuleId: (filePath, isApp = false) => {
            if (isApp) return MPX_APP_MODULE_ID
            const customComponentModuleId = this.options.customComponentModuleId
            if (typeof customComponentModuleId === 'function') {
              const customModuleId = customComponentModuleId(filePath)
              if (customModuleId) return customModuleId
            }
            return '_' + mpx.pathHash(filePath)
          },
          getEntryNode: (module, type) => {
            const entryNodeModulesMap = mpx.entryNodeModulesMap
            let entryNode = entryNodeModulesMap.get(module)
            if (!entryNode) {
              entryNode = new EntryNode(module, type)
              entryNodeModulesMap.set(module, entryNode)
            } else if (type) {
              if (entryNode.type && entryNode.type !== type) {
                compilation.errors.push(`获取request为${module.request}的entryNode时类型与已有节点冲突, 当前注册的type为${type}, 已有节点的type为${entryNode.type}!`)
              }
              entryNode.type = type
            }
            return entryNode
          },
          getOutputPath: (resourcePath, type, { ext = '', conflictPath = '' } = {}) => {
            const name = path.parse(resourcePath).name
            const hash = mpx.pathHash(resourcePath)
            const customOutputPath = this.options.customOutputPath
            if (conflictPath) return conflictPath.replace(/(\.[^\\/]+)?$/, match => hash + match)
            if (typeof customOutputPath === 'function') return customOutputPath(type, name, hash, ext, resourcePath).replace(/^\//, '')
            if (type === 'component' || type === 'page') return path.join(type + 's', name + hash, 'index' + ext)
            return path.join(type, name + hash + ext)
          },
          extractedFilesCache: new Map(),
          getExtractedFile: (resource, { error } = {}) => {
            const cache = mpx.extractedFilesCache.get(resource)
            if (cache) return cache
            const { resourcePath, queryObj } = parseRequest(resource)
            const { type, isStatic, isPlugin } = queryObj
            let file
            if (isPlugin) {
              file = 'plugin.json'
            } else if (isStatic) {
              const packageRoot = queryObj.packageRoot || ''
              file = toPosix(path.join(packageRoot, mpx.getOutputPath(resourcePath, type, { ext: typeExtMap[type] })))
            } else {
              const appInfo = mpx.appInfo
              const pagesMap = mpx.pagesMap
              const packageName = queryObj.packageRoot || mpx.currentPackageRoot || 'main'
              const componentsMap = mpx.componentsMap[packageName]
              let filename = resourcePath === appInfo.resourcePath ? appInfo.name : (pagesMap[resourcePath] || componentsMap[resourcePath])
              if (!filename) {
                error && error(new Error('Get extracted file error: missing filename!'))
                filename = 'missing-filename'
              }
              file = filename + typeExtMap[type]
            }
            mpx.extractedFilesCache.set(resource, file)
            return file
          },
          recordResourceMap: ({
            resourcePath,
            resourceType,
            outputPath,
            packageRoot = '',
            recordOnly,
            warn,
            error
          }) => {
            const packageName = packageRoot || 'main'
            const resourceMap = mpx[`${resourceType}sMap`] || mpx.otherResourcesMap
            const currentResourceMap = resourceMap.main ? resourceMap[packageName] = resourceMap[packageName] || {} : resourceMap
            let alreadyOutputted = false
            if (outputPath) {
              if (!currentResourceMap[resourcePath] || currentResourceMap[resourcePath] === true) {
                if (!recordOnly) {
                  // 在非recordOnly的模式下，进行输出路径冲突检测，如果存在输出路径冲突，则对输出路径进行重命名
                  for (const key in currentResourceMap) {
                    // todo 用outputPathMap来检测输出路径冲突
                    if (currentResourceMap[key] === outputPath && key !== resourcePath) {
                      outputPath = mpx.getOutputPath(resourcePath, resourceType, { conflictPath: outputPath })
                      warn && warn(new Error(`Current ${resourceType} [${resourcePath}] is registered with conflicted outputPath [${currentResourceMap[key]}] which is already existed in system, will be renamed with [${outputPath}], use ?resolve to get the real outputPath!`))
                      break
                    }
                  }
                }
                currentResourceMap[resourcePath] = outputPath
              } else {
                if (currentResourceMap[resourcePath] === outputPath) {
                  alreadyOutputted = true
                } else {
                  error && error(new Error(`Current ${resourceType} [${resourcePath}] is already registered with outputPath [${currentResourceMap[resourcePath]}], you can not register it with another outputPath [${outputPath}]!`))
                }
              }
            } else if (!currentResourceMap[resourcePath]) {
              currentResourceMap[resourcePath] = true
            }

            return {
              outputPath,
              alreadyOutputted
            }
          },
          // 组件和静态资源的输出规则如下：
          // 1. 主包引用的资源输出至主包
          // 2. 分包引用且主包引用过的资源输出至主包，不在当前分包重复输出
          // 3. 分包引用且无其他包引用的资源输出至当前分包
          // 4. 分包引用且其他分包也引用过的资源，重复输出至当前分包
          getPackageInfo: ({ resource, resourceType, outputPath, issuerResource, warn, error }) => {
            let packageRoot = ''
            let packageName = 'main'

            const { resourcePath } = parseRequest(resource)
            const currentPackageRoot = mpx.currentPackageRoot
            const currentPackageName = currentPackageRoot || 'main'
            const isIndependent = !!mpx.independentSubpackagesMap[currentPackageRoot]
            const resourceMap = mpx[`${resourceType}sMap`] || mpx.otherResourcesMap

            if (!resourceMap.main) {
              packageRoot = currentPackageRoot
              packageName = currentPackageName
            } else {
              // 主包中有引用一律使用主包中资源，不再额外输出
              // 资源路径匹配到forceMainPackageRules规则时强制输出到主包，降低分包资源冗余
              // 如果存在issuer且issuerPackageRoot与当前packageRoot不一致，也输出到主包
              // todo forceMainPackageRules规则目前只能处理当前资源，不能处理资源子树，配置不当有可能会导致资源引用错误
              let isMain = resourceMap.main[resourcePath] || matchCondition(resourcePath, this.options.forceMainPackageRules)
              if (issuerResource) {
                const { queryObj } = parseRequest(issuerResource)
                const issuerPackageRoot = queryObj.packageRoot || ''
                if (issuerPackageRoot !== currentPackageRoot) {
                  warn && warn(new Error(`当前模块[${resource}]的引用者[${issuerResource}]不带有分包标记或分包标记与当前分包不符，模块资源将被输出到主包，可以尝试将引用者加入到subpackageModulesRules来解决这个问题！`))
                  isMain = true
                }
              }
              if (!isMain || isIndependent) {
                packageRoot = currentPackageRoot
                packageName = currentPackageName
                if (this.options.auditResource && resourceType !== 'subpackageModule' && !isIndependent) {
                  if (this.options.auditResource !== 'component' || resourceType === 'component') {
                    Object.keys(resourceMap).filter(key => key !== 'main').forEach((key) => {
                      if (resourceMap[key][resourcePath] && key !== packageName) {
                        warn && warn(new Error(`当前${resourceType === 'component' ? '组件' : '静态'}资源${resourcePath}在分包${key}和分包${packageName}中都有引用，会分别输出到两个分包中，为了总体积最优，可以在主包中建立引用声明以消除资源输出冗余！`))
                      }
                    })
                  }
                }
              }
              resourceMap[packageName] = resourceMap[packageName] || {}
            }

            if (outputPath) outputPath = toPosix(path.join(packageRoot, outputPath))

            return {
              packageName,
              packageRoot,
              // 返回outputPath及alreadyOutputted
              ...mpx.recordResourceMap({
                resourcePath,
                resourceType,
                outputPath,
                packageRoot,
                warn,
                error
              })
            }
          },
          // 以包为维度记录不同 package 需要的组件属性等信息，用以最终 mpx-custom-element 相关文件的输出
          runtimeInfo: {},
          // 记录运行时组件依赖的运行时组件当中使用的基础组件 slot，最终依据依赖关系注入到运行时组件的 json 配置当中
          dynamicSlotDependencies: {},
          // 模板引擎参数，用来检测模板引擎支持渲染的模板
          dynamicTemplateRuleRunner: this.options.dynamicTemplateRuleRunner,
          // 依据 package 注入到 mpx-custom-element-*.json 里面的组件路径
          getPackageInjectedComponentsMap: (packageName = 'main') => {
            const res = {}
            const runtimeInfo = mpx.runtimeInfo[packageName] || {}
            const componentsMap = mpx.componentsMap[packageName] || {}
            const publicPath = compilation.outputOptions.publicPath || ''
            for (const componentPath in runtimeInfo) {
              Object.values(runtimeInfo[componentPath].json).forEach(({ hashName, resourcePath }) => {
                const outputPath = componentsMap[resourcePath]
                if (outputPath) {
                  res[hashName] = publicPath + outputPath
                }
              })
            }
            return res
          },
          // 获取生成基础递归渲染模版的节点配置信息
          getPackageInjectedTemplateConfig: (packageName = 'main') => {
            const res = {
              baseComponents: {
                block: {}
              },
              runtimeComponents: {},
              normalComponents: {}
            }

            const runtimeInfo = mpx.runtimeInfo[packageName] || {}

            // 包含了某个分包当中所有的运行时组件
            for (const resourcePath in runtimeInfo) {
              const { json, template } = runtimeInfo[resourcePath]
              const customComponents = template.customComponents || {}
              const baseComponents = template.baseComponents || {}

              // 合并自定义组件的属性
              for (const componentName in customComponents) {
                const extraAttrs = {}
                const attrsMap = customComponents[componentName]
                const { hashName, isDynamic } = json[componentName] || {}
                let componentType = 'normalComponents'
                if (isDynamic) {
                  componentType = 'runtimeComponents'
                  extraAttrs.slots = ''
                }
                if (!res[componentType][hashName]) {
                  res[componentType][hashName] = {}
                }

                Object.assign(res[componentType][hashName], {
                  ...attrsMap,
                  ...extraAttrs
                })
              }

              // 合并基础节点的属性
              for (const componentName in baseComponents) {
                const attrsMap = baseComponents[componentName]
                if (!res.baseComponents[componentName]) {
                  res.baseComponents[componentName] = {}
                }
                Object.assign(res.baseComponents[componentName], attrsMap)
              }
            }

            return res
          },
          injectDynamicSlotDependencies: (usingComponents, resourcePath) => {
            const dynamicSlotReg = /"mpx_dynamic_slot":\s*""*/
            const content = mpx.dynamicSlotDependencies[resourcePath] ? JSON.stringify(mpx.dynamicSlotDependencies[resourcePath]).slice(1, -1) : ''
            const result = usingComponents.replace(dynamicSlotReg, content).replace(/,\s*(\}|\])/g, '$1')
            return result
          },
          changeHashNameForAstNode: (templateAst, componentsMap) => {
            const nameReg = /"tag":\s*"([^"]*)",?/g

            // 替换 astNode hashName
            const result = templateAst.replace(nameReg, function (match, tag) {
              if (componentsMap[tag]) {
                const { hashName, isDynamic } = componentsMap[tag]
                let content = `"tag": "${hashName}",`
                if (isDynamic) {
                  content += '"dynamic": true,'
                }
                return content
              }
              return match
            }).replace(/,\s*(\}|\])/g, '$1')

            return result
          },
          collectDynamicSlotDependencies: (packageName = 'main') => {
            const componentsMap = mpx.componentsMap[packageName] || {}
            const publicPath = compilation.outputOptions.publicPath || ''
            const runtimeInfo = mpx.runtimeInfo[packageName]

            for (const resourcePath in runtimeInfo) {
              const { template, json } = runtimeInfo[resourcePath]
              const dynamicSlotDependencies = template.dynamicSlotDependencies || []

              dynamicSlotDependencies.forEach((slotDependencies) => {
                let lastNeedInjectNode = slotDependencies[0]
                for (let i = 1; i <= slotDependencies.length - 1; i++) {
                  const componentName = slotDependencies[i]
                  const { resourcePath, isDynamic } = json[componentName] || {}
                  if (isDynamic) {
                    const { resourcePath: path, hashName } = json[lastNeedInjectNode]
                    mpx.dynamicSlotDependencies[resourcePath] = mpx.dynamicSlotDependencies[resourcePath] || {}
                    Object.assign(mpx.dynamicSlotDependencies[resourcePath], {
                      [hashName]: publicPath + componentsMap[path]
                    })
                    lastNeedInjectNode = slotDependencies[i]
                  }
                }
              })
            }
          }
        }
      }

      const rawProcessModuleDependencies = compilation.processModuleDependencies
      compilation.processModuleDependencies = (module, callback) => {
        const presentationalDependencies = module.presentationalDependencies || []
        const errors = []
        async.forEach(presentationalDependencies.filter((dep) => dep.mpxAction), (dep, callback) => {
          dep.mpxAction(module, compilation, (err) => {
            if (err) errors.push(err)
            callback()
          })
        }, () => {
          compilation.errors.push(...errors)
          rawProcessModuleDependencies.call(compilation, module, callback)
        })
      }

      const rawFactorizeModule = compilation.factorizeModule
      compilation.factorizeModule = (options, callback) => {
        const originModule = options.originModule
        let proxyedCallback = callback
        if (originModule) {
          proxyedCallback = (err, module) => {
            // 避免selfModuleFactory的情况
            if (module && module !== originModule) {
              module.issuerResource = originModule.resource
            }
            return callback(err, module)
          }
        }
        return rawFactorizeModule.call(compilation, options, proxyedCallback)
      }

      // 处理watch时缓存模块中的buildInfo
      // 在调用addModule前对module添加分包信息，以控制分包输出及消除缓存，该操作由afterResolve钩子迁移至此是由于dependencyCache的存在，watch状态下afterResolve钩子并不会对所有模块执行，而模块的packageName在watch过程中是可能发生变更的，如新增删除一个分包资源的主包引用
      const rawAddModule = compilation.addModule
      compilation.addModule = (module, callback) => {
        const issuerResource = module.issuerResource
        const currentPackageRoot = mpx.currentPackageRoot
        const independent = mpx.independentSubpackagesMap[currentPackageRoot]

        if (module.resource) {
          // NormalModule
          const isStatic = isStaticModule(module)

          let needPackageQuery = isStatic || independent

          if (!needPackageQuery) {
            const { resourcePath } = parseRequest(module.resource)
            needPackageQuery = matchCondition(resourcePath, this.options.subpackageModulesRules)
          }

          if (needPackageQuery) {
            const { packageRoot } = mpx.getPackageInfo({
              resource: module.resource,
              resourceType: isStatic ? 'staticResource' : 'subpackageModule',
              issuerResource,
              warn (e) {
                compilation.warnings.push(e)
              },
              error (e) {
                compilation.errors.push(e)
              }
            })
            if (packageRoot) {
              const queryObj = {
                packageRoot
              }
              if (independent) queryObj.independent = independent
              module.request = addQuery(module.request, queryObj)
              module.resource = addQuery(module.resource, queryObj)
            }
          }
        } else if (independent) {
          // ContextModule/RawModule/ExternalModule等只在独立分包的情况下添加分包标记，其余默认不添加
          const hackModuleIdentifier = (module) => {
            const postfix = `|independent=${independent}|${currentPackageRoot}`
            const rawIdentifier = module.identifier
            if (rawIdentifier && !rawIdentifier.__mpxHacked) {
              module.identifier = () => {
                return rawIdentifier.call(module) + postfix
              }
              module.identifier.__mpxHacked = true
            }
          }
          hackModuleIdentifier(module)
          const rawCallback = callback
          callback = (err, module) => {
            // 因为文件缓存的存在，前面hack identifier的行为对于从文件缓存中创建得到的module并不生效，因此需要在回调中进行二次hack处理
            if (err) return rawCallback(err)
            hackModuleIdentifier(module)
            return rawCallback(null, module)
          }
        }
        return rawAddModule.call(compilation, module, callback)
      }

      // hack process https://github.com/webpack/webpack/issues/16045
      // no need anymore
      // const _handleModuleBuildAndDependenciesRaw = compilation._handleModuleBuildAndDependencies
      //
      // compilation._handleModuleBuildAndDependencies = (originModule, module, recursive, callback) => {
      //   const rawCallback = callback
      //   callback = (err) => {
      //     if (err) return rawCallback(err)
      //     return rawCallback(null, module)
      //   }
      //   return _handleModuleBuildAndDependenciesRaw.call(compilation, originModule, module, recursive, callback)
      // }

      const rawEmitAsset = compilation.emitAsset

      compilation.emitAsset = (file, source, assetInfo) => {
        if (assetInfo && assetInfo.skipEmit) return
        return rawEmitAsset.call(compilation, file, source, assetInfo)
      }

      compilation.hooks.succeedModule.tap('MpxWebpackPlugin', (module) => {
        // 静态资源模块由于输出结果的动态性，通过importModule会合并asset的特性，通过emitFile传递信息禁用父级extractor的缓存来保障父级的importModule每次都能被执行
        if (isStaticModule(module)) {
          emitFile(module, MPX_DISABLE_EXTRACTOR_CACHE, '', undefined, { skipEmit: true })
        }
      })

      compilation.hooks.finishModules.tap('MpxWebpackPlugin', (modules) => {
        // 移除extractor抽取后的空模块，只有生产模式且optimizeSize设置为true时开启
        if (this.options.optimizeSize && isProductionLikeMode(compiler.options)) {
          for (const module of modules) {
            if (module.buildInfo.isEmpty) {
              for (const connection of moduleGraph.getIncomingConnections(module)) {
                if (connection.dependency.type === 'mpx cjs extract') {
                  connection.weak = true
                  connection.dependency.weak = true
                }
              }
            }
          }
        }

        // 自动使用分包配置修改splitChunksPlugin配置
        if (splitChunksPlugin) {
          let needInit = false
          if (isWeb(mpx.mode)) {
            // web独立处理splitChunk
            if (!hasOwn(splitChunksOptions.cacheGroups, 'main')) {
              splitChunksOptions.cacheGroups.main = {
                chunks: 'initial',
                name: 'bundle',
                test: /[\\/]node_modules[\\/]/
              }
              needInit = true
            }
            if (!hasOwn(splitChunksOptions.cacheGroups, 'async')) {
              splitChunksOptions.cacheGroups.async = {
                chunks: 'async',
                name: 'async',
                minChunks: 2
              }
              needInit = true
            }
          } else {
            Object.keys(mpx.componentsMap).forEach((packageName) => {
              if (!hasOwn(splitChunksOptions.cacheGroups, packageName)) {
                splitChunksOptions.cacheGroups[packageName] = getPackageCacheGroup(packageName)
                needInit = true
              }
            })
          }
          if (needInit) {
            splitChunksPlugin.options = new SplitChunksPlugin(splitChunksOptions).options
          }
        }
      })

      JavascriptModulesPlugin.getCompilationHooks(compilation).renderModuleContent.tap('MpxWebpackPlugin', (source, module, renderContext) => {
        // 处理dll产生的external模块
        if (module.external && module.userRequest.startsWith('dll-reference ') && !isWeb(mpx.mode) && !isReact(mpx.mode)) {
          const chunk = renderContext.chunk
          const request = module.request
          let relativePath = toPosix(path.relative(path.dirname(chunk.name), request))
          if (!/^\.\.?\//.test(relativePath)) relativePath = './' + relativePath
          if (chunk) {
            return new RawSource(`module.exports = require("${relativePath}");\n`)
          }
        }
        return source
      })

      JavascriptModulesPlugin.getCompilationHooks(compilation).renderStartup.tap('MpxWebpackPlugin', (source, module) => {
        const realModule = (module && module.rootModule) || module
        if (realModule && mpx.exportModules.has(realModule)) {
          source = new ConcatSource(source)
          source.add('module.exports = __webpack_exports__;\n')
        }
        return source
      })

      compilation.hooks.moduleAsset.tap('MpxWebpackPlugin', (module, filename) => {
        const modules = mpx.assetsModulesMap.get(filename) || new Set()
        modules.add(module)
        mpx.assetsModulesMap.set(filename, modules)
      })

      const fillExtractedAssetsMap = (assetsMap, { index, content }, filename) => {
        if (assetsMap.has(index)) {
          if (assetsMap.get(index) !== content) {
            compilation.errors.push(new Error(`The extracted file [${filename}] is filled with same index [${index}] and different content:
            old content: ${assetsMap.get(index)}
            new content: ${content}
            please check!`))
          }
        } else {
          assetsMap.set(index, content)
        }
      }

      const sortExtractedAssetsMap = (assetsMap) => {
        return [...assetsMap.entries()].sort((a, b) => a[0] - b[0]).map(item => item[1])
      }

      compilation.hooks.beforeModuleAssets.tap('MpxWebpackPlugin', () => {
        const extractedAssetsMap = new Map()
        for (const module of compilation.modules) {
          const assetsInfo = module.buildInfo.assetsInfo || new Map()
          for (const [filename, { extractedInfo } = {}] of assetsInfo) {
            if (extractedInfo) {
              let extractedAssets = extractedAssetsMap.get(filename)
              if (!extractedAssets) {
                extractedAssets = [new Map(), new Map()]
                extractedAssetsMap.set(filename, extractedAssets)
              }
              fillExtractedAssetsMap(extractedInfo.pre ? extractedAssets[0] : extractedAssets[1], extractedInfo, filename)
              compilation.hooks.moduleAsset.call(module, filename)
            }
          }
        }

        for (const [filename, [pre, normal]] of extractedAssetsMap) {
          const sortedExtractedAssets = [...sortExtractedAssetsMap(pre), ...sortExtractedAssetsMap(normal)]
          const source = new ConcatSource()
          sortedExtractedAssets.forEach((content) => {
            if (content) {
              // 处理replace path
              if (/"mpx_replace_path_.*?"/.test(content)) {
                content = content.replace(/"mpx_replace_path_(.*?)"/g, (matched, key) => {
                  return JSON.stringify(mpx.replacePathMap[key] || 'missing replace path')
                })
              }
              source.add(content)
            }
          })
          compilation.emitAsset(filename, source)
        }
      })

      compilation.hooks.processAssets.tap({
        name: 'MpxWebpackPlugin'
      }, (assets) => {
        try {
          const dynamicAssets = {}
          for (const packageName in mpx.runtimeInfo) {
            for (const resourcePath in mpx.runtimeInfo[packageName]) {
              const { moduleId, template, style, json } = mpx.runtimeInfo[packageName][resourcePath]
              const templateAst = mpx.changeHashNameForAstNode(template.templateAst, json)
              dynamicAssets[moduleId] = {
                template: JSON.parse(templateAst),
                styles: style.reduce((preV, curV) => {
                  preV.push(...curV)
                  return preV
                }, [])
              }

              // 注入 dynamic slot dependency
              const outputPath = mpx.componentsMap[packageName][resourcePath]
              if (outputPath) {
                const jsonAsset = outputPath + '.json'
                const jsonContent = compilation.assets[jsonAsset].source()
                compilation.assets[jsonAsset] = new RawSource(mpx.injectDynamicSlotDependencies(jsonContent, resourcePath))
              }
            }
          }
          if (!isEmptyObject(dynamicAssets)) {
            // 产出 jsonAst 静态产物
            compilation.assets['dynamic.json'] = new RawSource(JSON.stringify(dynamicAssets))
          }
        } catch (error) {
          compilation.errors.push(error)
        }
      })

      const normalModuleFactoryParserCallback = (parser) => {
        parser.hooks.call.for('__mpx_resolve_path__').tap('MpxWebpackPlugin', (expr) => {
          if (expr.arguments[0]) {
            const resource = expr.arguments[0].value
            const packageName = mpx.currentPackageRoot || 'main'
            const issuerResource = moduleGraph.getIssuer(parser.state.module).resource
            const range = expr.range
            const dep = new ResolveDependency(resource, packageName, issuerResource, range)
            parser.state.current.addPresentationalDependency(dep)
            return true
          }
        })

        parser.hooks.call.for('__mpx_dynamic_entry__').tap('MpxWebpackPlugin', (expr) => {
          const args = expr.arguments.map((i) => i.value)
          args.unshift(expr.range)

          const dep = new DynamicEntryDependency(...args)
          parser.state.current.addPresentationalDependency(dep)
          return true
        })

        const requireAsyncHandler = (expr, members, args) => {
          if (members[0] === 'async') {
            let request = expr.arguments[0].value
            const range = expr.arguments[0].range
            const context = parser.state.module.context
            const { queryObj, resourcePath } = parseRequest(request)
            let tarRoot = queryObj.root
            if (!tarRoot && mpx.asyncSubpackageRules) {
              for (const item of mpx.asyncSubpackageRules) {
                if (matchCondition(resourcePath, item)) {
                  tarRoot = item.root
                  break
                }
              }
            }
            if (tarRoot) {
              // 删除root query
              if (queryObj.root) request = addQuery(request, {}, false, ['root'])
              // wx、ali和web平台支持require.async，其余平台使用CommonJsAsyncDependency进行模拟抹平
              if (mpx.supportRequireAsync) {
                if (isWeb(mpx.mode)) {
                  const depBlock = new AsyncDependenciesBlock(
                    {
                      name: tarRoot
                    },
                    expr.loc,
                    request
                  )
                  const dep = new ImportDependency(request, expr.range)
                  dep.loc = expr.loc
                  depBlock.addDependency(dep)
                  parser.state.current.addBlock(depBlock)
                } else {
                  const dep = new DynamicEntryDependency(range, request, 'export', '', tarRoot, '', context, {
                    isAsync: true,
                    isRequireAsync: true,
                    retryRequireAsync: !!this.options.retryRequireAsync
                  })

                  parser.state.current.addPresentationalDependency(dep)
                  // 包含require.async的模块不能被concatenate，避免DynamicEntryDependency中无法获取模块chunk以计算相对路径
                  parser.state.module.buildInfo.moduleConcatenationBailout = 'require async'
                }
              } else {
                const range = expr.range
                const dep = new CommonJsAsyncDependency(request, range)
                parser.state.current.addDependency(dep)
              }
              if (args) parser.walkExpressions(args)
              return true
            } else {
              compilation.errors.push(new Error(`The require async JS [${request}] need to declare subpackage name by root`))
            }
          }
        }

        parser.hooks.callMemberChain
          .for('require')
          .tap({
            name: 'MpxWebpackPlugin',
            stage: -1000
          }, (expr, members) => requireAsyncHandler(expr, members))

        parser.hooks.callMemberChainOfCallMemberChain
          .for('require')
          .tap({
            name: 'MpxWebpackPlugin',
            stage: -1000
          }, (expr, calleeMembers, callExpr) => requireAsyncHandler(callExpr, calleeMembers, expr.arguments))

        const requireExtractHandler = (expr, members, args) => {
          if (members[0] === 'extract') {
            const request = expr.arguments[0].value
            const range = expr.range
            const dep = new CommonJsExtractDependency(request, range)
            parser.state.current.addDependency(dep)
            if (args) parser.walkExpressions(args)
            return true
          }
        }

        parser.hooks.callMemberChain
          .for('require')
          .tap({
            name: 'MpxWebpackPlugin',
            stage: -2000
          }, (expr, members) => requireExtractHandler(expr, members))

        parser.hooks.callMemberChainOfCallMemberChain
          .for('require')
          .tap({
            name: 'MpxWebpackPlugin',
            stage: -2000
          }, (expr, calleeMembers, callExpr) => requireExtractHandler(callExpr, calleeMembers, expr.arguments))

        // hack babel polyfill global
        parser.hooks.statementIf.tap('MpxWebpackPlugin', (expr) => {
          if (/core-js.+microtask/.test(parser.state.module.resource)) {
            if (expr.test.left && (expr.test.left.name === 'Observer' || expr.test.left.name === 'MutationObserver')) {
              const current = parser.state.current
              current.addPresentationalDependency(new InjectDependency({
                content: 'document && ',
                index: expr.test.range[0]
              }))
            }
          }
        })

        parser.hooks.evaluate.for('CallExpression').tap('MpxWebpackPlugin', (expr) => {
          const current = parser.state.current
          const arg0 = expr.arguments[0]
          const arg1 = expr.arguments[1]
          const callee = expr.callee
          // todo 该逻辑在corejs3中不需要，等corejs3比较普及之后可以干掉
          if (/core-js.+global/.test(parser.state.module.resource)) {
            if (callee.name === 'Function' && arg0 && arg0.value === 'return this') {
              current.addPresentationalDependency(new InjectDependency({
                content: '(function() { return this })() || ',
                index: expr.range[0]
              }))
            }
          }
          if (/regenerator/.test(parser.state.module.resource)) {
            if (callee.name === 'Function' && arg0 && arg0.value === 'r' && arg1 && arg1.value === 'regeneratorRuntime = r') {
              current.addPresentationalDependency(new ReplaceDependency('(function () {})', expr.range))
            }
          }
        })

        parser.hooks.evaluate.for('NewExpression').tap('MpxWebpackPlugin', (expression) => {
          if (/@intlify\/core-base/.test(parser.state.module.resource)) {
            if (expression.callee.name === 'Function') {
              const current = parser.state.current
              current.addPresentationalDependency(new InjectDependency({
                content: '_mpxCodeTransForm(',
                index: expression.arguments[0].start
              }))
              current.addPresentationalDependency(new InjectDependency({
                content: ')',
                index: expression.arguments[0].end
              }))
            }
          }
        })

        parser.hooks.program.tap('MpxWebpackPlugin', ast => {
          if (/@intlify\/core-base/.test(parser.state.module.resource)) {
            const current = parser.state.current
            current.addPresentationalDependency(new InjectDependency({
              content: 'function _mpxCodeTransForm (code) {\n' +
                '  code = code.replace(/const { (.*?) } = ctx/g, function (match, $1) {\n' +
                '    var arr = $1.split(", ")\n' +
                '    var str = ""\n' +
                '    var pattern = /(.*):(.*)/\n' +
                '    for (var i = 0; i < arr.length; i++) {\n' +
                '      var result = arr[i].match(pattern)\n' +
                '      var left = result[1]\n' +
                '      var right = result[2]\n' +
                '      str += "var" + right + " = ctx." + left\n' +
                '    }\n' +
                '    return str\n' +
                '  })\n' +
                '  code = code.replace(/\\(ctx\\) =>/g, function (match, $1) {\n' +
                '    return "function (ctx)"\n' +
                '  })\n' +
                '  return code\n' +
                '}',
              index: ast.end
            }))
          }
        })

        // 处理跨平台转换
        if (mpx.srcMode !== mpx.mode) {
          // 处理跨平台全局对象转换
          const transGlobalObject = (expr) => {
            const module = parser.state.module
            const current = parser.state.current
            const { queryObj, resourcePath } = parseRequest(module.resource)
            const localSrcMode = queryObj.mode
            const globalSrcMode = mpx.srcMode
            const srcMode = localSrcMode || globalSrcMode
            const mode = mpx.mode

            let target
            if (expr.type === 'Identifier') {
              target = expr
            } else if (expr.type === 'MemberExpression') {
              target = expr.object
            }

            if (!matchCondition(resourcePath, this.options.transMpxRules) || resourcePath.indexOf('node_modules/@mpxjs') !== -1 || !target || mode === srcMode) return

            const type = target.name
            const name = type === 'wx' ? 'mpx' : 'createFactory'
            const replaceContent = type === 'wx' ? 'mpx' : `createFactory(${JSON.stringify(type)})`

            const dep = new ReplaceDependency(replaceContent, target.range)
            current.addPresentationalDependency(dep)

            let needInject = true
            for (const dep of module.dependencies) {
              if (dep instanceof CommonJsVariableDependency && dep.name === name) {
                needInject = false
                break
              }
            }
            if (needInject) {
              const dep = new CommonJsVariableDependency(`@mpxjs/core/src/runtime/${name}`, name)
              module.addDependency(dep)
            }
          }

          // 转换wx全局对象
          parser.hooks.expression.for('wx').tap('MpxWebpackPlugin', transGlobalObject)
          // Proxy ctor for transMode
          if (!this.options.forceDisableProxyCtor) {
            parser.hooks.call.for('Page').tap('MpxWebpackPlugin', (expr) => {
              transGlobalObject(expr.callee)
            })
            parser.hooks.call.for('Component').tap('MpxWebpackPlugin', (expr) => {
              transGlobalObject(expr.callee)
            })
            parser.hooks.call.for('App').tap('MpxWebpackPlugin', (expr) => {
              transGlobalObject(expr.callee)
            })
            if (mpx.mode === 'ali' || isWeb(mpx.mode) || isReact(mpx.mode)) {
              // 支付宝、web和react不支持Behaviors
              parser.hooks.call.for('Behavior').tap('MpxWebpackPlugin', (expr) => {
                transGlobalObject(expr.callee)
              })
            }
          }
        }
      }
      normalModuleFactory.hooks.parser.for('javascript/auto').tap('MpxWebpackPlugin', normalModuleFactoryParserCallback)
      normalModuleFactory.hooks.parser.for('javascript/dynamic').tap('MpxWebpackPlugin', normalModuleFactoryParserCallback)
      normalModuleFactory.hooks.parser.for('javascript/esm').tap('MpxWebpackPlugin', normalModuleFactoryParserCallback)

      // 为了正确生成sourceMap，将该步骤由原来的compile.hooks.emit迁移到compilation.hooks.processAssets
      compilation.hooks.processAssets.tap({
        name: 'MpxWebpackPlugin',
        stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS
      }, () => {
        if (isWeb(mpx.mode) || isReact(mpx.mode)) return

        if (this.options.generateBuildMap) {
          const pagesMap = compilation.__mpx__.pagesMap
          const componentsPackageMap = compilation.__mpx__.componentsMap
          const componentsMap = Object.keys(componentsPackageMap).map(item => componentsPackageMap[item]).reduce((pre, cur) => {
            return { ...pre, ...cur }
          }, {})
          const outputMap = JSON.stringify({ ...pagesMap, ...componentsMap })
          const filename = this.options.generateBuildMap.filename || 'outputMap.json'
          compilation.assets[filename] = new RawSource(outputMap)
        }

        const {
          globalObject,
          chunkLoadingGlobal
        } = compilation.outputOptions

        const chunkLoadingGlobalStr = JSON.stringify(chunkLoadingGlobal)

        function getTargetFile (file) {
          let targetFile = file
          const queryStringIdx = targetFile.indexOf('?')
          if (queryStringIdx >= 0) {
            targetFile = targetFile.substr(0, queryStringIdx)
          }
          return targetFile
        }

        const processedChunk = new Set()

        function processChunk (chunk, isRuntime, relativeChunks) {
          const chunkFile = chunk.files.values().next().value
          if (!chunkFile || processedChunk.has(chunk)) {
            return
          }

          const originalSource = compilation.assets[chunkFile]
          const source = new ConcatSource()
          source.add(`\nvar ${globalObject} = {};\n`)

          relativeChunks.forEach((relativeChunk, index) => {
            const relativeChunkFile = relativeChunk.files.values().next().value
            if (!relativeChunkFile) return
            const chunkPath = getTargetFile(chunkFile)
            let relativePath = getTargetFile(relativeChunkFile)
            relativePath = path.relative(path.dirname(chunkPath), relativePath)
            relativePath = fixRelative(relativePath, mpx.mode)
            relativePath = toPosix(relativePath)
            if (index === 0) {
              // 引用runtime
              // 支付宝分包独立打包，通过全局context获取webpackJSONP
              if (mpx.mode === 'ali' && !mpx.isPluginMode) {
                if (compilation.options.entry[chunk.name]) {
                  // 在rootChunk中挂载jsonpCallback
                  source.add('// process ali subpackages runtime in root chunk\n' +
                    'var context = (function() { return this })() || Function("return this")();\n')
                  source.add(`context[${chunkLoadingGlobalStr}] = ${globalObject}[${chunkLoadingGlobalStr}] = require("${relativePath}");\n`)
                } else {
                  // 其余chunk中通过context全局传递runtime
                  source.add('// process ali subpackages runtime in other chunk\n' +
                    'var context = (function() { return this })() || Function("return this")();\n')
                  source.add(`${globalObject}[${chunkLoadingGlobalStr}] = context[${chunkLoadingGlobalStr}];\n`)
                }
              } else {
                source.add(`${globalObject}[${chunkLoadingGlobalStr}] = require("${relativePath}");\n`)
              }
            } else {
              source.add(`require("${relativePath}");\n`)
            }
          })

          if (isRuntime) {
            if (mpx.mode === 'ali' || mpx.mode === 'qq') {
              source.add(`
// Fix babel runtime in some quirky environment like ali & qq dev.
try {
  var context = (function() { return this })() || Function("return this")();
  if(!context.console){
    context.console = console;
    context.setInterval = setInterval;
    context.setTimeout = setTimeout;
    context.JSON = JSON;
    context.Math = Math;
    context.Date = Date;
    context.RegExp = RegExp;
    context.Infinity = Infinity;
    context.isFinite = isFinite;
    context.parseFloat = parseFloat;
    context.parseInt = parseInt;
    context.Promise = Promise;
    context.WeakMap = WeakMap;
    context.RangeError = RangeError;
    context.TypeError = TypeError;
    context.Uint8Array = Uint8Array;
    context.DataView = DataView;
    context.ArrayBuffer = ArrayBuffer;
    context.Symbol = Symbol;
    context.Reflect = Reflect;
    context.Object = Object;
    context.Error = Error;
    context.Array = Array;
    context.Float32Array = Float32Array;
    context.Float64Array = Float64Array;
    context.Int16Array = Int16Array;
    context.Int32Array = Int32Array;
    context.Int8Array = Int8Array;
    context.Uint16Array = Uint16Array;
    context.Uint32Array = Uint32Array;
    context.Uint8ClampedArray = Uint8ClampedArray;
    context.String = String;
    context.Function = Function;
    context.SyntaxError = SyntaxError;
    context.decodeURIComponent = decodeURIComponent;
    context.encodeURIComponent = encodeURIComponent;
  }
} catch(e){
}\n`)
            }
            source.add(originalSource)
            source.add(`\nmodule.exports = ${globalObject}[${chunkLoadingGlobalStr}];\n`)
          } else {
            source.add(originalSource)
          }

          compilation.assets[chunkFile] = source
          processedChunk.add(chunk)
        }

        compilation.chunkGroups.forEach((chunkGroup) => {
          if (!chunkGroup.isInitial()) {
            return
          }

          let runtimeChunk, entryChunk
          const middleChunks = []

          const chunksLength = chunkGroup.chunks.length

          chunkGroup.chunks.forEach((chunk, index) => {
            if (index === 0) {
              runtimeChunk = chunk
            } else if (index === chunksLength - 1) {
              entryChunk = chunk
            } else {
              middleChunks.push(chunk)
            }
          })

          if (runtimeChunk) {
            processChunk(runtimeChunk, true, [])
            if (middleChunks.length) {
              middleChunks.forEach((middleChunk) => {
                processChunk(middleChunk, false, [runtimeChunk])
              })
            }
            if (entryChunk) {
              middleChunks.unshift(runtimeChunk)
              processChunk(entryChunk, false, middleChunks)
            }
          }
        })
      })
    })

    compiler.hooks.normalModuleFactory.tap('MpxWebpackPlugin', (normalModuleFactory) => {
      // resolve前修改原始request
      normalModuleFactory.hooks.beforeResolve.tap('MpxWebpackPlugin', (data) => {
        const request = data.request
        const { queryObj, resource } = parseRequest(request)
        if (queryObj.resolve) {
          // 此处的query用于将资源引用的当前包信息传递给resolveDependency
          const resolveLoaderPath = normalize.lib('resolve-loader')
          data.request = `!!${resolveLoaderPath}!${resource}`
        }
      })

      const typeLoaderProcessInfo = {
        styles: ['node_modules/css-loader', wxssLoaderPath, styleCompilerPath, styleStripConditaionalPath],
        template: ['node_modules/html-loader', wxmlLoaderPath, templateCompilerPath]
      }

      // 应用过rules后，注入mpx相关资源编译loader
      normalModuleFactory.hooks.afterResolve.tap('MpxWebpackPlugin', ({ createData }) => {
        const { queryObj } = parseRequest(createData.request)
        const loaders = createData.loaders
        if (queryObj.mpx && queryObj.mpx !== MPX_PROCESSED_FLAG) {
          const type = queryObj.type
          const extract = queryObj.extract
          switch (type) {
            case 'styles':
            case 'template': {
              let insertBeforeIndex = -1
              const info = typeLoaderProcessInfo[type]
              loaders.forEach((loader, index) => {
                const currentLoader = toPosix(loader.loader)
                if (currentLoader.includes(info[0])) {
                  loader.loader = info[1]
                  insertBeforeIndex = index
                } else if (currentLoader.includes(info[1])) {
                  insertBeforeIndex = index
                }
              })
              if (insertBeforeIndex > -1) {
                loaders.splice(insertBeforeIndex + 1, 0, {
                  loader: info[2]
                })
              }
              break
            }
            case 'json':
              if (queryObj.isTheme) {
                loaders.unshift({
                  loader: jsonThemeCompilerPath
                })
              } else if (queryObj.isPlugin) {
                loaders.unshift({
                  loader: jsonPluginCompilerPath
                })
              } else {
                loaders.unshift({
                  loader: jsonCompilerPath
                })
              }
              break
            case 'wxs':
              loaders.unshift({
                loader: wxsLoaderPath
              })
              break
          }
          if (extract) {
            loaders.unshift({
              loader: extractorPath
            })
          }
          if (type === 'styles') {
            // 判断最后一个loader是否是 selectorPath, 如果是，则在sectorPath之前插入strip-conditional
            const lastLoader = loaders[loaders.length - 1]
            if (lastLoader.loader.includes(selectorPath)) {
              loaders.splice(loaders.length - 1, 0, {
                loader: styleStripConditaionalPath
              })
            } else {
              // 在最后一个插入strip-conditional
              loaders.push({
                loader: styleStripConditaionalPath
              })
            }
          }
          createData.resource = addQuery(createData.resource, { mpx: MPX_PROCESSED_FLAG }, true)
        }
        // mpxStyleOptions 为 mpx style 文件的标识，避免 Vue 文件插入 styleCompiler 后导致 vue scoped 样式隔离失效
        if (isWeb(mpx.mode) && queryObj.mpxStyleOptions) {
          const firstLoader = loaders[0] ? toPosix(loaders[0].loader) : ''
          const isPitcherRequest = firstLoader.includes('node_modules/vue-loader/lib/loaders/pitcher')
          let cssLoaderIndex = -1
          let vueStyleLoaderIndex = -1
          let mpxStyleLoaderIndex = -1
          loaders.forEach((loader, index) => {
            const currentLoader = toPosix(loader.loader)
            if (currentLoader.includes('node_modules/css-loader') && cssLoaderIndex === -1) {
              cssLoaderIndex = index
            } else if (currentLoader.includes('node_modules/vue-loader/lib/loaders/stylePostLoader') && vueStyleLoaderIndex === -1) {
              vueStyleLoaderIndex = index
            } else if (currentLoader.includes(styleCompilerPath) && mpxStyleLoaderIndex === -1) {
              mpxStyleLoaderIndex = index
            }
          })
          if (mpxStyleLoaderIndex === -1) {
            let loaderIndex = -1
            if (cssLoaderIndex > -1 && vueStyleLoaderIndex === -1) {
              loaderIndex = cssLoaderIndex
            } else if (cssLoaderIndex > -1 && vueStyleLoaderIndex > -1 && !isPitcherRequest) {
              loaderIndex = vueStyleLoaderIndex
            }
            if (loaderIndex > -1) {
              loaders.splice(loaderIndex + 1, 0, {
                loader: styleCompilerPath
              })
            }
          }
        }

        createData.request = stringifyLoadersAndResource(loaders, createData.resource)
        // 根据用户传入的modeRules对特定资源添加mode query
        this.runModeRules(createData)
      })
    })

    const clearFileCache = () => {
      const fs = compiler.intermediateFileSystem
      const cacheLocation = compiler.options.cache.cacheLocation
      return new Promise((resolve) => {
        if (!cacheLocation) return resolve()
        if (typeof fs.rm === 'function') {
          fs.rm(cacheLocation, {
            recursive: true,
            force: true
          }, resolve)
        } else {
          // polyfill fs.rm
          const rm = (file, callback) => {
            async.waterfall([
              (callback) => {
                fs.stat(file, callback)
              },
              (stats, callback) => {
                if (stats.isDirectory()) {
                  const dir = file
                  fs.readdir(dir, (err, files) => {
                    if (err) return callback(err)
                    async.each(files, (file, callback) => {
                      file = path.join(dir, file)
                      rm(file, callback)
                    }, (err) => {
                      if (err) return callback(err)
                      fs.rmdir(dir, callback)
                    })
                  })
                } else {
                  fs.unlink(file, callback)
                }
              }
            ], callback)
          }
          rm(cacheLocation, resolve)
        }
      })
    }

    compiler.hooks.done.tapPromise('MpxWebpackPlugin', async (stats) => {
      const cache = compiler.getCache('MpxWebpackPlugin')
      const cacheIsValid = await cache.getPromise('cacheIsValid', null)
      if (!cacheIsValid) {
        await Promise.all([
          clearFileCache(),
          cache.storePromise('cacheIsValid', null, true)
        ])
      }
    })
  }
}

module.exports = MpxWebpackPlugin
