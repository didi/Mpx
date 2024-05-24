const { getAndRemoveAttr, parseMustache, findPrevNode, replaceNode, createASTElement } = require('./compiler')
const allConfigs = require('../config')
const { parseExp } = require('./parse-exps')

function processIf (vnode, config) {
  delete vnode.ifProcessed

  if (vnode.if) {
    getAndRemoveAttr(vnode, config.directive.if)
    const parsedExp = vnode.if.exp
    addIfCondition(vnode, {
      ifExp: true,
      block: 'self',
      __exps: parseExp(parsedExp)
    })

    vnode.if = true
  } else if (vnode.elseif || vnode.else) {
    const directive = vnode.elseif ? config.directive.elseif : config.directive.else
    getAndRemoveAttr(vnode, directive)
    processIfConditions(vnode)

    delete vnode.elseif
    delete vnode.else
  } else if (typeof vnode._if === 'boolean') {
    // 如果节点有 _if 属性，那么其值为一个常量值
    // 如果值为 true，一定会渲染这一个节点，当成一个普通节点即可，因为编译阶段已经 delete if
    if (vnode._if === true) {
      // do nothing
    }

    // 如果值为 false，后续的遍历过程会删除这个节点，本来也不需要被渲染出来
    if (vnode._if === false) {
      // do nothing
    }
  }
}

function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  el.ifConditions.push(condition)
}

function processIfConditions (el) {
  const prev = findPrevIfNode(el)
  if (prev) {
    addIfCondition(prev, {
      ifExp: !!el.elseif,
      block: el,
      __exps: el.elseif ? parseExp(el.elseif.exp) : ''
    })

    const tempNode = createASTElement('block', [])
    tempNode._tempIf = true // 创建一个临时的节点，后续遍历会删除
    replaceNode(el, tempNode)
  }
}

function findPrevIfNode (el) {
  const prevNode = findPrevNode(el)
  if (!prevNode) {
    return null
  }

  if (prevNode._tempIf) {
    return findPrevIfNode(prevNode)
  } else if (prevNode.if) {
    return prevNode
  } else {
    return null
  }
}

function processFor (vnode) {
  if (vnode.for) {
    vnode.for.__exps = parseExp(vnode.for.exp)

    delete vnode.for.raw
    delete vnode.for.exp
  }
}

function processAttrsMap (vnode, config) {
  processDirectives(vnode, config)

  if (vnode.attrsList && vnode.attrsList.length) {
    // 后序遍历，主要为了做剔除的操作
    for (let i = vnode.attrsList.length - 1; i >= 0; i--) {
      const attr = vnode.attrsList[i]
      if (attr.name === 'class') {
        processClass(attr)
      } else if (attr.name === 'style') {
        processStyle(attr)
      } else if (config.event.parseEvent(attr.name)) { // 原本的事件代理直接剔除，主要是基础模版的事件直接走代理形式，事件绑定名直接写死的，优化 astJson 体积
        vnode.attrsList.splice(i, 1)
      } else {
        const exps = getAttrExps(attr)
        if (exps) {
          attr.__exps = exps
        }
      }

      if (attr.__exps) {
        delete attr.value
      }
    }
  } else {
    // 如果长度为空，ast 产出物可以不输出
    delete vnode.attrsList
  }

  delete vnode.attrsMap
}

function processClass (attr) {
  const { staticClassExp = '', dynamicClassExp = '' } = attr
  if (staticClassExp || dynamicClassExp) {
    attr.__exps = [parseExp(staticClassExp), parseExp(dynamicClassExp)]

    delete attr.staticClassExp
    delete attr.dynamicClassExp
  } else {
    const exps = getAttrExps(attr)
    if (exps) {
      attr.__exps = [exps]
    }
  }
}

function processStyle (attr) {
  const { staticStyleExp = '', dynamicStyleExp = '' } = attr
  if (staticStyleExp || dynamicStyleExp) {
    attr.__exps = [parseExp(staticStyleExp), parseExp(dynamicStyleExp)]

    delete attr.staticStyleExp
    delete attr.dynamicStyleExp
  } else {
    const exps = getAttrExps(attr)
    if (exps) {
      attr.__exps = [exps]
    }
  }
}

function getAttrExps (attr) {
  // 属性为单值的写法 <scroll-view enhenced></scroll-view>
  // 默认置为 true
  if (attr.value == null) {
    attr.value = '{{ true }}'
  }
  const parsed = parseMustache(attr.value)
  if (parsed.hasBinding && !attr.__exps) {
    return parseExp(parsed.result)
  }
}

function processText (vnode) {
  // text 节点
  if (vnode.type === 3) {
    // todo 全局 defs 静态数的处理? -> 目前已经都支持了
    const parsed = parseMustache(vnode.text)
    if (parsed.hasBinding) {
      vnode.__exps = parseExp(parsed.result)
      delete vnode.text
    }

    delete vnode.exps
  }
}

function processDirectives (vnode, config) {
  const directives = Object.values(config.directive)
  if (vnode.attrsMap) {
    Object.keys(vnode.attrsMap).forEach(item => {
      if (directives.includes(item)) {
        getAndRemoveAttr(vnode, item)
      }
    })
  }
}

function processChildren (vnode, config) {
  if (vnode.children && vnode.children.length) {
    vnode.children.forEach(item => {
      simplifyTemplate(item, config)
    })
  } else {
    delete vnode.children
  }
}

function postProcessIf (vnode) {
  // 删除遍历过程中 if 替换的临时节点以及明确不会被渲染出来的 if 节点（即 {{ false }}）
  const children = vnode.children
  if (children && children.length) {
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i]._tempIf || children[i]._if === false) {
        children.splice(i, 1)
      }
    }
  }
}

function deleteUselessAttrs (vnode) {
  const uselessAttrs = ['parent', 'exps', 'unary']
  uselessAttrs.forEach(function (attr) {
    delete vnode[attr]
  })
}

function processWxs (vnode) {
  if (vnode.tag === 'wxs') {
    const tempNode = createASTElement('block', [])
    replaceNode(vnode, tempNode)
    return tempNode
  }
  return null
}

function simplifyTemplate (vnode, config) {
  if (!vnode) {
    return
  }

  const replacedBlockNode = processWxs(vnode)
  if (replacedBlockNode) vnode = replacedBlockNode
  processIf(vnode, config)
  processFor(vnode)
  processAttrsMap(vnode, config)
  processText(vnode)
  processChildren(vnode, config)
  postProcessIf(vnode)

  deleteUselessAttrs(vnode)

  if (vnode.tag === 'temp-node') {
    vnode.tag = 'block'
  }
}

module.exports = function (vnode, mode) {
  const _vnode = Object.assign({}, vnode)
  const config = allConfigs[mode]
  simplifyTemplate(_vnode, config)

  return _vnode
}