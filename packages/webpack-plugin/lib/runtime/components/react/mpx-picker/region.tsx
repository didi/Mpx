import { View, TouchableWithoutFeedback } from 'react-native'
import { Picker } from '@ant-design/react-native'
import { regionData } from './regionData'
import React, { forwardRef, useState, useRef } from 'react'
import useNodesRef, { HandlerRef } from '../useNodesRef' // 引入辅助函数
import { RegionProps, RegionObj, PickerData, LayoutType } from './type'

function formateRegionData(clObj: RegionObj[] = [], customItem?: string, depth = 2): PickerData[] {
  const l = depth
  const obj: PickerData[] = []
  if (customItem) {
    const objClone: PickerData = {
      value: customItem,
      label: customItem,
      children: []
    }
    const panding = { ...objClone }
    let loop = panding
    while (depth-- > 0) {
      loop.children = [{ ...objClone }]
      loop = loop.children[0] as PickerData
    }
    obj.push(panding)
  }
  for (let i = 0; i < clObj.length; i++) {
    const region: PickerData = {
      value: clObj[i].value,
      label: clObj[i].value,
    }
    if (clObj[i].children) {
      region.children = formateRegionData(clObj[i].children, customItem, l - 1)
    }
    obj.push(region)
  }
  return obj
}



const _RegionPicker = forwardRef<HandlerRef<View, RegionProps>, RegionProps>((props: RegionProps, ref): React.JSX.Element => {
  const { children, value, bindchange, bindcancel, disabled } = props
  let formatRegionData = formateRegionData(regionData, props['custom-item'])

  const [regionvalue, setRegionValue] = useState(value)
  // 存储layout布局信息
  const layoutRef = useRef({})
  const { nodeRef: viewRef } = useNodesRef<View, RegionProps>(props, ref, {
  })

  const onChange = (value: string[]): void => {
    // 通过 value 查找 code
    let tmp: RegionObj[] = regionData
    const postcode: (string | undefined)[] = []
    const code = value.map((item) => {
      for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].value === item) {
          const code = tmp[i].code
          postcode.push(tmp[i].postcode)
          tmp = tmp[i].children || []
          return code
        }
      }
    }).filter(code => !!code)
    const detail: Record<string, any> = { value, code }
    if (postcode[2]) detail.postcode = postcode[2]
    setRegionValue(value)
    bindchange && bindchange({
      detail
    })
  }

  const onElementLayout = (layout: LayoutType) => {
    viewRef.current?.measure((x: number, y: number, width: number, height: number, offsetLeft: number, offsetTop: number) => {
      layoutRef.current = { x, y, width, height, offsetLeft, offsetTop }
      props.getInnerLayout && props.getInnerLayout(layoutRef)
    })
  }
  
  const regionProps = {
    data: formatRegionData,
    value: regionvalue,
    onChange,
    disabled,
    onDismiss: bindcancel && bindcancel
  }

  const touchProps = {
    onLayout: onElementLayout,
    ref: viewRef
  }

  return (
    // @ts-ignore
    <Picker {...regionProps}>
      <TouchableWithoutFeedback>
        <View {...touchProps}>{children}</View>
      </TouchableWithoutFeedback>
    </Picker>
  )

})

_RegionPicker.displayName === 'mpx-picker-region'
export default _RegionPicker