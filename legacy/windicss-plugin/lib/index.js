const { Processor } = require('windicss/lib')
const { Style, Property, StyleSheet } = require('windicss/utils/style')
const windiParser = require('windicss/utils/parser')
const { parseClasses, parseStrings, parseTags, parseMustache, stringifyAttr, parseComments, parseCommentConfig } = require('./parser')
const { buildAliasTransformer, transformGroups, mpEscape, cssRequiresTransform } = require('./transform')
const { getReplaceSource, getConcatSource, getRawSource } = require('./source')
const platformPreflightsMap = require('./platform')
const mpxConfig = require('@mpxjs/webpack-plugin/lib/config')
const toPosix = require('@mpxjs/webpack-plugin/lib/utils/to-posix')
const fixRelative = require('@mpxjs/webpack-plugin/lib/utils/fix-relative')
const path = require('path')
const { loadConfiguration, defaultConfigureFiles } = require('@windicss/config')
const minimatch = require('minimatch')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const loadersPath = path.resolve(__dirname, './loaders')
const transAppLoader = path.resolve(loadersPath, 'windicss-app.js')
const PLUGIN_NAME = 'MpxWindicssPlugin'

function normalizeOptions (options) {
  let {
    // 公共配置
    root = process.cwd(),
    config,
    configFiles,
    transformCSS = true,
    transformGroups = true,
    preflight = false,
    // 小程序专属配置
    scan = {},
    windiFile = 'styles/windi',
    styleIsolation = 'isolated',
    minCount = 2,
    // web专属配置
    webOptions = {},
    ...rest
  } = options

  webOptions = {
    root,
    config,
    configFiles,
    transformCSS,
    transformGroups,
    preflight,
    scan: {
      include: ['src/**/*']
    },
    ...rest,
    ...webOptions
  }

  return {
    root,
    config,
    configFiles,
    transformCSS,
    transformGroups,
    preflight,
    scan,
    windiFile,
    styleIsolation,
    minCount,
    webOptions,
    ...rest
  }
}

function validateConfig (config, error) {
  if (config.attributify) {
    error('小程序环境下无法使用attributify模式，该配置将被忽略！')
  }
  return config
}

function getCommonClassesMap (classesMaps, minCount) {
  const commonClassesMap = {}
  const allClassesMap = classesMaps.reduce((acc, cur) => Object.assign(acc, cur), {})

  Object.keys(allClassesMap).forEach((item) => {
    let count = 0
    for (const classesMap of classesMaps) {
      if (classesMap[item]) count++
      if (count >= minCount) {
        commonClassesMap[item] = true
        classesMaps.forEach((classesMap) => {
          delete classesMap[item]
        })
        break
      }
    }
  })

  return commonClassesMap
}

function getPlugin (compiler, curPlugin) {
  const plugins = compiler.options.plugins
  return plugins.find(plugin => Object.getPrototypeOf(plugin).constructor === curPlugin)
}

function createGlobalPreflightStyle (processor, selector, properties = {}) {
  const style = new Style(selector)

  Object.entries(properties).forEach(([key, value]) => {
    style.add(Array.isArray(value)
      ? value.map(function (v) {
        return new Property(key, v)
      })
      : new Property(key, typeof value === 'function'
        ? value(function (path, defaultValue) {
          return processor.theme(path, defaultValue)
        })
        : value))
  })

  style.updateMeta('base', 'preflight', 0, 1, true)
  return style
}

function isProductionLikeMode (options) {
  return options.mode === 'production' || !options.mode
}

class MpxWindicssPlugin {
  constructor (options = {}) {
    this.options = normalizeOptions(options)
  }

