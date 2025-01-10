# 自定义组件

在 Mpx 中也可以使用类似 Vue 中的单文件自定义组件，我们可以在每个组件内封装自定义内容和逻辑。

在Mpx中自定义组件，语法默认以微信小程序为基准，与此同时，Mpx 额外提供的数据响应和模版增强语法等一系列增强能力都可以在自定义组件中使用。

>作为参考，原生小程序自定义组件的规范详情查看[这里](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html)，但在Mpx中自定义组件所支持的属性和功能还需以当前文档为准。

## 注册使用

```html
<!--组件 components/list.mpx-->
<template>
    <view>组件名称: {{ name }}</view>
</template>
<script>
    import { createComponent } from '@mpxjs/core'
    createComponent({
        data: {
          name: 'list'
        }
    })
</script>

<!--页面 index.mpx-->
<template>
    <view>
        <list></list>
    </view>
</template>
<script>
    import { createPage } from '@mpxjs/core'
    createPage({})
</script>
<script type="application/json">
  {
    "usingComponents": {
        "list": "components/list"
    }
  }
</script>
```
使用 [createComponent](/api/global-api.html#createcomponent) 方法创建自定义组件，在父组件/页面中通过 usingComponents 注册使用。

## 组件属性

对于组件属性的讲解，下方暂时使用选项式 API 进行讲解。

### properties

用于声明组件接收的外部属性。属性的类型可以为 String、Number、Boolean、Object、Array 其一，也可以为 null 表示不限制类型。

```ts

type PropType = | StringConstructor   // String
  | NumberConstructor   // Number
  | BooleanConstructor  // Boolean
  | ObjectConstructor   // Object
  | ArrayConstructor    // Array; 
  | null; // null

interface ComponentOptions {
  properties?: {
    [key: string]: PropOptions | PropType
  }
}

interface PropOptions {
  type: PropType // type 为必填项
  value?: any
  optionalTypes?: PropType[] // 属性的类型（可以指定多个）
  observer?: string | ((newVal: any, oldVal: any) => void)
}
```

properties 定义包含以下选项：
* **`type`**: 必填，属性的类型
* **`optionalTypes`**: 可选，属性的类型（可以指定多个）
* **`value`**: 可选，属性的初始值
* **`observer`**: 可选，属性值变化时的回调函数

> **注意：**
> 1. 属性名应避免以 data 开头，例如 data-xyz="" 会被作为节点 dataset 来处理
> 2. 在组件定义和使用时，属性名和 data 字段相互间都不能冲突

```js
createComponent({
  properties: {
    // 基础类型
    propA: {
      type: String,
      value: ''
    },
    // 简化的定义方式
    propB: Number,
    // 多种类型
    propC: {
      type: Number,
      optionalTypes: [String, Object],
      value: 0
    },
    // 带有属性值变化回调
    propE: {
      type: Object,
      observer(newVal, oldVal) {
        console.log('propE changed:', newVal, oldVal)
      }
    }
  }
})
```
**参考**：[微信小程序properties定义](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html#properties-%E5%AE%9A%E4%B9%89)

### data

组件的内部数据，和 properties 一同用于组件的模板渲染。

```ts
interface ComponentOptions {
  data?: object | (() => object)
}
```
data 可以是一个函数返回一个普通 JavaScript 对象，也可以是一个普通 JavaScript 对象。

在 Mpx 中，组件实例会代理 data 对象的所有属性并进行响应式处理，因此可以直接通过 `this.dataName` 访问这些数据, 同时修改这些数据也会触发视图更新。

```html
<template>
  <view>{{ count }}</view>
  <view>{{ message }}</view>
  <view>{{ userInfo.name }}</view>
</template>

<script>
import { createComponent } from '@mpxjs/core'

createComponent({
  data: {
    count: 0,
    message: 'Hello',
    userInfo: {
      name: 'John',
      age: 20
    }
  },
  methods: {
    addCount() {
      this.count++
    }
  }
})
</script>
```
// TODO data 的注意项


### computed

用于声明基于现有数据的计算属性。

```ts
type ComputedGetter<T> = () => T
type ComputedSetter<T> = (value: T) => void

interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}

// 计算属性可以是函数或对象
type ComputedOption<T> = ComputedGetter<T> | WritableComputedOptions<T>

// 组件选项的接口
interface ComponentOptions {
  computed?: {
    [K: string]: ComputedOption<any>
  }
}
```

该选项接收一个对象，其中键是计算属性的名称，值是一个计算属性 getter，或一个具有 get 和 set 方法的对象 (用于声明可写的计算属性)。

所有的 getters 和 setters 会将它们的 this 上下文自动绑定为组件实例。

computed 选项用于声明依赖于其他数据的计算属性。计算属性的结果会被缓存，只有在依赖发生变化时才会重新计算。

```js
import { createComponent } from '@mpxjs/core'
createComponent({
  data() {
    return {
      price: 100,
      quantity: 2
    }
  },
  computed: {
    // 只读计算属性
    total() {
      return this.price * this.quantity
    },
    // 可读写计算属性
    discount: {
      get() {
        return this.price * 0.9
      },
      set(value) {
        this.price = value / 0.9
      }
    }
  }
})
```
> 注意
>* 选项式 API 中 computed 尽量不要使用箭头函数，否则无法访问组件实例 this

### watch

用于对响应性数据变化调用的侦听回调。

```ts
// flush 选项的可选值类型
type FlushMode = 'sync' | 'post' | 'pre'

interface ComponentOptions {
  watch?: {
    [key: string]: WatchOption | WatchCallback | string
  }
}

type WatchCallback = (newValue: any, oldValue: any) => void

interface WatchOption {
  handler: WatchCallback | string
  immediate?: boolean  // 是否立即执行
  deep?: boolean      // 是否深度监听
  flush?: FlushMode   // 回调的执行时机
}
```

watch 选项用于监听数据的变化并执行相应的回调函数。支持以下功能：
* 监听单个数据源
* 监听多个数据源
* 深度监听（deep）
* 立即执行（immediate）
* 执行时机控制（flush）
  * `'sync'`: 同步执行，立即触发回调
  * `'post'`: DOM 更新后执行（默认值）
  * `'pre'`: DOM 更新前执行

```js
createComponent({
  data() {
    return {
      message: 'Hello',
      user: {
        name: 'John',
        age: 20
      }
    }
  },
  watch: {
    // 简单监听
    message(newVal, oldVal) {
      console.log('message changed:', newVal, oldVal)
    },
    
    // 深度监听
    user: {
      handler(newVal, oldVal) {
        console.log('user changed:', newVal, oldVal)
      },
      deep: true,
      immediate: true
    },
    
    // 监听对象的属性
    'user.name'(newVal, oldVal) {
      console.log('user.name changed:', newVal, oldVal)
    },

    // 控制执行时机
    count: {
      handler(newVal) {
        console.log('count changed:', newVal)
      },
      flush: 'post' // DOM 更新后执行
    }
  }
})
```

### observers

用于监听数据变化，类似于 watch，最早由微信小程序官方提出，Mpx 框架支持了该能力并做了跨平台兼容。

```ts
interface ComponentOptions {
  observers?: {
    [path: string]: (newValue: any, ...args: any[]) => void
  }
}
```

observers 选项支持以下功能：
* 监听单个数据
* 监听多个数据
* 使用通配符监听对象或数组的所有子数据

通配符说明：
* `**`：表示所有子数据


```js
createComponent({
  
  observers: {
     observers: {
      'numberA, numberB': function(numberA, numberB) {
        // 在 numberA 或者 numberB 被设置时，执行这个函数
        this.numberC = numberA + numberB
      }
      'some.subfield': function(subfield) {
        subfield === this.some.subfield
      },
      'arr[12]': function(arr12) {
        // 使用 setData 设置 this.data.arr[12] 时触发
        // （除此以外，使用 setData 设置 this.data.arr 也会触发）
        arr12 === this.arr[12]
      },
      'some.field.**': function(field) {
        // field 下所有子数据变化都会触发回调
        field === this.some.field
      }
    }
  }
})
```

> **注意：**
> 1. 和 watch 不同，observers 监听多个数据时回调方法的参数为响应性数据最新值，并非数组
> 2. 使用通配符与 watch deep 属性表现一致
> 3. 建议尽量统一使用 watch

**参考**：[微信小程序数据监听器](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html#properties-%E5%AE%9A%E4%B9%89)

### methods

用于声明组件的方法。

```ts
interface ComponentOptions {
  methods?: {
    [key: string]: (...args: any[]) => any
  }
}
```

methods 选项用于声明组件实例可以访问的方法。所有方法的 this 上下文会自动绑定为组件实例。

```js
createComponent({
  methods: {
    handleClick() {
      // 访问数据
      console.log(this.message)
      // 调用其他方法
      this.otherMethod()
    },
    otherMethod() {
      // ...
    }
  }
})
```

### mixins
一个包含组件选项对象的数组，这些选项都将被混入到当前组件的实例中。

具体请查看[Mpx-mixins](https://mpxjs.cn/guide/advance/mixin.html)

### behaviors

小程序平台提供的用于组件间代码共享的特性，类似于"mixins"。


**参考**：[微信小程序behaviors](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html#properties-%E5%AE%9A%E4%B9%89)

在 Mpx 组件内如果使用 behaviors，在跨平台时会进行抹平处理，但建议直接使用 Mpx 提供的 mixins 能力。

> **注意：**
> * 使用内置 behaviors（如 wx://form-field），因为牵扯到小程序平台底层能力，无法做到完全跨平台抹平

### relations

用于定义组件间的关系，支持父子、祖孙等关系，实现组件间的通信与控制。

该特性 base 微信小程序平台，在Mpx中使用该特性需要注意，输出微信小程序平台时能力完全支持，跨端输出其他平台时受制于平台底层能力，无法完全做抹平支持。

| 平台 | 支持情况 | 说明 |
|------|---------|------|
| 微信小程序 | 完全支持 | 完全支持 relations 能力 |
| 支付宝小程序 | 部分支持 | 部分支持，不支持 linkChanged 和 target 能力 |
| 百度小程序 | 不支持 |  不支持使用 relations |
| QQ小程序 | 完全支持 | 完全支持 relations 能力 |
| 字节小程序 | 部分支持 | 部分支持，不支持 linkChanged 能力 |
| Web | 部分支持 | 部分支持，不支持 linkChanged 和 target 能力 |
| RN | 不支持 | 不支持使用 relations |

因此需要注意，在使用 realtions 能力跨平台时需要做好平台条件编译。 

```ts
interface RelationOption {
  type: 'parent' | 'child' | 'ancestor' | 'descendant'  // 关系类型
  linked?: (target: any) => void      // 关系建立时的回调
  linkChanged?: (target: any) => void // 关系变化时的回调
  unlinked?: (target: any) => void    // 关系解除时的回调
  target?: string                     // 关联的 behavior
}

interface ComponentOptions {
  relations?: {
    [componentPath: string]: RelationOption
  }
}
```

relations 支持以下功能：
* 定义组件间的层级关系
* 监听关系的生命周期
* 获取关联的组件实例
* 关联使用相同 behavior 的组件

详情可参考[微信小程序-relations](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/relations.html)

```js
// custom-ul 组件
import { createComponent } from '@mpxjs/core'
createComponent({
  relations: {
    './custom-li': {
      type: 'child', // 关联的目标节点应为子节点
      linked(target) {
        // 每次有 custom-li 被插入时执行
        console.log('li linked', target)
      },
      unlinked(target) {
        // 每次有 custom-li 被移除时执行
        console.log('li unlinked', target)
      }
    }
  }
})

// custom-li 组件
import { createComponent } from '@mpxjs/core'
createComponent({
  relations: {
    './custom-ul': {
      type: 'parent', // 关联的目标节点应为父节点
      linked(target) {
        // 每次被插入到 custom-ul 时执行
        console.log('ul linked', target)
      }
    }
  }
})
```

### externalClasses

组件接受的外部样式类，常用于在开启组件样式隔离时，可以通过接收外部样式类来改变组件样式。

```ts
interface ComponentOptions {
  externalClasses?: string[]
}
```

externalClasses 支持以下功能：
* 定义多个外部样式类
* 在组件 template 中使用外部样式类，同时支持在同一个节点上使用多个外部样式类

```html
<template>
  <!-- 组件 custom-component.mpx -->
  <view class="my-class">
    外部传入的样式类
  </view>
  <view class="other-class">
    另一个外部传入的样式类
  </view>
</template>
<script>
// 组件 custom-component.js
import { createComponent } from '@mpxjs/core'

createComponent({
  externalClasses: ['my-class', 'other-class'],
  
  options: {
    styleIsolation: 'isolated'
  }
})
</script>
```

使用组件：

```html
<!-- 页面 page.mpx -->
<!-- 单个样式类 -->
<custom-component my-class="red-text" />

<!-- 多个样式类（需要基础库 2.7.1 以上） -->
<custom-component my-class="red-text large-text" />

<!-- 动态样式类 -->
<custom-component my-class="{{isActive ? 'active' : ''}}" />
```

```css
/* 页面 page style */
.red-text {
  color: red;
}

.large-text {
  font-size: 20px;
}

.active {
  background: #f0f0f0;
}
```

关于 externalclasses 的更多描述也可以查看[微信小程序-外部样式类](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#%E5%A4%96%E9%83%A8%E6%A0%B7%E5%BC%8F%E7%B1%BB)

>**注意：**
>* 该功能默认在微信小程序可用，在跨平台输出时，需要在 @mpxjs/webpack-plugin 中配置相关的 externalClasses, 否则跨平台时该能力不生效，具体配置请[查看](https://mpxjs.cn/api/compile.html#externalclasses)。

### options

开启组件的部分特性时需要设置的选项，例如 virtualHost 、 multipleSlots 之类特性。

```ts
interface ComponentOptions {
  options?: {
    virtualHost?: boolean      // 设置组件是否为虚拟节点
    styleIsolation?: 'isolated' | 'apply-shared' | 'shared' | 'page-isolated' | 'page-apply-shared' | 'page-shared'  // 设置样式隔离选项
    multipleSlots?: boolean    // 启用多 slot 支持
    addGlobalClass?: boolean   // 允许组件的样式影响到外部
  }
}
```

options 支持以下配置：
* **virtualHost**: 设置组件是否是虚拟的
* **styleIsolation**: 设置组件样式隔离选项
* **multipleSlots**: 是否启用多 slot 支持，仅微信和QQ需要配置
* **addGlobalClass**: 是否允许组件的样式影响外部

但需要注意的是，此处的 options 配置为 base 微信小程序的语法特性，在跨端输出其他平台时，由于依赖平台底层能力支持与否，因此无法做到全部功能抹平。

| 选项 |         微信 | 支付宝 | 百度 | QQ | 字节 | Web | RN | 说明 |
|------|------|--------|------|-----|------|-----|-----|-----|
| virtualHost |   ✓ | ✓ | ✗  | ✓ | ✓ | ✓ | ✗  | Mpx 以微信为base，virtualHost 默认为 false，跨端输出Web、支付宝时默认会在自定义组件根节点包裹一层节点，开发者也可以通过[编译配置](https://mpxjs.cn/api/compile.html#autovirtualhostrules)进行控制 |
| styleIsolation | ✓ | 部分支持 | ✗ | ✓ | ✗ | ✗ | ✗ | 微信默认开启样式隔离，目前只有支付宝小程序平台没有样式隔离能力, 当组件 style 标签配置 scoped 时，Mpx 输出支付宝会默认抹平开启样式隔离，开发者也可通过[编译配置](https://mpxjs.cn/api/compile.html#autoscoperules)进行控制 |
| multipleSlots | ✓ | - | - | ✓ | - | - | - | 目前仅微信和QQ使用多个slot需要配置multipleSlots，其他平台默认支持使用多slot |
| addGlobalClass |  ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | - |

>**注意：**
> * virtualHost 在支付宝平台默认为 false
>options 中的特性以微信小程序为 base，随着微信小程序的持续迭代，此处列出的特性可能会存在部分缺失。
>同时对于上述各特性的具体使用，特别是各小程序平台，开发者也可以在对应小程序开发文档中查找参考。

### 组件生命周期
在 Mpx 内组件生命周期可以使用[框架内置生命周期](框架内置生命周期)，也可以使用以微信原生base的生命周期，在使用微信原生base的生命周期时，在跨平台输出时，框架会对生命周期进行映射抹平，将不同小程序平台的生命周期转换映射为内置生命周期后再进行统一的驱动，以抹平不同小程序平台生命周期钩子的差异。

在选项式 API 中，可以使用微信 base 或者 Mpx 框架暴露的内置生命周期。

微信原生生命周期：

| 生命周期  | 说明 |
|-----------------|------|
| created  | 在组件实例初始化完成时调用 |
| attached  | 在组件挂载开始之前调用 |
| ready | 在组件在视图层布局完成后调用 |
| detached  | 在组件实例销毁时调用 |

在组合式 API 中，需要使用框架暴露的统一的[生命周期钩子](https://mpxjs.cn/api/composition-api.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E9%92%A9%E5%AD%90)

### pageLifetimes
组件中访问页面生命周期

在选项式中可以直接使用 pageLifetimes.show 之类的配置：

| 生命周期  | 说明 |
|-----------------|------|
| show  | 组件所在页面显示 |
| hide  | 组件所在页面隐藏 |
| resize | 组件所在页面尺寸发生变化 |

在组合式 API 中，需要使用框架暴露的 onShow、onHide、onResize，详情可[查看](https://mpxjs.cn/api/composition-api.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E9%92%A9%E5%AD%90)


## 组件实例方法

### setData

更新视图数据，无论数据value是否改变，都会强制刷新视图。

```ts
interface Component {
  setData(
    data: Record<string, any>,
    callback?: () => void
  ): void
}
```

setData 支持以下功能:
* 修改 data 数据
* 支持设置回调函数，回掉函数在视图更新完成后执行
* 支持批量更新多个数据

```js
import { createComponent } from '@mpxjs/core'
createComponent({
  data: {
    text: 'init data',
  },
  methods: {
    changeData() {
      // 修改数据
      this.setData({
        text: 'changed data'
      })
      // 设置回调函数
      this.setData({
        text: 'changed data'
      }, function() {
        console.log('数据更新完成')
      })
    }
  }
})
```
在 Mpx 内请慎重使用 setData，建议直接使用组件实例修改数据
```js
this.text = 'some data'
```

| API |  微信 | 支付宝 | 百度 | QQ | 字节 | Web | RN | 说明 |
|------|------|--------|------|-----|------|-----|-----|-----|
| setData |  ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | - |

### triggerEvent

### getPageId

### selectComponent

### createSelectorQuery

### createIntersectionObserver

### selectAllComponents

### hasBehavior

## 动态组件

Mpx中提供了使用方法类似于 Vue 的动态组件能力，这是一个基于 wx:if 实现的语法。通过对 `is` 属性进行动态绑定，可以实现在同一个挂载点切换多个组件，前提需要动态切换的组件已经在全局或者组件中完成注册。

使用示例如下：

```html
<view>
  <!-- current为组件名称字符串，可选范围为局部注册的自定义组件和全局注册的自定义组件 -->
  <!-- 当 `current`改变时，组件也会跟着切换  -->
  <component is="{{current}}"></component>
</view>

<script>
  import {createComponent} from '@mpxjs/core'
  createComponent({
    data: {
      current: 'test'
    },
    ready () {
      setTimeout(() => {
        this.current = 'list'
      }, 3000)
    }
  })
</script>

<script type="application/json">
  {
    "usingComponents": {
      "list": "../components/list",
      "test": "../components/test"
    }
  }
</script>
```

## slot

在组件中使用slot（插槽）可以使我们封装的组件更具有可扩展性，Mpx完全支持原生插槽的使用。

### 基础用法

```html
<!-- 组件模板 -->
<!-- components/mySlot.mpx -->
<view>
  <view>这是组件模板</view>
  <slot name="slot1"></slot>
  <slot name="slot2"></slot>
</view>
```

使用组件时：

```html
<!-- index.mpx -->
<template>
  <view>
    <my-slot>
      <view slot="slot1">我是slot1中的内容</view>
      <view slot="slot2">我是slot2中的内容</view>
    </my-slot>
  </view>
</template>

<script>
import { createComponent } from '@mpxjs/core'

createComponent({
  options: {
    multipleSlots: true // 启用多slot支持
  }
})
</script>

<script type="application/json">
  {
    "usingComponents": {
      "my-slot": "components/mySlot"
    }
  }
</script>
```

> 注意：使用多个slot时，需要在组件选项中开启 `multipleSlots: true`。

更多关于插槽的使用细节可查看[微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html)。
