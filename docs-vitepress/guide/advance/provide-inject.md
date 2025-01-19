# 依赖注入（Provide/Inject）

## 适用场景

通常情况下，从父组件向子组件传递数据时，我们会使用 props 向下传递。如果在一颗组件层级嵌套很深的组件树中，某个深层的子组件依赖一个较远的祖先组件中的部分数据。在这种情况下，如果仅使用 props 则必须将其沿着组件链路逐级传递下去，这就是 **prop 逐级透传（prop-drilling）** 问题。

使用 `provide` 和 `inject` 可以帮助我们解决这一麻烦问题：一个父组件相对于其所有的后代组件，会作为**依赖提供者**。任何后代的组件树，无论层级有多深，都可以**注入**由父组件提供给整条链路的依赖。

![组件间 provide-inject 示意图](https://s3-gz01.didistatic.com/packages-mait/img/bLipGWmlcm1732166788438.png)

## Provide 提供

### 组合式语法

在组合式语法中，需要使用到 `provide()` 函数，`provide()` 函数接收两个必填参数：

1. 第一个参数表示**注入名**，是一个字符串或者 `Symbol`。后代组件会用注入名来查找期望注入的值，一个组件可以多次调用 `provide()`，使用不同的注入名，注入不同的依赖值。使用 `Symbol` 作为注入名时，只能使用组合式语法而非选项式语法。
2. 第二个参数表示**提供值**，值可以是任意类型，包括响应式的状态，比如一个 `ref`、`reactive` 或者 `computed` 计算值。

```ts
<script setup>
import { computed, provide, ref } from '@mpxjs/core'

// 静态数据
provide(/* 注入名 */ 'message', /* 值 */ 'hello!')

// 使用 Symbol 作为注入名
const key = Symbol()
provide(key, 'hello!')

// 响应式数据
const count = ref(1)
const double = computed(() => count.value * 2)
provide('count', count)
provide('double', double)

</script>
```

### 选项式语法

选项式语法的 `setup()` 中，用法和组合式 API 一致。另外针对选项式语法，我们也提供了 `provide` 选项，它是**一个对象或返回一个对象的函数**。

对于 `provide` 对象上的每一个属性，后代组件会用其 key 为注入名查找期望注入的值，属性的值就是要提供的数据。

如果我们需要提供依赖当前组件实例的状态 (比如在 `data` 属性中定义的数据)，那么需要使用函数形式的 `provide` 选项。需要注意的是，这 **并不会** 使注入保持响应性，如果需要保证注入方和供给方之间的响应性链接，我们需要使用 `computed()` 函数提供一个计算属性。

```ts{17}
<script>
import { createComponent, computed } from '@mpxjs/core'

createComponent({
  data: {
    count: 1,
  },
  // 1. 静态数据可以选择直接使用对象形式
  provide: {
    message: 'hello'
  },
  // 2. 选择使用函数的形式，可以访问到 `this`
  provide() {
    return {
      count: this.count
      // 显式提供一个计算属性
      message: computed(() => this.count * 2)
    }
  }
})
</script>
```

### 应用级顶层 provide

前面介绍的是在一个组件中提供依赖，我们还可以在整个应用层面提供依赖，这样整个应用中所有组件都可以使用。

```ts
import { createApp } from '@mpxjs/core'

createApp({
  // 应用层 provide
  provide() {
    return {
      'appMessage': 'provide from App scope!'
    }
  }
})
```

## Inject 注入

### 组合式语法

`inject()` 函数最多接收三个参数：

- 第一个参数必填，表示**注入名**，字符串类型。
- 第二个参数可选，表示**默认值**。
  - 如果在注入一个值时不确定是否有提供者，那么应该声明一个默认值。如果既没有提供者也没有默认值，则会抛出一个运行时警告。
- 第三个参数可选，表示**是否将默认值视为工厂函数**，布尔类型。
  - 某些场景下，默认值可能需要通过调用一个函数或初始化一个类来生成，或者某些非基础类型数据创建开销比较大，请使用工厂函数来创建默认值。

```ts
<script setup>
import { inject } from '@mpxjs/core'

// 注入 message 依赖
const value = inject('message')
// 创建默认值
const value = inject('message', 'default value')
// 使用工厂函数创建默认值
const value = inject('key', () => new ExpensiveClass(), true)
</script>
```

如果提供的值是一个 ref，注入进来的会是该 ref 对象，而不会自动解包为其内部的值。这使得注入方能够通过 ref 对象和提供方保持响应性链接。

### 选项式语法

选项式语法的 `setup()` 中，用法和组合式 API 一致。另外针对选项式语法，我们也提供了 `inject` 选项，它是**一个数组或一个对象**。

1. **数组**形式使用。数组中的每一项对应一个注入名，注入的属性会以同名的 key 暴露到组件实例上。如下示例中，注入名 `"message"` 在注入后以 `this.message` 的形式暴露。另外，`inject` 会在组件自身的状态**之前**被解析，意味着你可以在 `data()` 中访问到注入的属性。

```ts{6}
<script>
import { createComponent } from '@mpxjs/core'

createComponent({
  // 数组形式使用 `inject` 选项
  inject: ['message', 'count'],
  data() {
    return {
      // 可以在 `data()` 中访问到注入的属性
      fullMessage: this.message,
      fullCount: this.count
    }
  }
})
</script>
```

2. **对象**形式使用。相比数组形式，对象形式支持注入**别名**和**默认值**。如下示例，通过 `from` 属性指定原注入名，通过 `default` 属性指定默认值。

```ts
<script>
import { createComponent } from '@mpxjs/core'

createComponent({
  inject: {
    myCount: 'count', // 按注入名 'count' 注入
    message: {
      from: 'message', // 'message' 是原注入名，当与原注入名同名时，这个属性是可选的
      default: 'default value' // 默认值
    },
    user: { // 与原注入名 'user' 同名
      default: () => ({ name: 'Wang' }) // 使用工厂函数创建默认值
    }
  }
})
</script>
```

## 避免注入名潜在冲突

如果你正在构建大型的应用，包含非常多的依赖提供，那么随处定义的注入名容易存在潜在的同名冲突。在 Mpx 实现中，同名的注入名会覆盖之前已有的注入名对应的提供值。

针对大型应用的最佳实践，我们通常推荐在一个单独的文件中导出这些注入名，可以结合业务模块功能来统一注入名的命名和管理规范。*以下示例仅供参考，具体实现请依据自身实际场景确定。*

```ts
/** 推荐创建一个单独的文件来管理和导出注入名 */

// 1. 使用枚举类型
export const InjectionKeys = {
  user: 'user',
  auth: 'auth',
  product: 'product',
}

// 2. 按业务模块功能划分命名，不容易命名冲突，可读性高
export const InjectionKeys = {
  user: {
    service: 'user:service',
    store: 'user:store',
  },
  auth: {
    service: 'auth:service',
    token: 'auth:token',
  },
  product: {
    list: 'product:list',
    details: 'product:details',
  },
}

// 3. 使用 Symbol 创建唯一注入名，或再结合命名空间
export const InjectionKeys = {
  user: Symbol('user'),
  auth: Symbol('auth'),
  product: Symbol('product'),
}

// 4. 自行实现类似 Symbol polyfill 的命名生成函数
export const createInjectionKey = (module, key) => `${module}:${key}`
export const InjectionKeys = {
  user: createInjectionKey('user', 'service'),
  auth: createInjectionKey('auth', 'token'),
  product: createInjectionKey('product', 'list'),
}
```

## TS 类型支持

直接使用字符串注入 key 时，注入值的类型默认推导会是 `unknown`，需要通过泛型参数显式声明。因为无法保证运行时一定存在这个 provide，所以推导类型也可能是 `undefined`。当声明一个默认值后，这个 `undefined` 类型就可以成功被移除。

```ts
<script setup lang="ts">
import { inject } from '@mpxjs/core'

const foo = inject('foo') // 类型：unknown
const foo = inject<string>('foo') // 类型：string | undefined
const foo = inject<string>('foo', 'default value') // 类型：string ✅
</script>
```

当然，如果你已经确定注入名肯定被提供了，也可以强制断言。

```ts
const foo = inject('foo') as string
```

如果使用 `Symbol` 作为注入名，可以使用我们提供的 `InjectionKey` 泛型接口，使用它对注入名进行注解或者断言后，可以用来在不同组件之间同步注入值的类型。建议将注入 key 放在单独文件，这样方便在多个组件中导入使用。

```ts{4}
import { provide, inject } from '@mpxjs/core'
import type { InjectionKey } from '@mpxjs/core'

export const key: InjectionKey<string> = Symbol() // 类型注解
// const key = Symbol() as InjectionKey<string> // 类型断言写法等效

provide(key, 'foo') // 若默认值是非字符串则会 TS 类型报错

const foo = inject(key) // ✅ foo 的类型：string | undefined
const foo = inject(key, 'default value') // ✅ foo 的类型：string
const foo = inject(key, 1) // ❌ 默认值是非字符串则会 TS 类型报错
```

## 跨端差异

- Mpx 输出 **Web** 端，使用规则与 Vue 一致，`provide/inject` 的生效范围严格遵行父子组件关系，只有父组件可以成功向子孙组件提供依赖。
- Mpx 输出 **RN** 端，框架内部基于 React 的 `useContext` 钩子来转换实现，表现和 Web 端一致。
- Mpx 输出 **小程序** 端同样遵循类似 Vue 的父子组件关系，但是在 `slot` 场景下小程序表现会和 Web、RN 端略有差异。举个例子，如下代码所示：在组件 A 的 `template` 模板中包含子组件 B，然后组件 B 通过 `slot` 包含子组件 C，组件 B 和 C 都定义在组件 A 的模板中。该场景下：在 Web 端，组件 A 是 B 的父组件，B 是 C 的父组件，所以 A 和 B 都可以向 C 提供依赖。但在小程序端，B 和 C 的父组件都是 A，组件 B 不能再向 C 提供依赖。这个跨端差异或者说“副作用”可以理解成：Web 端是基于“节点树”，即虚拟组件节点纬度，而小程序的父子组件关系是基于“组件树”，即组件模板维度，也就是说当前组件的创建者（在 WXML/AXML 模板中定义了此组件的组件）才是它的父组件。

```html
<!-- ComponentA -->
<template>
  <view>组件 A</view>
  <ComponentB>
    <ComponentC></ComponentC>
  </ComponentB>
</template>

<!-- ComponentB -->
<template>
  <view>
    <view>组件 B</view>
    <slot></slot>
  </view>
</template>
```
