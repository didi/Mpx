import { parseMustache, stringifyAttr } from '@mpxjs/webpack-plugin/lib/template-compiler/compiler.js'

function parseClasses (content) {
  const output = []
  if (!content) { return output }
  const regex = /class\s*=\s*"[^"]*"|class\s*=\s*'[^']*'/igm
  let match
  while (match = regex.exec(content)) {
    const raw = match[0]
    const sep = raw.indexOf('=')
    const value = raw.slice(sep + 1).trim().slice(1, -1)
    const end = regex.lastIndex - 2
    const start = regex.lastIndex - 1 - value.length
    output.push({
      result: value,
      start,
      end
    })
  }

  return output
}

function parseComments (content) {
  const output = []
  if (!content) { return output }
  const regex = /<!--(?:.|\n|\r)+?-->/gm
  let match
  while (match = regex.exec(content)) {
    const raw = match[0]
    const value = raw.slice(4, -3)
    const start = match.index
    const end = start + raw.length - 1
    output.push({
      result: value,
      start,
      end
    })
  }
  return output
}

function parseCommentConfig (content) {
  const result = {}
  if (!content) { return result }
  const regex = /mpx_config_(.+?)\s*:(.+)/
  content.split(/\n|\r/).forEach((item) => {
    const match = regex.exec(item)
    if (match) {
      const key = match[1]
      const raw = match[2]
      try {
        const value = JSON.parse(raw.replace(/'/g, '"'))
        result[key] = value
      } catch (e) {
      }
    }
  })
  return result
}

function parseStrings (content) {
  const output = []
  if (!content) { return output }
  const regex = /'[^']*'|"[^"]*"/gm
  let match
  while (match = regex.exec(content)) {
    const raw = match[0]
    const value = raw.slice(1, -1)
    const end = regex.lastIndex - 2
    const start = regex.lastIndex - 1 - value.length
    output.push({
      result: value,
      start,
      end
    })
  }
  return output
}

export {
  parseClasses,
  parseStrings,
  parseComments,
  parseCommentConfig,
  parseMustache,
  stringifyAttr
}
