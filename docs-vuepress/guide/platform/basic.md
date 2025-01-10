# 跨端输出基础

Mpx以微信增强DSL为基础，支持跨端输出至多端小程序、web和客户端，包括支付宝、百度、抖音、京东、QQ等多端小程序平台，基于Vue的web平台，和基于react-native的ios、android及鸿蒙平台。


## 跨端输出配置

配置mpx进行跨端输出十分简单，找到项目构建的webpack配置，在@mpxjs/webpack-plugin的配置参数中设置mode和srcMode参数即可。

```javascript
new MpxwebpackPlugin({
  // mode为mpx编译的目标平台，可选值有(wx|ali|swan|qq|tt|jd|web|ios|android|harmony)
  mode: 'ali',
  // srcMode为mpx编译的源码平台，目前仅支持wx   
  srcMode: 'wx'
})
```

对于使用 @mpxjs/cli 创建的项目，可以通过在 `npm script` 当中定义 `targets` 来设置编译的目标平台，多个平台标识以`,`分隔。

```javascript
// 项目 package.json
{
  "script": {
    "build:cross": "mpx-cli-service build --targets=wx,ali,ios,android"
  }
}
```

## 跨端条件编译

Mpx跨端输出时在框架内针对不同平台的差异进行了大量的转换抹平工作，但框架能做的工作始终是有限的，对于框架无法抹平的部分我们会在编译和运行时进行报错提示，同时提供了完善的跨平台条件编译机制，便于用户自行进行差异化处理，该能力也能够用于实现区分平台进行业务逻辑实现。

Mpx中我们支持了三种维度的条件编译，分别是文件维度，区块维度和代码维度，其中，文件维度和区块维度主要用于处理一些大块的平台差异性逻辑，而代码维度主要用于处理一些局部简单的平台差异。

### 文件维度条件编译

文件维度条件编译简单的来说就是文件为维度进行跨平台差异代码的编写，例如在微信->支付宝的项目中存在一个业务地图组件map.mpx，由于微信和支付宝中的原生地图组件标准差异非常大，无法通过框架转译方式直接进行跨平台输出，这时你可以在相同的位置新建一个map.ali.mpx，在其中使用支付宝的技术标准进行开发，编译系统会根据当前编译的mode来加载对应模块，当mode为ali时，会优先加载map.ali.mpx，反之则会加载map.mpx。

文件维度条件编译能够与webpack alias结合使用，对于npm包的文件我们并不方便在原本的文件位置创建.ali的条件编译文件，但我们可以通过webpack alias在相同位置创建一个`虚拟的`.ali文件，并将其指向项目中的其他文件位置。

```js
  // 对于npm包中的文件依赖
  import npmModule from 'somePackage/lib/index'

  // 配置以下alias后，当mode为ali时，会优先加载项目目录中定义的projectRoot/somePackage/lib/index文件
  // vue.config.js
  module.exports = defineConfig({
    configureWebpack() {
      return {
        resolve: {
          alias: {
            'somePackage/lib/index.ali': 'projectRoot/somePackage/lib/index'
          }
        }
      }
    }
  })
```

### 区块维度条件编译

在.mpx单文件中一般存在template、js、stlye、json四个区块，mpx的编译系统支持以区块为维度进行条件编译，只需在区块标签中添加`mode`属性定义该区块的目标平台即可，示例如下：

```html
<!--编译mode为ali时使用如下区块-->
<template mode="ali">
<!--该区块中的所有代码需采用支付宝的技术标准进行编写-->
  <view>支付宝环境</view>
</template>

<!--其他编译mode时使用如下区块-->
<template>
  <view>其他环境</view>
</template>
```

### 代码维度条件编译

如果只有局部的代码存在跨平台差异，mpx同样支持在代码内使用if/else进行局部条件编译，用户可以在js代码和template插值中访问`__mpx_mode__`获取当前编译mode，进行平台差异逻辑编写，js代码中使用示例如下。

除了 `__mpx_mode__` 这个默认插值以外，有别的环境变量需要的话可以在mpx.plugin.conf.js里通过defs进行配置。

```js
if(__mpx_mode__ === 'ali') {
  // 执行支付宝环境相关逻辑
} else {
  // 执行其他环境相关逻辑
}
```
template代码中使用示例如下

```html
<!--此处的__mpx_mode__不需要在组件中声明数据，编译时会基于当前编译mode进行替换-->
<view wx:if="{{__mpx_mode__ === 'ali'}}">支付宝环境</view>
<view wx:else>其他环境</view>
```

