import { View, Text, Modal, TouchableWithoutFeedback } from 'react-native'
import Portal from '../mpx-portal'
import { PickerView } from '@ant-design/react-native'
import React, { forwardRef, useState, useRef, useEffect } from 'react'
import useNodesRef, { HandlerRef } from '../useNodesRef' // 引入辅助函数
import { TimeProps } from './type'

// 可见应用窗口的大小。
// const { height: dHeight, width: dWidth } = Dimensions.get('window');
//  modal属性: {"height": 298.33331298828125, "offsetLeft": 0, "offsetTop": 513.6666870117188, "width": 375, "x": 0, "y": 513.6666870117188}
// const { height: sHeight, width: sWidth } = Dimensions.get('screen');
// 设备屏幕的大小。 screen
const styles: { [key: string]: Object } = {
  showModal: {
    backgroundColor: 'black',
    opacity: 0.5,
    width: '100%',
    height: '100%'
  },
  hideModal: {
    opacity: 1,
    height: 0
  },
  modal: {
    backgroundColor: 'black',
    opacity: 0.5
  },
  centeredView: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    overflow: 'scroll'
  },
  btnLine: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: 20,
    borderBottomWidth: 1,
    backgroundColor: 'white',
    paddingLeft: 40,
    paddingRight: 40
  },
  cancel: {
    height: 50,
    display: 'flex',
    justifyContent: 'center'
  },
  ok: {
    height: 50,
    display: 'flex',
    justifyContent: 'center'
  },
  btntext: {
    color: '#0ae',
    fontSize: 18
  }
}

function formatStrToInt (timestr: string) {
  const [start, end] = timestr.split(':')
  return [parseInt(start), parseInt(end)]
}
// [9, 59] to 09:59
function formatStr (arr: any[]) {
  let [hour, minute] = arr
  if (hour < 10) {
    hour = '0' + hour
  }
  if (minute < 10) {
    minute = '0' + minute
  }
  return hour + ':' + minute
}

function generateMinute () {
  const arrMinute: any[] = []
  for (let i = 0; i <= 59; i++) {
    const obj = {
      label: toSingleStr(i),
      value: i,
      children: []
    }
    arrMinute.push(obj)
  }
  return arrMinute
}
function generateColumns (): any[] {
  const pickData: any[] = []
  for (let i = 0; i <= 23; i++) {
    const obj = {
      label: toSingleStr(i),
      value: i,
      children: generateMinute()
    }
    pickData.push(obj)
  }

  return pickData
}

function toSingleStr (str: number) {
  return str < 10 ? '0' + str : str
}

function toStr (time: string): string {
  const [hour, minute]: any = formatStrToInt(time)
  const newHour = toSingleStr(hour)
  const newMinute = toSingleStr(minute)
  return '' + newHour + newMinute
}

function checkSelectedIsValid (strStart: string, strEnd: string, selected: number[]): boolean {
  const strSel = '' + toSingleStr(selected[0]) + toSingleStr(selected[1])
  if (strSel < strStart || strSel > strEnd) return false
  return true
}
/**
 * [{label:'', value: '', key: '', children: []}]
  label: string | ReactNode
  value: string | number
  key?: string | number
  children?: PickerColumnItem[]
*/
// start="02:10" end = 23:01

const _TimePicker = forwardRef<HandlerRef<View, TimeProps>, TimeProps>((props: TimeProps, ref): React.JSX.Element => {
  const { children, start, end, value, bindchange, bindcancel, style } = props
  const defaultProps = {
    start: '00:10',
    end: '23:59'
  }
  const defaultValue = formatStrToInt(value)
  const [timevalue, setTimeValue] = useState(defaultValue)
  // 存储layout布局信息
  const layoutRef = useRef({})
  const viewRef = useRef<View>(null)
  const nodeRef = useRef<View>(null)
  useNodesRef<View, TimeProps>(props, ref, nodeRef, { style })
  // 存储modal的布局信息
  const modalLayoutRef = useRef({})
  const modalRef = useRef<View>(null)
  const [visible, setVisible] = useState(false)
  const columnData = generateColumns()
  const [data, setData] = useState(columnData)
  const [offsetTop, setOffsetTop] = useState(0)
  const strStart = toStr(start)
  const strEnd = toStr(end)

  useEffect(() => {
    const newColumnData = generateColumns()
    setData(newColumnData)
  }, [start, end])

  useEffect(() => {
    if (value) {
      const nValue = formatStrToInt(value)
      nValue && setTimeValue(nValue)
    }
  }, [value])

  // console.log('---------------visible---', visible, JSON.stringify(columnData))
  const handleModalStatus = (status: boolean) => {
    setVisible(status)
  }
  const handleConfirm = () => {
    handleModalStatus(false)
    bindchange && bindchange({
      detail: {
        value: formatStr(timevalue)
      }
    })
  }

  const handleCancel = () => {
    handleModalStatus(false)
    bindcancel && bindcancel()
  }

  const handleChildClick = () => {
    handleModalStatus(true)
  }

  const handlePickChange = (date: number[]): void => {
    // 不是有效的值
    if (!checkSelectedIsValid(strStart, strEnd, date)) {
      setTimeValue(timevalue)
    } else {
      // [9, 13]
      setTimeValue(date)
    }
  }

  const onElementLayout = () => {
    viewRef.current?.measure((x: number, y: number, width: number, height: number, offsetLeft: number, offsetTop: number) => {
      layoutRef.current = { x, y, width, height, offsetLeft, offsetTop }
      props.getInnerLayout && props.getInnerLayout(layoutRef)
    })
  }

  const onModalLayout = () => {
    modalRef.current?.measure((x: number, y: number, width: number, height: number, offsetLeft: number, offsetTop: number) => {
      modalLayoutRef.current = { x, y, width, height, offsetLeft, offsetTop }
      setOffsetTop(offsetTop)
    })
  }

  const renderModalChildren = () => {
    const pickerProps = {
      ref: nodeRef,
      data,
      value: timevalue,
      defaultValue: timevalue,
      cols: 2,
      onChange: handlePickChange
    }
    return (
      <View style={styles.centeredView} ref={modalRef} onLayout={onModalLayout}>
        <View style={styles.btnLine}>
          <View style={styles.cancel}>
            <TouchableWithoutFeedback onPress={handleCancel}>
              <Text style={styles.btntext}>取消</Text>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.ok}>
            <TouchableWithoutFeedback onPress={handleConfirm}>
              <Text style={styles.btntext}>确定</Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <PickerView {...pickerProps}></PickerView>
      </View>
    )
  }

  const renderChildren = () => {
    const touchProps = {
      onLayout: onElementLayout,
      ref: viewRef
    }
    return <View>
      <TouchableWithoutFeedback onPress={handleChildClick}>
        <View {...touchProps}>{children}</View>
      </TouchableWithoutFeedback>
    </View>
  }

  // Animated.View
  return (<>
    <Portal>
      <View style={visible ? styles.showModal : styles.hideModal}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
      >
        {renderModalChildren()}
      </Modal>
    </View>
    </Portal>
    {renderChildren()}
  </>)
})

_TimePicker.displayName = 'mpx-picker-time'

export default _TimePicker
