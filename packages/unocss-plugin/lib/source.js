import webpack from 'webpack'
const { ReplaceSource, RawSource, ConcatSource, Source } = webpack.sources

function getRawSource (s) {
  if (s instanceof RawSource) { return s }
  if (s instanceof Source) { return new RawSource(s.source()) }
  return new RawSource(s)
}

function getReplaceSource (s) {
  if (s instanceof ReplaceSource) { return s }
  if (s instanceof Source) { return new ReplaceSource(s) }
  return new ReplaceSource(new RawSource(s))
}

function getConcatSource (s) {
  if (s instanceof ConcatSource) { return s }
  return new ConcatSource(s)
}

export {
  getRawSource,
  getReplaceSource,
  getConcatSource
}
