import { createContext, useMemo, memo, ReactNode } from 'react'
import { extendObject } from './utils'

interface Locale {
  /** zh_CN */
  locale: string
  DatePicker: {
    /** 确定 */
    okText: string
    /** 取消 */
    dismissText: string
    /** 请选择 */
    extra: string
    DatePickerLocale: {
      /** 年 */
      year: string
      /** 月 */
      month: string
      /** 日 */
      day: string
      /** 时 */
      hour: string
      /** 分 */
      minute: string
      /** 上午 */
      am: string
      /** 下午 */
      pm: string
    }
  }
  DatePickerView: {
    /** 年 */
    year: string
    /** 月 */
    month: string
    /** 日 */
    day: string
    /** 时 */
    hour: string
    /** 分 */
    minute: string
    /** 上午 */
    am: string
    /** 下午 */
    pm: string
  }
  Picker: {
    /** 确定 */
    okText: string
    /** 取消 */
    dismissText: string
    /** 请选择 */
    extra: string
  }
}
export type LocaleContextProps = {
  antLocale: Partial<Locale & { exist: boolean }>
}
export interface LocaleProviderProps {
  children?: ReactNode,
  locale?: LocaleContextProps
}

export const LocaleContext = createContext<
  LocaleContextProps | undefined
>(undefined)

const LocaleProvider = (props :LocaleProviderProps): JSX.Element => {
  const locale = useMemo(() => {
    return {
      antLocale: extendObject({}, props.locale, { exist: true })
    }
  }, [props.locale])
  return (
    <LocaleContext.Provider value={locale}>
      {props.children}
    </LocaleContext.Provider>
  )
}

LocaleProvider.displayName = 'LocaleProvider'

export default memo(LocaleProvider)
