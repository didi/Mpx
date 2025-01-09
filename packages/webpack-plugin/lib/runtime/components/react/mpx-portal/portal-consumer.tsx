import { useEffect, useRef, ReactNode } from 'react'
import { PortalContextValue } from '../context'
import { getFocusedNavigation } from '@mpxjs/utils'

export type PortalConsumerProps = {
  manager: PortalContextValue
  children?: ReactNode
}
const PortalConsumer = ({ manager, children } :PortalConsumerProps): JSX.Element | null => {
  const keyRef = useRef<any>(null)
  useEffect(() => {
    const navigation = getFocusedNavigation()
    const curPageId = navigation?.pageId
    manager.update(keyRef.current, children, curPageId)
  }, [children])
  useEffect(() => {
    if (!manager) {
      throw new Error(
        'Looks like you forgot to wrap your root component with `Provider` component from `@mpxjs/webpack-plugin/lib/runtime/components/react/dist/mpx-portal`.\n\n'
      )
    }
    const navigation = getFocusedNavigation()
    const curPageId = navigation?.pageId
    keyRef.current = manager.mount(children, undefined, curPageId)
    return () => {
      manager.unmount(keyRef.current)
    }
  }, [])
  return null
}

export default PortalConsumer
