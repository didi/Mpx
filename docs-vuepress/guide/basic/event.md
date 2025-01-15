# 事件处理

Mpx 在事件处理上基于原生小程序，支持原生小程序的全部事件处理技术规范，在此基础上新增了事件处理内联传参的增强机制。

## 事件分类

事件分为冒泡事件和非冒泡事件：

1. 冒泡事件：当一个组件上的事件被触发后，该事件会向父节点传递
2. 非冒泡事件：当一个组件上的事件被触发后，该事件不会向父节点传递

常用事件如下:

| 事件类型    | 触发条件                                                       |
| ----------- | -------------------------------------------------------------- |
| touchstart  | 手指触摸动作开始                                               |
| touchmove   | 手指触摸后移动                                                 |
| touchcancel | 手指触摸动作被打断，如来电提醒，弹窗                           |
| touchend    | 手指触摸动作结束                                               |
| tap         | 手指触摸后马上离开                                             |
| longpress   | 手指触摸后，超过 350ms 再离开，推荐使用 longpress 代替 longtap |
| longtap     | 手指触摸后，超过 350ms 再离开                                  |

## 事件绑定方式

### 基础绑定

事件绑定的写法同组件的属性，以 key、value 的形式：

1. `bind` 绑定：

```html
<view bindtap="handleTap">点击事件</view>
<!-- 也可以写成 -->
<view bind:tap="handleTap">点击事件</view>
```

2. `catch` 绑定（阻止冒泡）：

```html
<view catchtap="handleTap">阻止冒泡的点击事件</view>
<!-- 也可以写成 -->
<view catch:tap="handleTap">阻止冒泡的点击事件</view>
```

### 事件捕获

捕获阶段位于冒泡阶段之前，且在捕获阶段中，事件到达节点的顺序与冒泡阶段恰好相反。需要在捕获阶段监听事件时，可以采用 `capture-bind`、`capture-catch` 关键字：

```html
<view capture-bind:tap="handleCapture">捕获阶段事件</view>
<view capture-catch:tap="handleCaptureAndStop">捕获阶段且停止传递</view>
```

## 事件对象

当事件回调触发时，会收到一个事件对象，它的详细属性如下：

| 属性           | 类型    | 说明                                         |
| -------------- | ------- | -------------------------------------------- |
| type           | String  | 事件类型                                     |
| timeStamp      | Integer | 事件生成时的时间戳                           |
| target         | Object  | 触发事件的组件的一些属性值集合               |
| currentTarget  | Object  | 当前组件的一些属性值集合                     |
| detail         | Object  | 额外的信息                                   |
| touches        | Array   | 触摸事件，当前停留在屏幕中的触摸点信息的数组 |
| changedTouches | Array   | 触摸事件，当前变化的触摸点信息的数组         |

### Target 和 CurrentTarget

- `target` 是触发事件的源组件
- `currentTarget` 是事件绑定的当前组件

两者都具备以下属性：
| 属性 | 类型 | 说明 |
|------|------|------|
| id | String | 元素的 id 属性 |
| dataset | Object | 包含所有以 data- 开头的自定义属性的对象集合，dataset 属性会自动将 data- 后面的属性名转换为驼峰命名。 例如：data-user-name 会变成 dataset.userName |

```html
<!-- 点击 inner-view 时 -->
<view id="outer-view" bindtap="handleTap">
  outer-view
  <view id="inner-view"> inner-view </view>
</view>
```

上述示例中，点击 inner-view 时：

- `e.target.id` 为 inner-view
- `e.currentTarget.id` 为 outer-view

### touches 和 changedTouches

touches 数组中每个元素包含以下属性
| 属性 | 说明 |
|------|------|
| identifier | 触摸点的标识符 |
| pageX, pageY | 距离文档左上角的距离 |
| clientX, clientY | 距离页面可显示区域左上角的距离 |

### detail

自定义事件所携带的数据，如表单组件的提交事件会携带用户的输入，媒体的错误事件会携带错误信息等。点击事件的 detail 带有的 x, y 同 pageX, pageY 代表距离文档左上角的距离。

## Mpx 增强的内联传参

Mpx 提供了比原生小程序更强大的事件传参能力，支持以下几种传参方式：

### 基础传参

```html
<!--原生小程序语法，通过dataset进行传参-->
<view data-name="basic" bindtap="handleTap">基础传参</view>

<script>
  import { createComponent } from '@mpxjs/core'
  createComponent({
    methods: {
      handleTap(e) {
        console.log('dataset:', e.target.dataset)
      }
    }
  })
</script>
```

### 模板内联传参

```html
<!--Mpx增强语法，模板内联传参，方便简洁-->
<view bindtap="handleTapInline('inline')">内联传参</view>

<script>
  import { createComponent } from '@mpxjs/core'
  createComponent({
    methods: {
      handleTapInline(params) {
        console.log('params:', params)
      }
    }
  })
</script>
```

### 传递动态参数

```html
<!--参数支持传递字面量和组件数据-->
<view bindtap="handleTapInline(text)">{{text}}</view>
<!--参数同样支持传递for作用域下的item/index-->
<view wx:for="{{items}}" bindtap="handleTapInline(item)">{{item}}</view>

<script>
  import { createComponent } from '@mpxjs/core'
  createComponent({
    data: {
      text: 'dynamic text'
      items: ['Item 1', 'Item 2', 'Item 3', 'Item 4']
    },
    methods: {
      handleTapInline (params) {
        console.log('params:', params)
      }
    }
  })
</script>
```

### 使用 event 对象

```html
<!-- 获取 event 对象 -->
<view bindtap="handleTapInlineWithEvent($event, 'inline')">获取event对象</view>

<script>
  import { createComponent } from '@mpxjs/core'
  createComponent({
    methods: {
      handleTapInlineWithEvent(event, params) {
        console.log('event:', event)
        console.log('params:', params)
      }
    }
  })
</script>
```

### 动态事件绑定

```html
<!-- 支持传入动态数据 -->
<view wx:for="{{items}}" bindtap="handleTap_{{index}}"> {{item}}</view>

<script>
  import { createComponent } from '@mpxjs/core'
  createComponent({
    data: {
      items: ['Item 1', 'Item 2', 'Item 3', 'Item 4']
    },
    methods: {
      const handleTap_0 = (event) => {
        console.log('Tapped on item 1')
      },

      const handleTap_1 = (event) => {
        console.log('Tapped on item 2')
      },

      const handleTap_2 = (event) => {
        console.log('Tapped on item 3')
      },

      const handleTap_3 = (event) => {
        console.log('Tapped on item 4')
      }
    }
  })
</script>
```
