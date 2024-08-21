# Mpx转RN模版使用指南

## 模版指令
目前 Mpx 输出 React Native 仅支持以下指令，具体使用范围可参考如下文档

| 指令名    | 说明                               |
| --------- | ---------------------------------- |
| wx:if     | 根据表达式的值的来有条件地渲染元素       |
| wx:elif   | 根据表达式的值的来有条件地渲染元素，前一兄弟元素必须有 wx:if 或 wx:elif |
| wx:else   | 不需要表达式，前一兄弟元素必须有 wx:if 或 wx:elif |
| wx:show   | 根据表达式的值的来有条件地渲染元素，与 wx:if 所不同的是不会移除节点，而是设置节点的 style 为 display: none |
| wx:style  | 动态绑定 style 样式 |
| wx:class  | 动态绑定 class 样式 |
| wx:for | 在组件上使用 wx:for 绑定一个数组，即可使数组中各项的数据重复渲染该组件 |
| wx:for-item | 指定数组当前元素的变量名 |
| wx:for-index | 指定数组当前下标的变量名 |
| wx:key | 指定列表中项目的唯一的标识符 |
| wx:ref | 获取节点信息 |
| mpxTagName | 动态转换标签 |
| component | 使用 component is 动态切换组件 |
| @mode   | 使用 @ 符号来指定某个节点或属性只在某些平台下有效 |
| @_mode  | 隐式属性条件编译，仅控制节点的展示，保留节点属性的平台转换能力 |
| @env   | 自定义 env 目标应用，来实现在不同应用下编译产出不同的代码 |

## 事件编写
目前 Mpx 输出 React Native 的事件编写遵循小程序的事件编写规范，支持事件的冒泡及捕获

普通事件绑定
```js
<view bindtap="handleTap">
    Click here!
</view>
```

绑定并阻止事件冒泡
```js
<view catchtap="handleTap">
    Click here!
</view>
```

事件捕获

```js
<view capture-bind:touchstart="handleTap1">
  outer view
  <view capture-bind:touchstart="handleTap2">
    inner view
  </view>
</view>
```

中断捕获阶段和取消冒泡阶段

```js
<view capture-catch:touchstart="handleTap1">
  outer view
</view>

```

在此基础上也新增了事件处理内联传参的增强机制。

```html
<template>
 <!--Mpx增强语法，模板内联传参，方便简洁-->
 <view bindtap="handleTapInline('b')">b</view>
 </template>
 <script setup>
  // 直接通过参数获取数据，直观方便
  const handleTapInline = (name) => {
    console.log('name:', name)
  }
  // ...
</script>
```

除此之外，Mpx 也支持了动态事件绑定

```html
<template>
 <!--动态事件绑定-->
 <view wx:for="{{items}}" bindtap="handleTap_{{index}}">
  {{item}}
</view>
 </template>
 <script setup>
  import { ref } from '@mpxjs/core'

  const data = ref(['Item 1', 'Item 2', 'Item 3', 'Item 4'])
  const handleTap_0 = (event) => {
    console.log('Tapped on item 1');
  },

  const handleTap_1 = (event) => {
    console.log('Tapped on item 2');
  },

  const handleTap_2 = (event) => {
    console.log('Tapped on item 3');
  },

  const handleTap_3 = (event) => {
    console.log('Tapped on item 4');
  }
</script>
```
注意事项：

当同一个元素上同时绑定了 catchtap 和 bindtap 事件时:

两个事件都会被触发执行。
但是是否阻止事件冒泡的行为,会以模板上第一个绑定的事件标识符为准。
如果第一个绑定的是 catchtap，那么不管后面绑定的是什么,都会阻止事件冒泡。
如果第一个绑定的是 bindtap，则不会阻止事件冒泡。

同理,如果同一个元素上绑定了 capture-bind:tap 和 bindtap:

事件的执行时机会根据模板上第一个绑定事件的标识符来决定:
如果第一个绑定的是 capture-bind:tap，则事件会在捕获阶段触发。
如果第一个绑定的是 bindtap，则事件会在冒泡阶段触发。

## 基础组件

目前 Mpx 输出 React Native 仅支持以下组件，具体使用范围可参考如下文档

