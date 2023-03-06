const resolve = require('../build/utils').resolve
const path = require('path')
// 可以在此配置mpx webpack plugin
// 配置项文档： https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options
module.exports = {
  mode: 'web',
  srcMode: 'wx',
  // env为mpx编译的目标环境，需自定义
  // env: 'didi',
  // resolve的模式
  resolveMode: 'webpack', // 可选值 webpack / native，默认是webpack，原生迁移建议使用native

  // 当resolveMode为native时可通过该字段指定项目根目录
  // projectRoot: resolve('src'),

  // 可选值 full / changed，不传默认为change，当设置为changed时在watch模式下将只会对内容发生变化的文件进行写入，以提升小程序开发者工具编译性能
  writeMode: 'changed',

  // 是否需要对样式加scope，因为只有ali平台没有样式隔离，只对ali平台生效，提供include和exclude，和webpack的rules规则相同
  // autoScopeRules: {
  //   include: [resolve('src')]
  // },

  // 批量指定文件mode，用法如下，指定平台，提供include/exclude指定文件，即include的文件会默认被认为是该平台的，include/exclude的规则和webpack的rules的相同
  modeRules: {
    // ali: {
    //   include: [resolve('node_modules/vant-aliapp')]
    // }
  },

  // 定义一些全局环境变量，可在JS/模板/样式/JSON中使用
  defs: {
    __application_name__: 'dd'
  },

  // 是否转换px到rpx
  transRpxRules: [
    {
      mode: 'only',
      comment: 'use rpx',
      include: resolve('src')
    }
  ],

  // 多语言i18n能力 以下是简单示例，更多详情请参考文档：https://didi.github.io/mpx/i18n.html
  i18n: {
    locale: 'en-US',
    // messages既可以通过对象字面量传入，也可以通过messagesPath指定一个js模块路径，在该模块中定义配置并导出，dateTimeFormats/dateTimeFormatsPath和numberFormats/numberFormatsPath同理
    messagesPath: path.resolve(__dirname, '../src/i18n/index.js')
    // messages: {
    //   'en-US': {
    //     message: {
    //       title: 'test2344',
    //       hello: '{msg} world'
    //     }
    //   },
    //   'zh-CN': {
    //     message: {
    //       title: '中文',
    //       hello: '{msg} 世界'
    //     }
    //   }
    // }
  }
}