JSON中的条件编译（注意，这个依赖JSON的动态方案，得通过name="json"这种方式来编写，其实写的是js代码，最终module.exports导出一个可json化的对象即可）：
```html
<script name="json">
const pages = __mpx_mode__ === 'wx' ? [
  'main/xxx',
  'sub/xxx'
] : [
  'test/xxx'
] // 可以为不同环境动态书写配置
module.exports = {
  usingComponents: {
    aComponents: '../xxxxx' // 可以打注释 xxx组件
  }
}
</script>
```

样式的条件编译：
```css
/*
  @mpx-if (__mpx_env__ === 'someEvn')
*/
  /* @mpx-if (__mpx_mode__ === 'wx') */
  .backColor {
    background: green;
  }
  /*
    @mpx-elif (__mpx_mode__ === 'qq')
  */
  .backColor {
    background: black;
  }
  /* @mpx-endif */

  /* @mpx-if (__mpx_mode__ === 'swan') */
  .backColor {
    background: cyan;
  }
  /* @mpx-endif */
  .textSize {
    font-size: 18px;
  }
/*
  @mpx-else
*/
.backColor {
  /* @mpx-if (__mpx_mode__ === 'swan') */
  background: blue;
  /* @mpx-else */
  background: red;
  /* @mpx-endif */
}
/*
  @mpx-endif
*/
```

### 属性维度条件编译

属性维度条件编译允许用户在组件上使用 `@` 和 `|` 符号来指定某个节点或属性只在某些平台下有效。

对于同一个 button 组件，微信小程序支持 `open-type="getUserInfo"`，但是支付宝小程序支持 `open-type="getAuthorize" `。如果不使用任何维度的条件编译，则在编译的时候会有警告和报错信息。

比如业务中需要通过 button 按钮获取用户信息，虽然可以使用代码维度条件编译来解决，但是增加了很多代码量：

```html
<button
  wx:if="{{__mpx_mode__ === 'wx' || __mpx_mode__ === 'swan'}}"
  open-type="getUserInfo"
  bindgetuserinfo="getUserInfo">
  获取用户信息
</button>

<button
  wx:elif="{{__mpx_mode__ === 'ali'}}"
  open-type="getAuthorize"
  scope="userInfo"
  onTap="onTap">
  获取用户信息
</button>
```

而用属性维度的编译则方便很多：

```html
<button
  open-type@wx|swan="getUserInfo"
  bindgetuserinfo@wx|swan="getUserInfo"
  open-type@ali="getAuthorize"
  scope@ali="userInfo"
  onTap@ali="onTap">
  获取用户信息
</button>
```

属性维度的编译也可以对整个节点进行条件编译，例如只想在支付宝小程序中输出某个节点：

```html
<view @ali>this is view</view>
```
需要注意使用上述用法时，节点自身在构建时框架不会对节点属性进行平台语法转换，但对于其子节点，框架并不会继承父级节点 mode，会进行正常跨平台语法转换。
```html
<!--错误示例-->
<view @ali bindtap="otherClick">
    <view bindtap="someClick">tap click</view>
</view>
// srcMode 为 wx 跨端输出 ali 结果为
<view @ali bindtap="otherClick">
    <view onTap="someClick">tap click</view>
</view>
```
上述示例为错误写法，假如srcMode为微信小程序，用上述写法构建输出支付宝小程序时，父节点 bindtap 不会被转为 onTap，在支付宝平台执行时事件会无响应。

正确写法如下：
```html
<!--正确示例-->
<view @ali onTap="otherClick">
    <view bindtap="someClick">tap click</view>
</view>
// 输出 ali 产物
<view @ali onTap="otherClick">
    <view onTap="someClick">tap click</view>
</view>
```
有时开发者期望使用 @ali 这种方式仅控制节点的展示，保留节点属性的平台转换能力，为此 Mpx 实现了一个隐式属性条件编译能力
```html
<!--srcMode为 wx，输出 ali 时，bindtap 会被正常转换为 onTap-->
<view @_ali bindtap="someClick">test</view>
```
在对应的平台前加一个_，例如@_ali、@_swan、@_tt等，使用该隐式规则仅有条件编译能力，节点属性语法转换能力依旧。

有时候我们不仅需要对节点属性进行条件编译，可能还需要对节点标签进行条件编译。

为此，我们支持了一个特殊属性 `mpxTagName`，如果节点存在这个属性，我们会在最终输出时将节点标签修改为该属性的值，配合属性维度条件编译，即可实现对节点标签进行条件编译，例如在百度环境下希望将某个 view 标签替换为 cover-view，我们可以这样写：