  generateStyle (processor, classesMap, isMain) {
    const classes = Object.keys(classesMap || {}).join(' ')
    const { preflightOptions, minify, mode } = this

    const styleSheet = processor.interpret(classes).styleSheet

    styleSheet.children.forEach((style) => {
      if (style.selector) {
        style.selector = mpEscape(style.selector)
      }
    })

    if (isMain) {
      if (preflightOptions && preflightOptions.enablePreflight) {
        const { html, includeAll, includeBase, includeGlobal, includePlugin } = preflightOptions
        styleSheet.extend(processor.preflight(includeAll ? null : html, includeBase, includeGlobal, includePlugin))
      }

      const platformPreflights = platformPreflightsMap[mode] || []

      if (platformPreflights) {
        const platformStyleSheet = new StyleSheet()
        platformPreflights.forEach((p) => {
          platformStyleSheet.add(createGlobalPreflightStyle(processor, p.selector ? p.selector : p.keys.join(', '), p.properties))
        })
        styleSheet.extend(platformStyleSheet)
      }
    }

    return styleSheet.combine().sort().build(minify)
  }

  loadConfig (compilation, error) {
    const { root, config, configFiles = defaultConfigureFiles } = this.options
    const { error: err, config: resolved, filepath } = loadConfiguration(this.options)
    if (err) error(err)
    if (filepath) {
      compilation.fileDependencies.add(filepath)
      // fix jiti require cache for watch
      // delete require.cache[filepath]
    }

    if (!config) {
      for (const file of configFiles) {
        const tryPath = path.resolve(root, file)
        if (tryPath === filepath) break
        compilation.missingDependencies.add(tryPath)
      }
    }

    return validateConfig(resolved, error)
  }

  getSafeListClasses (safelist) {
    let classes = []
    if (typeof safelist === 'string') {
      classes = safelist.split(/\s/).filter(i => i)
    }
    if (Array.isArray(safelist)) {
      for (const item of safelist) {
        if (typeof item === 'string') {
          classes.push(item)
        } else if (Array.isArray(item)) {
          classes = classes.concat(item)
        }
      }
    }
    return classes
  }

