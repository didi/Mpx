import { BEFORECREATE, MOUNTED, BEFOREUNMOUNT } from '../../core/innerLifecycle'
import { isArray } from '@mpxjs/utils'

const relationTypeMap = {
  parent: 'child',
  ancestor: 'descendant'
}

const isChildNode = (target, instance) => {
  let children = target.props.children
  if (!children) return
  if (!isArray(children)) {
    children = [children]
  }
  return children.some((item = {}) => {
    if (item.type?.__mpxBuiltIn) { // 如果是基础节点，继续向下查找
      return isChildNode(item, instance)
    } else {
      return item.type === instance.__getReactFunctionComponent()
    }
  })
}

export default function relationsMixin (mixinType) {
  if (mixinType === 'component') {
    return {
      [BEFORECREATE] () {
        this.__mpxRelations = {}
        this.__mpxRelationNodesMap = {}
      },
      [MOUNTED] () {
        this.__mpxCollectRelations()
        this.__mpxExecRelations('linked')
      },
      [BEFOREUNMOUNT] () {
        this.__mpxExecRelations('unlinked')
        this.__mpxRelations = {}
        this.__mpxRelationNodesMap = {}
      },
      methods: {
        getRelationNodes (path) {
          return this.__mpxRelationNodesMap(path) || null
        },
        __mpxCollectRelations () {
          const relations = this.__mpxProxy.options.relations
          if (!relations) return
          Object.keys(relations).forEach(path => {
            const relation = relations[path]
            this.__mpxCheckParent(this, relation, path)
          })
        },
        __mpxCheckParent (current, relation, path) {
          const type = relation.type
          const target = current.__getRelation()
          if (!target) return

          // parent 只需要处理一层，ancestor 需要考虑多个层级
          if ((type === 'parent' && isChildNode(target, this)) || type === 'ancestor') {
            const targetRelation = target.__mpxProxy.options.relations?.[this.__componentPath]
            if (targetRelation && targetRelation.type === relationTypeMap[type] && target.__componentPath === path) {
              this.__mpxRelations[path] = {
                target,
                targetRelation,
                relation
              }
              this.__mpxRelationNodesMap[path] = [target]
            } else if (type === 'ancestor') {
              this.__mpxCheckParent(target, relation, path)
            }
          }
        },
        __mpxExecRelations (type) {
          Object.keys(this.__mpxRelations).forEach(path => {
            const { target, targetRelation, relation } = this.__mpxRelations[path]
            const currentPath = this.__componentPath
            if (type === 'linked') {
              this.__mpxLinkRelationNodes(target, currentPath)
            } else if (type === 'unlinked') {
              this.__mpxRemoveRelationNodes(target, currentPath)
            }
            if (typeof targetRelation[type] === 'function') {
              targetRelation[type].call(target, this)
            }
            if (typeof relation[type] === 'function') {
              relation[type].call(this, target)
            }
          })
        },
        __mpxLinkRelationNodes (target, path) {
          target.__mpxRelationNodesMap[path] = target.__mpxRelationNodesMap[path] || [] // 父级绑定子级
          target.__mpxRelationNodesMap[path].push(this)
        },
        __mpxRemoveRelationNodes (target, path) {
          const arr = target.__mpxRelationNodesMap[path] || []
          const index = arr.indexOf(this)
          if (index !== -1) arr.splice(index, 1)
        }
      }
    }
  }
}
