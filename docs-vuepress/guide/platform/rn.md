# 跨端输出RN

## 跨端样式定义
RN 样式属性和 Web/小程序中 CSS 样式属性是相交关系，RN 有一小部分样式属性（比如 tintColor、writingDirection 等） CSS 不支持，CSS 也有少部分样式属性 RN 不支持（比如 clip-path、animation、transition 等）。

因此，一方面，在我们进行跨平台开发时，跨平台样式属性声明要尽量使用两边样式属性的交集；另一方面为了减少开发适配的成本，Mpx 内部也对 RN 的样式作了部分抹平。

Mpx 框架在样式处理部分的具体工作主要分为两大类有：

**编译时的class类样式转化**
- 属性名转驼峰
- 单位的校验和对齐
- 过滤 RN 不支持的属性和属性值
- 简写转换
- 样式属性差异转换和拉齐

**运行时的style样式处理**
- 属性名转驼峰
- 单位的计算和处理
- 100% 计算
- css func 处理，包括 env()、calc()、var()
### CSS选择器
RN 环境下仅支持单个**类选择器**，不支持类名组合选择器，不过逗号组合的选择器本质上还是单类选择器，是可以支持的。
``` css
/* 支持 */
.classname {
  color: red
}
.classA, .classB {
  color: red
}
/* 不支持 */
view, text {
  color: red
}
.classA .classB {
  color: red
}
```
### 样式单位
Mpx转RN, 支持以下单位，部分单位在部分情况下存在使用限制
#### 数值类型单位说明
| 单位 | 支持情况 | 特殊说明 |
| ---- | ---- | ---- |
| % | 支持 | 百分比单位参考下面说明|
| px | 支持 | 无 |
| rpx | 支持 | rpx会根据屏幕宽度动态计算成实际的px |
| vh | 支持 | 屏幕的高度，在使用非自定义导航时，页面初次渲染计算出来的vh是屏幕高度，后续更新渲染使用实际可视区域高度，推荐使用此单位的页面使用自定义导航 |
| vw | 支持 | 无 |
#### 百分比单位说明
RN很多原生较多属性不支持百分比，比如font-size、translate等，但是这些属性在编写web、小程序代码的过程中使用较多，框架进行了抹平支持。以下这些属性在Mpx输出RN时专门进行了百分比单位的适配，部分属性存在编写的时候的特殊适配。
##### 特殊的百分比计算规则
###### font-size

font-size 百分比计算依赖开发者传入的 parent-font-size 属性，框架将根据开发者传入 parent-font-size 的值来计算 font-size 的百分比大小
> 备注：当 font-size 设置为百分比，未设置 parent-font-size 属性或者 parent-font-size 属性值非数值，会报错提示开发者且框架不计算 font-size 直接返回 

###### line-height

和 Web/小程序类似，当设置 line-height: 1.2; line-height: 120%; 这种 number 或百分比值时，实际都是按百分比来计算。line-height 的百分比计算基准是 font-size 的大小，所以在设置 line-height 为 number 或者百分比值时，要保证同时有设置 font-size 大小。 

> 备注：设置 line-height 注意区分有无单位，line-height: 12 会按照 line-height: 1200% 来计算处理，line-height: 12px 会按照正常单位计算。
##### 根据自身宽高计算百分比
translateX/translateY/border-radius 的百分比都是根据自身宽高的来计算的。
> 注意事项
> - RN 0.76 版本 translateX/translateY 支持百分比
> - translateX/border-radius 都是根据节点的 width 来计算百分比，而 translateY 是根据节点的 height 来计算的百分比
> - border-radius-*(top/right/bottom/left) 百分比计算逻辑和 border-radius 一致
> - 根据自身宽高计算百分比需要在完成渲染后在 onLayout 获取自身宽高计算并设置，故这些属性设置生效都在第一次 onLayout 后
> - 因动画执行不会触发 onLayout，所以最好不要在动画中使用这些属性的百分比
##### 根据父节点宽高计算百分比
除了上述两中规则外，属性 width/left/right/height/top/bottom/margin/padding 等设置百分比时的计算基准都是父节点的宽高，且 RN 支持设置百分比，无需框架额外处理。

有一种情况例外，则是在上述属性值中设置为 calc 函数且表达式使用百分比，如 width: calc(100% - 10px)。

###### calc() 函数内的百分比使用方式

如有在 calc 函数表达式内使用百分比的场景，则需要开发者设置 parent-width 或 parent-height 属性，传入百分比计算的基准值。

以父节点高度为基准值计算百分比的属性如 height/top/bottom 则需要传入 parent-height 属性；以父节点宽度为基准值计算百分比的属性如 width/left/right 则需要传入 parent-width 属性。