### view
视图容器。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| hover-class	             | string  |         | 指定按下去的样式类。 |
| hover-start-time   | number  |     50    | 按住后多久出现点击态，单位毫秒|
| hover-stay-time	  | number  |     400    | 手指松开后点击态保留时间，单位毫秒	 |
| enable-offset		  | Number  |     false    | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|

事件

| 事件名           | 说明                                                 |
| ----------------| --------------------------------------------------- |
| bindtap       |  点击的时候触发   |


### text
文本。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| user-select             | boolean  | `false`       | 文本是否可选。 |
| disable-default-style             | boolean  | `false`       |  会内置默认样式，比如fontSize为16。设置`true`可以禁止默认的内置样式。 |
| enable-offset		  | Number  |     false    | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|


事件


| 事件名           | 说明                                                 |
| ----------------| --------------------------------------------------- |
| bindtap       |  点击的时候触发         |

注意事项
1. 未包裹 text 标签的文本，会自动包裹 text 标签。
2. text 组件开启 enable-offset 后，offsetLeft、offsetWidth 获取时机仅为组件首次渲染阶段

### image
图片。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| src                     | String  | `false`       | 图片资源地址，支持本地图片资源及 base64 格式数据，暂不支持 svg 格式 |
| mode                    | String  | `scaleToFill` | 图片裁剪、缩放的模式，适配微信 image 所有 mode 格式              |
| enable-offset          | Number  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|

事件

| 事件名           | 说明                                                 |
| ----------------| --------------------------------------------------- |
| binderror       | 当错误发生时触发，event.detail = { errMsg }            |
| bindload        | 当图片载入完毕时触发，event.detail = { height, width }  |

注意事项

1. image 组件默认宽度320px、高度240px
2. image 组件进行缩放时，计算出来的宽高可能带有小数，在不同webview内核下渲染可能会被抹去小数部分

### input
输入框。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| value                   | String  |               | 输入框的初始内容                                              |
| type                    | String  | `text`        | input 的类型，不支持 `safe-password`、`nickname`              |
| password                | Boolean | `false`       | 是否是密码类型                                               |
| placeholder             | String  |               | 输入框为空时占位符                                            |
| placeholder-class       | String  |               | 指定 placeholder 的样式类，仅支持 color 属性                   |
| placeholder-style       | String  |               | 指定 placeholder 的样式，仅支持 color 属性                    |
| disabled                | Boolean | `false`       | 是否禁用                                                    |
| maxlength               | Number  | `140`         | 最大输入长度，设置为 -1 的时候不限制最大长度                     |
| auto-focus              | Boolean | `false`       | (即将废弃，请直接使用 focus )自动聚焦，拉起键盘                  |
| focus                   | Boolean | `false`       | 获取焦点                                                    |
| confirm-type            | String  | `done`        | 设置键盘右下角按钮的文字，仅在 type='text' 时生效               |
| confirm-hold            | Boolean | `false`       | 点击键盘右下角按钮时是否保持键盘不收起                           |
| cursor                  | Number  |               | 指定 focus 时的光标位置                                      |
| cursor-color            | String  |               | 光标颜色                                                    |
| selection-start         | Number  | `-1`          | 光标起始位置，自动聚集时有效，需与 selection-end 搭配使用         |
| selection-end           | Number  | `-1`          | 光标结束位置，自动聚集时有效，需与 selection-start 搭配使用       |
| enable-offset          | Number  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|

事件

| 事件名                | 说明                                                                               |
| ---------------------| ---------------------------------------------------------------------------------- |
| bindinput            | 键盘输入时触发，event.detail = { value, cursor }，不支持 `keyCode`                     |
| bindfocus            | 输入框聚焦时触发，event.detail = { value }，不支持 `height`                            |
| bindblur             | 输入框失去焦点时触发，event.detail = { value }，不支持 `encryptedValue`、`encryptError` |
| bindconfirm          | 点击完成按钮时触发，event.detail = { value }                                          |
| bind:selectionchange | 选区改变事件, event.detail = { selectionStart, selectionEnd }                        |

方法

可通过 `ref` 方式调用以下组件实例方法

