/**
 * ✔ enable
 */
import { ReactNode, createElement, Fragment } from 'react'
import Portal from './mpx-portal'
import { warn } from '@mpxjs/utils'
interface RootPortalProps {
  enable?: boolean
  children: ReactNode
  [x: string]: any
}

const _RootPortal = (props: RootPortalProps) => {
  const { children, enable = true } = props
  if (props.style) {
    warn('The root-portal component does not support the style prop.')
  }
  return enable
    ? createElement(Portal, null, children)
    : createElement(Fragment, null, children)
}

_RootPortal.displayName = 'MpxRootPortal'

export default _RootPortal
