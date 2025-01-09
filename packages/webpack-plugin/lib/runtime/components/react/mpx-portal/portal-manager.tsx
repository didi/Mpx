import { useState, useCallback, forwardRef, ForwardedRef, useImperativeHandle, ReactNode, ReactElement } from 'react'
import { View, StyleSheet } from 'react-native'

export type State = {
  portals: Array<{
    key: number
    children: ReactNode
  }>
}

type PortalManagerProps = {
}

const _PortalManager = forwardRef((props: PortalManagerProps, ref:ForwardedRef<unknown>): ReactElement => {
  const [state, setState] = useState<State>({
    portals: []
  })

  const mount = useCallback((key: number, children: ReactNode) => {
    setState((prevState) => ({
      portals: [...prevState.portals, { key, children }]
    }))
  }, [state])

  const update = useCallback((key: number, children: ReactNode) => {
    setState((prevState) => ({
      portals: prevState.portals.map((item) => {
        if (item.key === key) {
          return { ...item, children }
        }
        return item
      })
    }))
  }, [state])

  const unmount = useCallback((key: number) => {
    setState((prevState) => ({
      portals: prevState.portals.filter((item) => item.key !== key)
    }))
  }, [])

  useImperativeHandle(ref, () => ({
    mount,
    update,
    unmount,
    portals: state.portals
  }))

  return (
    <>
      {state.portals.map(({ key, children }, i) => (
        <View
          key={key}
          collapsable={false} // Need collapsable=false here to clip the elevations
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, { zIndex: 1000 + i }]}>
          {children}
        </View>
      ))}
    </>
  )
})

export default _PortalManager
