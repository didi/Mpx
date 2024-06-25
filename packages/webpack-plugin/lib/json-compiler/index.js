const async = require('async')
const JSON5 = require('json5')
const path = require('path')
const parseComponent = require('../parser')
const config = require('../config')
const parseRequest = require('../utils/parse-request')
const evalJSONJS = require('../utils/eval-json-js')
const getRulesRunner = require('../platform/index')
const addQuery = require('../utils/add-query')
const getJSONContent = require('../utils/get-json-content')
const createHelpers = require('../helpers')
const createJSONHelper = require('./helper')
const RecordGlobalComponentsDependency = require('../dependencies/RecordGlobalComponentsDependency')
const RecordIndependentDependency = require('../dependencies/RecordIndependentDependency')
const { MPX_DISABLE_EXTRACTOR_CACHE, RESOLVE_IGNORED_ERR, JSON_JS_EXT } = require('../utils/const')
const resolve = require('../utils/resolve')
const resolveTabBarPath = require('../utils/resolve-tab-bar-path')
const normalize = require('../utils/normalize')
const mpxViewPath = normalize.lib('runtime/components/ali/mpx-view.mpx')
const mpxTextPath = normalize.lib('runtime/components/ali/mpx-text.mpx')
const { generateVariableNameBySource, isProductionLikeMode } = require('../utils/optimize-compress')