| 方法名                | 说明                                 |
| ---------------------| ----------------------------------- |
| focus                | 使输入框得到焦点                       |
| blur                 | 使输入框失去焦点                       |
| clear                | 清空输入框的内容                       |
| isFocused            | 返回值表明当前输入框是否获得了焦点        |


### textarea
多行输入框。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| value                   | String  |               | 输入框内容                                                   |
| type                    | String  | `text`        | input 的类型，不支持 `safe-password`、`nickname`              |
| placeholder             | String  |               | 输入框为空时占位符                                            |
| placeholder-class       | String  |               | 指定 placeholder 的样式类，仅支持 color 属性                   |
| placeholder-style       | String  |               | 指定 placeholder 的样式，仅支持 color 属性                    |
| disabled                | Boolean | `false`       | 是否禁用                                                    |
| maxlength               | Number  | `140`         | 最大输入长度，设置为 -1 的时候不限制最大长度                     |
| auto-focus              | Boolean | `false`       | (即将废弃，请直接使用 focus )自动聚焦，拉起键盘                  |
| focus                   | Boolean | `false`       | 获取焦点                                                    |
| auto-height             | Boolean | `false`       | 是否自动增高，设置 auto-height 时，style.height不生效          |
| confirm-type            | String  | `done`        | 设置键盘右下角按钮的文字，不支持 `return`                       |
| confirm-hold            | Boolean | `false`       | 点击键盘右下角按钮时是否保持键盘不收起                           |
| cursor                  | Number  |               | 指定 focus 时的光标位置                                      |
| cursor-color            | String  |               | 光标颜色                                                    |
| selection-start         | Number  | `-1`          | 光标起始位置，自动聚集时有效，需与 selection-end 搭配使用         |
| selection-end           | Number  | `-1`          | 光标结束位置，自动聚集时有效，需与 selection-start 搭配使用       |
| enable-offset          | Number  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|

事件

| 事件名                | 说明                                                                               |
| ---------------------| ---------------------------------------------------------------------------------- |
| bindinput            | 键盘输入时触发，event.detail = { value, cursor }，不支持 `keyCode`                     |
| bindfocus            | 输入框聚焦时触发，event.detail = { value }，不支持 `height`                            |
| bindblur             | 输入框失去焦点时触发，event.detail = { value }，不支持 `encryptedValue`、`encryptError` |
| bindconfirm          | 点击完成按钮时触发，event.detail = { value }                                          |
| bindlinechange       | 输入框行数变化时调用，event.detail = { height: 0, lineCount: 0 }，不支持 `heightRpx`    |
| bind:selectionchange | 选区改变事件, {selectionStart, selectionEnd}                                         |

方法

可通过 `ref` 方式调用以下组件实例方法

| 方法名                | 说明                                 |
| ---------------------| ----------------------------------- |
| focus                | 使输入框得到焦点                       |
| blur                 | 使输入框失去焦点                       |
| clear                | 清空输入框的内容                       |
| isFocused            | 返回值表明当前输入框是否获得了焦点        |


### button
按钮。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                      |
| ----------------------- | ------- | ------------- | --------------------------------------------------------- |
| size                    | String  | `default`     | 按钮的大小                                                  |
| type                    | String  | `default`     | 按钮的样式类型                                               |
| plain                   | Boolean | `false`       | 按钮是否镂空，背景色透明                                       |
| disabled                | Boolean | `false`       | 是否禁用                                                    |
| loading                 | Boolean | `false`       | 名称前是否带 loading 图标                                     |
| open-type               | String  |               | 微信开放能力，当前仅支持 `share`                               |
| hover-class             | String  |               | 指定按钮按下去的样式类。当 hover-class="none" 时，没有点击态效果  |
| hover-start-time        | Number  |  `20`         | 按住后多久出现点击态，单位毫秒                                  |
| hover-stay-time         | Number  |  `70`         | 手指松开后点击态保留时间，单位毫秒                               |
| enable-offset          | Number  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|


### scroll-view
可滚动视图区域。

属性