> 备注：属性通过父节点宽度还是高度来计算基准，一般遵循纵向以高度为基准，横向以宽度为基准的大原则
#### 色值 color 类型支持的值格式说明
- hex-color(十六进制)
- rgb/rgba
- hsl/hsla
- hwb
- named color，具体参考[颜色枚举值](https://reactnative.dev/docs/colors#named-colors)
- Color ints(仅 RN 支持，如 0xff00ff00 )

```css
/* <named-color> 值 */
color: red;
color: orange;
color: tan;
color: rebeccapurple;

/* <hex-color> 值 */
color: #090;
color: #009900;
color: #090a;
color: #009900aa;

/* <rgb()> 值 */
color: rgb(34, 12, 64, 0.6);
color: rgba(34, 12, 64, 0.6);
color: rgb(34 12 64 / 0.6);
color: rgba(34 12 64 / 0.3);
color: rgb(34 12 64 / 60%);
color: rgba(34.6 12 64 / 30%);

/* <hsl()> 值 */
color: hsl(30, 100%, 50%, 0.6);
color: hsla(30, 100%, 50%, 0.6);
color: hsl(30 100% 50% / 0.6);
color: hsla(30 100% 50% / 0.6);
color: hsl(30 100% 50% / 60%);
color: hsla(30.2 100% 50% / 60%);

/* <hwb()> 值 */
color: hwb(90 10% 10%);
color: hwb(90 10% 10% / 0.5);
color: hwb(90deg 10% 10%);
color: hwb(1.5708rad 60% 0%);
color: hwb(0.25turn 0% 40% / 50%);
```

### 文本样式继承
Web/小程序中，文本节点可以通过 div/view 节点进行直接包裹，在 div/view 节点上也可以直接设定对应文本样式。
但是在RN中，必须通过 Text 来创建文本节点，[文本样式属性](https://reactnative.dev/docs/text-style-props)只有设置给 Text 节点才能生效。
Mpx 框架抹平了这部分的差异，在使用 Mpx 转 RN 时，我们可以使用 view 节点直接包裹文本，也可以在 view 节点上设置文本样式作用到直接子 text 节点上。
但仍因受限于[RN内 text 的样式继承原则的限制](https://reactnative.dev/docs/text#limited-style-inheritance)，只有 view 节点下的子 text 节点可以继承 view 节点上的文本样式，且 text 节点之间可以继承。
具体参考以下代码：
#### 示例代码
``` html
<!-- 示例1 -->
<view class="wrapper">
   文本1
   <text class="content">文本2</text>
   <text class="content"><text>文本3<text/></text>
   <view class="content">文本4</view>
   <view class="content"><view>文本5</view></view>
</view>

.wrapper {
    font-size: 20px;
}
.content {
    text-align: right;
}
<!-- 
小程序&web: 
- 文本1-6 均为字体大小20px，文字居右
RN: 
- 文本1 字体大小20px
- 文本2 字体大小20px，文字居右
- 文本3 字体大小20px，文字居右
- 文本4 文字居右
- 文本5 字体&居中未生效
-->
```
> 备注
> 1. 只有父级 view 节点的文本样式可以被子 text 节点继承；
> 2. view 节点直接包裹文本实际上等同于 view>text>文本，Mpx 框架在编译时若检测到 view 节点直接包裹文本会自动添加一层 text 节点；
> 3. 多级 text 节点可实现文本样式的继承，比如 text>text>文本 ；
> 4. 若不想使用 Mpx 内部实现的 view>text>文本 这种文本样式继承，可设置`disable-default-style=true` 来关闭该继承逻辑；
### 简写样式属性
在 Mpx 内对于通过 class 类来定义的样式会按照 RN 的样式规则在编译处理一遍，其中最重要的一部分就是将 RN 不支持简写属性按约定的规则转换成 RN 能支持多属性结构。

现已支持的简写属性如下:
- [text-shadow](#text-shadow)
- [text-decoration](#text-decoration)
- [flex](#flex)
- [flex-flow](#flex-flow)
- [margin](#margin)
- [padding](#padding)
- [background](#background)
- [box-shadow](#box-shadow)
- [border-radius](#border-radius)
- [border-width](#border-width)
- [border-color](#border-color)
- [border](#border)
- [border-top|border-right|border-bottom|border-left](#border-topborder-rightborder-bottomborder-left)

> **注意事项**
> 
> - 考虑到运行时转化的性能开销问题，简写能力只在编译处理时转化，所以 class 类上设置时简写属性会处理转化的，而在 style 属性上使用了对应的简写是不会转化的，若对应的简写属性 RN 不支持，则在 RN style 属性上不能使用，需直接使用多个属性组合来实现。
> - 简写属性不支持 单个 var() 函数，所以简写属性传入单个 var() 编译时会有错误提示，并且原样返回，这可能会导致 RN 运行时错误。
> - 若是多个 var() 函数则会按顺序赋给各个属性

### CSS函数
在介绍 CSS 函数前我们先来了解一下自定义属性的概念。
#### 自定义属性（CSS 变量）
**自定义属性**（有时候也被称作 **CSS 变量**或者**级联变量**），带有前缀 -- 的属性名，表示的是带有值的自定义属性，比如 --example--name。

通常与 var() 一起使用，由自定义属性标记设定值（带有前缀 -- 的属性名，比如： --main-color: black;），由 var() 函数来获取值（比如： color: var(--main-color);）
> 备注
> - 自定义属性受级联的约束，并从其父级继承其值
> - 自定义属性名区分大小写
#### var()
var() 函数可以插入一个自定义属性（有时也被称为“CSS 变量”）的值，用来代替属性值部分。

`var(<custom-property-name> , <declaration-value>? )`：函数的第一个参数是要替换的自定义属性的名称。函数的第二个参数是可选的，用作回退值。如果第一个参数引用的自定义属性无效，则该函数将使用第二个值。

> 备注
> - 自定义属性的回退值允许使用逗号。例如，var(--foo, red, blue) 将 red, blue 同时指定为回退值（在第一个逗号之后到函数结尾前的值都会被认为是回退值）
> - var() 函数不能作为属性名、选择器或者其他除了属性值之外的值
```vue
<!-- 代码示意 -->
<template>
  <view class="component">
    <view class="header">Header</view>
    <view class="content">Content</view>
    <view class="footer">Footer</view>
  </view>
</template>

<style>
  .component {
    --content-color: #b58df1;
    --header-color: pink;
  }
  .component .header {
    background-color: var(--header-color, blue);
  }
  .component .text {
    background-color: var(--content-color, black);
  }
  .component .footer {
    background-color: var(--footer-color, black);
  }
</style>
<!-- 实际效果 -->
<!-- Header 背景色是 #b58df1 -->
<!-- Content 背景色是 pink -->
<!-- Footer 背景色是 black（--footer-color 未定义，回退值生效） -->
```
#### calc()
calc() 函数允许在声明 CSS 属性值时执行一些计算。

calc() 函数用一个表达式作为它的参数，用这个表达式的结果作为值。

这个表达式采用标准操作符处理法则的简单表达式，支持加减乘除 ，乘法计算需要乘数中至少有一个是 number，除法计算要求除数（/右面的数）必须是 number。
> 备注
> - \+ 和 - 运算符的两边必须要有空白字符，\* 和 / 这两个运算符前后不需要空白字符，但如果考虑到统一性，仍然推荐加上空白符。
> - 能数值化的单位都支持 calc() 函数
> - 百分比的计算逻辑详见样式单位部分的[百分比单位说明](#百分比单位说明)
```css
/* 代码示意 */

/* property: calc(expression) */
.test {
    width: calc(100% - 80px);
}

/* 使用 CSS 变量嵌套使用 calc() */
.foo {
    --widthA: 100px;
    --widthB: calc(var(--widthA) / 2);
    --widthC: calc(var(--widthB) / 2);
    width: var(--widthC);
}

.demo {
    font-size: calc(1.5rem + 3vw);
}
```
#### env()
env() 用于将定义的环境变量的值插入到 CSS 中。

第一个参数为系统环境变量，具体可选值有 safe-area-inset-top、safe-area-inset-right、safe-area-inset-bottom、safe-area-inset-left，分别定义了视口上右下左各边缘的安全距离。

第二个可选参数是环境变量不可用时的回退值。

env() 函数通过和 var() 函数类似形式， 区别在于：一是环境变量是系统定义的，而 var() 函数是开发者自定义；二是环境变量是全局生效，而 var() 函数的自定义属性不能在声明之外使用。

```css
/* 代码示意 */
.demo {
  padding: env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) env(safe-area-inset-bottom, 20px) env(safe-area-inset-left, 20px);
}
```
> 注意事项
### 使用原子类
后续支持。

## 混合编写RN代码
在编写Mpx组件时，在特定情况下（处于性能考虑等因素），可能会涉及到混合开发(在Mpx项目内编写RN组件)

### 使用RN组件
在Mpx组件内引用RN组件，采用如下方式
- **RN组件注册方式**：需在components属性下进行引用注册。
- **RN组件的属性与事件**：属性与事件参考RN原生支持的属性与事件名，对应赋值方式按照Mpx语法进行双括号包裹，组件使用的值需要通过 REACTHOOKSEXEC方法的返回值的方式进行声明。
- **RN组件的样式定义**: 组件支持样式属性的透传，通过在RN组件上定义styles即可透传样式
- **其他功能**: 支持在RN组件内使用slot
```javascript
<template>
    <view>
        <!-- 事件的value需要使用双括号包裹 -->
        <ScrollView onScroll="{{scrollAction}}">
          <View styles="{{viewStyle}}">
            <!-- 可混合编写mpx组件 -->
            <view>我是Mpx组件</view>
            <!-- 支持在RN组件内部定义插槽 -->
            <slot name="myslot"></slot>
          <View>
        </ScrollView>
    </view>
</template>
<script>
    import { createComponent, REACTHOOKSEXEC } from '@mpxjs/core'
    import { ScrollView } from 'react-native-gesture-handler'
    createComponent({
        components: {
            ScrollView
        }
        [REACTHOOKSEXEC](){
            return {
              viewStyle: {
                width: 200,
                height: 200
              }
            }
        }
    })
</script>
```
### 使用React hooks
Mpx提供了hooks的执行机制，通过在Mpx组件内注册REACTHOOKSEXEC方法，保障RN组件的初始化执行。hooks的返回值支持数据与方法
- 模板上RN组件/Mpx组件的数据渲染
- 模板上的Props传递
- 模板上的样式定义
- 模板上的事件的绑定与透传

```javascript
<template>
    <view>
        <ScrollView onScroll="{{onScroll}}">
            <View>
                <Text>{{count}}</Text>
            </View>
        </ScrollView>
    </view>
</template>
<script>
import { createComponent, REACTHOOKSEXEC } from '@mpxjs/core'
import { ScrollView } from 'react-native-gesture-handler'
import { View, Text} from 'react-native'
import { useState } from 'react'
createComponent({
    components: {
        ScrollView,View, Text
    },
    [REACTHOOKSEXEC](prop) {
        // 所有使用hooks的部分在此处进行注册与执行
        const [count, setCount] = useState(0);
        const onScroll = () => {
            setCount(count + 1)
        }
        // 返回值用于可用于模板上
        return {
            count,
            onScroll
        }
    }
})
</script>
```
## 能力支持范围

### 模版语法

#### 模版指令
Mpx 输出 React Native 支持以下模版指令。

**wx:if**

输出React Native已支持，[详情查看 - wx:if](/api/directives.html#wx-if)

**wx:else**

输出React Native已支持，[详情查看 - wx:else](/api/directives.html#wx-else)


**wx:elif**

输出React Native已支持，[详情查看 - wx:elif](/api/directives.html#wx-elif)

**wx:show**

输出React Native已支持，[详情查看 - wx:show](/api/directives.html#wx-show)

**wx:for**

输出React Native已支持，[详情查看 - wx:for](/api/directives.html#wx-for)

**wx:for-item**

输出React Native已支持，[详情查看 - wx:for-item](/api/directives.html#wx-for-item)

**wx:for-index**

输出React Native已支持，[详情查看 - wx:for-index](/api/directives.html#wx-for-index)

**wx:class**

输出React Native已支持，[详情查看 - wx:class](/api/directives.html#wx-class)

**wx:style**

输出React Native已支持，[详情查看 - wx:style](/api/directives.html#wx-style)

**wx:model**

输出React Native已支持，[详情查看 - wx:model](/api/directives.html#wx-model)

**wx:model-prop**

输出React Native已支持，[详情查看 - wx:model-prop](/api/directives.html#wx-model-prop)

**wx:model-event**

输出React Native已支持，[详情查看 - wx:model-event](/api/directives.html#wx-model-event)

**wx:model-value-path**

输出React Native已支持，[详情查看 - wx:model-value-path](/api/directives.html#wx-model-value-path)

**wx:model-filter**

输出React Native已支持，[详情查看 - wx:model-filter](/api/directives.html#wx-model-filter)

**wx:ref**

使用wx:ref可以更方便获取基础节点及自定义组件实例。

* 如果获取的是基础节点（nodeRef），那么可以通过基础节点暴露的相应 api 获取基础节点的样式属性等内容；
* 如果是获取的自定义组件实例，那么可以直接调用组件实例上的方法或属性；

```html
<template>
  <!-- 基础组件 -->
  <view wx:ref="tref">123</view>
  <!-- 自定义组件 -->
  <test-component wx:ref="cref"></test-component>
</template>


<script>
    import { createPage } from "@mpxjs/core"

    createPage({
        ready() {
            // 基础节点 nodeRef 获取节点的样式属性
            this.$refs.tref.fields({size: true}, function (res) {
                console.log(res)
            }).exec()

            this.$refs.cref.show() // 拿到 test-component 组件实例，调用组件实例内部的 show 方法
        }
    })
</script>
```

**@mode**

跨端输出 React Native 时，对模版中节点或属性进行平台纬度的条件编译。[详情查看](/api/directives.html#mode)

**@_mode**

跨端输出 React Native 时，对节点或属性进行平台纬度的条件编译并保留跨平台转换能力。[详情查看](/api/directives.html#mode)

**@env**

跨端输出场景下，除了 mode 平台场景值，Mpx 框架还提供自定义 env 目标应用，来实现在不同应用下编译产出不同的代码。

**参考：**
* [通过 env 实现自定义目标环境的条件编译](/guide/advance/platform.html#use-env)
* [@env 指令](/api/directives.html#env)

**mpxTagName**

支持跨平台输出时针对节点标签名进行条件编译，可以配合属性维度条件编译使用, 
例如在 iOS 环境下希望将某个 view 标签替换为 cover-view，可以使用该功能：

```html
<view mpxTagName@ios="cover-view">will be cover-view in iOS</view>
```

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

RN环境基础组件通用属性

| 属性名                   | 类型     | 默认值         | 说明                                                       |
| ----------------------- | ------- | ------------- | ---------------------------------------------------------- |
| enable-offset		  | Boolean  |     false    | 设置是否要获取组件的布局信息，若设置了该属性，会在 e.target 中返回组件的 offsetLeft、offsetWidth 信息|
| enable-var	  | Boolean  |     true    | 默认支持使用 css variable，若想关闭该功能可设置为 false |
| parent-font-size		  | Number |         | 父组件字体大小，主要用于百分比计算的场景，如 font-size: 100%|
| parent-width		  | Number  |         | 父组件宽度，主要用于百分比计算的场景，如 width: calc(100% - 20px)，需要在外部传递父组件的宽度|
| parent-height		  | Number  |         | 父组件高度，主要用于百分比计算的场景，如 height: calc(100% - 20px),需要在外部传递父组件的高度|

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
| inertia   | boolean          |   false     | movable-view是否带有惯性｜
| out-of-bounds   | boolean          |   false     | 超过可移动区域后，movable-view是否还可以移动｜
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
创建自定义组件在 RN 环境下部分实例方法、属性存在兼容性问题不支持，
文档此部分会详细列出各方法、属性的支持度。

##### **组件属性**

| 属性                 | RN | 描述                                                                           |
|------------|---|------------------------------------------------------------------------------|
| properties | ✓ | 用于声明组件接收的外部属性，详情可[查看](/guide/basic/component.html#properties)                |
| data       | ✓ | 组件的内部数据，和 `properties` 一同用于组件的模板渲染，详情可[查看](/guide/basic/component.html#data) |
| observers  | ✓ | 组件数据字段监听器，详情可[查看](/guide/basic/component.html#observers)                     |
| methods    | ✓ | 组件方法定义，详情可[查看](/guide/basic/component.html#methods)                          |
| behaviors  | ✗  | 输出 RN 不支持                                                                    |
| created    | ✓ | 组件生命周期函数-详情可[查看](/guide/basic/component.html#created)                        |
| attached   | ✓ | 组件生命周期函数-详情可[查看](/guide/basic/component.html#attached)                       |
| ready      | ✓ | 组件生命周期函数-详情可[查看](/guide/basic/component.html#ready)                          |
| detached    | ✓ | 组件生命周期函数-详情可[查看](/guide/basic/component.html#detached)                       |
| externalClasses  | ✓ | 输出 RN 需要配置[构建配置](/api/compile.html#externalclasses)                          |
| options    | ✗ | 输出 RN 不支持，一些选项，诸如 multipleSlots、virtualHost、pureDataPattern，这些功能输出 RN 不支持    |
| lifetimes  | ✓ | 组件生命周期声明对象-详情可[查看](/guide/basic/component.html#lifetimes)                    |
| pageLifetimes  | ✓ | 组件所在页面的生命周期声明对象-详情可[查看](/guide/basic/component.html#pagelifetimes)                                                           |

##### **组件实例属性和方法**

生成的组件实例可以在组件的方法、生命周期函数中通过 this 访问。组件包含一些通用属性和方法。

未在本文档中列出的实例属性和方法则在 RN 中不支持。

| 属性名  | 类型     | RN 是否支持 | 描述                       |
|--------|----------|------|--------------------------|
| is     | String   | ✗     | 输出 RN 暂不支持，未来支持, 组件的文件路径 |
| id     | String   | ✓     | 节点id                     |
| dataset| String   | ✓     | 节点dataset                |


| 方法名               | RN是否支持 | 描述                       |
|---------------------|--|--------------------------|
| setData             | ✓ | 设置data并执行视图层渲染           |
| triggerEvent        | ✓ | 触发事件                     |
| createSelectorQuery| ✗ | 输出 RN 暂不支持，未来支持，建议使用 ref |
| selectComponent     | ✗ | 输出 RN 暂不支持，未来支持，建议使用 ref       |
| selectAllComponents| ✗ | 输出 RN 暂不支持，未来支持，建议使用 ref       |
| $set             | ✓ | 向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新       |
| $watch         | ✓ | 观察 Mpx 实例上的一个表达式或者一个函数计算结果的变化                               |
| $delete        | ✓ | 删除对象属性，如果该对象是响应式的，那么该方法可以触发观察器更新（视图更新 | watch回调）             |
| $refs        | ✓ | 一个对象，持有注册过 ref的所有 DOM 元素和组件实例，调用响应的组件方法或者获取视图节点信息。 |
| $forceUpdate        | ✓ | 用于强制刷新视图，不常用，通常建议使用响应式数据驱动视图更新                            |
| $nextTick        | ✓ | 在下次 DOM 更新循环结束之后执行延迟回调函数，用于等待 Mpx 完成状态更新和 DOM 更新后再执行某些操作 |
| $i18n        | ✗ | 输出 RN 暂不支持，国际化功能访问器，用于获取多语言字符串资源                                            |
| $rawOptions        | ✓ | 访问组件原始选项对象                                      |


### 样式规则
#### position
设置元素的定位样式
##### 值类型
enum: absolute, relative， 默认relative。
> 备注：RN 不支持 fixed 定位
##### 代码示例
``` css
position: absolute;
top: 10px
```
#### top|right|left|bottom
设置元素的不同方向的偏移量
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
position: relative;
top: 10%;
```
#### z-index
控制元素的堆叠覆盖顺序。
##### 值类型
number，纯数值，无单位
##### 代码示例
``` css
position: absolute;
top: 0;
z-index: 1;
```
#### display
设置元素的布局方式。
##### 值类型
enum: flex/none
> 备注
> - RN display 仅支持 flex 布局，其他在 Web/小程序常用的布局如 block、inline-block、inline、inline-flex、grid、table 等 RN 不支持，为了保证代码有更好的跨端适配，最好使用 flex 布局。
> - 和 Web/小程序一致，RN 下 Text 节点默认为行内 inline 布局
##### 代码示例
``` css
/* 默认 */ 
display:flex
/* 隐藏 */
display:none
```
#### justify-content
用来设置元素列之间的间隔大小，默认值 flex-start
##### 值类型
enum: flex-start/flex-end/center/space-between/space-around/space-evenly
##### 代码示例
``` css
justify-content: center; /* 居中排列 */
justify-content: flex-start; /* 从行首起始位置开始排列 */
justify-content: flex-end; /* 从行尾位置开始排列 */
```
#### align-content
设置单根轴线上的子元素的对齐方式。
##### 值类型
enum: flex-start/flex-end/center/stretch/space-between/space-around/space-evenly
##### 代码示例
``` css
/** 支持 **/
align-content: flex-start;
align-content: flex-end;
align-content: center;
align-content: stretch;
align-content: space-between;
align-content: space-around;
align-content: space-evenly;

/** 不支持 **/
align-content: safe center;
align-content: unsafe center;
```
#### align-items
设置单根轴线上的子元素的对齐方式。默认会是交叉轴上的。
##### 值类型
enum: flex-start/flex-end/center/stretch/baseline
##### 代码示例
``` css
/** 支持 **/
align-items: flex-start;
align-items: flex-end;
align-items: center;
align-items: stretch;
align-items: baseline;

/** 不支持 **/
align-items: first baseline;
align-items: last baseline;
```
#### align-self
设置单个子元素在单根轴线上的对齐方式
##### 值类型
enum: auto/flex-start/flex-end/center/stretch/baseline
##### 代码示例
``` css
/** 支持 **/
align-self: auto;
align-self: flex-start;
align-self: flex-end;
align-self: center;
align-self: stretch;
align-self: baseline;

/** 不支持 **/
align-self: first baseline;
align-self: last baseline;
```
#### flex-grow
设置 flex 元素的增长系数，默认值为0，不支持放大
##### 值类型
number，纯数值无单位，>= 0
##### 代码示例
```css
flex-grow: 3;
```
#### flex-shrink
设置 flex 元素的收缩规则。

flex 元素仅在默认宽度之和大于容器的时候才会发生收缩，其收缩的大小是依据 flex-shrink 的值，flex-shrink 默认为0，不支持收缩
##### 值类型
number，纯数值无单位，>= 0
##### 代码示例
```css
flex-shrink: 2;
```
#### flex-basis
设置指定了 flex 元素在主轴方向上的初始大小，默认值 auto。
##### 值类型
enum: auto

number，单位参考[数值类型单位说明](#数值类型单位说明)
> 备注
> 
> 当一个元素同时被设置了 flex-basis (除值为 auto 外) 和 width (或者在 flex-direction: column 情况下设置了height) , flex-basis 具有更高的优先级。
##### 代码示例
``` css
flex-basis: 10px;
flex-basis: 10rpx;
flex-basis: 20%;
flex-basis: auto;
flex-basis: 0;
```
#### flex
flex-grow flex-shrink flex-basis 的简写，和所有简写属性一致，仅支持定义在类上
##### 简写规则
可以使用一个，两个或三个值来指定 flex 属性。

**单值语法**，值必须是以下之一：
- 一个 `<flex-grow>` 的有效值：此时简写会扩展为 `flex: <flex-grow> 1 0`。
- 一个 `<flex-basis>` 的有效值：此时简写会扩展为 `flex: 1 1 <flex-basis>`。
- 关键字 none/initial 。

**双值语法**，第一个值必须是一个 flex-grow 的有效值，第二个值必须是以下之一：
- 一个 flex-shrink 的有效值：此时简写会扩展为 flex: `<flex-grow> <flex-shrink> 0`。
- 一个 flex-basis 的有效值：此时简写会扩展为 flex: `<flex-grow> 1 <flex-basis>`。

**三值语法**，值必须按照以下顺序指定：
- 一个 flex-grow 的有效值。
- 一个 flex-shrink 的有效值。
- 一个 flex-basis 的有效值。

**几种情况**：
- initial 相当于将属性设置为 flex: 0 1 auto
- auto 相当于将属性设置为 flex: 1 1 auto
- none 相当于将属性设置为 flex: 0 0 auto
- flex-grow/flex-shrink 负值无效，省略时默认值为 1；flex-basis 若值为0，则必须加上单位，省略时默认值为 0
##### 代码示例
``` css
/** 单值，flex-grow 有效值 **/
flex: 1;
/* 等同于 */
flex: 0 1 1;

/** 单值，flex-basis 有效值 **/
flex 30px
/* 等同于 */
flex: 1 1 30px

/* 双值：flex-grow + flex-basis 有效值 */
flex: 1 30px
/* 等同于 */
flex: 1 1 30px

/* 双值：flex-grow + flex-shrink 有效值 */
flex: 2 2
/* 等同于 */
flex: 2 2 0
```
#### flex-direction
设置主轴的方向。
##### 值类型
enum: row/row-reverse/column/column-reverse
##### 代码示例
``` css
flex-direction: row;
flex-direction: row-reverse;
flex-direction: column;
flex-direction: column-reverse;
```
#### flex-wrap
设置元素是否换行。当值为wrap时，alignItems：center不生效。
##### 值类型
enum: wrap, nowrap, wrap-reverse
##### 代码示例
``` css
flex-wrap: wrap;
flex-wrap: nowrap;
flex-wrap: wrap-reverse;
```
#### flex-flow
flex-direction flex-wrap 的简写形式，值按固定顺序分别赋值给 flex-direction flex-wrap，若值个数不够则后置位属性不设置；和所有简写属性一致，仅支持定义在类上
##### 代码示例
```css
/* flex-direction flex-wrap 缺省则不设置 */
flex-flow: row;
/* flex-direction |  flex-wrap */
flex-flow: row nowrap;
```
#### direction
用来设置元素列之间的间隔大小
##### 值类型
enum: inherit/ltr/rtl
##### 代码示例
``` css
/* 支持 */
direction: ltr;
direction: rtl;
direction: inherit;
```
#### column-gap
用来设置元素列之间的间隔大小
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 支持 */
column-gap: 3px;
column-gap: 25rpx;
column-gap: 3%;
```
#### row-gap
用来设置元素行之间的间隙大小
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 支持 */
row-gap: 20px;
row-gap: 10%;
```
#### gap
用于设置行、列的间隙，该属性用来表示 row-gap 和可选的 column-gap 的值。如果缺失 column-gap，则其会被设置成跟 row-gap 一样的值。
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 一个值 */
gap: 16%;
/* 两个值 */
gap: 20px 10px;
gap: 21px 82%;
/* calc() 值 */
gap: calc(10% + 20px);
gap: calc(20px + 10%) calc(10% - 5px);
```
#### height
设置元素高度
##### 值类型
enum: auto

number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 支持 */
height: 120px;
height: 130rpx;
height: auto;
```
#### max-height
设置元素最大高度
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 支持 */
max-height: 120px;
max-height: 75%;
```
#### min-height
设置元素最小高度
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 支持 */
min-height: 120px;
min-height: 130rpx;
```
#### width
设置元素宽度
##### 值类型
enum: auto

number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 支持 */
width: auto;
width: 10%;
```
#### max-width
设置元素最大宽度
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 支持 */
max-width: 75%;
max-width: 75px;
```
#### min-width
设置元素最小宽度
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* 支持 */
min-width: 10%;
min-width: 120px;
```
#### margin-top|margin-bottom|margin-right|margin-left
上下左右外边距
##### 值类型
enum: auto

number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
margin-top: 2px;
margin-top: 2rpx;
margin-top: 10%;
```
#### margin
设置外边距

RN margin 属性仅支持单值的，设置多值时是由框架按简写逻辑在编译时处理的，和所有简写属性一致，多值的简写形式仅在class类上支持。
##### 值类型
enum: auto

number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* all */
margin: 2px;

/* top and bottom | left and right */
margin: 5% auto;

/* top | left and right | bottom */
margin: 1rpx auto 2rpx;

/* top | right | bottom | left */
margin: 1rpx 2rpx 2rpx ;
```
#### padding-top|padding-bottom|padding-left|padding-right
上下左右内边距
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/** padding-top **/
padding-top: 2px;
padding-top: 2rpx;
padding-top: 10%;
```
#### padding
设置内边距

RN padding 属性仅支持单值的，设置多值时是由框架按简写逻辑在编译时处理的，和所有简写属性一致，多值的简写形式仅在class类上支持。
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* all */
padding: 2px;

/* top and bottom | left and right */
padding: 5% 10%;

/* top | left and right | bottom */
padding: 1rpx 0 2rpx;

/* top | right | bottom | left */
padding: 1rpx 2rpx 2rpx ;
```
#### border-top-width|border-bottom-width|border-left-width|border-right-width
设置上下左右各边框的宽度
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
border-top-width: 2px;
```
#### border-width
设置边框的宽度

RN border-width 属性仅支持单值的，设置多值时是由框架按简写逻辑在编译时处理的，和所有简写属性一致，多值的简写形式仅在class类上支持。
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* all border */
border-width: 2px;

/* 顶部和底部 | 左侧和右侧 */
border-width: 2px 1.5em;

/* 顶部 | 左侧和右侧 | 底部 */
border-width: 1px 2em 1.5cm;

/* 顶部 | 右侧 | 底部 | 左侧 */
border-width: 1px 2em 0 4rem;
```
#### border-top-color|border-bottom-color|border-left-color|border-right-color
设置上下左右各边框的颜色
##### 值类型
color: 参考[Color](#色值-color-类型支持的值格式说明)
##### 代码示例
``` css
border-top-color: red;
```
#### border-color
设置边框的颜色

RN border-color 属性仅支持单值的，设置多值时是由框架按简写逻辑在编译时处理的，和所有简写属性一致，多值的简写形式仅在class类上支持。
##### 值类型
color: 参考[Color](#色值-color-类型支持的值格式说明)
##### 代码示例
``` css
/* border-color: color; 单值语法 */
border-color: red;

/* border-color: vertical horizontal; 双值语法*/
border-color: red #f015ca;

/* border-color: top horizontal bottom; 三值语法 */
border-color: red yellow green;

/* border-color: top right bottom left; 四值语法 */
border-color: red yellow green blue;
```
#### border-style
设置边框的样式
##### 值类型
enum: solid|dotted|dashed
> 注意事项：RN 不支持分开设置各边框线的形态，所以 RN 上 border-style 不支持简写形式
##### 代码示例
``` css
/** 支持 **/
/* all border */
border-color: solid;
border-color: dotted;
border-color: dashed;

/** 不支持 **/
border-style: double;
border-style: groove;
border-style: ridge;
border-style: dotted solid;
border-style: hidden double dashed;
border-style: none solid dotted dashed;

/** 不支持 **/
/* horizontal | vertical */
border-style: dotted solid;
/* top | horizontal | bottom */
border-style: hidden double dashed;
/* top | right | bottom | left */
border-style: none solid dotted dashed;
```
#### border
border-width border-style border-color 的简写模式, 值按固定顺序分别赋值给 border-width border-style border-color，若值个数不够则后置位属性不设置；和所有简写属性一致，仅支持定义在类上
##### 代码示例
```css
/* border-width | border-style | border-color */
border: 1px solid red;
/* border-width */
border: 1px;
/* border-width | border-style */
border: 1px solid;
/* border-width | border-style | border-color */
border: 1px double pink;
```
#### border-top|border-right|border-bottom|border-left
border-(top|right|bottom|left)-width border-(top|right|bottom|left)-style border-(top|right|bottom|left)-color 的简写模式, 值按固定顺序分别赋值给 border-*-width border-*-style border-*-color，若值个数不够则后置位属性不设置；和所有简写属性一致，仅支持定义在类上
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
```css
border-top: 1px;
border-top: 2px dotted;
border-top: medium dashed green;
```
#### border-bottom-left-radius|border-bottom-right-radius|border-top-left-radius|border-top-right-radius
上下左圆角大小
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
border-bottom-left-radius: 2px;
```
#### border-radius
圆角大小

RN border-radius 属性仅支持单值的，设置多值时是由框架按简写逻辑在编译时处理的，和所有简写属性一致，多值的简写形式仅在class类上支持。
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
##### 代码示例
``` css
/* all */
border-radius: 2px;
/* top-left | top-right | bottom-right | bottom-left */
border-radius: 10px 10px 10px 0;
```
#### background-color
设置背景色
##### 值类型
color: 参考[Color](#色值-color-类型支持的值格式说明)
##### 代码示例
``` css
background-color: red;
```
#### background-image
设置背景图

##### 值类型
string: url / linear-gradient
> 注意事项 
> - 背景图和背景色仅支持 view 节点
> - 开发者可通过 enable-background 属性来控制是否开启背景图片和渐变色的支持
> - 渐变不支持turn、px单位，只支持渐变距离百分比。

##### 代码示例
``` css
/* 支持 */
background-image: url("https://res.wx.qq.com/wxdoc/dist/assets/img/0.4cb08bb4.jpg");
background-image linear-gradient(270deg, rgba(255,255,255,0.40), rgba(255,255,255,0.00))
background-image: linear-gradient(to top, blue, red)
background-image: linear-gradient(to right bottom, blue, red)
background-image: linear-gradient(45deg, blue, red)
background-image: linear-gradient(45deg, blue 0%, orange 40%, red)
background-image: linear-gradient(to left top, blue, red)



/* 不支持 */
background-image: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5));
background-image: linear-gradient(.25turn, red, blue) //  turn单位不支持
background-image: linear-gradient(45deg, red 100px, blue) //px单位不支持
background-image: linear-gradient(red 0%, orange 10% 30%, yellow 50% 70%, green 90% 100%);

```
#### background-size
设置背景图大小
##### 值类型
enum: contain/cover/auto

number，单位参考[数值类型单位说明](#数值类型单位说明)
> 注意事项
> - 仅支持 view 节点
> - 支持一个值，这个值指定图片的宽度，图片的高度隐式的为 auto；支持两个值，第一个值指定图片的宽度，第二个值指定图片的高度；不支持逗号分隔的多个值
##### 代码示例
``` css
/* 支持 */
background-size: 50%;
background-size: 50% 25%;
background-size: contain;
background-size: cover;
background-size: auto;
background-size: 20px auto;

/* 不支持 */
background-size: 50%, 25%, 25%;
```
#### background-repeat
设置是否重复背景图
##### 值类型
enum: no-repeat
> 备注：仅支持 view 节点
##### 代码示例
``` css
background-repeat: no-repeat;

/* 不支持 */
background-repeat: repeat; 
```


#### background-postion
设置背景图大小
##### 值类型
enum: center/left/right/top/bottom

number，单位参考[数值类型单位说明](#数值类型单位说明)

> 注意事项
> - 仅支持 view 节点
##### 代码示例
``` css
/* 支持 */
background-position: center;
background-position: 10%;
background-position: 10px;
background-position: 10px 20px;
background-position: 10px center;
background-position: right 10px center;
background-position: right 10px bottom 10px;

/* 不支持 */
background-position: 1cm 2cm;
background-position: 10ch 8em;
background-position: right 3em bottom 10px;

```


#### background
背景的简写属性，只能在view上使用
##### 值类型
仅支持 background-image|background-color|background-size|background-repeat|background-position，具体每个属性的支持情况详见各属性的介绍文档
> 备注：仅支持 view 节点
##### 代码示例
```css
/* 支持 */
background: url("https://res.wx.qq.com/wxdoc/dist/assets/img/0.4cb08bb4.jpg") pink no-repeat;
background: #000;
background: url("https://res.wx.qq.com/wxdoc/dist/assets/img/0.4cb08bb4.jpg") pink;
background: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5));
```
#### box-shadow
设置阴影颜色、阴影偏移量、阴影模糊半径，因 RN 不支持 box-shadow 属性，实际是由 mpx 按 RN 支持的 shadowOffset: { width?: number, height?: number }; shadowRadius: number; shadowColor: number; 属性和顺序转换成对应的属性。
##### 值类型
offset-x|offset-y|blur-radius 值为 number，单位参考[数值类型单位说明](#数值类型单位说明)，shadow-color 为 color 类型，参考[Color](#色值-color-类型支持的值格式说明)
##### 简写规则
- 按 offset-x|offset-y|blur-radius|spread-radius|color 顺序赋值
- 赋值过程中，如遇到不支持的属性会忽略该属性；若属性值校验不合法，则忽略该值，继续校验下一个值是否合法，合法则赋值，不合法则继续校验下一个值
- android 下仅支持 shadowColor，故框架在 android 模式下不会添加 shadowOffset/shadowRadius
- 在设置 box-shadow 有效值的情况下，ios 下会新增 shadowOpacity: 1 来展示阴影
##### 代码示例
```css
/* offset-x | offset-y | blur-radius | color */
box-shadow: 0 1px 3px rgba(139,0,0,0.32);
/* x 偏移量 | y 偏移量 | 阴影模糊半径 | 阴影扩散半径 | 阴影颜色 */
/* 因第四个值 spread-radius 阴影扩散半径 不支持，故 1px 在框架处理时会被忽略 */
box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
```
> 注意事项
> - android 仅支持 shadowColor，ios 也支持 shadowOffset/shadowRadius/shadowColor/shadowOpacity, 不支持设置 spread-radius 阴影扩散半径
> - 在节点有设置 overflow:hidden; 同时设置 box-shadow，Web/小程序能正常展示阴影，RN 不能正常展示阴影，需单独新增一级节点来添加阴影
> - RN 0.76 新架构支持 [boxShadow 属性](https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture#box-shadow-and-filter-style-props)
#### backface-visibility
指定当 image 背面朝向观察者时是否可见，仅 image 支持
##### 值类型
enum: visible/hidden
> 备注：仅支持 view 节点
##### 代码示例
```css
backface-visibility: visible;
```
#### object-fit
确定当元素 image 与原始图像尺寸不匹配时如何调整图像大小
##### 值类型
enum: cover/contain/fill/scale-down
> 备注：仅支持 view 节点
##### 代码示例
```css
object-fit: contain;
```
#### transform
设置旋转、缩放、倾斜或平移
##### 值类型
array of objects (only rn): [{matrix: number[]}, {perspective: number}, {rotate: string}, {rotateX: string}, {rotateY: string}, {rotateZ: string}, {scale: number}, {scaleX: number}, {scaleY: number}, {translateX: number}, {translateY: number}, {skewX: string}, {skewY: string}]

string
##### 代码示例
```css
/* rn & css */
transform: 'rotateX(45deg) rotateZ(0.785398rad)';
/* 仅rn支持 */
transform: [{rotateX: '45deg'}, {rotateZ: '0.785398rad'}]
```
#### transform-origin
设置视图变换的原点，默认情况下，变换的原点是中心。
##### 值类型
- 单值时，该值必须是 px、百分比或关键字 left、center、right、top 和 bottom 之一； 
- 双值时，第一个值代表 X 偏移， 必须是 px、百分比或关键字 left、center 和 right 之一， 第二个值代表 Y 偏移，必须是 px、百分比或关键字 top、center 和 bottom 之一；
- 三值时，前两个值与双值语法相同，第三个值代表 Z 偏移，必须是 px。
##### 代码示例
```css
transform-origin: bottom;
transform-origin: 10px 2px;
transform-origin: right bottom 20px;
```
#### opacity
设置节点的不透明度
##### 值类型
number
- 0	元素完全透明 (即元素不可见).
- 任何一个位于 0.0-1.0 之间的 `<number>`	元素半透明 (即元素后面的背景可见).
- 1	元素完全不透明 (即元素后面的背景不可见).
> 注意事项：在 RN 上设置节点 opacity: 0; 时该节点不会触发事件响应 
##### 代码示例
``` css
/* 完全不透明 */
opacity: 1;

/* 半透明 */
opacity: 0.6;

/* 完全透明 */
opacity: 0;
```
#### pointer-events
控制视图是否可以成为触摸事件的目标
##### 值类型
enum
- auto/none
- box-none 仅 RN 支持，表示当前视图不会成为触摸事件的目标，但其子视图可以
- box-only 仅 RN 支持，表示当前视图可以成为触摸事件的目标，但其子视图不能
##### 代码示例
``` css
pointer-events: auto;
pointer-events: none;
```
#### overflow
控制元素溢出时所需的行为
##### 值类型
enum: visible/hidden/scroll
##### 代码示例
``` css
/* 支持 */
overflow: visible;
overflow: hidden;
overflow: scroll;

/* 不支持 */
overflow: clip;
overflow: auto;
overflow: hidden visible;
```
#### aspect-ratio
规定盒子首选纵横比
##### 值类型
number, string
##### 代码示例
``` css
/* 支持 */
aspect-ratio: 1 / 1;
aspect-ratio: 1;
aspect-ratio: 0.5;
aspect-ratio: auto;
```
#### color
##### 值类型
color 参考 [Color](https://reactnative.dev/docs/colors)
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
``` css
color: orange;
color: #fff;
color: #fafafa;
color: rgb(255, 255, 255);
color: rgba(255, 99, 71, 0.2)
```
#### font-family
可设置系统字体，引入字体文件，暂时不支持。
##### 值类型
string
> 注意事项
> - [文本样式继承规则](#文本样式继承)
> - 仅支持设置一种字体
##### 代码示例
``` css
/* 支持 */
font-family: PingFangSC-Regular

/* 不支持 */
font-family: "Gill Sans", sans-serif;
```
#### font-size
可设置字体的大小
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
> 备注：
> - [文本样式继承规则](#文本样式继承)
> - [font-size 的百分比计算](#特殊的百分比计算规则)
##### 代码示例
``` css
font-size: 12px;
font-size: 12rpx;
```
#### font-style
设置文本的字体样式。
##### 值类型
enum: normal，italic
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
``` css
font-style: italic;
font-style: normal;
```
#### font-weight
设置文字的权重。
##### 值类型
enum: 100，200，300，400，500，600，800，900,normal,bold
> 备注：
> - [文本样式继承规则](#文本样式继承)
> - 若在自定义字体图标上加 font-weight，可能会导致在某些安卓上不展示图标或者图标展示异常
> - 100，200，300，400，500，600，800，900 在 RN 上是字符串类型而非数值类型，非字符串类型可能会导致某些安卓机型异常
##### 代码示例
``` css
font-weight: 100;
font-weight: 200;
font-weight: 300;
font-weight: 400;
font-weight: 500;
font-weight: 600;
font-weight: 700;
font-weight: 800;
font-weight: 900;

font-weight: normal;
font-weight: bold;
```
#### font-variant
设置文本的字体变体
##### 值类型
enum: small-caps/oldstyle-nums/lining-nums/tabular-nums/proportional-nums
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
``` css
font-variant: small-caps;
font-variant: oldstyle-nums;
font-variant: lining-nums;
font-variant: tabular-nums;
font-variant: lining-nums;
font-variant: proportional-nums;
```
#### letter-spacing
定义字符之间的间距
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
``` css
letter-spacing: 2px;
letter-spacing: 2rpx;
```
#### line-height
设置行高。
##### 值类型
number，单位参考[数值类型单位说明](#数值类型单位说明)
> 备注：
> - [文本样式继承规则](#文本样式继承)
> - [font-size 的百分比计算](#特殊的百分比计算规则)
##### 代码示例
``` css
line-height: 16px
line-height: 16rpx
line-height: 100%
line-height: 1
```
#### text-align
设置文本的水平对齐方式。
##### 值类型
enum: left, right, center, justify
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
``` css
/** 支持 **/
text-align: left;
text-align: right;
text-align: center;
text-align: justify;

/** 不支持 **/
text-align: match-parent;
text-align: auto;
text-align: justify-all;
```
#### text-decoration-line
设置文本的装饰线样式。
##### 值类型
enum: none, underline, line-through, underline line-through
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
``` css
/** 支持 **/
text-decoration-line: none;
text-decoration-line: underline;
text-decoration-line: line-through;
text-decoration-line: underline line-through;

/** 不支持 **/
text-decoration-line: overline;
```
#### text-decoration-style
设置文本的装饰线样式
##### 值类型
enum: solid/double/dotted/dashed
> 备注
> - [文本样式继承规则](#文本样式继承)
> - 仅 ios 支持
##### 代码示例
``` css
text-decoration-style: double;
```
#### text-decoration-color
设置文本的装饰线颜色
##### 值类型
color 参考 [Color](https://reactnative.dev/docs/colors)
> 备注
> - [文本样式继承规则](#文本样式继承)
> - 仅 ios 支持
##### 代码示例
``` css
text-decoration-color: #21ff21;
```
#### text-decoration
text-decoration-line text-decoration-style text-decoration-color 的简写格式
##### 简写规则
- 按 text-decoration-line text-decoration-style text-decoration-color 顺序赋值
- 赋值过程中，如遇到不支持的属性会忽略该属性；若属性值校验不合法，则忽略该值，继续校验下一个值是否合法，合法则赋值，不合法则继续校验下一个值
- android 下仅转换 text-decoration-line，text-decoration-style/text-decoration-color 因不支持不会添加
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
``` css
text-decoration: underline;
text-decoration: underline dotted;
text-decoration: underline dotted red;

```
#### text-transform
设置文本的大小写转换。
##### 值类型
enum: none, uppercase, lowercase, capitalize
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
``` css
/** 支持 **/
text-transform: none;
text-transform: uppercase;
text-transform: lowercase;
text-transform: capitalize;

/** 不支持 **/
text-transform: full-width;
text-transform: full-size-kana;
text-transform: math-auto;
```
#### vertical-align
用来指定行内文本的对齐方式
##### 值类型
enum: auto/top/bottom/middle
> 备注
> - [文本样式继承规则](#文本样式继承)
> - 仅 android 支持
##### 代码示例
```css
/* 支持 */
vertical-align: auto;
vertical-align: middle;
vertical-align: top;
vertical-align: bottom;

/* 不支持 */
vertical-align: baseline;
vertical-align: sub;
vertical-align: super;
vertical-align: text-top;
vertical-align: text-bottom;
```
#### user-select
用于控制用户是否可以选择文本
##### 值类型
enum: auto/text/none/contain/all
> 备注: [文本样式继承规则](#文本样式继承)
##### 代码示例
```css
/* 关键字值 */
user-select: none;
user-select: auto;
user-select: text;
user-select: contain;
user-select: all;
```
#### text-shadow
设置文本阴影，因 RN 不支持 text-shadow 属性，实际是由 mpx 按 RN 支持的 textShadowOffset: { width?: number, height?: number }; textShadowRadius: number; textShadowColor: number; 属性和顺序转换成对应的属性。
##### 值类型
offset-x|offset-y|blur-radius 值为 number，单位参考[数值类型单位说明](#数值类型单位说明)，textShadowColor 为 color 类型，参考[Color](#色值-color-类型支持的值格式说明)
##### 简写规则
- 按 offset-x|offset-y|blur-radius|color 顺序赋值
- 赋值过程中，如遇到不支持的属性会忽略该属性；若属性值校验不合法，则忽略该值，继续校验下一个值是否合法，合法则赋值，不合法则继续校验下一个值
> 备注：[文本样式继承规则](#文本样式继承)
##### 代码示例
```css
/* offset-x | offset-y | blur-radius | color */
text-shadow: 1rpx 3rpx 0 #2E0C02;

/* offset-x | offset-y */
text-shadow: 5px 10px;

/* offset-x | offset-y | color */
/* 因为第三个值是 color 类型，赋值给 textShadowRadius 检验不合法，继续赋值给下一个属性 textShadowColor 校验合法 */
text-shadow: 5px 5px #558abb;
```
### 应用能力
#### app配置
对标参考[微信app配置](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html), 以下仅标注支持项或者特殊关注项，未标注的均未支持

| 配置项 | 支持情况 | 特殊说明 |
| ---- | ---- | ---- |
| entryPagePath | 支持 | 无|
| pages | 支持 | 无 |
| window | 子属性部分支持 | 参考下面window配置部分 |
| tabbar | 暂未支持 | 无 |
| networkTimeout | 支持 | 无 |
| subpackages | 支持 | 分包在RN下暂未进行拆包处理，仅能正常打包在一起，分包能力待后续支持 |
| usingComponents | 支持 |  |
| vw | 支持 | 无 |

##### window配置
app里面的window配置，参考[微信内window配置说明](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#window)

| 配置项 | 支持情况 | 特殊说明 |
| ---- | ---- | ---- |
| navigationBarBackgroundColor | 支持 | 无|
| navigationBarTextStyle | 支持 | 无 |
| navigationStyle | 支持 | 无 |
| backgroundColor | 支持 | 无 |

#### 页面配置
页面配置内可配置页面级别的属性，参考[微信页面配置说明](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/page.html)

| 配置项 | 支持情况 | 特殊说明 |
| ---- | ---- | ---- |
| navigationBarBackgroundColor | 支持 | 无|
| navigationBarTextStyle | 支持 | 无 |
| navigationStyle | 支持 | 无 |
| backgroundColor | 支持 | 无 |
| usingComponents | 支持 | 无 |
| disableScroll | 不支持 | RN下默认页面不支持滚动，如需滚动需要使用可滚动的元素包裹 |

#### 状态管理
##### pinia 
暂未支持
##### store 
已支持
#### i18n
支持
#### 原子类能力
开发中，暂未支持
#### 依赖注入（Provide/Inject）
开发中，暂未支持

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
需要在mpx项目中需要配置externals
```bash
externals: {
  ...
  '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage',
  '@react-native-clipboard/clipboard': '@react-native-clipboard/clipboard',
  '@react-native-community/netinfo': '@react-native-community/netinfo',
  'react-native-device-info': 'react-native-device-info',
  'react-native-safe-area-context': 'react-native-safe-area-context',
  'react-native-reanimated': 'react-native-reanimated',
  'react-native-get-location': 'react-native-get-location',
  'react-native-haptic-feedback': 'react-native-haptic-feedback'
},
```
如果引用单独的api-proxy方法这种情况，需要根据下表说明是否用到以下方法，来确定是否需要配置externals，配置参考上面示例

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
```bash
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
```html
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

```js
include ':react-native-haptic-feedback'
project(':react-native-haptic-feedback').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-haptic-feedback/android')
```
react-native-reanimated在mpx和RN项目都要安装，安装好包后需要在babel.config.json文件中做如下配置，并且RN环境中使用的react-native-reanimated与mpx项目中安装的react-native-reanimated版本要一致：
[配置参考文档](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
```javascript
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
对于业务中一些特殊的方法，需要有web与RN进行交互的这种情况，基于这种情况在mpx框架内部提供了挂在方法的能力，在webview-bridge提供了invoke通信的能力，具体使用方法如下：

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


### 其他使用限制
如事件的target等
