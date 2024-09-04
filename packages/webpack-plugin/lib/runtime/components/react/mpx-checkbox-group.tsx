/**
 * ✔ bindchange
 */
import {
  JSX,
  useRef,
  forwardRef,
  ReactNode,
  useContext
} from 'react'
import {
  View,
  NativeSyntheticEvent,
  StyleProp,
  ViewStyle,
  StyleSheet
} from 'react-native'
import { FormContext, FormFieldValue, CheckboxGroupContext, GroupValue } from './context'
import useInnerProps, { getCustomEvent } from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef'
import { recordPerformance } from './performance'

export interface CheckboxGroupProps {
  name: string
  style?: StyleProp<ViewStyle>
  'enable-offset'?: boolean
  children: ReactNode
  bindchange?: (evt: NativeSyntheticEvent<TouchEvent> | unknown) => void
}

const CheckboxGroup = forwardRef<
  HandlerRef<View, CheckboxGroupProps>,
  CheckboxGroupProps
>((props, ref): JSX.Element => {
  const startTime = new Date().getTime()

  const {
    style = [],
    'enable-offset': enableOffset,
    children,
    bindchange
  } = props

  const layoutRef = useRef({})
  const formContext = useContext(FormContext)

  let formValuesMap: Map<string, FormFieldValue> | undefined;

  if (formContext) {
    formValuesMap = formContext.formValuesMap
  }

  const groupValue: GroupValue = useRef({}).current

  const defaultStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    ...StyleSheet.flatten(style)
  }
  const { nodeRef } = useNodesRef(props, ref, {
    defaultStyle
  })

  const onLayout = () => {
    nodeRef.current?.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        offsetLeft: number,
        offsetTop: number
      ) => {
        layoutRef.current = { x, y, width, height, offsetLeft, offsetTop }
      }
    )
  }

  const getSelectionValue = (): string[] => {
    const arr: string[] = []
    for (let key in groupValue) {
      if (groupValue[key].checked) {
        arr.push(key)
      }
    }
    return arr
  }

  const getValue = () => {
    return getSelectionValue()
  }

  const resetValue = () => {
    Object.keys(groupValue).forEach((key) => {
        groupValue[key].checked = false
        groupValue[key].setValue(false)
      })
  }

  if (formValuesMap) {
    if (!props.name) {
      console.warn('[Mpx runtime warn]: If a form component is used, the name attribute is required.')
    } else {
      formValuesMap.set(props.name, { getValue, resetValue })
    }
  }

  const notifyChange = (
    evt: NativeSyntheticEvent<TouchEvent>
  ) => {
    bindchange &&
      bindchange(
        getCustomEvent(
          'tap',
          evt,
          {
            layoutRef,
            detail: {
              value: getSelectionValue()
            }
          },
          props
        )
      )
  }

  const innerProps = useInnerProps(
    props,
    {
      ref: nodeRef,
      style: defaultStyle,
      ...(enableOffset ? { onLayout } : {})
    },
    ['enable-offset'],
    {
      layoutRef
    }
  )

  const content = (
    <View {...innerProps}>
      <CheckboxGroupContext.Provider value={{ groupValue, notifyChange }}>
        {children}
      </CheckboxGroupContext.Provider>
    </View>
  )

  recordPerformance(startTime, 'mpx-checkbox-group')
  
  return content
})

CheckboxGroup.displayName = 'mpx-checkbox-group'

export default CheckboxGroup