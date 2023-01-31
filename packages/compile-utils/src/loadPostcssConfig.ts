import load from 'postcss-load-config'

export function loadPostcssConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Record<string, any>,
  inlineConfig: {
    config?: {
      path: string
    }
    ignoreConfigFile?: boolean
    plugins?: load.Result['plugins']
    options?: load.Result['options']
  } = {}
): Promise<load.Result> {

  if (inlineConfig.ignoreConfigFile) {
    return Promise.resolve({
      file: '',
      plugins: [],
      options: {}
    })
  }

  const config = inlineConfig.config
  const ctx = {
    ...context
  }

  return load(ctx, config?.path, {
    loaders: { '.json': (_: any, content: string) => JSON.parse(content) }
  })
    .catch(err => {
      // postcss-load-config throws error when no config file is found,
      // but for us it's optional. only emit other errors
      if (err.message.indexOf('No PostCSS Config found') >= 0) {
        return
      }
      throw new Error(`Error loading PostCSS config: ${err.message}`)
    })
    .then(config => {
      let plugins = inlineConfig.plugins || []
      let options = inlineConfig.options || {}
      let file = ''

      // merge postcss config file
      if (config && config.plugins) {
        plugins = plugins.concat(config.plugins)
      }
      if (config && config.options) {
        options = Object.assign({}, config.options, options)
      }
      if(config && config.file){
        file = config.file
      }

      return {
        file,
        plugins,
        options
      }
    })
}
