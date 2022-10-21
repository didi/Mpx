import { error } from '../helper/log'

const BEHAVIORS_MAP = [
  'wx://form-field',
  'wx://form-field-group',
  'wx://form-field-button',
  'wx://component-export'
]

export default {
  convert (options) {
    if (options.behaviors) {
      options.behaviors.forEach((behavior, idx) => {
        if (typeof behavior === 'string' && BEHAVIORS_MAP.includes(behavior)) {
          error(`Built-in behavior "${behavior}" is not supported in tt environment!`, global.currentResource)
          options.behaviors.splice(idx, 1)
        }
      })
    }
  }
}
