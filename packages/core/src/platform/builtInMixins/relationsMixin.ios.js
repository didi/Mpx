import { BEFORECREATE, MOUNTED, BEFOREUNMOUNT } from '../../core/innerLifecycle'

const relationTypeMap = {
  parent: 'child',
  ancestor: 'descendant'
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
          return this.__mpxRelationNodesMap[path] || null
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
          const relationMap = current.__relation
          if (!relationMap) return

          if (relationMap[path]) {
            const target = relationMap[path]
            const targetRelation = target.__mpxProxy.options.relations?.[this.__componentPath]
            if (targetRelation && targetRelation.type === relationTypeMap[type] && target.__componentPath) {
              this.__mpxRelations[path] = {
                target,
                targetRelation,
                relation
              }
              this.__mpxRelationNodesMap[path] = [target]
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
