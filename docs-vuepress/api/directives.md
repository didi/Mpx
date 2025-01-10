# 模板指令

## wx:if

`any`

根据表达式的值的 [truthiness](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy) 来有条件地渲染元素。在切换时元素及它的数据绑定 / 组件被销毁并重建。 **注意：如果元素是 `<block/>`, 注意它并不是一个组件，它仅仅是一个包装元素，不会在页面中做任何渲染，只接受控制属性**。

::: danger
当和 `wx:if` 一起使用时，`wx:for` 的优先级比 `wx:if` 更高。详见列[表渲染教程](../guide/basic/list-render.html)
:::

**参考：** [条件渲染 - wx:if](../guide/basic/conditional-render.html)

## wx:elif

`any`

前一兄弟元素必须有 `wx:if` 或 `wx:elif`。表示 `wx:if` 的“ `wx:elif` 块”，可以链式调用。

``` html
<view wx:if="{{type === 'A'}}">
  A
</view>
<view wx:elif="{{type === 'B'}}">
  B
</view>
<view wx:elif="{{type === 'C'}}">
  C
</view>
<view wx:else>
  Not A/B/C
</view>
```

**参考：** [条件渲染 - wx:elif](../guide/basic/conditional-render.html)

## wx:else

不需要表达式，前一兄弟元素必须有 `wx:if` 或 `wx:elif`

为 `wx:if` 或者 `wx:elif` 添加 `wx:else` 块

``` html
<view wx:if="{{type === 'A'}}">
  A
</view>
<view wx:else>
  Not A
</view>
```

**参考：** [条件渲染 - wx:else](../guide/basic/conditional-render.html)

## wx:for

`Array | Object | number | string`

在组件上使用 `wx:for` 控制属性绑定一个数组，即可使用数组中各项的数据重复渲染该组件。默认数组的当前项的下标变量名默认为 `index`，数组当前项的变量名默认为 `item`

``` html
<view wx:for="{{array}}">
  {{ index }}: {{ item.message }}
</view>

// 0: foo
// 1: bar
```

``` js
Page({
  data: {
    array: [{
      message: 'foo'
    }, {
      message: 'bar'
    }]
  }
})
```

`wx:for` 的默认行为会尝试原地修改元素而不是移动它们。要强制其重新排序元素，你需要用特殊 `attribute key` 来提供一个排序提示：

``` html
<view wx:for="{{array}}" wx:key="id">
  {{ item.text }}
</view>

// foo
// bar
```

``` js
import { createComponent } from '@mpxjs/core'
createComponent({
  data: {
    array: [{
      id: 1, text: 'foo'
    }, {
      id: 2, text: 'bar'
    }]
  }
})
```

::: danger
当和 `wx:if` 一起使用时，`wx:for` 的优先级比 `wx:if` 更高。详见列[表渲染教程](../guide/basic/list-render.html)
:::

`wx:for` 的详细用法可以通过以下链接查看教程详细说明。

**参考：** [列表渲染 - wx:for](../guide/basic/list-render.html)

## wx:for-index

`string`

使用 wx:for-index 可以指定数组当前下标的变量名：

``` html
<view wx:for="{{array}}" wx:key="id" wx:for-index="idx">
  {{ idx }}: {{ item.text }}
</view>

// 0: foo
// 1: bar
```

``` js
import { createComponent } from '@mpxjs/core'
createComponent({
  data: {
    array: [{
      id: 1, text: 'foo'
    }, {
      id: 2, text: 'bar'
    }]
  }
})
```

**参考：** [列表渲染 - wx:for-index](../guide/basic/list-render.html)

## wx:for-item

`string`

使用 wx:for-item 可以指定数组当前元素的变量名：

``` html
<view wx:for="{{[1, 2, 3, 4, 5, 6, 7, 8, 9]}}" wx:for-item="i">
  <view wx:for="{{[1, 2, 3, 4, 5, 6, 7, 8, 9]}}" wx:for-item="j">
    <view wx:if="{{i <= j}}">
      {{i}} * {{j}} = {{i * j}}
    </view>
  </view>
</view>
```

**参考：** [列表渲染 - wx:for-item](../guide/basic/list-render.html)

## wx:key

`number | string`

