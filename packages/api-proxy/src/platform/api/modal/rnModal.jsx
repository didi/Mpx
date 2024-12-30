import { View, Dimensions, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { successHandle, failHandle } from '../../../common/js'
import Portal from '@mpxjs/webpack-plugin/lib/runtime/components/react/dist/mpx-portal'
const { width, height } = Dimensions.get('window')
const showModal = function (options = {}) {
  const {
    title,
    content,
    showCancel = true,
    cancelText = '取消',
    cancelColor = '#000000',
    confirmText = '确定',
    editable = false,
    placeholderText = '',
    confirmColor = '#576B95',
    success,
    fail,
    complete
  } = options
  const modalWidth = width * 0.8
  const styles = StyleSheet.create({
    modalTask: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
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
      paddingRight: 20,
      textAlign: 'center'
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
      paddingTop: width * 0.04,
      paddingBottom: width * 0.04,
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
  let editableContent = []
  let modalButton = [{
    text: confirmText,
    type: 'confirm',
    color: confirmColor
  }]
  let contentText = content
  const onChangeText = function (text) {
    contentText = text
  }
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
        content: editable ? contentText : null
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
  if (editable) {
    editableContent.push(placeholderText)
  }
  if (showCancel) {
    modalButton.unshift({
      text: cancelText,
      type: 'cancel',
      style: styles.cancelStyle,
      color: cancelColor
    })
  }
  ModalView = <View style={styles.modalTask}>
    <View style={styles.modalContent}>
      {modalTitle.map((item, index) => <View key={index}><Text style={styles.modalTitleText}>{item}</Text></View>)}
      {modalContent.map((item, index) => <ScrollView key={index} style={styles.contentBox}><Text style={styles.modalContentText}>{item}</Text></ScrollView>)}
      {editableContent.map((item, index) => <View key={index} style={{
        width: '100%',
        paddingLeft: 25,
        paddingRight: 25,
        marginTop: 5
      }}><TextInput placeholder={item} style={{
        height: 40,
        backgroundColor: '#eeeeee',
        width: '100%',
        keyboardType: 'default',
        paddingLeft: 10,
        paddingRight: 10
      }} onChangeText={text => onChangeText(text)} defaultValue={content}></TextInput></View>)}
      <View style={styles.modalBtnBox}>
        {modalButton.map((item, index) => <TouchableOpacity key={index} style={[ styles.modalBtn, item.style ]} onPress={() => closeModal(item)}><Text style={[styles.modalButton, { color: item.color }]}>{item.text}</Text></TouchableOpacity>)}
      </View>
    </View>
  </View>
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
