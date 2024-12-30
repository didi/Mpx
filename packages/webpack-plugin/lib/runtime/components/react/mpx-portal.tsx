import { ReactNode } from 'react'
import { PortalContext, PortalContextValue } from './context'
import PortalConsumer from './mpx-portal/portal-consumer'
import PortalHost, { portal } from './mpx-portal/portal-host'

export type PortalProps = {
  /**
   * Content of the `Portal`.
   */
  children?: ReactNode
  key?: string
  manager?: PortalContextValue
}

const Portal = ({ children }:PortalProps): JSX.Element => {
  return (
    <PortalContext.Consumer>
      {(manager) => (
        <PortalConsumer manager={manager}>{children}</PortalConsumer>
      )}
    </PortalContext.Consumer>
  )
}

Portal.Host = PortalHost
Portal.add = portal.add
Portal.remove = portal.remove

export default Portal