如果列表中项目的位置会动态改变或者有新的项目添加到列表中，并且希望列表中的项目保持自己的特征和状态，需要使用 wx:key 来指定列表中项目的唯一的标识符。
**注意：如不提供 wx:key，会报一个 warning， 如果明确知道该列表是静态，或者不必关注其顺序，可以选择忽略**。

有相同父元素的子元素必须有独特的 key。重复的 key 会造成渲染错误。

常见的用例是结合 `wx:for`：

``` html
<view wx:for="{{array}}" wx:key="id">
  {{ item.text }}
</view>
```

**参考：** [列表渲染 - wx:for](../guide/basic/list-render.html)

## wx:class

绑定HTML Class: 类似vue的class绑定

#对象用法

  我们可以传给 `wx:class` 一个对象，以动态地切换 class：

  ``` html
  <view wx:class="{{ {active: isActive} }}">
    这是一段测试文字
  </view>
  ```

  你可以在对象中传入更多字段来动态切换多个 class。此外，`wx:class` 指令也可以与普通的 class attribute 共存。

  ``` html
  <view class="static" wx:class="{{ {active: isActive, text-danger: hasError} }}">
    这是一段测试文字
  </view>
  ```

  ```js
  <script>
    import {createComponent} from '@mpxjs/core'

    createComponent({
      data: {
       isActive: true,
       hasError: false
      }
    })
  </script>
  ```

  渲染为：

  ``` html
  <view class="static active">
    这是一段测试文字
  </view>
  ```

  **注意：由于微信的限制，`wx:class` 中的 key 值不能使用引号（如: { 'my-class-name': xx }）**

  绑定的数据对象不必内联定义在模板里：

  ``` html
  <view wx:class="{{ classObject }}">
    这是一段测试文字
  </view>
  ```

  ```js
  <script>
    import {createComponent} from '@mpxjs/core'

    createComponent({
      data: {
        classObject: {
          active: true,
          'text-danger': false
        }
      }
    })
  </script>
  ```

  我们也可以在这里绑定一个返回对象的计算属性。

  如果你也想根据条件切换列表中的 class，可以用三元表达式：

  ``` html
  <view wx:class="{{ isActive ? 'active' : '' }}">
    这是一段测试文字
  </view>
  ```

#数组用法

  我们可以把一个数组传给 `wx:class`，以应用一个 class 列表：

  ``` html
  <view wx:class="{{[activeClass, errorClass]}}">
    这是一段测试文字
  </view>
  ```

  ```js
  <script>
    import {createComponent} from '@mpxjs/core'

    createComponent({
      data: {
        activeClass: 'active',
        errorClass: 'text-danger'
      }
    })
  </script>
  ```
  
  渲染为：

  ``` html
  <view wx:class="active text-danger">
    这是一段测试文字
  </view>
  ```

