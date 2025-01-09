# 编译配置

新版的 `@mpxjs/cli` 整体是基于 `@vue/cli` 的架构设计开发的。因此有关 `mpx` 编译构建相关的配置统一使用 `vue.config.js` 来进行管理。

### 编译构建配置

#### mpx 编译构建配置

有关 `mpx` 相关的 webpack 插件、loader 等在 `vue.config.js` 当中 `pluginOptions.mpx` 进行相关的配置：

```javascript
// vue.config.js
module.exports = {
  pluginOptions: {
    mpx: {
      // 传入 @mpxjs/webpack-plugin 当中的配置信息
      // 具体可参考文档：https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options
      plugin: {
        srcMode: 'wx',
      },
      // 传入 @mpxjs/webpack-plugin loader 当中的配置信息
      // 具体可参考文档：https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-loader
      loader: {},
      // 提供图片资源处理简单操作
      // 具体配置参考 https://mpxjs.cn/guide/advance/image-process.html#%E5%9B%BE%E5%83%8F%E8%B5%84%E6%BA%90%E5%BC%95%E5%85%A5%E6%9C%89%E4%B8%89%E7%A7%8D%E6%96%B9%E5%BC%8F
      urlLoader: {
        name: 'img/[name][hash].[ext]',
        publicPath: '',
        publicPathScope: '',
        limit: 10
      }
    }
  }
}
```

注：通过 `@mpxjs/cli` 初始化的项目提供了开箱即用的配置(在[插件内部](https://github.com/mpx-ecology/mpx-cli/blob/master/packages/vue-cli-plugin-mpx/utils/resolveMpxWebpackPluginConf.js#L6-L59)设置了默认的配置)，如果开发过程中有一些其他的配置需求，参见 [mpx 官方文档](https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options)。

#### vue.config.js

以下表格为 `vue.config.js` 当中 `web` 侧和 `小程序` 侧支持的字段一览表，具体每个字段的配置功能请参见 [@vue/cli 官方配置](https://cli.vuejs.org/config/#configuration-reference)：

注：`yes` 表示在对应环境支持配置，`no` 表示在对应环境不支持配置。

| 字段                       | web | 小程序 | 备注                                                          |
| -------------------------- | --- | ------ | ------------------------------------------------------------- |
| publicPath                 | yes | no     | -                                                             |
| outputDir                  | yes | yes    | `dist/${process.env.MPX_CURRENT_TARGET_MODE}`目录作为输出目录 |
| assetsDir                  | yes | no     | -                                                             |
| indexPath                  | yes | no     | -                                                             |
| filenameHashing            | yes | no     | -                                                             |
| pages                      | yes | no     | -                                                             |
| lintOnSave                 | yes  | yes     | -                                                             |
| runtimeCompiler            | yes | no     | -                                                             |
| transpileDependencies      | yes | yes    | -                                                             |
| productionSourceMap        | yes | yes    |                                                   |
| crossorigin                | yes | no     | -                                                             |
| integrity                  | yes | no     | -                                                             |
| configureWebpack           | yes | yes    | -                                                             |
| chainWebpack               | yes | yes    | -                                                             |
| css.requireModuleExtension | yes | no     | -                                                             |
| css.extract                | yes | no     | -                                                             |
| css.sourceMap              | yes | no     | 未来会支持                                                    |
| css.loaderOptions          | yes | no     | 未来会支持                                                    |
| devServer                  | yes | no     | -                                                             |
| devServer.proxy            | yes | no     | -                                                             |
| parallel                   | yes | no     | -                                                             |
| pwa                        | yes | no     | -                                                             |
| pluginOptions              | yes | yes    | -                                                             |

可通过 `vue.config.js` 中提供的 `chainWebpack` 或 `configureWebpack` 字段进行配置，具体使用规则请参见[@vue/cli](https://cli.vuejs.org/guide/webpack.html#simple-configuration)：

```javascript
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [new MyOwnWebpackPlugin()]
  },
  chainWebpack: (config) => {
    config
      .rule('some-rule')
      .test(/some-rule/)
      .use('some-loader')
      .loader('some-loader')
  }
}
```

### 根据不同的构建目标配置

可根据构建平台和开发环境进行选择性的配置，在构建过程中暴露出来的环境变量包括：

- `MPX_CLI_MODE`: 'mp' | 'web' | 'rn'
- `NODE_ENV`：'development' | 'production'
- `MPX_CURRENT_TARGET_MODE`: 'wx' | 'ali' | 'swan' | 'qq' | 'tt' | 'dd' | 'web' | 'ios' | 'android' | 'harmony'
- `MPX_CURRENT_TARGET_ENV` : 'development' | 'production'

```javascript
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    if (process.env.MPX_CLI_MODE === 'mp') {
      // do something
    }

    if (
      process.env.MPX_CLI_MODE === 'web' &&
      process.env.NODE_ENV === 'development'
    ) {
      // do something
    }
  }
}
```
