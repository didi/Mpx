import { useEffect, useRef, ReactNode } from 'react'
import {
  View,
  DeviceEventEmitter,
  EventSubscription,
  NativeEventEmitter,
  StyleSheet
} from 'react-native'
import PortalManager from './portal-manager'
import { getFocusedNavigation } from '@mpxjs/utils'
import { PortalManagerContextValue, PortalContext } from '../context'

export type PortalHostProps = {
  children: ReactNode
}

type addIdsMapsType = {
  [key: number]: number[]
}

export type Operation =
  | { type: 'mount'; key: number; children: ReactNode }
  | { type: 'update'; key: number; children: ReactNode }
  | { type: 'unmount'; key: number }

// events
const addType = 'MPX_RN_ADD_PORTAL'
const removeType = 'MPX_RN_REMOVE_PORTAL'
// fix react native web does not support DeviceEventEmitter
const TopViewEventEmitter = DeviceEventEmitter || new NativeEventEmitter()

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

class PortalGuard {
  private nextKey = 10000
  add = (e: ReactNode) => {
    const key = this.nextKey++
    TopViewEventEmitter.emit(addType, e, key)
    return key
  }

  remove = (key: number) => {
    TopViewEventEmitter.emit(removeType, key)
  }
}
/**
 * portal
 */
export const portal = new PortalGuard()

const PortalHost = ({ children } :PortalHostProps): JSX.Element => {
  const _nextKey = useRef(0)
  const _queue = useRef<Operation[]>([])
  const _addType = useRef<EventSubscription | null>(null)
  const _removeType = useRef<EventSubscription | null>(null)
  const manager = useRef<PortalManagerContextValue | null>(null)
  let currentPageId: number | undefined
  const _mount = (children: ReactNode, _key?: number, curPageId?: number) => {
    const navigation = getFocusedNavigation()
    const pageId = navigation?.pageId
    if (pageId !== (curPageId ?? currentPageId)) {
      return
    }
    const key = _key || _nextKey.current++
    if (manager.current) {
      manager.current.mount(key, children)
    } else {
      _queue.current.push({ type: 'mount', key, children })
    }
    return key
  }

  const _unmount = (key: number, curPageId?: number) => {
    const navigation = getFocusedNavigation()
    const pageId = navigation?.pageId
    if (pageId !== (curPageId ?? currentPageId)) {
      return
    }
    if (manager.current) {
      manager.current.unmount(key)
    } else {
      _queue.current.push({ type: 'unmount', key })
    }
  }

  const _update = (key: number, children: ReactNode, curPageId?: number) => {
    const navigation = getFocusedNavigation()
    const pageId = navigation?.pageId
    if (pageId !== (curPageId ?? currentPageId)) {
      return
    }
    if (manager.current) {
      manager.current.update(key, children)
    } else {
      const op: Operation = { type: 'mount', key, children }
      const index = _queue.current.findIndex(
        (o) => o.type === 'mount' || (o.type === 'update' && o.key === key)
      )

      if (index > -1) {
        _queue.current[index] = op
      } else {
        _queue.current.push(op)
      }
    }
  }

  useEffect(() => {
    const navigation = getFocusedNavigation()
    currentPageId = navigation?.pageId
    _addType.current = TopViewEventEmitter.addListener(addType, _mount)
    _removeType.current = TopViewEventEmitter.addListener(
      removeType,
      _unmount
    )
    return () => {
      while (_queue.current.length && manager.current) {
        const action = _queue.current.pop()
        if (!action) {
          continue
        }
        // tslint:disable-next-line:switch-default
        switch (action.type) {
          case 'mount':
            manager.current?.mount(action.key, action.children)
            break
          case 'update':
            manager.current?.update(action.key, action.children)
            break
          case 'unmount':
            manager.current?.unmount(action.key)
            break
        }
      }
    }
  }, [])
  return (
    <PortalContext.Provider
      value={{
        mount: _mount,
        update: _update,
        unmount: _unmount
      }}
      >
      {/* Need collapsable=false here to clip the elevations, otherwise they appear above Portal components */}
      <View style={styles.container} collapsable={false}>
        {children}
      </View>
      <PortalManager ref={manager} />
    </PortalContext.Provider>
  )
}

export default PortalHost