**参考：** [类名样式绑定 - 类名绑定](../guide/basic/class-style-binding.html#类名绑定)

## wx:style

`wx:style` 的对象语法十分直观——看着非常像 CSS，但其实是一个 JavaScript 对象。CSS property 名可以用驼峰式 (camelCase) 或短横线分隔 (kebab-case) 来命名：

``` html
<view wx:style="color: {{activeColor}}; font-size: {{fontSize}}px; fontWeight: bold">
  这是一段测试文字
</view>
```

```js
<script>
  import {createComponent} from '@mpxjs/core'

  createComponent({
    data: {
      activeColor: 'red',
      fontSize: 30
    }
  })
</script>
```

直接绑定到一个样式对象通常更好，这会让模板更清晰：

``` html
<view wx:style="{{styleObject}}">
  这是一段测试文字
</view>
```

```js
<script>
  import {createComponent} from '@mpxjs/core'

  createComponent({
    data: {
      styleObject: {
        color: 'red',
        fontWeight: 'bold'
      }
    },
  })
</script>
```

同样的，对象语法常常结合返回对象的计算属性使用。

`wx:style` 的数组语法可以将多个样式对象应用到同一个元素上

``` html
<view wx:style="{{[baseStyles, overridingStyles]}}">
  这是一段测试文字
</view>
```

**参考：** [类名样式绑定 - 样式绑定](../guide/basic/class-style-binding.html#样式绑定)

## wx:model

除了小程序原生指令之外，mpx 基于input事件提供了一个指令 wx:model, 用于双向绑定。

``` html
<template>
  <view>
    <input wx:model="{{val}}"/>
    <input wx:model="{{test.val}}"/>
    <input wx:model="{{test['val']}}"/>
  </view>
</template>

<script>
  import {createComponent} from '@mpxjs/core'
  createComponent({
    data: {
      val: 'test',
      test: {
        val: 'xxx'
      }
    }
  })
</script>
```

wx:model并不会影响相关的事件处理函数，比如像下面这样：

``` html
<input wx:model="{{inputValue}}" bindinput="handleInput"/>
```

**参考：** [双向绑定](../guide/basic/two-way-binding.html)

## wx:model-prop

wx:model 默认使用 `value` 属性传值，使用 `wx:model-prop` 定义 wx:model 指令对应的属性；

## wx:model-event

wx:model 默认监听 `input` 事件，可以使用 `wx:model-event` 定义 wx:model 指令对应的事件；

父组件
```html
<template>
  <customCheck wx:model="{{checked}}" wx:model-prop="checkedProp" wx:model-event="checkedChange"></customCheck>
</template>

<script>
  import {createPage} from '@mpxjs/core'
  createPage({
    data: {
      checked: true
    }
  })
</script>
<script type="application/json">
  {
    "usingComponents": {
      "customCheck": "./customCheck"
    }
  }
</script>

```

子组件：(customCheck.mpx)
```html
<template>
  <view bindtap="handleTap" class="viewProps">{{checkedProp}}</view>
</template>

<style lang="stylus">
  .viewProps {
    width 100px
    height 100px
    color #000
  }
</style>

<script>
  import {createComponent} from '@mpxjs/core'
  createComponent({
    properties: {
      checkedProp: Boolean
    },
    methods: {
      handleTap () {
        // 这里第二个参数为自定义事件的detail，需要以下面的形式传递值以保持与原生组件对齐
        this.triggerEvent('checkedChange', {
          value: !this.checkedProp
        })
      }
    }
  })
</script>
```

如示例，当子组件被点击时，父组件的checked数据会发生变化

> 注意：由于微信限制，如果事件名使用横线分割（'checked-change'）,将不可以再使用该特性

## wx:model-value-path

指定 wx:model 双向绑定时的取值路径；
并非所有的组件都会按微信的标注格式 `event.detail.value` 来传值，例如 vant 的 input 组件，值是通过抛出 `event.detail` 本身传递的，这时我们可以使用 `wx:model-value-path="[]"` 重新指定取值路径。

```html
<vant-field wx:model-value-path="[]" wx:model="{{a}}"></vant-field>
```

## wx:model-filter

在使用 `wx:model` 时我们可能需要像 Vue 的 `.trim` 、`.lazy` 这样的修饰符来对双向数据绑定的数据进行过滤和修饰；Mpx 通过增强指令 `wx:model-filter` 可以实现这一功能；
该指令可以绑定内建的 filter 或者自定义的 filter 方法，该方法接收过滤前的值，返回过滤操作后的值。

例如我们希望拿到的 input 元素中的数据是经过 trim 的。示例：

> 当然，Mpx 已经内置了 trim 过滤器；可以通过 wx:model-filter="trim" 直接使用；

```html
<template>
  <view class="cover-page">
    <view>
       <!-- wx:model-filter 过滤wx:model 的值-->
      <input type="text" wx:model-filter="trimSpace" wx:model="{{filterData}}" />
      <view >{{filterData.length}}</view>
    </view>
  </view>
</template>

<script>
  import { createPage } from '@mpxjs/core'
  createPage({
    data: {
      filterData: 'model-filter'
    },
    trimSpace (val) {
      // wx:model-filter 绑定的 filter 方法
      return typeof val === 'string' && val.trim()
    },
    methods: {
    }
  })
</script>
``` 

filter 方法除可以是和 `methods` 平级的方法，还可以是 `methods` 中的方法。

```html
<template>...</template>  
<script>
  import { createPage } from '@mpxjs/core'
  createPage({
    data: {
      filterData: 'model-filter'
    },
    methods: {
      trimSpace (val) {
        // wx:model-filter 支持将过滤器方法定义成 methods 中的方法
        return typeof val === 'string' && val.trim()
      }
    }
  })
</script>
```

## wx:ref

`string`

Mpx提供了 `wx:ref=xxx` 来更方便获取 WXML 节点信息的对象。在JS里只需要通过this.$refs.xxx 即可获取节点。

```html
  <view wx:ref="tref">
    123
  </view>

  <script>
    Page({
      ready () {
        this.$refs.tref.fields({size: true}, function (res) {
          console.log(res)
        }).exec()
      }
    })
  </script>
```

**参考：** [获取组件实例 - wx:ref](../guide/basic/refs.html)

## wx:show

`boolean`

与 `wx:if` 所不同的是**不会移除节点**，而是设置节点的 `style` 为 `display: none`。

```html
<view wx:show="{{show}}">
  123
</view>
```

```js
import {createPage} from '@mpxjs/core'
createPage({
  data: {
    show: false
  }
})
```

## bind

`string`

让 `bind + (:?) + eventType` 作为属性值

比如：`bindtap`

```html
<view bindtap="tapTest"> Click me! </view>
<view bind:tap="tapTest1(testVal, $event)"> Click me! </view>
```

```js
Page({
  methods: {
    tapTest () {
      console.log('Clicked!')
    },
    tapTest1 (val, event) {
      console.log(val, event)
    }
  }
})
```

Mpx做了增强的**内联传参**能力以及具体有哪些事件**类型**参考下方

**参考：** [事件处理 - bind](../guide/basic/event.html)

## catch

`string`

让 `catch + (:?) + eventType` 作为属性值

除 `bind` 外，也可以用 `catch` 来绑定事件。与 `bind` 不同，`catch` 会阻止事件向上冒泡。

```html
<view id="outer" bindtap="handleTap1">
  outer view
  <view id="middle" catchtap="handleTap2">
    middle view
    <view id="inner" bindtap="handleTap3">
      inner view
    </view>
  </view>
</view>
```

```js
Page({
  methods: {
    handleTap1 () {
      console.log('outer')
    },
    handleTap2 () {
      console.log('middle')
    },
    handleTap3 () {
      console.log('inner')
    }
  }
})
// 通过几个操作看出被catchtap的middle view阻止了向上冒泡
// click outer
// outer

// click middle
// middle

// click inner
// inner
// middle
```

**参考：** [事件处理 - catch](../guide/basic/event.html)

## capture-bind

`string`

让 `capture-bind + (:?) + eventType` 作为属性值

capture-bind要在bind之前执行，是因为事件是先捕获后冒泡，**注意：仅触摸类事件支持捕获阶段**

```html
  <view id="outer" bind:touchstart="handleTap1" capture-bind:touchstart="handleTap2">
    outer view
    <view id="inner" bind:touchstart="handleTap3" capture-bind:touchstart="handleTap4">
      inner view
    </view>
  </view>
```

点击inner view的调用顺序是(handleTap)2、4、3、1

**参考：** [事件处理 - capture-bind](../guide/basic/event.html)

## capture-catch

`string`

让 `capture-catch + (:?) + eventType` 作为属性值

capture-catch中断捕获阶段和取消冒泡阶段

```html
<view id="outer" bind:touchstart="handleTap1" capture-catch:touchstart="handleTap2">
  outer view
  <view id="inner" bind:touchstart="handleTap3" capture-bind:touchstart="handleTap4">
    inner view
  </view>
</view>
```

点击inner view仅执行handleTap2

**参考：** [事件处理 - capture-catch](../guide/basic/event.html)


## @mode

`type mode = 'wx' | 'ali' | 'qq' | 'swan' | 'tt' | 'web' | 'qa' | 'ios' | 'android' | 'harmony'`

### 属性中使用
跨平台输出场景下，Mpx 框架允许用户在组件上使用 @ 和 | 符号来指定某个节点或属性只在某些平台下有效。

```html
<button
  open-type@wx|swan|ios="getUserInfo"
  bindgetuserinfo@wx|swan|ios="getUserInfo"
  open-type@ali|ios="getAuthorize"
  scope@ali="userInfo"
  enable-background@ios|android="{{ true }}"
  onTap@ali="onTap">
  获取用户信息
</button>
```
例如在上述示例中：
* 在支付宝小程序与微信和百度小程序等平台分别生效的 open-type 等属性
* 在输出iOS或android平台时，enable-background 属性生效
* 以及事件绑定或其他属性灵活的进行条件编译

假设当前 srcMode 为 wx，目标平台为 ali，则输出产物为：
```html
<button
  open-type="getAuthorize"
  scope="userInfo"
  onTap="onTap">
  获取用户信息
</button>
```
假设当前 srcMode 为 wx，目标平台为 ios，则输出产物为：
```html
<button
  open-type="getAuthorize"
  bindgetuserinfo="getUserInfo"
  open-type="getAuthorize"
  enable-background="{{ true }}"
  >
  获取用户信息
</button>
```

### 节点中使用
同时，该指令也可以作用在单个节点上，来对节点进行跨平台条件判断。

但需要注意的是，该指令作用在单个节点时，节点仅在目标平台输出，同时节点自身属性不会进行跨平台语法转换，不过其子节点不受影响。

```html
<!--当srcMode为wx，跨平台输出ali时-->
<!--错误写法-->
<view @ali bindtap="someClick">
    <view wx:if="{{flag}}">text</view>
</view>
<!--正确写法-->
<view @ali onTap="someClick">
    <view wx:if="{{flag}}">text</view>
</view>
```
::: danger
另外在跨端输出 React Native 和 H5 时，不要在基础组件节点上使用 @mode 指令，仅可在自定义组件节点使用 @mode 指令
:::
```html
<!--错误写法-->
<view @ios>测试数据</view>
```

## @_mode

`type _mode = '_wx' | '_ali' | '_qq' | '_swan' | '_tt' | '_web' | '_qa' ｜ '_ios' | '_android' | '_harmony'`

有时开发者期望使用 @mode 这种方式仅控制节点的展示，保留节点属性的平台转换能力，为此 Mpx 实现了一个隐式属性条件编译能力。
```html
<!--srcMode为 wx，输出 ali 时，bindtap 会被正常转换为 onTap-->
<view @_ali bindtap="someClick">test</view>
```
在对应的平台前加一个_，例如@_ali、@_swan、@_tt等，使用该隐式规则仅有条件编译能力，节点属性语法转换能力依旧。

在跨端输出 React Native 和 H5 时，可以在节点上使用该属性。

## @env

`string`

跨平台输出场景下，除了 mode 平台场景值，Mpx 框架还提供自定义 env 目标应用，来实现在不同应用下编译产出不同的代码。

关于 env 的详细介绍可以点击[查看](../guide/advance/platform.html#use-env)

跨平台输出使用 env 与 mode 一样支持文件纬度、区块纬度、节点纬度、属性纬度等条件编译，这里我们仅介绍下节点和属性纬度的指令模式使用，env 与 mode 可以组合使用。

env 属性维度条件编译与 mode 的用法大致相同，使用 : 符号与 mode 和其他 env 进行串联，与 mode 组合使用格式形如 attr@mode:env:env|mode:env，为了不与 mode 混淆，当条件编译中仅存在 env 条件时，也需要添加 : 前缀，形如 attr@:env。

```html
<!--open-type 属性仅在百度平台且应用 env 为 didi 时保留-->
<button open-type@swan:didi="getUserInfo">获取用户信息</button>
<!--open-type 属性在应用 env 为 didi 的任意小程序平台保留-->
<button open-type@:didi="getUserInfo">获取用户信息</button>
<!--open-type 属性在微信平台且应用 env 为 didi 或 qingju 时保留-->
<button open-type@wx:didi:qingju="getUserInfo">获取用户信息</button>
```

env 也可在单个节点上进行条件编译：

```html
<!--整个节点在应用 env 为 didi时进行保留-->
<view @:didi>this is a  view component</view>
```

需要注意的时，如果只声明了 env，没有声明 mode，跨平台输出时框架对于节点属性默认会进行转换：

```html
<!--srcMode为wx，跨平台输出ali时，bindtap会被转为onTap-->
<view @:didi bindtap="someClick">this is a  view component</view>
<view bindtap@:didi ="someClick">this is a  view component</view>
```

## mpxTagName

`string`

跨平台输出时，有时开发者不仅需要对节点属性进行条件编译，可能还需对节点标签进行条件编译。

为此，Mpx 框架支持了一个特殊属性 mpxTagName，如果节点存在这个属性，在最终输出时将节点标签修改为该属性的值，配合属性维度条件编译，即可实现对节点标签进行条件编译，例如在百度环境下希望将某个 view 标签替换为 cover-view，我们可以这样写：

```html
<view mpxTagName@swan="cover-view">will be cover-view in swan</view>
```

