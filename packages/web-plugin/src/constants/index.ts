import { normalize } from '@mpxjs/compile-utils'

export const RESOLVE_IGNORED_ERR = new Error('Resolve ignored!')
export const MPX_APP_MODULE_ID = 'mpx-app-scope' // app文件moduleId

export const OPTION_PROCESSOR_PATH = normalize.runtime('option-processor')
export const TAB_BAR_PATH = normalize.runtime('components/web/mpx-tab-bar.vue')
export const TAB_BAR_CONTAINER_PATH = normalize.runtime(
  'components/web/mpx-tab-bar-container.vue'
)
