# 构建配置

mpx深度定制开发了一个webpack插件`@mpxjs/webpack-plugin`，基于该插件使用webpack进行小程序的编译构建工作。

## 自动配置
如果你不熟悉webpack，可以通过脚手架进行[快速配置](../start.md)。

----

## 手动配置

**webpack.config.js**
```js
var MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

var webpackConfig = {
  module: {
    rules: [
      // mpx文件必须设置正确的loader，参考下文详细的loader设置options
      {
        test: /\.mpx$/,
        use: MpxWebpackPlugin.loader({
          transRpx: [
            // 可以是对象也可以是数组，数组可以通过include/exclude对不同资源配置不同的转换
            {
              // `only`模式下，样式前加上注释/* use rpx */可将该段样式中所有的px转换为rpx
              mode: 'only',
              comment: 'use rpx',
              include: resolve('src')
            },
            {
              // 对某些第三方组件库另设转换规则
              mode: 'all',
              designWidth: 375,
              include: resolve('node_modules/vant-weapp')
            }
          ]
        })
      },
      // 对本地图片资源提供增强，编译成小程序支持的格式 
      // <style>中的图片会被强制转为base64，
      // 其他地方引用的资源小于limit的会被转base64，否则会被打包到dist/img目录下通过小程序路径引用
      // 由于微信小程序中<cover-image>不支持传base64，可以在图像资源链接后加上`?fallback`查询字符串强制跳过转base64步骤
      // 参考下文详细的设置@mpxjs/url-loader的方法
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: '@mpxjs/url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[ext]'
        }
      }
    ]
  },
  // mpx主插件，必须设置，参考下文详细的插件设置options
  plugins: [
    new MpxWebpackPlugin({
    // 微信模式下设置为`wx`，支付宝模式下设置为`ali`
      mode: 'wx'
    })
  ],
  // sourceMap: 小程序不支持eval，因此不要设置为eval相关的sourceMap类型。
  // 注意：webpack4新增的mode属性设置为development的时候，会将devtool默认设置为eval，
  //      必须手动设置devtool为非eval相关类型来覆盖默认配置
  devtool: false,
  output: {
    // filename设置不能更改
    filename: '[name].js' 
  },
  // 通过webpack分包能力减少小程序体积，参考下文的详细介绍
  optimization: {
    runtimeChunk: {
      name: 'bundle'
    },
    splitChunks: {
      chunks: 'all',
      name: 'bundle',
      minChunks: 2
    }
  }
}
```
----
### @mpxjs/webpack-plugin

**webpack.config.js**
```js
var MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

webpackconfig = {
  plugins: [
    new MpxWebpackPlugin(options)
  ],
}
```
#### options

- **mode** `String` 目前支持的有微信小程序(wx)\支付宝小程序(ali)\百度小程序(swan)\头条小程序(tt)\QQ小程序(qq)
- **srcMode** `String` 跨平台编译场景下使用，详情请看 [跨平台编译](../platform.md#跨平台编译) 一节
  
----

### MpxWebpackPlugin.loader

`@mpxjs/webpack-plugin`暴露了一个静态方法`MpxWebpackPlugin.loader`作为`.mpx`文件的loader

**webpack.config.js**
```js
var MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

webpackconfig = {
  module: {
    rules: [
      {
        test: /\.mpx$/,
        use: MpxWebpackPlugin.loader({
          transRpx: {}
        })
      }
    ]
  }
}
```

- **transRpx**  
  `Object | Array | boolean | string`
    - `false`关闭转换rpx
    - `'all'`普通样式中的px全部转换为rpx，`rpx注释样式`不转换
    - `'only'`普通样式中的px全部**不转换**为rpx，`rpx注释样式`转换
    - Object包含属性：mode/comment/designWidth/include/exclude
        > include/exclude属性的用法和webpack对module.rules里的规则是一样的，参考[webpack文档-exclude](https://webpack.js.org/configuration/module/#rule-exclude)

该loader用于处理.mpx单文件，并可以通过options控制mpx框架提供的rpx转换能力。详情见 [rpx转换](/single/style-enhance.md#rpx转换)

### @mpxjs/url-loader

已废弃，功能全部收集到 @mpxjs/webpack-plugin 中。

> 想深入的了解mpx框架对小程序对图片资源的支持，查看[mpx图像资源处理](/understanding/resource.md)了解更多细节

### output.filename

小程序限定[描述页面的文件具有相同的路径和文件名](https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html)，仅以后缀名进行区分。

因此`output.filename`中必须写为 **`[name].js`**，基于chunk id或者hash name的filename都会导致编译后的文件无法被小程序识别

**webpack.config.js**
```js
webpackconfig = {
  output: {
    filename: '[name].js', // 正确 
    filename: '[id].js', // 错误。chunk id name
    filename: '[name].[chunkhash].js' // 错误。hash name
  }
}
```
