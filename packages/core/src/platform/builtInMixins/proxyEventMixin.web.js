import { setByPath, error, parseDataset } from '@mpxjs/utils'
import Mpx from '../../index'

export default function proxyEventMixin () {
  return {
    beforeCreate () {
      const modelEvent = this.$attrs.mpxModelEvent
      if (modelEvent) {
        this.$on(modelEvent, (e) => {
          this.$emit('mpxModel', e)
        })
      }
    },
    methods: {
      __model (expr, $event, valuePath = ['value'], filterMethod) {
        const innerFilter = {
          trim: val => typeof val === 'string' && val.trim()
        }
        const originValue = valuePath.reduce((acc, cur) => acc[cur], $event.detail)
        const value = filterMethod ? (innerFilter[filterMethod] ? innerFilter[filterMethod](originValue) : typeof this[filterMethod] === 'function' && this[filterMethod]) : originValue
        setByPath(this, expr, value)
      },
      __invoke (rawEvent, eventConfig = []) {
        if (typeof Mpx.config.proxyEventHandler === 'function') {
          try {
            Mpx.config.proxyEventHandler(rawEvent)
          } catch (e) {}
        }
        const location = this.__mpxProxy.options.mpxFileResource

        if (rawEvent.target && !rawEvent.target._datasetProcessed) {
          const originalDataset = rawEvent.target.dataset
          Object.defineProperty(rawEvent.target, 'dataset', {
            get: () => parseDataset(originalDataset),
            configurable: true,
            enumerable: true
          })
          rawEvent.target._datasetProcessed = true
        }
        if (rawEvent.currentTarget && !rawEvent.currentTarget._datasetProcessed) {
          const originalDataset = rawEvent.currentTarget.dataset
          Object.defineProperty(rawEvent.currentTarget, 'dataset', {
            get: () => parseDataset(originalDataset),
            configurable: true,
            enumerable: true
          })
          rawEvent.currentTarget._datasetProcessed = true
        }

        let returnedValue
        eventConfig.forEach((item) => {
          const callbackName = item[0]
          if (callbackName) {
            const params =
              item.length > 1
                ? item.slice(1).map((item) => {
                    if (item === '__mpx_event__') {
                      return rawEvent
                    } else {
                      return item
                    }
                  })
                : [rawEvent]
            if (typeof this[callbackName] === 'function') {
              returnedValue = this[callbackName].apply(this, params)
            } else {
              error(
                `Instance property [${callbackName}] is not function, please check.`,
                location
              )
            }
          }
        })
        return returnedValue
      }
    }
  }
}
