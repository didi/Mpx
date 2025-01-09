import cssSelect from './css-select'
// todo: stringify wxs 模块只能放到逻辑层执行，主要还是因为生成 vdom tree 需要根据 class 去做匹配，需要看下这个代码从哪引入
import stringify from '@mpxjs/webpack-plugin/lib/runtime/stringify.wxs'
import Interpreter from './interpreter'
import { dash2hump, isString, error } from '@mpxjs/utils'

const deepCloneNode = function (val) {
  return JSON.parse(JSON.stringify(val))
}

function simpleNormalizeChildren (children) {
  for (let i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

export default function _genVnodeTree (astData, contextScope, options) {
  const { template = {}, styles = [] } = astData || {}
  const { moduleId, location } = options || {}
  // 解除引用
  const templateAst = deepCloneNode(template)
  // 获取实例 uid
  const uid = contextScope[0]?.__mpxProxy?.uid || contextScope[0]?.uid
  // 动态化组件 slots 通过上下文传递，相当于 props
  const slots = contextScope[0]?.slots || {}

  function createEmptyNode () {
    return createNode('block')
  }

  function genVnodeTree (node) {
    if (node.type === 1) {
      // wxs 模块不需要动态渲染
      if (node.tag === 'wxs') {
        return createEmptyNode()
      } else if (node.for && !node.forProcessed) {
        return genFor(node)
      } else if (node.if && !node.ifProcessed) {
        return genIf(node)
      } else if (node.tag === 'slot') {
        return genSlot(node)
      } else {
        const data = genData(node)
        let children = genChildren(node)
        // 运行时组件的子组件都通过 slots 属性传递，样式规则在当前组件内匹配后挂载
        if (node.dynamic) {
          data.slots = resolveSlot(children.map(item => genVnodeWithStaticCss(deepCloneNode(item))))
          children = []
        }
        return createNode(node.tag, data, children)
      }
    } else if (node.type === 3) {
      return genText(node)
    }
  }

  function evalExps (exps) {
    const interpreter = new Interpreter(contextScope)
    // 消除引用关系
    let value
    try {
      value = interpreter.eval(JSON.parse(JSON.stringify(exps)))
    } catch (e) {
      const errmsg = e.message
      console.warn(errmsg)
      error('interprete the expression wrong: ', location, {
        errType: 'mpx-dynamic-interprete',
        errmsg
      })
    }
    return value
  }

  function createNode (tag, data = {}, children = []) {
    if (Array.isArray(data)) {
      children = data
      data = {}
    }
    if (typeof tag === 'object') {
      return tag
    }

    // 处理 for 循环产生的数组，同时清除空节点
    children = simpleNormalizeChildren(children).filter(node => !!node?.nt)

    return {
      nt: tag,
      d: data,
      c: children
    }
  }

  /**
   *
   * 样式隔离的匹配策略优化：
   *
   * 条件1： 子组件不能影响到父组件的样式
   * 条件2： slot 的内容必须在父组件的上下文当中完成样式匹配
   * 条件3： 匹配过程只能进行一次
   *
   * 方案一：根据 moduleId 即作用域来进行匹配
   * 方案二：根据虚拟树来进行匹配
   */
  // function createDynamicNode (moduleId, data = {}, children = []) {
  //   const { template = {}, styles = [] } = staticMap[moduleId]
  //   data.$slots = resolveSlot(children) // 将 slot 通过上下文传递到子组件的渲染流程中
  //   const vnodeTree = _genVnodeTree(template, [data], styles, moduleId)
  //   return vnodeTree
  // }

  function resolveSlot (children) {
    const slots = {}
    if (children.length) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const name = child.d?.slot
        if (name) {
          const slot = (slots[name] || (slots[name] = []))
          if (child.tag === 'template') {
            slot.push.apply(slot, child.children || [])
          } else {
            slot.push(child)
          }
        } else {
          (slots.default || (slots.default = [])).push(child)
        }
      }
    }
    return slots
  }

  function genData (node) {
    const res = {
      uid,
      moduleId
    }
    if (!node.attrsList) {
      return res
    }

    node.attrsList.forEach((attr) => {
      if (attr.name === 'class' || attr.name === 'style') {
        // class/style 的表达式为数组形式，class/style的计算过程需要放到逻辑层，主要是因为有逻辑匹配的过程去生成 vnodeTree
        const helper = attr.name === 'class' ? stringify.c : stringify.s
        let value = ''
        if (attr.__exp) {
          let valueArr = evalExps(attr.__exp)
          valueArr = Array.isArray(valueArr) ? valueArr : [valueArr]
          value = helper(...valueArr)
          // dynamic style + wx:show
          const showStyle = valueArr[2]
          if (showStyle) {
            value = value + ';' + showStyle
          }
        } else {
          value = attr.value
        }
        res[attr.name] = value
      } else {
        res[dash2hump(attr.name)] = attr.__exp
          ? evalExps(attr.__exp)
          : attr.value
      }
    })

    return res
  }

  function genChildren (node) {
    const res = []
    const children = node.children || []
    if (children.length) {
      children.forEach((item) => {
        res.push(genNode(item))
      })
    }
    return res
  }

  function genNode (node) {
    if (node.type === 1) {
      return genVnodeTree(node)
    } else if (node.type === 3 && node.isComment) {
      return ''
      // TODO: 注释暂不处理
      // return _genComment(node)
    } else {
      return genText(node) // 文本节点统一通过 _genText 来生成，type = 2(带有表达式的文本，在 mpx 统一处理为了3) || type = 3(纯文本，非注释)
    }
  }

  function genText (node) {
    return {
      nt: '#text',
      ct: node.__exp ? evalExps(node.__exp) : node.text
    }
  }

  function genFor (node) {
    node.forProcessed = true

    const itemKey = node.for.item || 'item'
    const indexKey = node.for.index || 'index'
    const scope = {
      [itemKey]: null,
      [indexKey]: null
    }
    const forExp = node.for
    const res = []
    let forValue = evalExps(forExp.__exp)

    // 和微信的模版渲染策略保持一致：当 wx:for 的值为字符串时，会将字符串解析成字符串数组
    if (isString(forValue)) {
      forValue = forValue.split('')
    }

    if (Array.isArray(forValue)) {
      forValue.forEach((item, index) => {
        // item、index 模板当中如果没申明，需要给到默认值
        scope[itemKey] = item
        scope[indexKey] = index

        contextScope.push(scope)

        // 针对 for 循环避免每次都操作的同一个 node 导致数据的污染的问题
        res.push(deepCloneNode(genVnodeTree(deepCloneNode(node))))

        contextScope.pop()
      })
    }

    return res
  }

  // 对于 if 而言最终生成 <= 1 节点
  function genIf (node) {
    if (!node.ifConditions) {
      node.ifConditions = []
      return {} // 一个空节点
    }
    node.ifProcessed = true

    const ifConditions = node.ifConditions.slice()

    let res = {} // 空节点
    for (let i = 0; i < ifConditions.length; i++) {
      const condition = ifConditions[i]
      // 非 else 节点
      if (condition.ifExp) {
        const identifierValue = evalExps(condition.__exp)
        if (identifierValue) {
          res = genVnodeTree(condition.block === 'self' ? node : condition.block)
          break
        }
      } else { // else 节点
        res = genVnodeTree(condition.block)
        break
      }
    }
    return res
  }

  // 暂时不支持作用域插槽
  function genSlot (node) {
    const data = genData(node) // 计算属性值
    const slotName = data.name || 'default'
    return slots[slotName] || null
  }

  function genVnodeWithStaticCss (vnodeTree) {
    styles.forEach((item) => {
      const [selector, style] = item
      const nodes = cssSelect(selector, { moduleId })(vnodeTree)
      nodes?.forEach((node) => {
        // todo style 合并策略问题：合并过程中缺少了权重关系 style, class 的判断，需要优化
        node.d.style = node.d.style ? style + node.d.style : style
      })
    })

    return vnodeTree
  }

  const interpreteredVnodeTree = genVnodeTree(templateAst)

  return genVnodeWithStaticCss(interpreteredVnodeTree)
}
