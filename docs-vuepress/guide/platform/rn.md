# 跨端输出RN
大致介绍

## 跨端样式定义

### CSS选择器

### 样式单位

### 文本样式继承

### 简写样式属性

### CSS函数

### 使用原子类

## 混合编写RN代码

### 使用RN组件

### 使用React hooks

## 能力支持范围

### 模版语法

#### 事件处理
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

注意事项

1. 当同一个元素上同时绑定了 catchtap 和 bindtap 事件时，两个事件都会被触发执行。但是是否阻止事件冒泡的行为,会以模板上第一个绑定的事件标识符为准。
如果第一个绑定的是 catchtap，那么不管后面绑定的是什么,都会阻止事件冒泡。如果第一个绑定的是 bindtap，则不会阻止事件冒泡。
2. 当同一个元素上绑定了 capture-bind:tap 和 bindtap 事件时，事件的执行时机会根据模板上第一个绑定事件的标识符来决定。如果第一个绑定的是 capture-bind:tap，则事件会在捕获阶段触发，如果第一个绑定的是 bindtap，则事件会在冒泡阶段触发。
3. 当使用了事件委托想获取 e.target.dataset 时，只有点击到文本节点才能获取到，点击其他区域无效。建议直接将事件绑定到事件触发的元素上，使用 e.currentTarget 来获取 dataset 等数据。
4. 由于 tap 事件是由 touchend 事件模拟实现，所以如果子组件绑定了 catchtap，那么父组件的 touchend 事件将不会响应。同理如果子组件绑定了 catchtouchend，那么父组件的 tap 事件将不会响应。
5. 如果元素上设置了 opacity: 0 的样式，会导致 ios 事件无法响应。


### 基础组件
目前 Mpx 输出 React Native 仅支持以下组件，文档中未提及的组件以及组件属性即为不支持，具体使用范围可参考如下文档

基础组件通用属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| enable-offset		  | Boolean  |     false    | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|
| enable-var	  | Boolean  |     true    | 默认支持使用 css variable，若想关闭该功能可设置为 false |
| parent-font-size		  | Number |         | 父组件字体大小，主要用于百分比计算的场景，如 font-size: 100%|
| parent-width		  | Number  |         | 父组件宽度，主要用于百分比计算的场景，如 width: calc(100% - 20px)，需要在外部传递父组件的宽度|
| parent-height		  | Number  |         | 父组件高度，主要用于百分比计算的场景，如 height: calc(100% - 20px),需要在外部传递父组件的高度|

以上基础组件的通用属性仅在 React Native 环境中支持。在跨平台输出到小程序或 Web 时，这些属性将无法使用。

由于 view、text、scroll-view、image 和 input 组件都是基于 React Native 原生组件实现的，因此这些组件默认继承原生组件支持的属性。

#### view
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


