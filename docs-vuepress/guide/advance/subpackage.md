# 多人合作与分包

小程序原生的 app.json 中定义了 pages 域，用于注册 app 中所有用到的页面，这个设计能够满足绝大部分个人开发场景，但是当我们在开发一个团队协作的大型项目时，我们一方面要保持开发者可以相对独立的开发需求，同时某个开发者也可能会依赖其他开发者提供的单个或几个页面来开发，这种大型项目较复杂场景下，使用 pages 域就有些捉襟见肘了。

为此，我们引入了 packages 的概念来解决依赖问题。

后来微信原生增加了 [分包加载](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html) 能力，支持多人协作场景和包体积控制。

## packages

我们提供的 packages 概念实际上是对业务的拆分合并，即开发的时候可以各自开发，打包的时候合为一个，和微信的分包不相同，推荐在此基础上进一步使用平台原生分包能力，可以更好地控制小程序体积。

我们也在package机制中增加了对原生分包加载的支持。

### 使用方法

我们拓展了 app.json 的语法，新增了 packages 域，用来声明依赖的 packages，packages 可嵌套依赖。

```html
// @file src/app.mpx
<script type="application/json">
  {
    "pages": [
      "./pages/index/index"
    ],
    "packages": [
      "{npmPackage || relativePathToPackage}/index"
    ]
  }
</script>

// @file src/packages/index.mpx
<script type="application/json">
  {
    "pages": [
      "./pages/other/other",
      "./pages/other/other2"
    ]
  }
</script>
```

打包结果：dist/app.json
```json
{
  "pages": [
    "pages/index/index",
    "pages/other/other",
    "pages/other/other2"
  ]
}
```

由上可见，经过我们的编译过程，packages 中注册的页面按照原始的路径形状被合并到主 app 中，
这样依赖的开发者可以不用考虑自己在被依赖时页面路径是怎么样的，也可以直接将调试用的app.mpx作为依赖入口直接暴露出去，
对于主app的开发者来说也不需要了解依赖内部的细节，只需要在packages中声明自己所需的依赖即可

### 注意事项

- 依赖的开发者在自己的入口 app.mpx 中注册页面时对于本地页面一定要使用相对路径进行注册，否则在主app中进行编译时会找不到对应的页面
- 不管是用 json 还是 mpx 格式定义 package 入口，编译时永远只会解析 json 且只会关注 json 中的 pages 和 packages 域，其余所有东西在主app编译时都会被忽略
- 由于我们是将 packages 中注册的页面按照原始的路径合并到主 app 当中，有可能会出现路径名冲突。  
这种情况下编译会报出响应错误提示用户解决冲突，为了避免这种情况的发生，依赖的提供者最好将自己内部的页面放置在能够描述依赖特性的子文件夹下。

例如一个包叫login，建议包内页面文件目录为：

```
project
│   app.mpx  
└───pages
    └───login
        │   page1.mpx
        │   page2.mpx
        │   ...
```

## 分包

作为一个对 performance 极度重视的框架，分包作为提升小程序体验的重要能力，是必须支持的。

微信文档中有以下三种分包，mpx 对这些能力都做了较好的支持。

> 分包是小程序平台提供的原生能力，mpx是对该能力做了部分加强，目前各大主流小程序平台都已支持分包，且框架在可能的情况下进行了抹平。

- [普通分包](#普通分包)
- [分包预下载](#分包预下载)

### 普通分包

todo 说明分包与packages的相似性，mpx支持使用packages添加?root配置分包，同时也支持原生分包配置

mpx 中会将 app.mpx（入口文件，也不一定非要叫app.mpx） 中 packages 域下的路径带 root 为 key 的 query 则被解析认为是使用分包加载。

> 使用分包一定要记得阅读下面的[分包注意事项](#分包注意事项)

```html
// @file src/app.mpx
<script type="application/json">
  {
    "pages": [
      "./pages/index/index"
    ],
    "packages": [
      "{npmPackage || relativePathToPackage}/index?root=test"
    ]
  }
</script>

// @file src/packages/index.mpx (子包的入口文件)
<script type="application/json">
  {
    "pages": [
      "./pages/other/other",
      "./pages/other/other2"
    ]
  }
</script>
```

打包结果：dist/app.json
```json
{
  "pages": [
    "pages/index/index"
  ],
  "subPackages": [
    {
      "root": "test",
      "pages": [
        "pages/other/other",
        "pages/other/other2"
      ]
    }
  ]
}
```

分包加载的好处详见微信的文档。路径冲突的概率也大大降低，只需要保证root不同即可。

### 独立分包

Mpx目前已支持独立分包构建，使用packages语法声明分包时只需要在后面添加 `independent=true` query 即可，同时也支持原生语法声明。

**示例：**
```json
{
    "packages": [
      "subpackageA/index?root=pacA&independent=true"
    ]
  }
```

### 分包预下载

分包预下载是在 json中 新增一个 preloadRule 字段，mpx 打包时候会原封不动把这个部分放到 app.json 中，所以只需要按照 [微信小程序官方文档 - 分包预下载](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/preload.html) 或者 [支付宝小程序官方文档 - 分包预下载](https://opendocs.alipay.com/mini/framework/subpackages) 配置即可。


**示例：**

```html
// @file src/app.mpx
<script type="application/json">
  {
    "pages": [
      "./pages/index/index"
    ],
    "packages": [
      "{npmPackage || relativePathToPackage}/index?root=xxx"
    ],
    "preloadRule": {
      "pages/index": {
        "network": "all",
        "packages": ["important"]
      },
      "sub1/index": {
        "packages": ["hello", "sub3"]
      }
    }
  }
</script>

// @file src/packages/index.mpx (子包的入口文件)
<script type="application/json">
  {
    "pages": [
      "./pages/other/other",
      "./pages/other/other2"
    ]
  }
</script>
```

打包结果：dist/app.json
```json
{
  "pages": [
    "pages/index/index"
  ],
  "subPackages": [
    {
      "root": "xxx",
      "pages": [
        "pages/other/other",
        "pages/other/other2"
      ]
    }
  ],
  "preloadRule": {
    "pages/index": {
      "network": "all",
      "packages": ["important"]
    },
    "sub1/index": {
      "packages": ["hello", "sub3"]
    }
  }  
}
```

### 分包注意事项

当我们使用分包加载时，依赖包内的跳转路径需注意，比如要跳转到other2页面  
不用分包时会是：wx.jump/pages/other/other2  
使用分包后应为：/test/pages/other/other2  
即前面会多?root={rootKey}的rootKey这一层

为了解决这个问题，有三种方案：

- import的时候在最后加'?resolve', 例如: `import testPagePath from '../pages/testPage.mpx?resolve'` , 编译时就会把它处理成正确的完整的绝对路径。

- 使用相对路径跳转。

- 定死使用的分包路径名，直接写/{rootKey}/pages/xxx （极度不推荐，尤其在分包可能被多方引用的情况时）

这里我们建议使用第一种方式。
