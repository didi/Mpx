import { ReactNode, createContext, useMemo } from 'react'
import LocaleProvider, { LocaleContextProps } from './locale-provider'
import Portal from './mpx-portal'
import { extendObject } from './utils'

export type Theme = typeof defaultTheme & { [key: string]: any }

export interface ProviderProps {
  locale?: LocaleContextProps
  theme?: Partial<Theme>
  children: ReactNode
}
const defaultTheme = {
  color_text_base: '#000000', // 基本
  color_text_base_inverse: '#ffffff', // 基本 _ 反色
  color_text_secondary: '#a4a9b0', // 辅助色
  color_text_placeholder: '#bbbbbb', // 文本框提示
  color_text_disabled: '#bbbbbb', // 失效
  color_text_caption: '#888888', // 辅助描述
  color_text_paragraph: '#333333', // 段落
  color_error: '#ff4d4f', // 错误(form validate)
  color_warning: '#faad14', // 警告
  color_success: '#52c41a',
  color_primary: '#1677ff'
}
export const ThemeContext = createContext(defaultTheme)

export type PartialTheme = Partial<Theme>

export interface ThemeProviderProps {
  value?: PartialTheme
  children?: React.ReactNode
}

const ThemeProvider = (props: ThemeProviderProps) => {
  const { value, children } = props
  const theme = useMemo(() => (extendObject({}, defaultTheme, value)), [value])
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

const Provider = ({ locale, theme, children }:ProviderProps): JSX.Element => {
  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider value={theme}>
        <Portal.Host>{children}</Portal.Host>
      </ThemeProvider>
    </LocaleProvider>
  )
}

export default Provider