#### scroll-view
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
| scroll-into-view	        | Boolean | `false` | 值应为某子元素id（id不能以数字开头）                               |
| refresher-default-style | String  | `'black'` | 设置下拉刷新默认样式,支持 `black`、`white`、`none`，仅安卓支持 |
| refresher-background    | String  | `'#fff'`  | 设置自定义下拉刷新背景颜色，仅安卓支持                         |
| refresher-triggered     | Boolean | `false`   | 设置当前下拉刷新状态,true 表示已触发               |
| paging-enabled          | Number  | `false`   | 分页滑动效果 (同时开启 enhanced 属性后生效)，当值为 true 时，滚动条会停在滚动视图的尺寸的整数倍位置  |
| show-scrollbar          | Number  | `true`   | 滚动条显隐控制 (同时开启 enhanced 属性后生效)|
| enable-offset          | Number  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|
| enable-trigger-intersection-observer  |  Boolean   |  []    | 是否开启intersection-observer |
| simultaneous-handlers  | `Array<object>`  |    []    | 主要用于组件嵌套场景，允许多个手势同时识别和处理并触发，这个属性可以指定一个或多个手势处理器，处理器支持使用 this.$refs.xxx 获取组件实例来作为数组参数传递给 scroll-view 组件 |
| wait-for  |  `Array<object>`   |  []    | 主要用于组件嵌套场景，允许延迟激活处理某些手势，这个属性可以指定一个或多个手势处理器，处理器支持使用 this.$refs.xxx 获取组件实例来作为数组参数传递给 scroll-view 组件 |


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
2. 若使用 scroll-into-view 属性，需要 id 对应的组件节点添加 wx:ref 标记，否则无法正常滚动
3. simultaneous-handlers 为 RN 环境特有属性，具体含义可参考[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/#simultaneouswithexternalgesture)
4. wait-for  为 RN 环境特有属性，具体含义可参考[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/#requireexternalgesturetofail)


#### swiper
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
| scale                   | Boolean  | `false`            | 滑动时是否开启前后元素缩小,默认是缩放0.7倍, 暂不支持自定义 |
| enable-offset           | Number  | `false`       | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|
| easing-function         | String  | `linear`      | 支持 linear、easeInCubic、easeOutCubic、easeInOutCubic|
| bindchange              | eventhandle|   无          | current 改变时会触发 change 事件，event.detail = {current, source}| 




事件

| 事件名           | 说明                |
| ----------------| ------------------ |
| bindchange| current 改变时会触发 change 事件，event.detail = {current, source}|

#### swiper-item
仅可放置在swiper组件中，宽高自动设置为100%。

属性

| 属性名                   | 类型     | 默认值              | 说明                                 |
| ----------------------- | ------- | ------------------  | ------------------------------------|
| item-id                 | string  | `无`             | 该 swiper-item 的标识符                  |

#### movable-area
movable-view的可移动区域。

注意事项

1. movable-area不支持设置 scale-area，缩放手势生效区域仅在 movable-view 内

#### movable-view
可移动的视图容器，在页面中可以拖拽滑动。movable-view 必须在 movable-area 组件中，并且必须是直接子节点，否则不能移动。


属性

| 属性名 | 类型             | 默认值 | 说明                                                                                                  |
| ------ | ---------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| direction   | String           |   none     | 目前支持 all、vertical、horizontal、none｜
| inertia   | boolean           |   false     | movable-view是否带有惯性｜
| out-of-bounds   | boolean           |   false     | 超过可移动区域后，movable-view是否还可以移动｜
| x   | Number |      | 定义x轴方向的偏移  |
| y  | Number  |        | 定义y轴方向的偏移 |
| friction  | Number  |    7    | 摩擦系数 |
| disabled  | boolean  |    false    | 是否禁用 |
| animation  | boolean  |    true    | 是否使用动画	 |
| simultaneous-handlers  | `Array<object>`  |    []    | 主要用于组件嵌套场景，允许多个手势同时识别和处理并触发，这个属性可以指定一个或多个手势处理器，处理器支持使用 this.$refs.xxx 获取组件实例来作为数组参数传递给 movable-view 组件 |
| wait-for  |  `Array<object>`  |  []    | 主要用于组件嵌套场景，允许延迟激活处理某些手势，这个属性可以指定一个或多个手势处理器，处理器支持使用 this.$refs.xxx 获取组件实例来作为数组参数传递给 movable-view 组件 |

事件

| 事件名               | 说明                                       |
| -------------------- | ------------------------------------------ |
| bindchange        | 拖动过程中触发的事件，event.detail = {x, y, source} |
| bindscale         | 缩放过程中触发的事件，event.detail = {x, y, scale}    |
| htouchmove          | 初次手指触摸后移动为横向的移动时触发 |
| vtouchmove    | 初次手指触摸后移动为纵向的移动时触发                      |


注意事项

1. simultaneous-handlers 为 RN 环境特有属性，具体含义可参考[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/#simultaneouswithexternalgesture)
2. wait-for  为 RN 环境特有属性，具体含义可参考[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/#requireexternalgesturetofail)

#### root-portal
使整个子树从页面中脱离出来，类似于在 CSS 中使用 fixed position 的效果。主要用于制作弹窗、弹出层等。
属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| enable   | boolean           |   true	     | 是否从页面中脱离出来	

注意事项

1. style 样式不支持中使用百分比计算、css variable

#### cover-view
视图容器。
功能同 view 组件

#### cover-image
视图容器。
功能同 image 组件

#### icon
图标组件


属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| type      | String  |               | icon 的类型，有效值：success、success_no_circle、info、warn、waiting、cancel、download、search、clear |
| size      | String \| Number  |     23    | icon 的大小 |
| color		  | String  |         | icon 的颜色，同 css 的 color |


#### text
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


#### button
按钮。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                      |
| ----------------------- | ------- | ------------- | --------------------------------------------------------- |
| size                    | String  | `default`     | 按钮的大小，`default`：默认大小，`mini`：小尺寸                                                  |
| type                    | String  | `default`     | 按钮的样式类型，`primary`：绿色，`default`：白色，`warn`：红色                                               |
| plain                   | Boolean | `false`       | 按钮是否镂空，背景色透明                                       |
| disabled                | Boolean | `false`       | 是否禁用                                                    |
| loading                 | Boolean | `false`       | 名称前是否带 loading 图标                                     |
| open-type               | String  |               | 微信开放能力，当前仅支持 `share`                               |
| hover-class             | String  |               | 指定按钮按下去的样式类。当 hover-class="none" 时，没有点击态效果  |
| hover-start-time        | Number  |  `20`         | 按住后多久出现点击态，单位毫秒                                  |
| hover-stay-time         | Number  |  `70`         | 手指松开后点击态保留时间，单位毫秒                               |
| enable-offset          | Number  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|


#### label
用来改进表单组件的可用性


注意事项

1. 当前不支持使用 for 属性找到对应 id，仅支持将控件放在该标签内，目前可以绑定的空间有：checkbox、radio、switch。
   

#### checkbox
多选项目


属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| value	    | String   |              | checkbox 标识，选中时触发 checkbox-group 的 change 事件，并携带 checkbox 的 value |
| disabled  | Boolean  |     false    | 是否禁用 |
| checked	  | Boolean  |     false    | 当前是否选中，可用来设置默认选中 |
| color		  | String   |     #09BB07  | checkbox的颜色，同css的color |


#### checkbox-group
多项选择器，内部由多个checkbox组成。


事件

| 事件名           | 说明                |
| ----------------| ------------------ |
| bindchange      | checkbox-group 中选中项发生改变时触发 change 事件，detail = { value: [ 选中的 checkbox 的 value 的数组 ] } |


#### radio
单选项目


属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| value	    | String  |               | radio 标识，当该 radio 选中时，radio-group 的 change 事件会携带 radio 的 value |
| disabled  | Boolean  |     false    | 是否禁用 |
| checked	  | Boolean  |     false    | 当前是否选中，可用来设置默认选中 |
| color		  | String   |     #09BB07  | checkbox 的颜色，同 css 的 color |


#### radio-group
单项选择器，内部由多个 radio 组成


事件

| 事件名           | 说明                |
| ----------------| ------------------ |
| bindchange      | radio-group 中选中项发生改变时触发 change 事件，detail = { value: [ 选中的 radio 的 value 的数组 ] } |


#### form
表单。

当点击 form 表单中 form-type 为 submit 的 button 组件时，会将表单组件中的 value 值进行提交，需要在表单组件中加上 name 来作为 key。

事件

| 事件名     | 说明                                                |
| ---------- | --------------------------------------------------- |
| bindsubmit | 携带 form 中的数据触发 submit 事件，event.detail = {value : {'name': 'value'} } |
| bindreset  | 表单重置时会触发 reset 事件 |


#### input
输入框。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| value                   | String  |               | 输入框的初始内容                                              |
| type                    | String  | `text`        | input 的类型，可选值为 `text`、`number`、`idcard`、`digit`，不支持 `safe-password`、`nickname`              |
| password                | Boolean | `false`       | 是否是密码类型                                               |
| placeholder             | String  |               | 输入框为空时占位符                                            |
| placeholder-class       | String  |               | 指定 placeholder 的样式类，仅支持 color 属性                   |
| placeholder-style       | String  |               | 指定 placeholder 的样式，仅支持 color 属性                    |
| disabled                | Boolean | `false`       | 是否禁用                                                    |
| maxlength               | Number  | `140`         | 最大输入长度，设置为 -1 的时候不限制最大长度                     |
| auto-focus              | Boolean | `false`       | (即将废弃，请直接使用 focus )自动聚焦，拉起键盘                  |
| focus                   | Boolean | `false`       | 获取焦点                                                    |
| confirm-type            | String  | `done`        | 设置键盘右下角按钮的文字，仅在 type='text' 时生效，可选值为 `send`、`search`、`next`、`go`、`done`              |
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


#### textarea
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
| confirm-type            | String  | `done`        | 设置键盘右下角按钮的文字，可选值为 `send`、`search`、`next`、`go`、`done`，不支持 `return`                       |
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

#### picker-view

嵌入页面的滚动选择器。其中只可放置 [*picker-view-column*](#picker-view-column) 组件，其它节点不会显示

- 属性

| 属性名                   | 类型              | 默认值              | 说明                                 |
| ----------------------- | ------------------| ------------------ | ------------------------------------|
| value                   | Array\<number\>   | `[]`           | 数组中的数字依次表示 *picker-view* 内的 [*picker-view-column*](#picker-view-column) 选择的第几项（下标从 0 开始），数字大于 [*picker-view-column*](#picker-view-column) 可选项长度时，选择最后一项。|
| indicator-style         | String          |                | 设置选择器中间选中框的样式 |
| indicator-class         | String          |                | 设置选择器中间选中框的类名 |
| mask-style              | String          |                | 设置蒙层的样式           |
| mask-class              | String          |                | 设置蒙层的类名           |

- 事件

| 事件名           | 说明                |
| ----------------| ------------------ |
| bindchange      | 滚动选择时触发 change 事件，`event.detail = {value}`，其中 `value` 为数组，表示 *picker-view* 内的 [*picker-view-column*](#picker-view-column) 当前选择的是第几项（下标从 0 开始） |

- 触感反馈回调方法

通过在全局注册 `mpx.config.rnConfig.pickerVibrate` 方法，在每次滚动选择时会调用该方法。

| 注册触感方法名           | 类型          | 说明                |
| ----------------------| --------------| ------------------- |
| pickerVibrate         | Function      | 注册自定义触感反馈方法。调用时机：在每次滚动选择时会调用该方法。可以在方法内自定义实现类似 iOS 端原生表盘的振动触感。    |

#### picker-view-column

滚动选择器子项。仅可放置于 [*picker-view*](#picker-view) 中，其孩子节点的高度会自动设置成与 [*picker-view*](#picker-view) 的选中框的高度一致

#### picker

从底部弹起的滚动选择器。

属性

| 属性名                  | 类型         | 默认值             | 说明                          |
| -----------------------| ------------| ------------------ | -----------------------------|
| mode                   | string      | `selector`         | 选择器类型，合法值如下表所示      |
| disabled               | boolean     | `false`            | 是否禁用                       |

- `mode` 合法值

  | 合法值         | 说明         |
  | --------------| ------------|
  | selector      | 普通选择器    |
  | multiSelector | 多列选择器    |
  | time          | 时间选择器    |
  | date          | 日期选择器    |
  | region        | 省市区选择器  |

公共事件

| 事件名           | 说明                                                 |
| ----------------| ----------------------------------------------------|
| bindcancel      | 取消选择时触发                                         |
| bindchange      | value 改变时触发 change 事件，`event.detail = {value}` |

##### 普通选择器：mode = selector

属性

| 属性名                  | 类型                     | 默认值         | 说明                           |
| -----------------------| ------------------------| ------------- | -----------------------------|
| range                  | array[object]/array     | `[]`          | mode 为 selector 或 multiSelector 时，range 有效 |
| range-key              | string                  | `false`       | 当 range 是一个 Object Array 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容 |
| value                  | number                  | 0             | 表示选择了 range 中的第几个（下标从 0 开始）|

##### 多列选择器：mode = multiSelector
属性

| 属性名                  | 类型                     | 默认值         | 说明                           |
| -----------------------| ------------------------| ------------- | -----------------------------|
| range                  | array[object]/array     | `[]`          | mode 为 selector 或 multiSelector 时，range 有效 |
| range-key              | string                  | `false`       | 当 range 是一个 Object Array 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容 |
| value                  | array                   | `[]`          | 表示选择了 range 中的第几个（下标从 0 开始）|
| bindcolumnchange       |                         |               | 列改变时触发|

##### 多列选择器：时间选择器：mode = time
属性

| 属性名                  | 类型                     | 默认值         | 说明                           |
| -----------------------| ------------------------| ------------- | -----------------------------|
| value                  | string                  | `[]`          | 表示选中的时间，格式为"hh:mm" |
| start                  | string                  | `false`       | 表示有效时间范围的开始，字符串格式为"hh:mm" |
| end                    | string                   | `[]`         | 表示有效时间范围的结束，字符串格式为"hh:mm"|

##### 多列选择器：时间选择器：mode = date
属性

| 属性名                  | 类型                     | 默认值         | 说明                                      |
| -----------------------| ------------------------| ------------- | ------------------------------------------|
| value                  | string                  | `当天`         | 表示选中的日期，格式为"YYYY-MM-DD"            |
| start                  | string                  | `false`       | 表示有效日期范围的开始，字符串格式为"YYYY-MM-DD" |
| end                    | string                   | `[]`         | 表示有效日期范围的结束，字符串格式为"YYYY-MM-DD" |
| fields                 | string                   | `day`        | 有效值 year,month,day，表示选择器的粒度        |

##### fields 有效值：
| 属性名                  | 说明                     |
| -----------------------| ------------------------ | 
| year                   | 选择器粒度为年             | 
| month                  | 选择器粒度为月份           |
| day                   | 选择器粒度为天              |

##### 省市区选择器：mode = region
属性

| 属性名                  | 类型                     | 默认值         | 说明                                      |
| -----------------------| ------------------------| ------------- | ------------------------------------------|
| value                  | array                   | `[]`          | 表示选中的省市区，默认选中每一列的第一个值       |
| custom-item            | string                  |               | 可为每一列的顶部添加一个自定义的项              |
| level                  | string                  | `region`      | 选择器层级                                  |

##### level 有效值：
| 属性名                  | 说明                     |
| -----------------------| ------------------------ | 
| province               | 选省级选择器               | 
| city                   | 市级选择器                 |
| region                 | 区级选择器                 |

#### image
图片。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| src                     | String  | `false`       | 图片资源地址及 base64 格式数据 |
| mode                    | String  | `scaleToFill` | 图片裁剪、缩放的模式，可选值为 `scaleToFill`、`aspectFit`、`aspectFill`、`widthFix`、`heightFix`、`top`、`bottom`、`center`、`left`、`right`、`top left`、`top right`、`bottom left`、`bottom right`             |
| enable-offset          | Boolean  | `false`   | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|
| enable-fast-image          | Boolean  | `false`   | 开启后将使用 react-native-fast-image 进行图片渲染，请根据实际情况开启 |

事件

| 事件名           | 说明                                                 |
| ----------------| --------------------------------------------------- |
| binderror       | 当错误发生时触发，event.detail = { errMsg }            |
| bindload        | 当图片载入完毕时触发，event.detail = { height, width }  |

注意事项

1. image 组件默认宽度320px、高度240px
2. image 组件进行缩放时，计算出来的宽高可能带有小数，在不同webview内核下渲染可能会被抹去小数部分


#### switch
开关选择器。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| checked		             | boolean  |         | 是否选中 |
| disabled   | boolean  |     false    | 是否禁用	|
| type	  | string  |     `switch`    | 样式，有效值：switch, checkbox		 |
| color		  | string  |     `#04BE02`    | switch 的颜色，同 css 的 color|


事件

| 事件名           | 说明                                                 |
| ----------------| --------------------------------------------------- |
| bindchange       |  点击的时候触发   |

#### navigator
页面链接。

属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| hover-class	             | string  |    false      | 指定按下去的样式类。 |
| hover-start-time   | number  |     50    | 按住后多久出现点击态，单位毫秒|
| hover-stay-time	  | number  |     400    | 手指松开后点击态保留时间，单位毫秒	 |
| open-type		  | String  |     `navigate`    | 可支持`navigateBack`、`redirect`、`switchTab`、`reLaunch`、`navigateTo`|
| url		  | String  |     ``    |  当前Navite内的跳转链接	|


事件

| 事件名           | 说明                                                 |
| ----------------| --------------------------------------------------- |
| bindtap       |  点击的时候触发   |



#### rich-text
富文本。


属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| nodes			             | array/string  |    []     | 节点列表/HTML String |




#### canvas
画布。

事件

| 属性名                   | 类型      | 说明                                                       |
| ----------------------- | ------- | ---------------------------------------------------------- |
| bindtouchstart	    | eventhandle  | 手指触摸动作开始		|
| bindtouchmove	    | eventhandle  | 手指触摸后移动		|
| bindtouchend	    | eventhandle  | 手指触摸动作结束	|
| bindtouchcancel	    | eventhandle  | 手指触摸动作被打断	|
| bindlongpress    | eventhandle  | 手指长按 350ms 之后触发	|
| binderror	    | eventhandle  | 当发生错误时触发 error 事件， detail = {errMsg}	|

API

 方法名                     | 说明  |
| ----------------------- | ------- |
| createImage	     |  创建一个图片对象。 仅支持在 2D Canvas 中使用	|
| createImageData	      | 创建一个 ImageData 对象。仅支持在 2D Canvas 中使用		|
| getContext	      | 该方法返回 Canvas 的绘图上下文。仅支持在 2D Canvas 中使用	|
| toDataURL	      | 返回一个包含图片展示的 data URI	|

注意事项

1. canvas 组件目前仅支持 2D 类型，不支持 webgl
2. 通过 Canvas.getContext('2d') 接口可以获取 CanvasRenderingContext2D 对象，具体接口可以参考 (HTML Canvas 2D Context)[https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D] 定义的属性、方法
3. canvas 的实现主要借助于 PostMessage 方式与 webview 容器通信进行绘制，所以对于严格依赖方法执行时机的场景，如调用 drawImage 绘图，再通过 getImageData 获取图片数据的场景，调用时需要使用 await 等方式来保证方法的执行时机
4. 通过 Canvas.createImage 画图，图片的链接不能有特殊字符，安卓手机可能会 load 失败

#### web-view
承载网页的容器。会自动铺满整个RN页面


属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| src	    | String  |               | webview 指向网页的链接，如果需要对跳转的URL设定白名单可跳转，需要在业务跳转之前出来该逻辑
| bindmessage	    | EventHandler  |               | 网页向RN通过 postMessage 传递数据
| bindload	    | EventHandler  |               | 网页加载成功时候触发此事件
| binderror	    | EventHandler  |               | 网页加载失败的时候触发此事件


注意事项

1. web-view网页中可使用@mpxjs/webview-bridge@2.9.68版本提供的接口返回RN页面或与RN页面通信，具体使用细节可以参见[Webview API](#WebviewAPI)

#### 自定义组件

#### 样式规则

#### 应用能力

#### 环境API
在RN环境中也提供了一部分常用api能力，方法名与使用方式与小程序相同，个别api提供的能力或者返回值(返回值部分如果不支持，会在调用是有warn提醒)会比微信小程序提供的能力少一些，以下是使用说明：
##### 使用说明
如果全量引入api-proxy这种情况下，需要如下配置
```javascript
// 全量引入api-proxy
import mpx from '@mpxjs/core'
import apiProxy from '@didi/mpxjs-api-proxy'
mpx.use(apiProxy, { usePromise: true })
```

| api方法                                                                                                                                                                                              | 依赖的react-native三方库                        |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| showActionSheet                                                                                                                                                                                    | react-native-reanimated                   |
| getNetworkType、<br/>offNetworkStatusChange、<br/>onNetworkStatusChange                                                                                                                              | @react-native-community/netinfo           |
| getLocation、<br/>openLocation、<br/>chooseLocation                                                                                                                                                  | react-native-get-location                 |
| setStorage、<br/> setStorageSync、<br/>getStorage、<br/> getStorageSync、<br/>getStorageInfo、<br/>getStorageInfoSync、<br/>removeStorage，<br/>removeStorageSync，<br/>clearStorage，<br/>clearStorageSync | @react-native-async-storage/async-storage |
| getSystemInfo、<br/>getSystemInfoSync、<br/>getDeviceInfo、<br/>getWindowInfo、<br/>getLaunchOptionsSync、<br/>getEnterOptionsSync                                                                      | react-native-device-info                  |
| getWindowInfo、<br/>getLaunchOptionsSync、<br/>getEnterOptionsSync                                                                                                                                   | react-native-safe-area-context            |
| vibrateShort、<br/> vibrateLong                                                                                                                                                                     | react-native-haptic-feedback              |

在RN 项目中，如果是以全量引入api-proxy的方法需要在RN环境中执行以下所有的命令，如果只是使用单个api的能力，可以参考上表来判断安装对应的包
```
// 安装api-proxy下所用到的依赖 如果
npm i @react-native-async-storage/async-storage
npm i @react-native-clipboard/clipboard
npm i @react-native-community/netinfo
npm i react-native-safe-area-context
npm i react-native-device-info
npm i react-native-reanimated
npm i react-native-haptic-feedback
ios项目需要执行如下命令
cd ios
pod install

npm i react-native-get-location
```

android下需要做如下配置：
安装react-native-get-location包后，需要在AndroidManifest.xml中定义位置权限，[参考文档](https://www.npmjs.com/package/react-native-get-location)
```
<!-- Define ACCESS_FINE_LOCATION if you will use enableHighAccuracy=true  -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>

<!-- Define ACCESS_COARSE_LOCATION if you will use enableHighAccuracy=false  -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>

```
安装react-native-haptic-feedback包后需要在安卓中配置，[配置参考文档](https://github.com/mkuczera/react-native-haptic-feedback)
打开 android/app/src/main/java/[...]/MainApplication.java. 在文件的顶部添加以下导入下面的代码片段
```
import com.mkuczera.RNReactNativeHapticFeedbackPackage;
```


修改设置,将下面的配置添加到android/settings.gradle文件中

```
include ':react-native-haptic-feedback'
project(':react-native-haptic-feedback').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-haptic-feedback/android')
```
react-native-reanimated在mpx和RN项目都要安装，安装好包后需要在babel.config.json文件中做如下配置，并且RN环境中使用的react-native-reanimated与mpx项目中安装的react-native-reanimated版本要一致：
[配置参考文档](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
```
module.exports = {
    presets: [
      ... // don't add it here :)
    ],
    plugins: [
      ...
      'react-native-reanimated/plugin',
    ],
};
```

注意事项：

1. 调用 `@mpxjs/api-proxy` 当中抹平跨端环境的 `createSelectorQuery` 方法创建的 `SelectorQuery` 实例，在使用过程中需要手动调用实例上的 `in` 方法来指定组件上下文。示例：

```javascript
import { createComponent } from '@mpxjs/core'

createComponent({
  attached () {
    const query = wx.createSelectorQuery()
    query.select('#the-id').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function(res){
      res[0].top       // #the-id节点的上边界坐标
      res[1].scrollTop // 显示区域的竖直滚动位置
    }).in(this) // this 为组件实例
  }
})
````

2. `SelectorQuery.select/SelectorQuery.selectAll` 方法目前仅支持2种选择器写法
  * id 选择器：`#id`
  * class 选择器（可连续指定多个）：`.a-class` 或 `.a-class.b-class.c-class`

<!-- WebviewAPI -->
#### Webview API
对于web-view组件打开的网页，想要跟RN通信，或者跳转到RN页面，提供了以下能力

| 方法名           | 说明                                          |
|---------------|---------------------------------------------|
| navigateTo    | 保留当前webview页面，跳转RN页面                        |
| navigateBack  | 关闭当前页面，返回上一页或多级RN页面                         |
| switchTab        | 跳转到RN的 tabBar 页面                            |
| reLaunch        | 关闭所有页面，打开到应用内的某个RN页面                        |
| redirectTo        | 关闭当前页面，跳转到应用内的某个RN页面                        |
| getEnv        | 获取当前环境                                      |
| postMessage        | 向RN发送消息，实时触发组件的message事件                    |
| invoke        | 开放一个webview页面和web页面互通消息的能力 |

##### webview-bridge示例代码
```javascript
import webviewBridge from '@mpxjs/webview-bridge'
webviewBridge.navigateTo({
  url: 'RN地址',
  success: () => {
    console.log('跳转成功')
  }
})
```

##### invoke示例代码
对于业务中一些特殊的方法，需要有web与RN进行交互的这种情况，基于这种情况在mpx框架内部提供了挂载方法的能力，在webview-bridge提供了invoke通信的能力，具体使用方法如下：

RN环境中挂载getTime的逻辑
```javascript
import mpx from '@mpxjs/core'
...
// 普通方法
mpx.config.webviewConfig = {
  apiImplementations: {
    getTime:  (options = {}) => {
      const { params = {} } = options
      return {
        text: params.text,
        time: '2024-12-24'
      }
    }
  }
}
// 或者promise
mpx.config.webviewConfig = {
  apiImplementations: {
    getTime:  (options = {}) => {
      return new Promise((resolve, reject) => {
        const { params = {} } = options
        if (params.text) {
          resolve({
            text: params.text,
            time: '2024-12-24'
          })
        } else {
          reject(new Error('没有传text参数'))
        }
      })
    }
  }
}
...
```
web中通信的逻辑
```javascript
import webviewBridge from '@mpxjs/webview-bridge'
webviewBridge.invoke('getTime', {
  params: {
    text: '我是入参'
  },
  success: (res) => {
    console.log('接收到的消息：', res.time)
  }
})
```


#### 其他使用限制
如事件的target等