| 属性名                   | 类型     | 默认值     | 说明                                               |
| ----------------------- | ------- | --------- | -------------------------------------------------- |
| scroll-x                | Boolean | `false`   | 允许横向滚动动 |
| scroll-y                | Boolean | `false`   | 允许纵向滚动  |
| upper-threshold         | Number  | `50`      | 距顶部/左边多远时(单位 px),触发 scrolltoupper 事件      |
| lower-threshold         | Number  | `50`      | 距底部/右边多远时(单位 px),触发 scrolltolower 事件      |
| scroll-top              | Number  | `0`       | 设置纵向滚动条位置                                    |
| scroll-left             | Number  | `0`       | 设置横向滚动条位置                                    |
| scroll-with-animation   | Boolean | `false`   | 在设置滚动条位置时使用动画过渡                          |
| enable-back-to-top      | Boolean | `false`   | 点击状态栏的时候视图会滚动到顶部                        |
| enhanced                | Boolean | `false`   | scroll-view 组件功能增强                             |
| refresher-enabled       | Boolean | `false`   | 开启自定义下拉刷新                                    |
| scroll-anchoring        | Boolean | `false`   | 开启滚动区域滚动锚点                                   |
| refresher-default-style | String  | `'black'` | 设置下拉刷新默认样式,支持 `black`、`white`、`none`，仅安卓支持 |
| refresher-background    | String  | `'#fff'`  | 设置自定义下拉刷新背景颜色，仅安卓支持                         |
| refresher-triggered     | Boolean | `false`   | 设置当前下拉刷新状态,true 表示已触发               |
| paging-enabled          | Number  | `false`   | 分页滑动效果 (同时开启 enhanced 属性后生效)，当值为 true 时，滚动条会停在滚动视图的尺寸的整数倍位置  |
| show-scrollbar          | Number  | `true`   | 滚动条显隐控制 (同时开启 enhanced 属性后生效)|
| enable-offset          | Number  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|


事件

| 事件名           | 说明                |
| ----------------| ------------------ |
| binddragstart| 滑动开始事件，同时开启 enhanced 属性后生效|
| binddragging| 滑动事件，同时开启 enhanced 属性后生效 |
| binddragend| 滑动结束事件，同时开启 enhanced 属性后生效 |
| bindscrolltoupper   | 滚动到顶部/左边触发 | 
| bindscrolltolower   | 滚动到底部/右边触发 | 
| bindscroll          | 滚动时触发         | 
| bindrefresherrefresh| 自定义下拉刷新被触发 |  

注意事项

1. 目前不支持自定义下拉刷新节点，使用 slot="refresher" 声明无效，在 React Native 环境中还是会被当作普通节点渲染出来

### swiper
滑块视图容器。

属性

| 属性名                   | 类型     | 默认值              | 说明                                 |
| ----------------------- | ------- | ------------------  | ------------------------------------|
| indicator-dots          | Boolean | `false`             | 是否显示面板指示点                     |
| indicator-color         | color   | `rgba(0, 0, 0, .3)` | 指示点颜色                            |
| indicator-active-color  | color   | `#000000`           | 当前选中的指示点颜色                   |
| autoplay                | Boolean | `false`             | 是否自动切换                          |
| current                 | Number  | `0`                 | 当前所在滑块的 index                  |
| interval                | Number  | `5000`              | 自动切换时间间隔                       |
| duration                | Number  | `500`               | 滑动动画时长                          |
| circular                | Boolean | `false`             | 是否采用衔接滑动                       |
| vertical                | Boolean | `false`             | 滑动方向是否为纵向                      |
| previous-margin         | String  | `0`                 | 前边距，可用于露出前一项的一小部分，接受px |
| next-margin             | String  | `0`                 | 后边距，可用于露出后一项的一小部分，接受px |
| enable-offset          | Number  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|


事件

| 事件名           | 说明                |
| ----------------| ------------------ |
| bindchange| current 改变时会触发 change 事件，event.detail = {current, source}|

### swiper-item
1. 仅可放置在swiper组件中，宽高自动设置为100%。

属性

| 属性名                   | 类型     | 默认值              | 说明                                 |
| ----------------------- | ------- | ------------------  | ------------------------------------|
| item-id                 | string  | `无`             | 该 swiper-item 的标识符                  |