module.exports = function (content) {
  const nativeCallback = this.async()
  const mpx = this.getMpx()

  if (!mpx) {
    return nativeCallback(null, content)
  }
  // json模块必须每次都创建（但并不是每次都需要build），用于动态添加编译入口，传递信息以禁用父级extractor的缓存
  this.emitFile(MPX_DISABLE_EXTRACTOR_CACHE, '', undefined, { skipEmit: true })

  // 微信插件下要求组件使用相对路径
  const useRelativePath = mpx.isPluginMode || mpx.useRelativePath
  const { resourcePath, queryObj } = parseRequest(this.resource)
  const useJSONJS = queryObj.useJSONJS || this.resourcePath.endsWith(JSON_JS_EXT)
  const packageName = queryObj.packageRoot || mpx.currentPackageRoot || 'main'
  const pagesMap = mpx.pagesMap
  const componentsMap = mpx.componentsMap[packageName]
  const appInfo = mpx.appInfo
  const mode = mpx.mode
  const env = mpx.env
  const globalSrcMode = mpx.srcMode
  const localSrcMode = queryObj.mode
  const srcMode = localSrcMode || globalSrcMode
  const projectRoot = mpx.projectRoot

  const isApp = !(pagesMap[resourcePath] || componentsMap[resourcePath])
  const publicPath = this._compilation.outputOptions.publicPath || ''
  const fs = this._compiler.inputFileSystem

  const emitWarning = (msg) => {
    this.emitWarning(
      new Error('[json compiler][' + this.resource + ']: ' + msg)
    )
  }

  const emitError = (msg) => {
    this.emitError(
      new Error('[json compiler][' + this.resource + ']: ' + msg)
    )
  }

  const fillInComponentPlaceholder = (name, placeholder, placeholderEntry) => {
    const componentPlaceholder = json.componentPlaceholder || {}
    if (componentPlaceholder[name]) return
    componentPlaceholder[name] = placeholder
    json.componentPlaceholder = componentPlaceholder
    if (placeholderEntry && !json.usingComponents[placeholder]) json.usingComponents[placeholder] = placeholderEntry
  }
  const normalizePlaceholder = (placeholder) => {
    if (typeof placeholder === 'string') {
      const placeholderMap = mode === 'ali'
      ? {
        view: { name: 'mpx-view', resource: mpxViewPath },
        text: { name: 'mpx-text', resource: mpxTextPath }
      }
      : {}
      placeholder = placeholderMap[placeholder] || { name: placeholder }
    }
    if (!placeholder.name) {
      emitError('The asyncSubpackageRules configuration format of @mpxjs/webpack-plugin a is incorrect')
    }
    return placeholder
  }

  const {
    isUrlRequest,
    urlToRequest,
    processPage,
    processDynamicEntry,
    processComponent,
    processJsExport
  } = createJSONHelper({
    loaderContext: this,
    emitWarning,
    emitError
  })

  const { getRequestString } = createHelpers(this)

  let currentName

  if (isApp) {
    currentName = appInfo.name
  } else {
    currentName = componentsMap[resourcePath] || pagesMap[resourcePath]
  }

  const relativePath = useRelativePath ? publicPath + path.dirname(currentName) : ''

  const copydir = (dir, context, callback) => {
    fs.readdir(dir, (err, files) => {
      if (err) return callback(err)
      async.each(files, (file, callback) => {
        file = path.join(dir, file)
        async.waterfall([
          (callback) => {
            fs.stat(file, callback)
          },
          (stats, callback) => {
            if (stats.isDirectory()) {
              copydir(file, context, callback)
            } else {
              fs.readFile(file, (err, content) => {
                if (err) return callback(err)
                if (!this._compilation) return callback()
                const targetPath = path.relative(context, file)
                this.emitFile(targetPath, content)
                callback()
              })
            }
          }
        ], callback)
      }, callback)
    })
  }

  const callback = (err, processOutput) => {
    if (err) return nativeCallback(err)
    let output = `var json = ${JSON.stringify(json, null, 2)};\n`
    if (processOutput) output = processOutput(output)
    const jsonSpace = this.minimize ? 0 : 2
    output += `module.exports = JSON.stringify(json, null, ${jsonSpace});\n`
    nativeCallback(null, output)
  }

  let json
  try {
    if (useJSONJS) {
      json = evalJSONJS(content, this.resourcePath, this)
    } else {
      json = JSON5.parse(content || '{}')
    }
  } catch (err) {
    return callback(err)
  }

  // json补全
  if (pagesMap[resourcePath]) {
    // page
    if (!mpx.forceUsePageCtor) {
      if (!json.usingComponents) {
        json.usingComponents = {}
      }
      if (!json.component && mode === 'swan') {
        json.component = true
      }
    }
  } else if (componentsMap[resourcePath]) {
    // component
    if (json.component !== true) {
      json.component = true
    }
  }

  // 快应用补全json配置，必填项
  if (mode === 'qa' && isApp) {
    const defaultConf = {
      package: '',
      name: '',
      icon: 'assets/images/logo.png',
      versionName: '',
      versionCode: 1,
      minPlatformVersion: 1080
    }
    json = Object.assign({}, defaultConf, json)
  }

  const rulesRunnerOptions = {
    mode,
    srcMode,
    type: 'json',
    waterfall: true,
    warn: emitWarning,
    error: emitError,
    data: {
      // polyfill global usingComponents & record globalComponents
      globalComponents: mpx.usingComponents
    }
  }
  if (!isApp) {
    rulesRunnerOptions.mainKey = pagesMap[resourcePath] ? 'page' : 'component'
  }

  const rulesRunner = getRulesRunner(rulesRunnerOptions)

  if (rulesRunner) {
    rulesRunner(json)
  }

  if (isApp) {
    Object.assign(mpx.usingComponents, json.usingComponents)
    // 在 rulesRunner 运行后保存全局注册组件
    // todo 其余地方在使用mpx.usingComponents时存在缓存问题，要规避该问题需要在所有使用mpx.usingComponents的loader中添加app resourcePath作为fileDependency，但对于缓存有效率影响巨大
    // todo 需要考虑一种精准控制缓存的方式，仅在全局组件发生变更时才使相关使用方的缓存失效，例如按需在相关模块上动态添加request query？
    this._module.addPresentationalDependency(new RecordGlobalComponentsDependency(mpx.usingComponents, this.context))
  }

  const processComponents = (components, context, callback) => {
    if (components) {
      async.eachOf(components, (component, name, callback) => {
        processComponent(component, context, { relativePath }, (err, entry, { tarRoot, placeholder } = {}) => {
          if (err === RESOLVE_IGNORED_ERR) {
            delete components[name]
            return callback()
          }
          if (err) return callback(err)
          components[name] = entry
          if (tarRoot) {
            if (placeholder) {
              placeholder = normalizePlaceholder(placeholder)
              if (placeholder.resource) {
                processComponent(placeholder.resource, projectRoot, { relativePath }, (err, entry) => {
                  if (err) return callback(err)
                  fillInComponentPlaceholder(name, placeholder.name, entry)
                  callback()
                })
              } else {
                fillInComponentPlaceholder(name, placeholder.name)
                callback()
              }
            } else {
              if (!json.componentPlaceholder || !json.componentPlaceholder[name]) {
                const errMsg = `componentPlaceholder of "${name}" doesn't exist! \n\r`
                emitError(errMsg)
              }
              callback()
            }
          } else {
            callback()
          }
        })
      }, callback)
    } else {
      callback()
    }
  }

  const processOptimizeSize = (json, callback) => {
    if (mpx.optimizeSize && isProductionLikeMode(this)) {
      // placeholder 替换
      if (json.componentPlaceholder) {
        const newComponentPlaceholder = {}
        for (const [name, value] of Object.entries(json.componentPlaceholder)) {
          const newName = generateVariableNameBySource(name, this.resourcePath + 'componentName')
          newComponentPlaceholder[newName] = json.componentPlaceholder[name]
          delete json.componentPlaceholder[name]
          if (value in json.usingComponents) {
            newComponentPlaceholder[newName] = generateVariableNameBySource(value, this.resourcePath + 'componentName')
          }
        }
        Object.assign(json.componentPlaceholder, newComponentPlaceholder)
      }
      // usingComponents 替换
      if (json.usingComponents) {
        const newUsingComponents = {}
        for (const name of Object.keys(json.usingComponents)) {
          const newName = generateVariableNameBySource(name, this.resourcePath + 'componentName')
          newUsingComponents[newName] = json.usingComponents[name]
          delete json.usingComponents[name]
        }
        Object.assign(json.usingComponents, newUsingComponents)
      }
    }
    callback()
  }

  if (isApp) {
    // app.json
    const localPages = []
    const subPackagesCfg = {}
    const pageKeySet = new Set()
    const defaultPagePath = require.resolve('../runtime/components/wx/default-page.mpx')
    const processPages = (pages, context, tarRoot = '', callback) => {
      if (pages) {
        const pagesCache = []
        async.each(pages, (page, callback) => {
          processPage(page, context, tarRoot, (err, entry, { isFirst, key, resource } = {}) => {
            if (err) return callback(err === RESOLVE_IGNORED_ERR ? null : err)
            if (pageKeySet.has(key)) return callback()
            if (resource.startsWith(defaultPagePath)) {
              pagesCache.push(entry)
              return callback()
            }
            pageKeySet.add(key)

            if (tarRoot && subPackagesCfg) {
              subPackagesCfg[tarRoot].pages.push(entry)
            } else {
              // 确保首页
              if (isFirst) {
                localPages.unshift(entry)
              } else {
                localPages.push(entry)
              }
            }
            callback()
          })
        }, () => {
          if (tarRoot && subPackagesCfg) {
            if (!subPackagesCfg[tarRoot].pages.length && pagesCache[0]) {
              subPackagesCfg[tarRoot].pages.push(pagesCache[0])
            }
          } else {
            if (!localPages.length && pagesCache[0]) {
              localPages.push(pagesCache[0])
            }
          }
          callback()
        })
      } else {
        callback()
      }
    }

    const processPackages = (packages, context, callback) => {
      if (packages) {
        async.each(packages, (packagePath, callback) => {
          const { queryObj } = parseRequest(packagePath)
          async.waterfall([
            (callback) => {
              resolve(context, packagePath, this, (err, result) => {
                if (err) return callback(err)
                const { rawResourcePath } = parseRequest(result)
                callback(err, rawResourcePath)
              })
            },
            (result, callback) => {
              fs.readFile(result, (err, content) => {
                if (err) return callback(err)
                callback(err, result, content.toString('utf-8'))
              })
            },
            (result, content, callback) => {
              const extName = path.extname(result)
              if (extName === '.mpx') {
                const parts = parseComponent(content, {
                  filePath: result,
                  needMap: this.sourceMap,
                  mode,
                  env
                })
                // 对于通过.mpx文件声明的独立分包，默认将其自身的script block视为init module
                if (queryObj.independent === true) queryObj.independent = result
                getJSONContent(parts.json || {}, result, this, (err, content) => {
                  callback(err, result, content)
                })
              } else {
                callback(null, result, content)
              }
            },
            (result, content, callback) => {
              try {
                content = JSON5.parse(content)
              } catch (err) {
                return callback(err)
              }

              const processSelfQueue = []
              const context = path.dirname(result)

              if (content.pages) {
                const tarRoot = queryObj.root
                if (tarRoot) {
                  delete queryObj.root
                  const subPackage = {
                    tarRoot,
                    pages: content.pages,
                    ...queryObj
                  }

                  if (content.plugins) {
                    subPackage.plugins = content.plugins
                  }

                  processSelfQueue.push((callback) => {
                    processSubPackage(subPackage, context, callback)
                  })
                } else {
                  processSelfQueue.push((callback) => {
                    processPages(content.pages, context, '', callback)
                  })
                }
              }
              if (content.packages) {
                processSelfQueue.push((callback) => {
                  processPackages(content.packages, context, callback)
                })
              }
              if (processSelfQueue.length) {
                async.parallel(processSelfQueue, callback)
              } else {
                callback()
              }
            }
          ], (err) => {
            callback(err === RESOLVE_IGNORED_ERR ? null : err)
          })
        }, callback)
      } else {
        callback()
      }
    }

    const getOtherConfig = (config) => {
      const result = {}
      const blackListMap = {
        tarRoot: true,
        srcRoot: true,
        root: true,
        pages: true
      }
      for (const key in config) {
        if (!blackListMap[key]) {
          result[key] = config[key]
        }
      }
      return result
    }

    const recordIndependent = (root, request) => {
      this._module && this._module.addPresentationalDependency(new RecordIndependentDependency(root, request))
    }

    const processIndependent = (otherConfig, context, tarRoot, callback) => {
      // 支付宝不支持独立分包，无需处理
      const independent = otherConfig.independent
      if (!independent || mode === 'ali') {
        delete otherConfig.independent
        return callback()
      }
      // independent配置为字符串时视为init module
      if (typeof independent === 'string') {
        otherConfig.independent = true
        resolve(context, independent, this, (err, result) => {
          if (err) return callback(err)
          recordIndependent(tarRoot, result)
          callback()
        })
      } else {
        recordIndependent(tarRoot, true)
        callback()
      }
    }

    // 为了获取资源的所属子包，该函数需串行执行
    const processSubPackage = (subPackage, context, callback) => {
      if (subPackage) {
        if (typeof subPackage.root === 'string' && subPackage.root.startsWith('.')) {
          emitError(`Current subpackage root [${subPackage.root}] is not allow starts with '.'`)
          return callback()
        }
        const tarRoot = subPackage.tarRoot || subPackage.root || ''
        const srcRoot = subPackage.srcRoot || subPackage.root || ''
        if (!tarRoot) return callback()

        context = path.join(context, srcRoot)
        const otherConfig = getOtherConfig(subPackage)
        subPackagesCfg[tarRoot] = subPackagesCfg[tarRoot] || {
          root: tarRoot,
          pages: []
        }
        async.parallel([
          (callback) => {
            processIndependent(otherConfig, context, tarRoot, callback)
          },
          (callback) => {
            processPages(subPackage.pages, context, tarRoot, callback)
          },
          (callback) => {
            processPlugins(subPackage.plugins, context, tarRoot, callback)
          }
        ], (err) => {
          if (err) return callback(err)
          Object.assign(subPackagesCfg[tarRoot], otherConfig)
          callback()
        })
      } else {
        callback()
      }
    }

    const processSubPackages = (subPackages, context, callback) => {
      if (subPackages) {
        async.each(subPackages, (subPackage, callback) => {
          processSubPackage(subPackage, context, callback)
        }, callback)
      } else {
        callback()
      }
    }

    const processTabBar = (output) => {
      const tabBarCfg = config[mode].tabBar
      const itemKey = tabBarCfg.itemKey
      const iconKey = tabBarCfg.iconKey
      const activeIconKey = tabBarCfg.activeIconKey

      if (json.tabBar && json.tabBar[itemKey]) {
        json.tabBar[itemKey].forEach((item, index) => {
          if (item[iconKey] && isUrlRequest(item[iconKey])) {
            output += `json.tabBar.${itemKey}[${index}].${iconKey} = require("${addQuery(urlToRequest(item[iconKey]), { useLocal: true })}");\n`
          }
          if (item[activeIconKey] && isUrlRequest(item[activeIconKey])) {
            output += `json.tabBar.${itemKey}[${index}].${activeIconKey} = require("${addQuery(urlToRequest(item[activeIconKey]), { useLocal: true })}");\n`
          }
        })
      }
      return output
    }

    const processOptionMenu = (output) => {
      const optionMenuCfg = config[mode].optionMenu
      if (optionMenuCfg && json.optionMenu) {
        const iconKey = optionMenuCfg.iconKey
        if (json.optionMenu[iconKey] && isUrlRequest(json.optionMenu[iconKey])) {
          output += `json.optionMenu.${iconKey} = require("${addQuery(urlToRequest(json.optionMenu[iconKey]), { useLocal: true })}");\n`
        }
      }
      return output
    }

    const processThemeLocation = (output) => {
      if (json.themeLocation && isUrlRequest(json.themeLocation)) {
        const requestString = getRequestString('json', { src: urlToRequest(json.themeLocation) }, {
          isTheme: true,
          isStatic: true
        })
        output += `json.themeLocation = require(${requestString});\n`
      }
      return output
    }

    const processWorkers = (workers, context, callback) => {
      if (workers) {
        const workersPath = path.join(context, workers)
        this.addContextDependency(workersPath)
        copydir(workersPath, context, callback)
      } else {
        callback()
      }
    }

    const processCustomTabBar = (tabBar, context, callback) => {
      const outputCustomKey = config[mode].tabBar.customKey
      if (tabBar && tabBar[outputCustomKey]) {
        const srcCustomKey = config[srcMode].tabBar.customKey
        const srcPath = resolveTabBarPath(srcCustomKey)
        const outputPath = resolveTabBarPath(outputCustomKey)
        const dynamicEntryExtraOptions = {
          // replace with true for custom-tab-bar
          replaceContent: 'true'
        }

        processComponent(`./${srcPath}`, context, { outputPath, extraOptions: dynamicEntryExtraOptions }, (err, entry) => {
          if (err === RESOLVE_IGNORED_ERR) {
            delete tabBar[srcCustomKey]
            return callback()
          }
          if (err) return callback(err)
          tabBar[outputCustomKey] = entry // hack for javascript parser call hook.
          callback()
        })
      } else {
        callback()
      }
    }

    const processPluginGenericsImplementation = (plugin, context, tarRoot, callback) => {
      if (!plugin.genericsImplementation) return callback()
      const relativePath = useRelativePath ? publicPath + tarRoot : ''
      async.eachOf(plugin.genericsImplementation, (genericComponents, name, callback) => {
        async.eachOf(genericComponents, (genericComponentPath, name, callback) => {
          processComponent(genericComponentPath, context, {
            tarRoot,
            relativePath
          }, (err, entry) => {
            if (err === RESOLVE_IGNORED_ERR) {
              delete genericComponents[name]
              return callback()
            }
            if (err) return callback(err)
            genericComponents[name] = entry
          })
        }, callback)
      }, callback)
    }

    const processPluginExport = (plugin, context, tarRoot, callback) => {
      if (!plugin.export) return callback()
      processJsExport(plugin.export, context, tarRoot, (err, entry) => {
        if (err === RESOLVE_IGNORED_ERR) {
          delete plugin.export
          return callback()
        }
        if (err) return callback(err)
        plugin.export = entry
        callback()
      })
    }

    const processPlugins = (plugins, context, tarRoot = '', callback) => {
      if (mode !== 'wx' || !plugins) return callback() // 目前只有微信支持导出到插件
      async.eachOf(plugins, (plugin, name, callback) => {
        async.parallel([
          (callback) => {
            processPluginGenericsImplementation(plugin, context, tarRoot, callback)
          },
          (callback) => {
            processPluginExport(plugin, context, tarRoot, callback)
          }
        ], callback)
      }, callback)
    }

    async.parallel([
      (callback) => {
        processOptimizeSize(json, callback)
      },
      (callback) => {
        // 添加首页标识
        if (json.pages && json.pages[0]) {
          if (typeof json.pages[0] !== 'string') {
            json.pages[0].src = addQuery(json.pages[0].src, { isFirst: true })
          } else {
            json.pages[0] = addQuery(json.pages[0], { isFirst: true })
          }
        }
        processPages(json.pages, this.context, '', callback)
      },
      (callback) => {
        processComponents(json.usingComponents, this.context, callback)
      },
      (callback) => {
        processPlugins(json.plugins, this.context, '', callback)
      },
      (callback) => {
        processWorkers(json.workers, this.context, callback)
      },
      (callback) => {
        processPackages(json.packages, this.context, callback)
      },
      (callback) => {
        processCustomTabBar(json.tabBar, this.context, callback)
      },
      (callback) => {
        processSubPackages(json.subPackages || json.subpackages, this.context, callback)
      }
    ], (err) => {
      if (err) return callback(err)
      delete json.packages
      delete json.subpackages
      delete json.subPackages
      json.pages = localPages
      for (const root in subPackagesCfg) {
        const subPackageCfg = subPackagesCfg[root]
        // 分包不存在 pages，输出 subPackages 字段会报错
        if (subPackageCfg.pages.length) {
          if (!json.subPackages) {
            json.subPackages = []
          }
          json.subPackages.push(subPackageCfg)
        }
      }
      const processOutput = (output) => {
        output = processDynamicEntry(output)
        output = processTabBar(output)
        output = processOptionMenu(output)
        output = processThemeLocation(output)
        return output
      }
      callback(null, processOutput)
    })
  } else {
    // page.json或component.json
    const processGenerics = (generics, context, callback) => {
      if (generics) {
        async.eachOf(generics, (generic, name, callback) => {
          if (generic.default) {
            processComponent(generic.default, context, { relativePath }, (err, entry) => {
              if (err === RESOLVE_IGNORED_ERR) {
                delete generic.default
                return callback()
              }
              if (err) return callback(err)
              generic.default = entry
              callback()
            })
          } else {
            callback()
          }
        }, callback)
      } else {
        callback()
      }
    }
    async.parallel([
      (callback) => {
        processOptimizeSize(json, callback)
      },
      (callback) => {
        processComponents(json.usingComponents, this.context, callback)
      },
      (callback) => {
        processGenerics(json.componentGenerics, this.context, callback)
      }
    ], (err) => {
      callback(err, processDynamicEntry)
    })
  }
}
