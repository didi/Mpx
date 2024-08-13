import{_ as t,c as d,o as r,a7 as e}from"./chunks/framework.CwvFaCp2.js";const R=JSON.parse('{"title":"RN 自定义组件支持","description":"","frontmatter":{},"headers":[],"relativePath":"rn-component.md","filePath":"rn-component.md"}'),a={name:"rn-component.md"},o=e('<h1 id="rn-自定义组件支持" tabindex="-1">RN 自定义组件支持 <a class="header-anchor" href="#rn-自定义组件支持" aria-label="Permalink to &quot;RN 自定义组件支持&quot;">​</a></h1><p>创建自定义组件在 RN 环境下部分实例方法、属性存在兼容性问题不支持， 此文档以微信小程序为参照，会详细列出各方法、属性的支持度。</p><h2 id="参数" tabindex="-1">参数 <a class="header-anchor" href="#参数" aria-label="Permalink to &quot;参数&quot;">​</a></h2><h3 id="组件定义属性说明" tabindex="-1">组件定义属性说明 <a class="header-anchor" href="#组件定义属性说明" aria-label="Permalink to &quot;组件定义属性说明&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>RN 是否支持</th><th>描述</th></tr></thead><tbody><tr><td>properties</td><td>Object Map</td><td>是</td><td>组件的对外属性，是属性名到属性设置的映射表</td></tr><tr><td>data</td><td>Object</td><td>是</td><td>组件的内部数据，和 <code>properties</code> 一同用于组件的模板渲染</td></tr><tr><td>observers</td><td>Object</td><td>是</td><td>组件数据字段监听器，用于监听 <code>properties</code> 和 <code>data</code> 的变化</td></tr><tr><td>methods</td><td>Object</td><td>是</td><td>组件的方法，包括事件响应函数和任意的自定义方法，关于事件响应函数的使用</td></tr><tr><td>behaviors</td><td>String Array</td><td>否</td><td>输出 RN 不支持</td></tr><tr><td>created</td><td>Function</td><td>是</td><td>组件生命周期函数-在组件实例刚刚被创建时执行，注意此时不能调用 <code>setData</code></td></tr><tr><td>attached</td><td>Function</td><td>是</td><td>组件生命周期函数-在组件实例进入页面节点树时执行</td></tr><tr><td>ready</td><td>Function</td><td>是</td><td>组件生命周期函数-在组件布局完成后执行</td></tr><tr><td>moved</td><td>Function</td><td>否</td><td>RN 不支持，组件生命周期函数-在组件实例被移动到节点树另一个位置时执行</td></tr><tr><td>detached</td><td>Function</td><td>是</td><td>组件生命周期函数-在组件实例被从页面节点树移除时执行</td></tr><tr><td>relations</td><td>Object</td><td>否</td><td>输出 RN 不支持</td></tr><tr><td>externalClasses</td><td>String Array</td><td>否</td><td>输出 RN 不支持</td></tr><tr><td>options</td><td>Object Map</td><td>否</td><td>输出 RN 不支持，一些选项，诸如 multipleSlots、virtualHost、pureDataPattern，这些功能输出 RN 不支持</td></tr><tr><td>lifetimes</td><td>Object</td><td>是</td><td>组件生命周期声明对象</td></tr><tr><td>pageLifetimes</td><td>Object</td><td>是</td><td>组件所在页面的生命周期声明对象</td></tr></tbody></table><h3 id="组件实例属性与方法" tabindex="-1">组件实例属性与方法 <a class="header-anchor" href="#组件实例属性与方法" aria-label="Permalink to &quot;组件实例属性与方法&quot;">​</a></h3><p>生成的组件实例可以在组件的方法、生命周期函数中通过 this 访问。组件包含一些通用属性和方法。</p><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>RN 是否支持</th><th>描述</th></tr></thead><tbody><tr><td>is</td><td>String</td><td>否</td><td>输出 RN 暂不支持，未来支持, 组件的文件路径</td></tr><tr><td>id</td><td>String</td><td>是</td><td>节点id</td></tr><tr><td>dataset</td><td>String</td><td>是</td><td>节点dataset</td></tr><tr><td>data</td><td>Object</td><td>否</td><td>组件数据，通过 this 直接访问</td></tr><tr><td>properties</td><td>Object</td><td>否</td><td>组件props，通过 this 直接访问</td></tr><tr><td>router</td><td>Object</td><td>否</td><td>输出 RN 暂不支持</td></tr><tr><td>pageRouter</td><td>Object</td><td>否</td><td>输出 RN 暂不支持</td></tr><tr><td>renderer</td><td>string</td><td>否</td><td>输出 RN 暂不支持</td></tr></tbody></table><p>微信小程序原生方法</p><table tabindex="0"><thead><tr><th>方法名</th><th>RN是否支持</th><th>参数</th><th>描述</th></tr></thead><tbody><tr><td>setData</td><td>是</td><td>Object newData</td><td>设置data并执行视图层渲染</td></tr><tr><td>hasBehavior</td><td>否</td><td>Object behavior</td><td>检查组件是否具有 behavior</td></tr><tr><td>triggerEvent</td><td>是</td><td>String name, Object detail, Object options</td><td>触发事件</td></tr><tr><td>createSelectorQuery</td><td>否</td><td></td><td>输出 RN 暂不支持，未来支持，建议使用 ref</td></tr><tr><td>createIntersectionObserver</td><td>否</td><td></td><td>输出 RN 暂不支持</td></tr><tr><td>selectComponent</td><td>否</td><td>String selector</td><td>输出 RN 暂不支持，未来支持，建议使用 ref</td></tr><tr><td>selectAllComponents</td><td>否</td><td>String selector</td><td>输出 RN 暂不支持，未来支持，建议使用 ref</td></tr><tr><td>selectOwnerComponent</td><td>否</td><td></td><td>输出 RN 不支持</td></tr><tr><td>getRelationNodes</td><td>否</td><td>String relationKey</td><td>输出 RN 不支持</td></tr><tr><td>groupSetData</td><td>否</td><td>Function callback</td><td>输出 RN 不支持</td></tr><tr><td>getTabBar</td><td>否</td><td></td><td>输出 RN 不支持</td></tr><tr><td>getPageId</td><td>否</td><td></td><td>输出 RN 不支持</td></tr><tr><td>animate</td><td>否</td><td>String selector, Array keyframes, ...</td><td>输出 RN 不支持</td></tr><tr><td>clearAnimation</td><td>否</td><td>String selector, Object options, ...</td><td>输出 RN 不支持</td></tr></tbody></table><p>Mpx 框架增强实例方法</p><table tabindex="0"><thead><tr><th>方法名</th><th>RN是否支持</th><th>描述</th></tr></thead><tbody><tr><td>$set</td><td>是</td><td>向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新</td></tr><tr><td>$watch</td><td>是</td><td>观察 Mpx 实例上的一个表达式或者一个函数计算结果的变化</td></tr><tr><td>$delete</td><td>是</td><td>删除对象属性，如果该对象是响应式的，那么该方法可以触发观察器更新（视图更新</td></tr><tr><td>$refs</td><td>是</td><td>一个对象，持有注册过 ref的所有 DOM 元素和组件实例，调用响应的组件方法或者获取视图节点信息。</td></tr><tr><td>$asyncRefs</td><td>否</td><td>输出 RN 不支持</td></tr><tr><td>$forceUpdate</td><td>是</td><td>用于强制刷新视图，不常用，通常建议使用响应式数据驱动视图更新</td></tr><tr><td>$nextTick</td><td>是</td><td>在下次 DOM 更新循环结束之后执行延迟回调函数，用于等待 Mpx 完成状态更新和 DOM 更新后再执行某些操作</td></tr><tr><td>$i18n</td><td>否</td><td>输出 RN 暂不支持，国际化功能访问器，用于获取多语言字符串资源</td></tr><tr><td>$rawOptions</td><td>是</td><td>访问组件原始选项对象</td></tr></tbody></table>',12),n=[o];function i(c,h,s,l,p,b){return r(),d("div",null,n)}const m=t(a,[["render",i]]);export{R as __pageData,m as default};