const { headerPlugin } = require('./headerMdPlugin')

const sidebar = {
  '/guide/': [
    {
      title: '基础',
      collapsable: false,
      children: [
        'basic/start',
        'basic/intro',
        'basic/single-file',
        'basic/ide',
        'basic/template',
        'basic/css',
        'basic/reactive',
        'basic/class-style-binding',
        'basic/conditional-render',
        'basic/list-render',
        'basic/event',
        'basic/two-way-binding',
        'basic/component',
        'basic/refs',
        'basic/option-chain'
      ]
    },
    {
      title: '进阶',
      collapsable: false,
      children: [
        'advance/store',
        'advance/pinia',
        'advance/mixin',
        'advance/npm',
        'advance/subpackage',
        'advance/async-subpackage',
        'advance/platform',
        'advance/i18n',
        'advance/size-report',
        'advance/image-process',
        'advance/progressive',
        'advance/ability-compatible',
        'advance/plugin',
        'advance/custom-output-path',
        'advance/utility-first-css',
        'advance/ssr',
        'advance/provide-inject',
        'advance/build-config'
      ]
    },
    {
      title: '组合式 API',
      collapsable: false,
      children: [
        'composition-api/composition-api',
        'composition-api/reactive-api'
      ]
    },
    {
      title: '工具',
      collapsable: false,
      children: [
        'tool/ts',
        'tool/unit-test',
        'tool/e2e-test'
      ]
    },
    {
      title: '拓展',
      collapsable: false,
      path: '/guide/extend',
      children: [
        'extend/fetch',
        'extend/api-proxy',
        'extend/mock'
      ]
    },
    {
      title: '理解',
      collapsable: false,
      children: [
        'understand/runtime',
        'understand/compile'
      ]
    },
    {
      title: '迁移',
      collapsable: false,
      children: [
        'migrate/2.9',
        'migrate/2.8',
        'migrate/2.7',
        'migrate/mpx-cli-3'
      ]
    }
  ],
  '/api/': [
    'app-config',
    'global-api',
    'instance-api',
    'store-api',
    'directives',
    'compile',
    'builtIn',
    'reactivity-api',
    'composition-api',
    'optional-api',
    'extend'
  ],
  '/articles/': [
    { title: '滴滴开源小程序框架Mpx', path: '1.0' },
    { title: 'Mpx发布2.0，完美支持跨平台开发', path: '2.0' },
    { title: '小程序框架运行时性能大测评', path: 'performance' },
    { title: 'Mpx框架初体验', path: 'mpx1' },
    { title: 'Mpx框架技术揭秘', path: 'mpx2' },
    { title: '基于Mpx的小程序体积优化', path: 'size-control' },
    { title: 'Mpx中基于 Typescript Template Literal Types 实现链式key的类型推导', path: 'ts-derivation' },
    { title: 'Mpx2.7 版本正式发布，大幅提升编译构建速度', path: '2.7-release' },
    { title: 'Mpx2.8 版本正式发布，使用组合式 API 开发小程序', path: '2.8-release' },
    { title: 'Mpx2.9 版本正式发布，支持原子类、SSR 和包体积优化', path: '2.9-release' },
    { title: '小程序跨端组件库 Mpx-cube-ui 开源啦', path: 'mpx-cube-ui' },
    { title: 'Mpx-cli 插件化改造', path: 'mpx-cli-next' },
    { title: 'Mpx 小程序单元测试能力建设与实践', path: 'unit-test'}
  ]
}

const nav = [
  { text: '指南', link: '/guide/basic/start' },
  { text: 'API', link: '/api/index' },
  { text: '文章', link: '/articles/index' },
  { text: '更新记录', link: 'https://github.com/didi/mpx/releases', target:'_blank'},
  { text: 'Github', link: 'https://github.com/didi/mpx', target:'_blank'}
]

module.exports = {
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // 插入一段 clarity 的数据分析的代码
    ['script', { type: 'text/javascript' }, `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "jtvvy52wxy");`]
  ],
  title: 'Mpx框架',
  locales: {
    '/': {
      lang: 'zh-CN', // 将会被设置为 <html> 的 lang 属性
      title: 'Mpx框架',
      description: 'Mpxjs 是滴滴开源的支持跨端开发、深度性能优化的增强型小程序开发框架。使用 Mpxjs 帮助你更好开发小程序，拥有类似 VueJS 的数据响应能力，在降低研发心智负担的同时比原生小程序性能更好，完全基于原生小程序语法保障了最少的坑，一次开发多端生效同时支持微信小程序、支付宝小程序、抖音小程序、百度小程序、Web H5。'
    },
  },
  shouldPrefetch: () => false,
  plugins: {
    '@vuepress/pwa': {
      serviceWorker: true,
      updatePopup: {
        message: '文档有更新啦！',
        buttonText: '刷新'
      }
    },
    '@vuepress/active-header-links': {
      sidebarLinkSelector: '.header-anchor',
      headerAnchorSelector: '.header-anchor'
    }
  },
  themeConfig: {
    // navbar: false,
    algolia: {
      apiKey: '7849f511f78afc4383a81f0137a91c0f',
      indexName: 'mpxjs',
    },
    sidebarDepth: 1,
    logo: '/logo.png',
    displayAllHeaders: false,
    sidebar,
    nav
  },
  chainWebpack: (config, isServer) => {
    // 添加node_modules避免resolve错误
    config.resolve.modules.add('node_modules')
  },
  markdown: {
    // markdown-it-toc 的选项
    extendMarkdown: md => {
      // 使用更多的 markdown-it 插件!
      md.use(headerPlugin)
    }
  }
}