```html
<view mpxTagName@swan="cover-view">will be cover-view in swan</view>
```

### 通过 env 实现自定义目标环境的条件编译 {#use-env}

Mpx 支持在以上四种条件编译的基础上，通过自定义 env 的形式实现在不同环境下编译产出不同的代码。

实例化 MpxWebpackPlugin 的时候，传入配置 env。

```javascript
// vue.config.js
module.exports = defineConfig({
  pluginOptions: {
    mpx: {
      srcMode: 'wx' // srcMode为mpx编译的源码平台，目前仅支持wx
      plugin: {
        env: "didi" // env为mpx编译的目标环境，需自定义
      }
    }
  }
})
```

#### 文件维度条件编译

微信转支付宝的项目中存在一个业务地图组件map.mpx，由于微信和支付宝中的原生地图组件标准差异非常大，无法通过框架转译方式直接进行跨平台输出，而且这个地图组件在不同的目标环境中也有很大的差异，这时你可以在相同的位置新建一个 map.ali.didi.mpx 或 map.ali.qingju.mpx，在其中使用支付宝的技术标准进行开发，编译系统会根据当前编译的 mode 和 env 来加载对应模块，当 mode 为 ali，env 为 didi 时，会优先加载 map.ali.didi.mpx、map.ali.mpx，如果没有定义 env，则会优先加载 map.ali.mpx，反之则会加载 map.mpx。

#### 区块维度条件编译

在.mpx单文件中一般存在template、js、stlye、json四个区块，mpx的编译系统支持以区块为维度进行条件编译，只需在区块标签中添加`mode`或`env`属性定义该区块的目标平台即可，示例如下：

```html
<!--编译mode为ali且env为didi时使用如下区块，优先级最高是4-->
<template mode="ali" env="didi">
  <view>该区块中的所有代码需采用支付宝的技术标准进行编写</view>
</template>

<!--编译mode为ali时使用如下区块，优先级是3-->
<template mode="ali">
  <view>该区块中的所有代码需采用支付宝的技术标准进行编写</view>
</template>

<!--编译env为didi时使用如下区块，优先级是2-->
<template env="didi">
  <view>该区块中的所有代码需采用支付宝的技术标准进行编写</view>
</template>

<!--其他环境，优先级是1-->
<template>
  <view>该区块中的所有代码需采用支付宝的技术标准进行编写</view>
</template>
```

注意，如果多个相同的区块写相同的 mode 和 env，默认会用最后一个，如：

```html
<template mode="ali">
  <view>该区块会被忽略</view>
</template>

<template mode="ali">
  <view>默认会用这个区块</view>
</template>
```

#### 代码维度条件编译

如果在 MpxWebpackPlugin 插件初始化时自定义了 env，你可以访问`__mpx_env__`获取当前编译env，进行环境差异逻辑编写。使用方法与`__mpx_mode__`相同。

#### 属性维度条件编译

env 属性维度条件编译与 mode 的用法大致相同，使用 `:` 符号与 mode 和其他 env 进行串联，与 mode 组合使用格式形如 `attr@mode:env:env|mode:env`，为了不与 mode 混淆，当条件编译中仅存在 env 条件时，也需要添加 `:` 前缀，形如 `attr@:env`。

对于同一个 button 组件，微信小程序支持 `open-type="getUserInfo"`，但是支付宝小程序支持 `open-type="getAuthorize" `。如果不使用任何维度的条件编译，则在编译的时候会有警告和报错信息。

如果当前编译的目标平台是 wx，以下写法 open-type 属性将被忽略

```html
<button open-type@swan:didi="getUserInfo">获取用户信息</button>
```

如果当前 env 不是 didi，以下写法 open-type 属性也会被忽略
```html
<button open-type@:didi="getUserInfo">获取用户信息</button>
```

如果只想在 mode 为 wx 且 env 为 didi 或 qingju 的环境下使用 open-type 属性，则可以这样写：
```html
<button open-type@wx:didi:qingju="getUserInfo">获取用户信息</button>
```

env 属性维度的编译同样支持对整个节点或者节点标签名进行条件编译：

```html
<view @:didi>this is a  view component</view>
<view mpxTagName@:didi="cover-view">this is a  view component</view>
```
如果只声明了 env，没有声明 mode，跨平台输出时框架对于节点属性默认会进行转换：
```html
<!--srcMode为wx，跨平台输出ali时，bindtap会被转为onTap-->
<view @:didi bindtap="someClick">this is a  view component</view>
<view bindtap@:didi ="someClick">this is a  view component</view>
```


## 环境API跨端抹平

## Webview环境跨端抹平



