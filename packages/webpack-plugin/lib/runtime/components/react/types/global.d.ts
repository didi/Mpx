declare let __mpx_mode__: 'wx' | 'ali' | 'swan' | 'qq' | 'tt' | 'web' | 'dd' | 'qa' | 'jd' | 'android' | 'ios'
declare module '@mpxjs/utils' {
  export function isEmptyObject (obj: Object): boolean
  export function isFunction (fn: unknown): boolean
  export function isNumber (num: unknown): boolean
  export function hasOwn (obj: Object, key: string): boolean
  export function noop (...arg: any): void
  export function diffAndCloneA<A, B> (a: A, b?: B): {
    clone: A
    diff: boolean
    diffData: Object | null
  }
  export function isObject (value): value is Object
  export function error (msg: string, location?: string, e?: any): void
  export function warn (msg: string, location?: string, e?: any): void
  export function collectDataset (props: Record<string, any>, needParse?: boolean): Record<string, any>
  export function getFocusedNavigation (): {
    insets: {
      top: number
      bottom: number
      left: number
      right: number
    },
    setOptions: (params: Record<string, any>) => void,
    addListener: (eventName: string, callback: (e: Event) => void) => void
    removeListener: (eventName: string, callback: (e: Event) => void) => void
    dispatch: (eventName: string) => void
    pageId: number
  } | undefined
}

declare let global: {
  __formatValue (value: string): string | number
} & Record<string, any>
