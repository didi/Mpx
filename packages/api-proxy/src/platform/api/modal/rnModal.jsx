import { View, Dimensions, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { successHandle, failHandle } from '../../../common/js'
import { Portal } from '@ant-design/react-native'
const { width, height } = Dimensions.get('window')
const showModal = function (options = {}) {
  const {
    title,
    content,
    showCancel = true,
    cancelText = '取消',
    cancelColor = '#000000',
    confirmText = '确定',
    confirmColor = '#576B95',
    editable = false,
    placeholderText,
    success,
    fail,
    complete
  } = options
  const modalWidth = width - 60
  const styles = StyleSheet.create({
    modalTask: {
      width,
      height,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      position: 'absolute'
    },
    modalContent: {
      paddingTop: 20,
      width: modalWidth,
      backgroundColor: '#ffffff',
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalTitleText: {
      fontSize: 18,
      fontWeight: 'bold',
      paddingLeft: 20,
      paddingRight: 20
    },
    contentBox: {
      maxHeight: height * 0.45,
      marginTop: 10
    },
    modalContentText: {
      fontSize: 16,
      lineHeight: 26,
      color: '#808080',
      paddingLeft: 20,
      paddingRight: 20
    },
    modalBtnBox: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(0,0,0,0.2)',
      borderStyle: 'solid',
      marginTop: 25,
      width: '100%',
      display: 'flex',
      flexDirection: 'row'
    },
    modalBtn: {
      flex: 1,
      textAlign: 'center',
      paddingTop: 10,
      paddingBottom: 10,
    },
    modalButton: {
      width: '100%',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    cancelStyle: {
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: 'rgba(0,0,0,0.2)',
      borderStyle: 'solid',
    }
  })
  let modalKey
  let ModalView
  let modalTitle = []
  let modalContent = []
  let modalButton = [{
    text: confirmText,
    confirmColor,
    type: 'confirm',
    color: 'rgb(87, 107, 149)'
  }]
  const closeModal = function (buttonInfo) {
    Portal.remove(modalKey)
    modalKey = null
    const result = {
      errMsg: 'showModal:ok'
    }
    if (buttonInfo.type === 'confirm') {
      Object.assign(result, {
        confirm: true,
        cancel: false,
        content: null
      })
    } else {
      Object.assign(result, {
        confirm: false,
        cancel: true
      })
    }
    successHandle(result, success, complete)
  }
  if (title) {
    modalTitle.push(title)
  }
  if (!editable && content) {
    modalContent.push(content)
  }
  if (showCancel) {
    modalButton.unshift({
      text: cancelText,
      cancelColor,
      type: 'cancel',
      style: styles.cancelStyle,
      color: '#000000'
    })
  }
  if (!editable) {
    ModalView = <View style={styles.modalTask}>
      <View style={styles.modalContent}>
        {modalTitle.map((item, index) => <View key={index}><Text style={styles.modalTitleText}>{item}</Text></View>)}
        {modalContent.map((item, index) => <ScrollView key={index} style={styles.contentBox}><Text style={styles.modalContentText}>{item}</Text></ScrollView>)}
        <View style={styles.modalBtnBox}>
          {modalButton.map((item, index) => <TouchableOpacity key={index} style={[ styles.modalBtn, item.style ]} onPress={() => closeModal(item)}><Text style={[styles.modalButton, { color: item.color }]}>{item.text}</Text></TouchableOpacity>)}
        </View>
      </View>
    </View>
  }
  try {
    modalKey = Portal.add(ModalView)
  } catch (e) {
    const result = {
      errMsg: `showModal:fail invalid ${e}`
    }
    failHandle(result, fail, complete)
  }
}

export {
  showModal
}