  apply (compiler) {
    const mpxPluginInstance = getPlugin(compiler, MpxWebpackPlugin)
    if (!mpxPluginInstance) {
      const logger = compiler.getInfrastructureLogger(PLUGIN_NAME)
      logger.error(new Error('@mpxjs/windicss-plugin需要与@mpxjs/webpack-plugin配合使用，请检查!'))
      return
    }
    const mode = this.mode = mpxPluginInstance.options.mode
    this.minify = isProductionLikeMode(compiler.options)
    if (mode === 'web') {
      // web直接用插件
      const WindiCSSWebpackPlugin = require('windicss-webpack-plugin')
      if (!getPlugin(compiler, WindiCSSWebpackPlugin)) {
        compiler.options.plugins.push(new WindiCSSWebpackPlugin(this.options.webOptions))
      }
      // 给app注入windicss模块
      compiler.options.module.rules.push({
        test: /\.mpx$/,
        resourceQuery: /isApp/,
        enforce: 'pre',
        use: [transAppLoader]
      })
      return
    }
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise({
        name: PLUGIN_NAME,
        stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS
      }, async (assets) => {
        const { __mpx__: mpx } = compilation
        const error = (msg) => {
          compilation.errors.push(new Error(msg))
        }
        const warn = (msg) => {
          compilation.warnings.push(new Error(msg))
        }

        const { dynamicEntryInfo, appInfo } = mpx

        const config = this.loadConfig(compilation, error)
        const processor = new Processor(config)

        const { template: templateExt, styles: styleExt } = mpxConfig[mode].typeExtMap

        const packages = Object.keys(dynamicEntryInfo)

        function getPackageName (file) {
          file = toPosix(file)
          for (const packageName of packages) {
            if (packageName === 'main') continue
            if (file.startsWith(packageName + '/')) return packageName
          }
          return 'main'
        }

        const packageClassesMaps = {
          main: {}
        }
        const mainClassesMap = packageClassesMaps.main

        // config中的safelist视为主包classes
        const safeListClasses = this.getSafeListClasses(processor.config('safelist'))

        safeListClasses.forEach((className) => {
          mainClassesMap[className] = true
        })

        const commentConfigMap = {}

        const tagsMap = {}
        const cssEscape = processor.e

        const preflight = this.options.preflight
        const enablePreflight = config.preflight !== false && Boolean(preflight)

        if (enablePreflight) {
          warn('由于底层实现的差异，开启preflight可能导致输出web与输出小程序存在样式差异，如需输出web请关闭该配置！')
        }

        const preflightOptions = this.preflightOptions = Object.assign(
          {
            includeBase: true,
            includeGlobal: false,
            includePlugin: true,
            enableAll: false,
            includeAll: false,
            safelist: [],
            blocklist: [],
            alias: {}
          },
          typeof config.preflight === 'boolean' ? {} : config.preflight,
          typeof preflight === 'boolean' ? {} : preflight
        )

        preflightOptions.includeAll = preflightOptions.includeAll || preflightOptions.enableAll
        preflightOptions.enablePreflight = enablePreflight
        preflightOptions.blocklist = new Set(preflightOptions.blocklist)

        const transformAlias = buildAliasTransformer(config.alias)

        const transformClasses = (source, classNameHandler = c => c) => {
          // pre process
          source = transformAlias(source)
          if (this.options.transformGroups) {
            source = transformGroups(source)
          }
          const content = source.source()
          // escape & fill classesMap
          return content.split(/\s+/).map(classNameHandler).join(' ')
        }
        // transform directives like @apply @variants @screen @layer theme()
        const processStyle = (file, source) => {
          const content = source.source()
          if (!content || !cssRequiresTransform(content)) return
          const style = new windiParser.CSSParser(content, processor).parse()
          const output = style.build()
          if (!output || output.length <= 0) {
            error(`${file} 解析style错误，请检查样式文件输入！`)
            return
          }
          assets[file] = getRawSource(output)
        }

        const processTemplate = (file, source) => {
          source = getReplaceSource(source)

          const content = source.original().source()

          const packageName = getPackageName(file)

          const filename = file.slice(0, -templateExt.length)

          const currentClassesMap = packageClassesMaps[packageName] = packageClassesMaps[packageName] || {}

          const classNameHandler = (className) => {
            if (!className) return className
            if (packageName === 'main') {
              mainClassesMap[className] = true
            } else if (!mainClassesMap[className]) {
              currentClassesMap[className] = true
            }
            return mpEscape(cssEscape(className))
          }

          const commentConfig = {}

          // process comments
          parseComments(content).forEach(({ result, start, end }) => {
            Object.assign(commentConfig, parseCommentConfig(result))
            source.replace(start, end, '')
          })

          if (commentConfig.safelist) {
            this.getSafeListClasses(commentConfig.safelist).forEach((className) => {
              classNameHandler(className)
            })
          }

          commentConfigMap[filename] = commentConfig

          // process classes
          parseClasses(content).forEach(({ result, start, end }) => {
            let { replaced, val } = parseMustache(result, (exp) => {
              const expSource = getReplaceSource(exp)
              parseStrings(exp).forEach(({ result, start, end }) => {
                result = transformClasses(result, classNameHandler)
                expSource.replace(start, end, result)
              })
              return expSource.source()
            }, (str) => transformClasses(str, classNameHandler))

            if (replaced) {
              val = stringifyAttr(val)
              source.replace(start - 1, end + 1, val)
            }
          })

          if (enablePreflight) {
            const { blocklist, alias } = preflightOptions
            // process preflight
            parseTags(content).forEach((tagName) => {
              tagName = alias[tagName] || tagName
              if (blocklist.has(tagName)) return
              tagsMap[tagName] = true
            })
          }

          assets[file] = source
        }

        const filterFile = (file) => {
          const { include = [], exclude = [] } = this.options.scan
          for (const pattern of exclude) {
            if (minimatch(file, pattern)) return false
          }
          for (const pattern of include) {
            if (!minimatch(file, pattern)) return false
          }
          return true
        }

        Object.entries(assets).forEach(([file, source]) => {
          if (!filterFile(file)) return
          if (this.options.transformCSS && file.endsWith(styleExt)) return processStyle(file, source)
          if (file.endsWith(templateExt)) return processTemplate(file, source)
        })

        delete packageClassesMaps.main
        const commonClassesMap = getCommonClassesMap(Object.values(packageClassesMaps), this.options.minCount)
        Object.assign(mainClassesMap, commonClassesMap)

        if (enablePreflight) preflightOptions.html = Object.keys(tagsMap).map(i => `<${i}/>`).join(' ')

        // 生成主包windi.css
        let mainWindiFile
        const mainWindiFileContent = this.generateStyle(processor, mainClassesMap, true)
        if (mainWindiFileContent) {
          mainWindiFile = this.options.windiFile + styleExt
          if (assets[mainWindiFile]) error(`${mainWindiFile}当前已存在于[compilation.assets]中，请修改[options.windiFile]配置以规避冲突！`)
          assets[mainWindiFile] = getRawSource(mainWindiFileContent)
        }

        if (mainWindiFile) {
          const appStyleFile = appInfo.name + styleExt
          const mainRelativePath = fixRelative(toPosix(path.relative(path.dirname(appStyleFile), mainWindiFile)), mode)
          const appStyleSource = getConcatSource(`@import ${JSON.stringify(mainRelativePath)};\n`)
          appStyleSource.add(assets[appStyleFile] || '')
          assets[appStyleFile] = appStyleSource
          dynamicEntryInfo.main.entries.forEach(({ entryType, filename }) => {
            const commentConfig = commentConfigMap[filename] || {}
            const styleIsolation = commentConfig.styleIsolation || this.options.styleIsolation
            if (styleIsolation === 'isolated' && entryType === 'component') {
              const componentStyleFile = filename + styleExt
              const mainRelativePath = fixRelative(toPosix(path.relative(path.dirname(componentStyleFile), mainWindiFile)), mode)
              const componentStyleSource = getConcatSource(`@import ${JSON.stringify(mainRelativePath)};\n`)
              componentStyleSource.add(assets[componentStyleFile] || '')
              assets[componentStyleFile] = componentStyleSource
            }
          })
        }

        // 生成分包windi.css
        Object.entries(packageClassesMaps).forEach(([packageRoot, classesMap]) => {
          let windiFile
          const windiFileContent = this.generateStyle(processor, classesMap)
          if (windiFileContent) {
            windiFile = toPosix(path.join(packageRoot, this.options.windiFile + styleExt))
            if (assets[windiFile]) error(`${windiFile}当前已存在于[compilation.assets]中，请修改[options.windiFile]配置以规避冲突！`)
            assets[windiFile] = getRawSource(windiFileContent)
          }

          dynamicEntryInfo[packageRoot].entries.forEach(({ entryType, filename }) => {
            if (windiFile && entryType === 'page') {
              const pageStyleFile = filename + styleExt
              const relativePath = fixRelative(toPosix(path.relative(path.dirname(pageStyleFile), windiFile)), mode)
              const pageStyleSource = getConcatSource(`@import ${JSON.stringify(relativePath)};\n`)
              pageStyleSource.add(assets[pageStyleFile] || '')
              assets[pageStyleFile] = pageStyleSource
            }

            const commentConfig = commentConfigMap[filename] || {}
            const styleIsolation = commentConfig.styleIsolation || this.options.styleIsolation
            if (styleIsolation === 'isolated' && entryType === 'component') {
              const componentStyleFile = filename + styleExt
              const componentStyleSource = getConcatSource('')

              if (mainWindiFile) {
                const mainRelativePath = fixRelative(toPosix(path.relative(path.dirname(componentStyleFile), mainWindiFile)), mode)
                componentStyleSource.add(`@import ${JSON.stringify(mainRelativePath)};\n`)
              }

              if (windiFile) {
                const relativePath = fixRelative(toPosix(path.relative(path.dirname(componentStyleFile), windiFile)), mode)
                componentStyleSource.add(`@import ${JSON.stringify(relativePath)};\n`)
              }

              componentStyleSource.add(assets[componentStyleFile] || '')
              assets[componentStyleFile] = componentStyleSource
            }
          })
        })
      })
    })
  }
}

module.exports = MpxWindicssPlugin
