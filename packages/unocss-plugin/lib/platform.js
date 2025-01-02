// todo 此处进行跨端preflights定义，保障跨端样式表现一致，待补充完善
// todo 目前不支持声明web preflight，待完善
export default {
  ali: [
    {
      getCSS: () => `
          button {
            height: initial;
            border-radius: 5px;
            box-sizing: border-box;
            cursor: pointer;
          }
        `
    }
  ]
}
