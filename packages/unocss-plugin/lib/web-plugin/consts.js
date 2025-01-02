const VIRTUAL_ENTRY_ALIAS = [
  /^(?:virtual:)?uno(?::(.+))?\.css(\?.*)?$/
]
const LAYER_MARK_ALL = '__ALL__'

const RESOLVED_ID_WITH_QUERY_RE = /[/\\]__uno(?:(_.*?))?\.css(\?.*)?$/
const RESOLVED_ID_RE = /[/\\]__uno(?:(_.*?))?\.css$/

function resolveId (id) {
  if (id.match(RESOLVED_ID_WITH_QUERY_RE)) { return id }

  for (const alias of VIRTUAL_ENTRY_ALIAS) {
    const match = id.match(alias)
    if (match) {
      return match[1]
        ? `/__uno_${match[1]}.css`
        : '/__uno.css'
    }
  }
}

function resolveLayer (id) {
  const match = id.match(RESOLVED_ID_RE)
  if (match) { return match[1] || LAYER_MARK_ALL }
}

const LAYER_PLACEHOLDER_RE = /(\\?")?#--unocss--\s*{\s*layer\s*:\s*(.+?);?\s*}/g
function getLayerPlaceholder (layer) {
  return `#--unocss--{layer:${layer}}`
}

export {
  LAYER_MARK_ALL,
  LAYER_PLACEHOLDER_RE,
  RESOLVED_ID_RE,
  getLayerPlaceholder,
  resolveLayer,
  resolveId
}
