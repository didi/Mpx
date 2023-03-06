import { CompilerResult, templateCompiler } from '@mpxjs/compiler'
import path from 'path'
import slash from 'slash'
import { Options } from '../../options'
import { JsonProcessResult } from '../../processor/json-process'
import { TemplateProcessResult } from '../../processor/template-process'
import { OptionObject } from 'loader-utils'
import pathHash from '../../utils/path-hash'
import { resolvedConfig } from '../config'

export interface SFCDescriptor
  extends CompilerResult,
    Omit<TemplateProcessResult, 'templateContent'>,
    JsonProcessResult {
  id: string
  filename: string
  app: boolean
  isPage: boolean
  isComponent: boolean
  vueSfc?: string
}

const cache = new Map<string, SFCDescriptor>()
const prevCache = new Map<string, SFCDescriptor | undefined>()

function genDescriptorTemplate () {
  const template: SFCDescriptor['template'] = {
    tag: 'template',
    type: 'template',
    content:
      '<div class="app"><mpx-keep-alive><router-view class="page"></router-view></mpx-keep-alive></div>',
    attrs: {},
    start: 0,
    end: 0
  }
  return template
}

function genDescriptorScript (descriptor: SFCDescriptor) {
  const script: SFCDescriptor['script'] = {
    tag: 'script',
    type: 'script',
    content: '',
    attrs: {},
    start: 0,
    end: 0
  }
  if (descriptor.app) {
    script.content = `
import { createApp } from "@mpxjs/core"
createApp({})`
  }
  if (descriptor.isPage) {
    script.content = `
import { createPage } from "@mpxjs/core"
createPage({})`
  }
  if (descriptor.isComponent) {
    script.content = `
import { createComponent } from "@mpxjs/core"
createComponent({})`
  }
  return script
}

export function createDescriptor (
  filename: string,
  code: string,
  query: OptionObject,
  options: Options
): SFCDescriptor {
  const { projectRoot = '', mode = 'web', defs, env } = options
  const { isProduction, sourceMap } = resolvedConfig
  const normalizedPath = slash(
    path.normalize(path.relative(projectRoot, filename))
  )
  const isPage = !!query.isPage
  const isComponent = !!query.isComponent
  const compilerResult = templateCompiler.compiler.parseComponent(code, {
    mode,
    defs,
    env,
    filePath: filename,
    pad: 'line',
    needMap: sourceMap
  })
  if (compilerResult.script && compilerResult.script.map) {
    const sources = compilerResult.script.map.sources || []
    compilerResult.script.map.sources = sources.map(
      (v: string) => v.split('?')[0]
    )
  }
  const descriptor: SFCDescriptor = {
    ...compilerResult,
    id: pathHash(normalizedPath + (isProduction ? code : '')),
    filename,
    isPage,
    isComponent,
    app: !(isPage || isComponent),
    wxsModuleMap: {},
    wxsContentMap: {},
    builtInComponentsMap: {},
    genericsInfo: undefined,
    jsonConfig: {},
    localPagesMap: {},
    localComponentsMap: {},
    tabBarMap: {}
  }
  if (descriptor.app) {
    descriptor.template = genDescriptorTemplate()
  }
  if (!descriptor.script) {
    descriptor.script = genDescriptorScript(descriptor)
  }
  setDescriptor(filename, descriptor)
  return descriptor
}

export function getPrevDescriptor (filename: string): SFCDescriptor | undefined {
  return prevCache.get(filename)
}

export function setPrevDescriptor (
  filename: string,
  entry: SFCDescriptor
): void {
  prevCache.set(filename, entry)
}

export function getDescriptor (
  filename: string,
  code?: string,
  query?: OptionObject,
  options?: Options,
  createIfNotFound = true
): SFCDescriptor | undefined {
  if (cache.has(filename)) {
    return cache.get(filename)
  }
  if (createIfNotFound && code && query && options) {
    return createDescriptor(filename, code, query, options)
  }
}

export function setDescriptor (filename: string, entry: SFCDescriptor): void {
  cache.set(filename, entry)
}
