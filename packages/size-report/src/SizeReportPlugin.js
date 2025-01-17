const startServer = require('./server')
const path = require('path')
const matchCondition = require('@mpxjs/webpack-plugin/lib/utils/match-condition').matchCondition
const parseRequest = require('@mpxjs/webpack-plugin/lib/utils/parse-request')
const toPosix = require('@mpxjs/webpack-plugin/lib/utils/to-posix')
const { every, has, map, filter, concat, mapToArr } = require('@mpxjs/webpack-plugin/lib/utils/set')
const parseAsset = require('./utils/parse-asset')
const { mkdirp } = require('webpack/lib/util/fs')

class SizeReportPlugin {
  constructor (opts = {}) {
    this.options = opts
    this.options.server = Object.assign({
      host: '127.0.0.1',
      port: 0,
      autoOpenBrowser: true,
      enable: true
    }, opts.server)
  }

  apply (compiler) {
    const fs = compiler.outputFileSystem
    const mkdirpPromise = (dir) => new Promise((resolve, reject) => {
      mkdirp(fs, dir, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    const writeFilePromise = (file, content) => new Promise((resolve, reject) => {
      fs.writeFile(file, content, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    compiler.hooks.thisCompilation.tap('SizeReportPlugin', (compilation) => {
      compilation.hooks.assetPath.tap('SizeReportPlugin', (path, data, assetInfo) => {
        if (data.chunk && assetInfo) {
          assetInfo.chunkName = data.chunk.name
        }
      })
    })

    compiler.hooks.emit.tapPromise({
      name: 'SizeReportPlugin',
      // 在最后assets稳定后执行
      stage: 1000
    }, async (compilation) => {
      const { moduleGraph, chunkGraph, __mpx__: mpx } = compilation
      if (!mpx) {
        compilation.errors.push(new Error('@mpxjs/size-report需要与@mpxjs/webpack-plugin配合使用，请检查!'))
        return
      }

      const logger = compilation.getLogger('SizeReportPlugin')
      const cache = compilation.getCache('SizeReportPlugin')

      logger.time('compute size')

      function getRelativePathToProject (resourcePath) {
        return './' + toPosix(path.relative(mpx.projectRoot, resourcePath))
      }

      // 简化identifier
      function getSuccinctIdentifier (module) {
        let identifier = module.readableIdentifier(compilation.requestShortener)
        let query = ''
        const resource = module.resource || (module.rootModule && module.rootModule.resource)
        if (resource) {
          const { queryObj } = parseRequest(resource)
          query = queryObj.packageRoot ? '?packageRoot=' + queryObj.packageRoot : ''
        }
        identifier = identifier.split(/\?|!/)[0] + query
        const match = identifier.match(/\.pnpm\/[^/]+\/(node_modules\/.*)/)
        if (match) {
          identifier = match[1]
        }
        return identifier
      }

      function walkEntry (entryModule, sideEffect) {
        const modulesSet = new Set()
        const sourceStack = [entryModule]

        function walk (module) {
          sideEffect && sideEffect(module, entryModule, [...sourceStack])
          if (modulesSet.has(module)) return
          modulesSet.add(module)
          for (const connection of moduleGraph.getOutgoingConnections(module)) {
            const d = connection.dependency
            // We skip connections without dependency
            if (!d) continue
            const m = connection.module
            // We skip connections without Module pointer
            if (!m) continue
            // We skip weak connections
            if (connection.weak && d.type !== 'mpx cjs extract') continue
            // Use undefined runtime
            const state = connection.getActiveState(/* runtime */)
            // We skip inactive connections
            if (state === false) continue
            sourceStack.push(m)
            walk(m)
            sourceStack.pop()
          }
        }

        walk(entryModule)
      }

      const reportGroups = this.options.groups || []

      const reportPages = this.options.reportPages

      const reportRedundance = this.options.reportRedundance

      const needEntryPathRules = this.options.needEntryPathRules || {}

      const ignoreSubpackages = this.options.ignoreSubpackages

      if (reportPages) {
        Object.entries(mpx.pagesMap).forEach(([resourcePath, name]) => {
          reportGroups.push({
            name,
            resourcePath,
            isPage: true,
            entryRules: {
              include: resourcePath
            }
          })
        })
      }

      const reportGroupsWithNoEntryRules = reportGroups.filter((reportGroup) => {
        return !!reportGroup.noEntryRules
      })

      const moduleEntryGraphMap = new Map() // Map<moduleId, {target: boolean, children: Set<moduleId>, parents: Set<moduleId>}> 存放模块引用关系

      function addModuleEntryGraph (moduleId, relation) {
        if (typeof moduleId !== 'number') return
        if (!moduleEntryGraphMap.has(moduleId)) {
          moduleEntryGraphMap.set(moduleId, {
            target: !!(relation && relation.target),
            children: new Set(),
            parents: new Set()
          })
        }
        const value = moduleEntryGraphMap.get(moduleId)

        if (Array.isArray(relation.children)) {
          for (let i = 0; i < relation.children.length; i++) {
            value.children.add(relation.children[0])
          }
        }

        if (Array.isArray(relation.parents)) {
          for (let i = 0; i < relation.parents.length; i++) {
            value.parents.add(relation.parents[0])
          }
        }
      }

      const moduleEntriesMap = new Map()

      function setModuleEntries (module, entryModule, noEntry) {
        entryModule = entryModule.rootModule || entryModule
        getModuleEntries(module, noEntry).add(entryModule)
      }

      function getModuleEntries (module, noEntry) {
        module = module.rootModule || module
        const entries = moduleEntriesMap.get(module) || []
        const index = noEntry ? 1 : 0
        entries[index] = entries[index] || new Set()
        moduleEntriesMap.set(module, entries)
        return entries[index]
      }

      // Walk and mark entryModules/noEntryModules
      let entryModules = mpx.removedEntryModules || []
      compilation.chunks.forEach((chunk) => {
        entryModules = concat(entryModules, new Set(chunkGraph.getChunkEntryModulesIterable(chunk)))
      })

      const modulesMapById = {}

      compilation.modules.forEach(module => {
        const id = chunkGraph.getModuleId(module)
        modulesMapById[id] = module
        const resource = module.resource || (module.rootModule && module.rootModule.resource)
        if (resource && matchCondition(parseRequest(resource).resourcePath, needEntryPathRules)) {
          addModuleEntryGraph(id, { target: true })
        }
      })

      for (const entryModule of entryModules) {
        walkEntry(entryModule, (module, entryModule, stack) => {
          const id = chunkGraph.getModuleId(module)
          if (moduleEntryGraphMap.has(id)) {
            // 将stack中所有节点加入moduleEntryGraphMap中并且记录其节点关系
            if (stack.length > 1) {
              for (let i = 0, len = stack.length; i < len; i++) {
                addModuleEntryGraph(chunkGraph.getModuleId(stack[i]),
                  {
                    children: stack[i + 1] && [chunkGraph.getModuleId(stack[i + 1])],
                    parents: stack[i - 1] && [chunkGraph.getModuleId(stack[i - 1])]
                  })
              }
            }
          }
          setModuleEntries(module, entryModule)
        })
        reportGroups.forEach((reportGroup) => {
          reportGroup.entryModules = reportGroup.entryModules || new Set()
          // 处理ConcatenatedModule
          const resource = entryModule.resource || (entryModule.rootModule && entryModule.rootModule.resource)
          if (resource && reportGroup.entryRules && matchCondition(parseRequest(resource).resourcePath, reportGroup.entryRules)) {
            reportGroup.entryModules.add(entryModule.rootModule || entryModule)
          }
        })
      }

      if (reportGroupsWithNoEntryRules.length) {
        compilation.modules.forEach((module) => {
          reportGroupsWithNoEntryRules.forEach((reportGroup) => {
            // 处理ConcatenatedModule
            const resource = module.resource || (module.rootModule && module.rootModule.resource)
            if (resource && matchCondition(parseRequest(resource).resourcePath, reportGroup.noEntryRules)) {
              reportGroup.noEntryModules = reportGroup.noEntryModules || new Set()
              reportGroup.noEntryModules.add(module.rootModule || module)
              walkEntry(module, (module, noEntryModule) => {
                setModuleEntries(module, noEntryModule, true)
              })
            }
          })
        })
      }

      const packages = Object.keys(mpx.dynamicEntryInfo)

      function getPackageName (fileName) {
        fileName = toPosix(fileName)
        for (const packageName of packages) {
          if (packageName === 'main') continue
          if (fileName.startsWith(packageName + '/')) return packageName
        }
        return 'main'
      }

      function getEntrySet (entryModules, ignoreSubEntry) {
        const selfSet = new Set()
        const sharedSet = new Set()
        const otherSelfEntryModules = new Set()
        entryModules.forEach((entryModule) => {
          const entryNode = mpx.getEntryNode(entryModule)
          if (entryNode) {
            selfSet.add(entryNode)
          } else {
            // 没有在entryNode中记录的entryModule默认为selfEntryModule
            otherSelfEntryModules.add(entryModule)
          }
        })
        if (!ignoreSubEntry) {
          let currentSet = selfSet
          while (currentSet.size) {
            const newSet = new Set()
            currentSet.forEach((entryNode) => {
              entryNode.children.forEach((childNode) => {
                if (selfSet.has(childNode) || sharedSet.has(childNode)) return
                if (every(childNode.parents, (parentNode) => {
                  return selfSet.has(parentNode)
                })) {
                  selfSet.add(childNode)
                } else {
                  sharedSet.add(childNode)
                }
                newSet.add(childNode)
              })
            })
            currentSet = newSet
          }
        }

        return {
          selfEntryModules: concat(map(filter(selfSet, item => {
            if (!item.module) {
              compilation.warnings.push(`EntryNode[${item.request}] has no module, please check!`)
              return false
            }
            return true
          }), item => item.module), otherSelfEntryModules),
          sharedEntryModules: map(filter(sharedSet, item => {
            if (!item.module) {
              compilation.warnings.push(`EntryNode[${item.request}] has no module, please check!`)
              return false
            }
            return true
          }), item => item.module)
        }
      }

      // Get and split selfEntryModules & sharedEntryModules
      reportGroups.forEach((reportGroup) => {
        const entrySet = getEntrySet(reportGroup.entryModules, reportGroup.ignoreSubEntry)
        Object.assign(reportGroup, entrySet, {
          selfSize: 0,
          ignoreSelfSize: 0,
          selfSizeInfo: {},
          sharedSize: 0,
          sharedSizeInfo: {},
          shareEquallySize: 0
        })
      })

      function fillSizeInfo (sizeInfo, packageName, fillType, fillInfo) {
        sizeInfo[packageName] = sizeInfo[packageName] || {
          assets: [],
          modules: [],
          size: 0
        }
        sizeInfo[packageName][fillType].push({ ...fillInfo })
        sizeInfo[packageName].size += fillInfo.size
      }

      function fillSizeReportGroups (entryModules, noEntryModules, packageName, fillType, fillInfo) {
        // 依赖当前模块的页面分组
        const sharedModulesGroupsSet = new Set()
        // 依赖当前模块的自定义分组
        const customGroupSharedModulesGroupsSet = new Set()

        reportGroups.forEach((reportGroup) => {
          if (reportGroup.noEntryModules && noEntryModules && noEntryModules.size) {
            if (has(noEntryModules, (noEntryModule) => {
              const _entryModules = getModuleEntries(noEntryModule)
              return reportGroup.noEntryModules.has(noEntryModule) && every(entryModules, (entryModule) => {
                return _entryModules.has(entryModule)
              })
            })) {
              reportGroup.selfSize += fillInfo.size
              if (ignoreSubpackages && ignoreSubpackages.includes(packageName)) {
                reportGroup.ignoreSelfSize += fillInfo.size
              }
              return fillSizeInfo(reportGroup.selfSizeInfo, packageName, fillType, fillInfo)
            } else if (has(noEntryModules, (noEntryModule) => {
              return reportGroup.noEntryModules.has(noEntryModule)
            })) {
              reportGroup.sharedSize += fillInfo.size
              customGroupSharedModulesGroupsSet.add(reportGroup)
              return fillSizeInfo(reportGroup.sharedSizeInfo, packageName, fillType, fillInfo)
            }
          }
          if (entryModules && entryModules.size) {
            if (every(entryModules, (entryModule) => {
              return reportGroup.selfEntryModules.has(entryModule)
            })) {
              reportGroup.selfSize += fillInfo.size
              if (ignoreSubpackages && ignoreSubpackages.includes(packageName)) {
                reportGroup.ignoreSelfSize += fillInfo.size
              }
              return fillSizeInfo(reportGroup.selfSizeInfo, packageName, fillType, fillInfo)
            } else if (has(entryModules, (entryModule) => {
              return reportGroup.selfEntryModules.has(entryModule) || reportGroup.sharedEntryModules.has(entryModule)
            })) {
              if (reportGroup.isPage) {
                sharedModulesGroupsSet.add(reportGroup)
              } else {
                customGroupSharedModulesGroupsSet.add(reportGroup)
              }
              reportGroup.sharedSize += fillInfo.size
              return fillSizeInfo(reportGroup.sharedSizeInfo, packageName, fillType, fillInfo)
            }
          }
        })

        // 平均分配体积到指定分组的shareEquallySize
        function divideEquallySize (groupsSet, size) {
          if (groupsSet.size) {
            // 页面的均摊体积 = 共享资源文件体积 / 共享该资源的页面数量
            const sharedSize = size / groupsSet.size
            for (const reportGroup of groupsSet) {
              reportGroup.shareEquallySize += sharedSize
            }
          }
        }

        divideEquallySize(sharedModulesGroupsSet, fillInfo.size)
        divideEquallySize(customGroupSharedModulesGroupsSet, fillInfo.size)
      }

      const resourcePathMap = {}

      // {resourcePath: { packages: {pkA: xx, pkB: xx}, redundantSize: xx, partial: true }}

      function fillResourcePathMap (pathKey, packageName, fillInfo) {
        resourcePathMap[pathKey] = resourcePathMap[pathKey] || { redundantSize: 0, packages: {} }
        // concanatedModule的体积是部分而非全部, 对于只冗余部分的无法计算体积，所以只做展示
        if (fillInfo.partial) {
          resourcePathMap[pathKey].partial = true
        }
        resourcePathMap[pathKey].packages[packageName] = resourcePathMap[pathKey].packages[packageName] || 0
        resourcePathMap[pathKey].packages[packageName] += fillInfo.size
        // 如果需要查看modules明细可以打开看这个
        // resourcePathMap[pathKey].modules = resourcePathMap[pathKey].modules || []
        // resourcePathMap[pathKey].modules.push(fillInfo)

        const packageNames = Object.keys(resourcePathMap[pathKey].packages)
        if (packageNames.length > 1) {
          resourcePathMap[pathKey].redundantSize = (packageNames.length - 1) * resourcePathMap[pathKey].packages[packageNames[0]]
        }
      }

      /**
       *
       * @param modules
       * @param moduleType assetModules / 其它module
       * @param packageName
       * @param fillInfo
       */
      function fillRedundanceReport (modules, moduleType, packageName, fillInfo) {
        if (reportRedundance) {
          if (moduleType === 'assetModules') {
            const resourcePathArr = []
            // assetModules包含的module需要取所有的module的resourcePath，排序拼接后作为key，完全一致才能确定是冗余数据。
            // 对应场景 -> 一个组件里面有多个style标签, 最终合并成了一个资源文件
            modules.forEach((module) => {
              const resource = module.resource || (module.rootModule && module.rootModule.resource)
              if (resource) {
                const parsed = parseRequest(resource)
                // 处理为相对路径以减少体积
                parsed.resourcePath = getRelativePathToProject(parsed.resourcePath)
                resourcePathArr.push(parsed.resourcePath)
              }
            })
            const resourcePathKey = resourcePathArr.sort().join(',')
            fillResourcePathMap(resourcePathKey, packageName, fillInfo)
          } else {
            modules.forEach((module) => {
              // 有些contextModule可忽略
              if (!module.resource && !module.rootModule) return

              const parsed = parseRequest(module.resource || module.rootModule.resource)
              // 处理为相对路径以减少体积
              parsed.resourcePath = getRelativePathToProject(parsed.resourcePath)
              if (parsed.queryObj && parsed.queryObj.resolve) return

              fillResourcePathMap(parsed.resourcePath, packageName, fillInfo)

              // 对应concatenatedModule的处理逻辑
              // 1、concatenatedModule可查看rootModule的资源归属。
              // 2、如果rootModule本身不存在冗余，遍历rootModules里面的组成modules有没有冗余，对应场景： a.js -> b.js 但是a冗余输出到多分包，b并未冗余输出(配置subpackageModulesRules)
              if (!module.resource && module.rootModule.resource && (!resourcePathMap[parsed.resourcePath] || !resourcePathMap[parsed.resourcePath].redundantSize)) {
                fillRedundanceReport(module.modules.filter((item) => {
                  return item !== module.rootModule
                }), '', packageName, { partial: true, ...fillInfo })
              }
            })
          }
        }
      }

      function formatAllSize (toFormatData) {
        if (Array.isArray(toFormatData) || Object.prototype.toString.call(toFormatData) === '[object Object]') {
          for (const key in toFormatData) {
            if (Array.isArray(toFormatData[key]) || Object.prototype.toString.call(toFormatData[key]) === '[object Object]') formatAllSize(toFormatData[key])
            if (typeof toFormatData[key] === 'number') toFormatData[key] = formatSize(toFormatData[key])
          }
        }
        return toFormatData
      }

      function formatRedundanceReport () {
        const formatedReport = []
        for (const resourcePath in resourcePathMap) {
          const redundantSize = resourcePathMap[resourcePath].redundantSize
          const sizeInfoItem = {
            resourcePath,
            redundantSize: redundantSize,
            packages: resourcePathMap[resourcePath].packages
            // modules: resourcePathMap[resourcePath].modules
          }
          if (resourcePathMap[resourcePath].partial && redundantSize) {
            sizeInfoItem.partial = true
            delete sizeInfoItem.redundantSize
            formatedReport.push(sizeInfoItem)
          } else if (redundantSize) {
            let insertIndex = formatedReport.findIndex((item) => {
              return redundantSize > item.redundantSize
            })
            if (insertIndex === -1) insertIndex = formatedReport.length
            formatedReport.splice(insertIndex, 0, sizeInfoItem)
          }
        }
        return formatAllSize(formatedReport)
      }

      const assetsSizeInfo = {
        assets: []
      }

      const packagesSizeInfo = {}

      const sizeSummary = {
        sizeInfo: packagesSizeInfo,
        totalSize: 0,
        staticSize: 0,
        chunkSize: 0,
        copySize: 0,
        webpackTemplateSize: 0
      }

      function fillPackagesSizeInfo (packageName, size) {
        packagesSizeInfo[packageName] = packagesSizeInfo[packageName] || 0
        packagesSizeInfo[packageName] += size
      }

      // Generate original size info
      for (const name in compilation.assets) {
        const packageName = getPackageName(name)
        const assetModules = mpx.assetsModulesMap.get(name)
        const assetInfo = compilation.assetsInfo.get(name)
        if (assetModules) {
          const entryModules = new Set()
          const noEntryModules = new Set()
          const size = compilation.assets[name].size()
          const identifierSet = new Set()

          let identifier = ''

          assetModules.forEach((module) => {
            // 循环 modules，存储到 entryModules 和 noEntryModules 中
            const _entryModules = getModuleEntries(module)
            const _noEntryModules = getModuleEntries(module, true)
            if (_entryModules) {
              _entryModules.forEach((entryModule) => {
                const resource = entryModule.resource || (entryModule.rootModule && entryModule.rootModule.resource)
                if (resource) {
                  entryModules.add(entryModule)
                }
              })
            }
            if (_noEntryModules) {
              _noEntryModules.forEach((noEntryModule) => {
                noEntryModules.add(noEntryModule)
              })
            }
            const moduleIdentifier = getSuccinctIdentifier(module)
            identifierSet.add(moduleIdentifier)
            if (!identifier) identifier = moduleIdentifier
          })

          if (identifierSet.size > 1) identifier += ` + ${identifierSet.size - 1} modules`

          fillSizeReportGroups(entryModules, noEntryModules, packageName, 'assets', {
            name,
            identifier,
            size
          })

          fillRedundanceReport(assetModules, 'assetModules', packageName, {
            name,
            identifier,
            size
          })
          assetsSizeInfo.assets.push({
            type: 'static',
            name,
            packageName,
            size,
            modules: mapToArr(identifierSet, (identifier) => {
              const retModule = {
                identifier
              }
              return retModule
            })
          })
          fillPackagesSizeInfo(packageName, size)
          sizeSummary.staticSize += size
          sizeSummary.totalSize += size
        } else if (/\.m?js$/i.test(name) && assetInfo.chunkName) {
          const chunk = compilation.namedChunks.get(assetInfo.chunkName)
          const etag = chunk ? chunk.contentHash.javascript : null
          const content = compilation.assets[name].source()
          const ast = mpx.assetsASTsMap.get(name)

          let parsedLocations = etag && await cache.getPromise(name, etag)
          if (!parsedLocations) {
            try {
              const result = parseAsset(content, ast)
              parsedLocations = result.locations
              mpx.assetsASTsMap.set(name, result.ast)
              etag && await cache.storePromise(name, etag, parsedLocations)
            } catch (err) {
              const msg = err.code === 'ENOENT' ? 'no such file' : err.message
              compilation.errors.push(`Error parsing bundle asset "${name}": ${msg}`)
              continue
            }
          }

          let size = compilation.assets[name].size()
          const chunkAssetInfo = {
            type: 'chunk',
            name,
            packageName,
            size,
            modules: []
          }
          assetsSizeInfo.assets.push(chunkAssetInfo)
          fillPackagesSizeInfo(packageName, size)
          sizeSummary.chunkSize += size
          sizeSummary.totalSize += size
          for (const id in parsedLocations) {
            const module = modulesMapById[id]
            const { start, end } = parsedLocations[id]
            const moduleSize = Buffer.byteLength(content.slice(start, end))
            const identifier = getSuccinctIdentifier(module)
            const entryModules = getModuleEntries(module)
            const noEntryModules = getModuleEntries(module, true)
            fillSizeReportGroups(entryModules, noEntryModules, packageName, 'modules', {
              name,
              identifier,
              size: moduleSize
            })
            fillRedundanceReport([module], '', packageName, {
              name,
              identifier,
              size: moduleSize
            })
            const moduleData = {
              identifier,
              size: moduleSize
            }

            // 将被联合的模块中所有的子模块identifier输出
            if (identifier.endsWith(' modules') && module.modules) {
              moduleData.modules = [...module.modules].map(module => ({
                identifier: getSuccinctIdentifier(module)
              }))
            }

            chunkAssetInfo.modules.push(moduleData)
            size -= moduleSize
          }
          sizeSummary.webpackTemplateSize += size
          // filter sourcemap
        } else if (!/\.m?js\.map$/i.test(name)) {
          // static copy assets such as project.config.json
          const size = compilation.assets[name].size()
          assetsSizeInfo.assets.push({
            type: 'copy',
            name,
            packageName,
            size
          })
          fillPackagesSizeInfo(packageName, size)
          sizeSummary.copySize += size
          sizeSummary.totalSize += size
        }
      }

      // Check threshold
      function normalizeThreshold (threshold) {
        if (typeof threshold === 'number') return threshold
        if (typeof threshold === 'string') {
          if (/ki?b$/i.test(threshold)) return parseFloat(threshold) * 1024
          if (/mi?b$/i.test(threshold)) return parseFloat(threshold) * 1024 * 1024
        }
        return +threshold
      }

      function checkThreshold (threshold, size, sizeInfo, reportGroupName) {
        const sizeThreshold = normalizeThreshold(threshold.size || threshold)
        const preWarningSize = threshold.preWarningSize
        const packagesThreshold = threshold.packages
        const prefix = reportGroupName ? `${reportGroupName}体积分组` : '总包'

        if (sizeThreshold && size && size > sizeThreshold) {
          compilation.errors.push(`${prefix}的总体积（${size}B）超过设定阈值（${sizeThreshold}B），共${(size - sizeThreshold) / 1024}kb，请检查！`)
        }
        if (preWarningSize && size && size < sizeThreshold) {
          compilation.warnings.push(`当前${prefix}的总体积 ${size / 1024}kb，${prefix}的体积阈值为${sizeThreshold / 1024}kb, 共剩余${(sizeThreshold - size) / 1024}kb，请注意！`)
        }

        if (packagesThreshold && sizeInfo) {
          for (const packageName in sizeInfo) {
            const packageSize = sizeInfo[packageName].size || sizeInfo[packageName]
            const packageSizeThreshold = normalizeThreshold(packagesThreshold[packageName] || packagesThreshold)
            if (packageSize && packageSizeThreshold && packageSize > packageSizeThreshold) {
              const readablePackageName = packageName === 'main' ? '主包' : `${packageName}分包`
              compilation.errors.push(`${prefix}的${readablePackageName}体积（${packageSize}B）超过设定阈值（${packageSizeThreshold}B），共${(size - sizeThreshold) / 1024}kb，请检查！`)
            }
          }
        }
      }

      if (this.options.threshold) {
        let filterIgnoreTotalSize = sizeSummary.totalSize
        if (ignoreSubpackages) {
          ignoreSubpackages.forEach(ignoreName => {
            if (packagesSizeInfo[ignoreName]) {
              filterIgnoreTotalSize -= packagesSizeInfo[ignoreName]
            }
          })
        }
        checkThreshold(this.options.threshold, filterIgnoreTotalSize, packagesSizeInfo)
      }

      reportGroups.forEach((reportGroup) => {
        if (reportGroup.threshold) {
          let groupSelfSize = reportGroup.selfSize
          if (reportGroup.ignoreSelfSize) {
            groupSelfSize -= reportGroup.ignoreSelfSize
          }
          checkThreshold(reportGroup.threshold, groupSelfSize, reportGroup.selfSizeInfo, reportGroup.name || 'anonymous group')
        }
      })

      // Format size info
      // function mapModulesReadable (modulesSet) {
      //   return mapToArr(modulesSet, (module) => module.readableIdentifier(compilation.requestShortener))
      // }

      function formatSizeInfo (sizeInfo) {
        const result = {}
        for (const key in sizeInfo) {
          const item = sizeInfo[key]
          result[key] = {
            assets: sortAndFormat(item.assets),
            modules: sortAndFormat(item.modules),
            size: formatSize(item.size)
          }
        }
        return result
      }

      function formatSize (byteLength) {
        if (typeof byteLength !== 'number') return byteLength
        return (byteLength / 1024).toFixed(2) + 'KiB'
      }

      function sortAndFormat (sizeItems) {
        sizeItems.sort((a, b) => {
          return b.size - a.size
        }).forEach((sizeItem) => {
          sizeItem.size = formatSize(sizeItem.size)
        })
        return sizeItems
      }

      const groupsSizeInfo = reportGroups.filter(item => !item.isPage).map((reportGroup) => {
        const readableInfo = {}
        readableInfo.name = reportGroup.name || 'anonymous group'
        // readableInfo.selfEntryModules = mapModulesReadable(reportGroup.selfEntryModules)
        // readableInfo.sharedEntryModules = mapModulesReadable(reportGroup.sharedEntryModules)
        // if (reportGroup.noEntryModules) readableInfo.noEntryModules = mapModulesReadable(reportGroup.noEntryModules)
        readableInfo.selfSize = formatSize(reportGroup.selfSize)
        readableInfo.selfSizeInfo = formatSizeInfo(reportGroup.selfSizeInfo)
        readableInfo.sharedSize = formatSize(reportGroup.sharedSize)
        readableInfo.sharedSizeInfo = formatSizeInfo(reportGroup.sharedSizeInfo)
        readableInfo.shareEquallySize = formatSize(reportGroup.shareEquallySize + reportGroup.selfSize)
        return readableInfo
      })

      const pagesSizeInfo = reportGroups.filter(item => item.isPage).map((reportGroup) => {
        const readableInfo = {}
        readableInfo.name = reportGroup.name || 'anonymous page'
        readableInfo.resourcePath = getRelativePathToProject(reportGroup.resourcePath)
        // readableInfo.selfEntryModules = mapModulesReadable(reportGroup.selfEntryModules)
        // readableInfo.sharedEntryModules = mapModulesReadable(reportGroup.sharedEntryModules)
        readableInfo.selfSize = formatSize(reportGroup.selfSize)
        readableInfo.selfSizeInfo = formatSizeInfo(reportGroup.selfSizeInfo)
        readableInfo.sharedSize = formatSize(reportGroup.sharedSize)
        readableInfo.sharedSizeInfo = formatSizeInfo(reportGroup.sharedSizeInfo)
        readableInfo.shareEquallySize = formatSize(reportGroup.shareEquallySize + reportGroup.selfSize)
        return readableInfo
      })

      sortAndFormat(assetsSizeInfo.assets)
      assetsSizeInfo.assets.forEach((asset) => {
        if (asset.modules) sortAndFormat(asset.modules)
      })
      'totalSize|staticSize|chunkSize|copySize|webpackTemplateSize'.split('|').forEach((key) => {
        sizeSummary[key] = formatSize(sizeSummary[key])
      })

      for (const packageName in packagesSizeInfo) {
        packagesSizeInfo[packageName] = formatSize(packagesSizeInfo[packageName])
      }

      const moduleEntryGraph = [...moduleEntryGraphMap.entries()].reduce((obj, [id, value]) => {
        if (value.parents.size || value.children.size) {
          obj[id] = {
            target: !!value.target,
            parents: [...value.parents],
            children: [...value.children],
            identifier: getSuccinctIdentifier((modulesMapById[id]))
          }
        }
        return obj
      }, {})

      const reportData = {
        sizeSummary
      }

      const redundanceSizeInfo = formatRedundanceReport()
      if (Object.keys(moduleEntryGraph).length) reportData.moduleEntryGraph = moduleEntryGraph
      if (groupsSizeInfo.length) reportData.groupsSizeInfo = groupsSizeInfo
      if (pagesSizeInfo.length) reportData.pagesSizeInfo = pagesSizeInfo
      if (redundanceSizeInfo.length) reportData.redundanceSizeInfo = redundanceSizeInfo
      if (this.options.reportAssets) reportData.assetsSizeInfo = assetsSizeInfo

      const reportFilePath = path.resolve(compiler.outputPath, this.options.filename || 'report.json')

      await mkdirpPromise(path.dirname(reportFilePath))

      await writeFilePromise(reportFilePath, JSON.stringify(reportData))

      logger.info(`Size report is generated in ${reportFilePath}!`)

      if (this.options.server.enable) {
        startServer(JSON.stringify(reportData), Object.assign({ logger }, this.options.server))
      }

      this.options.callback && this.options.callback(reportData)

      if (this.options.skylineSubpackages) {
        /**
         * skyline 分包相关功能检测
         * 1.检测是否有其他分包异步引用skyline分包
         * 2.检测skyline分包内页面是否全量开启 renderer = 'skyline'
         */
        // 判断 skylineSubpackages 是否为数组
        if (Array.isArray(this.options.skylineSubpackages)) {
          // 遍历 skylineSubpackages
          this.options.skylineSubpackages.forEach((skylineSubpackage) => {
            const subpackageInfo = mpx.dynamicEntryInfo[skylineSubpackage]
            if (subpackageInfo && subpackageInfo.entries) {
              subpackageInfo.entries.forEach((entry) => {
                if (entry.hasAsync) {
                  // 报错提示skyline分包不可被其他分包异步引用
                  compilation.errors.push(new Error(`skylineSubpackages ${skylineSubpackage} can not be required async\n
                    resource: ${entry.resource}\n
                    filename: ${entry.filename}
                  `))
                }
                if (entry.entryType === 'page') {
                  const pageJsonString = compilation.assets[entry.filename + '.json'].source()
                  const pageJson = JSON.parse(pageJsonString)
                  if (pageJson.renderer !== 'skyline') {
                    // 报错提示skyline分包内页面必须开启 renderer = 'skyline'
                    compilation.errors.push(new Error(`skylineSubpackages ${skylineSubpackage} page ${entry.filename} must set renderer = 'skyline'\n
                      resource: ${entry.resource}\n
                      filename: ${entry.filename}
                    `))
                  }
                }
              })
            }
          })
        } else {
          logger.warn('skylineSubpackages must be an array')
        }
      }

      logger.timeEnd('compute size')
    })
  }
}

module.exports = SizeReportPlugin
