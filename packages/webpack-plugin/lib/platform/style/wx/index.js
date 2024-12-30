const { hump2dash } = require('../../../utils/hump-dash')

module.exports = function getSpec ({ warn, error }) {
  // React Native 双端都不支持的 CSS property
  const unsupportedPropExp = /^(white-space|text-overflow|animation|transition|font-variant-caps|font-variant-numeric|font-variant-east-asian|font-variant-alternates|font-variant-ligatures|background-position|caret-color)$/
  const unsupportedPropMode = {
    // React Native ios 不支持的 CSS property
    ios: /^(vertical-align)$/,
    // React Native android 不支持的 CSS property
    android: /^(text-decoration-style|text-decoration-color|shadow-offset|shadow-opacity|shadow-radius)$/
  }
  // var(xx)
  const cssVariableExp = /var\(/
  // calc(xx)
  const calcExp = /calc\(/
  const envExp = /env\(/
  // 不支持的属性提示
  const unsupportedPropError = ({ prop, value, selector }, { mode }, isError = true) => {
    const tips = isError ? error : warn
    tips(`Property [${prop}] on ${selector} is not supported in ${mode} environment!`)
  }
  // prop 校验
  const verifyProps = ({ prop, value, selector }, { mode }, isError = true) => {
    prop = prop.trim()
    if (unsupportedPropExp.test(prop) || unsupportedPropMode[mode].test(prop)) {
      unsupportedPropError({ prop, value, selector }, { mode }, isError)
      return false
    }
    return true
  }
  // 值类型
  const ValueType = {
    number: 'number',
    color: 'color',
    enum: 'enum'
  }
  // React 属性支持的枚举值
  const SUPPORTED_PROP_VAL_ARR = {
    'box-sizing': ['border-box'],
    'backface-visibility': ['visible', 'hidden'],
    overflow: ['visible', 'hidden', 'scroll'],
    'border-style': ['solid', 'dotted', 'dashed'],
    'object-fit': ['cover', 'contain', 'fill', 'scale-down'],
    direction: ['inherit', 'ltr', 'rtl'],
    display: ['flex', 'none'],
    'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
    'flex-wrap': ['wrap', 'nowrap', 'wrap-reverse'],
    'pointer-events': ['auto', 'box-none', 'box-only', 'none'],
    'vertical-align': ['auto', 'top', 'bottom', 'center'],
    position: ['relative', 'absolute'],
    'font-variant': ['small-caps', 'oldstyle-nums', 'lining-nums', 'tabular-nums', 'proportional-nums'],
    'text-align': ['left', 'right', 'center', 'justify'],
    'font-style': ['normal', 'italic'],
    'font-weight': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    'text-decoration-line': ['none', 'underline', 'line-through', 'underline line-through'],
    'text-decoration-style': ['solid', 'double', 'dotted', 'dashed'],
    'text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
    'user-select': ['auto', 'text', 'none', 'contain', 'all'],
    'align-content': ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'],
    'align-items': ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    'align-self': ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    'background-size': ['contain', 'cover', 'auto', ValueType.number],
    'background-position': ['left', 'right', 'top', 'bottom', 'center', ValueType.number],
    'background-repeat': ['no-repeat'],
    width: ['auto', ValueType.number],
    height: ['auto', ValueType.number],
    'flex-basis': ['auto', ValueType.number],
    margin: ['auto', ValueType.number],
    'margin-top': ['auto', ValueType.number],
    'margin-left': ['auto', ValueType.number],
    'margin-bottom': ['auto', ValueType.number],
    'margin-right': ['auto', ValueType.number],
    'margin-horizontal': ['auto', ValueType.number],
    'margin-vertical': ['auto', ValueType.number]
  }
  // 获取值类型
  const getValueType = (prop) => {
    const propValueTypeRules = [
      // 重要！！优先判断是不是枚举类型
      [ValueType.enum, new RegExp('^(' + Object.keys(SUPPORTED_PROP_VAL_ARR).join('|') + ')$')],
      [ValueType.number, /^((opacity|flex-grow|flex-shrink|gap|left|right|top|bottom)|(.+-(width|height|left|right|top|bottom|radius|spacing|size|gap|index|offset|opacity)))$/],
      [ValueType.color, /^(color|(.+-color))$/]
    ]
    for (const rule of propValueTypeRules) {
      if (rule[1].test(prop)) return rule[0]
    }
  }
  // 多value解析
  const parseValues = (str, char = ' ') => {
    let stack = 0
    let temp = ''
    const result = []
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '(') {
        stack++
      } else if (str[i] === ')') {
        stack--
      }
      // 非括号内 或者 非分隔字符且非空
      if (stack !== 0 || (str[i] !== char && str[i] !== ' ')) {
        temp += str[i]
      }
      if ((stack === 0 && str[i] === char) || i === str.length - 1) {
        result.push(temp)
        temp = ''
      }
    }
    return result
  }
  // const getDefaultValueFromVar = (str) => {
  //   const totalVarExp = /^var\((.+)\)$/
  //   if (!totalVarExp.test(str)) return str
  //   const newVal = parseValues((str.match(totalVarExp)?.[1] || ''), ',')
  //   if (newVal.length <= 1) return ''
  //   if (!totalVarExp.test(newVal[1])) return newVal[1]
  //   return getDefaultValueFromVar(newVal[1])
  // }
  // 属性值校验
  const verifyValues = ({ prop, value, selector }, isError = true) => {
    prop = prop.trim()
    value = value.trim()
    const tips = isError ? error : warn
    if (cssVariableExp.test(value) || calcExp.test(value) || envExp.test(value)) return true
    const namedColor = ['transparent', 'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen']
    const valueExp = {
      number: /^((-?(\d+(\.\d+)?|\.\d+))(rpx|px|%|vw|vh)?|hairlineWidth)$/,
      color: new RegExp(('^(' + namedColor.join('|') + ')$') + '|(^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$)|^(rgb|rgba|hsl|hsla|hwb)\\(.+\\)$')
    }
    const type = getValueType(prop)
    const tipsType = (type) => {
      const info = {
        [ValueType.number]: '2rpx,10%,30rpx',
        [ValueType.color]: 'rgb,rgba,hsl,hsla,hwb,named color,#000000',
        [ValueType.enum]: `${SUPPORTED_PROP_VAL_ARR[prop]?.join(',')}`
      }
      tips(`Value of ${prop} in ${selector} should be ${type}, eg ${info[type]}, received [${value}], please check again!`)
    }
    switch (type) {
      case ValueType.number: {
        if (!valueExp.number.test(value)) {
          tipsType(type)
          return false
        }
        return true
      }
      case ValueType.color: {
        if (!valueExp.color.test(value)) {
          tipsType(type)
          return false
        }
        return true
      }
      case ValueType.enum: {
        const isIn = SUPPORTED_PROP_VAL_ARR[prop].includes(value)
        const isType = Object.keys(valueExp).some(item => valueExp[item].test(value) && SUPPORTED_PROP_VAL_ARR[prop].includes(ValueType[item]))
        if (!isIn && !isType) {
          tipsType(type)
          return false
        }
        return true
      }
    }
    return true
  }
  // prop & value 校验：过滤的不合法的属性和属性值
  const verification = ({ prop, value, selector }, { mode }) => {
    return verifyProps({ prop, value, selector }, { mode }) && verifyValues({ prop, value, selector }) && ({ prop, value })
  }

  // 简写转换规则
  const AbbreviationMap = {
    // 仅支持 offset-x | offset-y | blur-radius | color 排序
    'text-shadow': ['textShadowOffset.width', 'textShadowOffset.height', 'textShadowRadius', 'textShadowColor'],
    // 仅支持 width | style | color 这种排序
    border: ['borderWidth', 'borderStyle', 'borderColor'],
    // 仅支持 width | style | color 这种排序
    'border-left': ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'],
    // 仅支持 width | style | color 这种排序
    'border-right': ['borderRightWidth', 'borderRightStyle', 'borderRightColor'],
    // 仅支持 width | style | color 这种排序
    'border-top': ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
    // 仅支持 width | style | color 这种排序
    'border-bottom': ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'],
    // 仅支持 offset-x | offset-y | blur-radius | color 排序
    'box-shadow': ['shadowOffset.width', 'shadowOffset.height', 'shadowRadius', 'shadowColor'],
    // 仅支持 text-decoration-line text-decoration-style text-decoration-color 这种格式
    'text-decoration': ['textDecorationLine', 'textDecorationStyle', 'textDecorationColor'],
    // flex-grow | flex-shrink | flex-basis
    flex: ['flexGrow', 'flexShrink', 'flexBasis'],
    // flex-flow: <'flex-direction'> or flex-flow: <'flex-direction'> and <'flex-wrap'>
    'flex-flow': ['flexDirection', 'flexWrap'],
    'border-radius': ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'],
    'border-width': ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
    'border-color': ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'],
    margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']
  }
  const formatAbbreviation = ({ prop, value, selector }, { mode }) => {
    const original = `${prop}:${value}`
    const props = AbbreviationMap[prop]
    const values = Array.isArray(value) ? value : parseValues(value)
    const cssMap = []
    // 复合属性不支持单个css var（css var可以接收单个值可以是复合值，复合值运行时不处理，这里前置提示一下）
    if (values.length === 1 && cssVariableExp.test(value)) {
      error(`Property ${prop} in ${selector} is abbreviated property and does not support a single CSS var`)
      return cssMap
    }
    let idx = 0
    let propsIdx = 0
    const diff = values.length - props.length
    while (idx < values.length) {
      const prop = props[propsIdx]
      if (!prop) {
        warn(`Value of [${original}] in ${selector} has not enough props to assign, please check again!`)
        break
      }
      const value = values[idx]
      const newProp = hump2dash(prop.replace(/\..+/, ''))
      if (!verifyProps({ prop: newProp, value, selector }, { mode }, diff === 0)) {
        // 有 ios or android 不支持的 prop，跳过 prop
        if (diff === 0) {
          propsIdx++
          idx++
        } else {
          propsIdx++
        }
      } else if (!verifyValues({ prop: newProp, value, selector }, diff === 0)) {
        // 值不合法 跳过 value
        if (diff === 0) {
          propsIdx++
          idx++
        } else if (diff < 0) {
          propsIdx++
        } else {
          idx++
        }
      } else if (prop.includes('.')) {
        // 多个属性值的prop
        const [main, sub] = prop.split('.')
        const cssData = cssMap.find(item => item.prop === main)
        if (cssData) { // 设置过
          cssData.value[sub] = value
        } else { // 第一次设置
          cssMap.push({
            prop: main,
            value: {
              [sub]: value
            }
          })
        }
        idx += 1
        propsIdx += 1
      } else {
        // 单个值的属性
        cssMap.push({
          prop,
          value
        })
        idx += 1
        propsIdx += 1
      }
    }
    return cssMap
  }

  const formatCompositeVal = ({ prop, value, selector }, { mode }) => {
    const values = parseValues(value).splice(0, 4)
    switch (values.length) {
      case 1:
        verifyValues({ prop, value, selector }, false)
        return { prop, value }
      case 2:
        values.push(...values)
        break
      case 3:
        values.push(values[1])
        break
    }
    return formatAbbreviation({ prop, value: values, selector }, { mode })
  }

  // line-height
  const formatLineHeight = ({ prop, value, selector }) => {
    return verifyValues({ prop, value, selector }) && ({
      prop,
      value: /^\s*(-?(\d+(\.\d+)?|\.\d+))\s*$/.test(value) ? `${Math.round(value * 100)}%` : value
    })
  }

  // background 相关属性的转换 Todo
  // 仅支持以下属性，不支持其他背景相关的属性
  // /^((?!(-color)).)*background((?!(-color)).)*$/ 包含background且不包含background-color
  const checkBackgroundImage = ({ prop, value, selector }, { mode }) => {
    const bgPropMap = {
      image: 'background-image',
      color: 'background-color',
      size: 'background-size',
      repeat: 'background-repeat',
      position: 'background-position',
      all: 'background'
    }
    const urlExp = /url\(["']?(.*?)["']?\)/
    const linearExp = /linear-gradient\(.*\)/
    switch (prop) {
      case bgPropMap.image: {
        // background-image 支持背景图/渐变/css var
        if (cssVariableExp.test(value) || urlExp.test(value) || linearExp.test(value)) {
          return { prop, value }
        } else {
          error(`Value of ${prop} in ${selector} selector only support value <url()> or <linear-gradient()>, received ${value}, please check again!`)
          return false
        }
      }
      case bgPropMap.size: {
        // background-size
        // 不支持逗号分隔的多个值：设置多重背景!!!
        // 支持一个值:这个值指定图片的宽度，图片的高度隐式的为 auto
        // 支持两个值:第一个值指定图片的宽度，第二个值指定图片的高度
        if (parseValues(value, ',').length > 1) { // commas are not allowed in values
          error(`Value of [${bgPropMap.size}] in ${selector} does not support commas, received [${value}], please check again!`)
          return false
        }
        const values = []
        parseValues(value).forEach(item => {
          if (verifyValues({ prop, value: item, selector })) {
            // 支持 number 值 / container cover auto 枚举
            values.push(item)
          }
        })
        // value 无有效值时返回false
        return values.length === 0 ? false : { prop, value: values }
      }
      case bgPropMap.position: {
        const values = []
        parseValues(value).forEach(item => {
          if (verifyValues({ prop, value: item, selector })) {
            // 支持 number 值 /  枚举, center与50%等价
            values.push(item === 'center' ? '50%' : item)
          } else {
            error(`Value of [${bgPropMap.size}] in ${selector} does not support commas, received [${value}], please check again!`)
          }
        })
        return { prop, value: values }
      }
      case bgPropMap.all: {
        // background: 仅支持 background-image & background-color & background-repeat
        if (cssVariableExp.test(value)) {
          error(`Property [${bgPropMap.all}] in ${selector} is abbreviated property and does not support CSS var`)
          return false
        }
        const bgMap = []
        const values = parseValues(value)
        values.forEach(item => {
          const url = item.match(urlExp)?.[0]
          const linerVal = item.match(linearExp)?.[0]
          if (url) {
            bgMap.push({ prop: bgPropMap.image, value: url })
          } else if (linerVal) {
            bgMap.push({ prop: bgPropMap.image, value: linerVal })
          } else if (verifyValues({ prop: bgPropMap.color, value: item }, false)) {
            bgMap.push({ prop: bgPropMap.color, value: item })
          } else if (verifyValues({ prop: bgPropMap.repeat, value: item, selector }, false)) {
            bgMap.push({ prop: bgPropMap.repeat, value: item })
          }
        })
        return bgMap.length ? bgMap : false
      }
    }
    unsupportedPropError({ prop, value, selector }, { mode })
    return false
  }

  // transform 转换
  const formatTransform = ({ prop, value, selector }, { mode }) => {
    // css var & 数组直接返回
    if (Array.isArray(value) || cssVariableExp.test(value)) return { prop, value }
    const values = parseValues(value)
    const transform = []
    values.forEach(item => {
      const match = item.match(/([/\w]+)\((.+)\)/)
      if (match && match.length >= 3) {
        let key = match[1]
        const val = match[2]
        switch (key) {
          case 'translateX':
          case 'translateY':
          case 'scaleX':
          case 'scaleY':
          case 'rotateX':
          case 'rotateY':
          case 'rotateZ':
          case 'rotate':
          case 'skewX':
          case 'skewY':
          case 'perspective':
            // 单个值处理
            transform.push({ [key]: val })
            break
          case 'matrix':
          case 'matrix3d':
            transform.push({ [key]: parseValues(val, ',').map(val => +val) })
            break
          case 'translate':
          case 'scale':
          case 'skew':
          case 'rotate3d': // x y z angle
          case 'translate3d': // x y 支持 z不支持
          case 'scale3d': // x y 支持 z不支持
          {
            // 2 个以上的值处理
            key = key.replace('3d', '')
            const vals = parseValues(val, ',').splice(0, key === 'rotate' ? 4 : 3)
            // scale(.5) === scaleX(.5) scaleY(.5)
            if (vals.length === 1 && key === 'scale') {
              vals.push(vals[0])
            }
            const xyz = ['X', 'Y', 'Z']
            transform.push(...vals.map((v, index) => {
              if (key !== 'rotate' && index > 1) {
                unsupportedPropError({ prop: `${key}Z`, value, selector }, { mode })
              }
              return { [`${key}${xyz[index] || ''}`]: v.trim() }
            }))
            break
          }
          case 'translateZ':
          case 'scaleZ':
          default:
            // 不支持的属性处理
            unsupportedPropError({ prop, value, selector }, { mode })
            break
        }
      } else {
        error(`Property [${prop}] is invalid in ${selector}, received [${value}], please check again!`)
      }
    })
    return {
      prop,
      value: transform
    }
  }

  const isNumber = (value) => {
    return !isNaN(+value)
  }

  const getIntegersFlex = ({ prop, value, selector }) => {
    if ((isNumber(value) && value >= 0) || cssVariableExp.test(value)) {
      return { prop, value }
    } else {
      error(`Value of [${prop}] in ${selector} accepts any floating point value >= 0, received [${value}], please check again!`)
      return false
    }
  }

  const formatFlex = ({ prop, value, selector }) => {
    let values = parseValues(value)
    // 值大于3 去前三
    if (values.length > 3) {
      warn(`Value of [flex] in ${selector} supports up to three values, received [${value}], please check again!`)
      values = values.splice(0, 3)
    }
    const cssMap = []
    // 单个css var 直接设置 flex 属性
    if (values.length === 1 && cssVariableExp.test(value)) {
      return { prop, value }
    }
    // 包含枚举值 none initial
    if (values.includes('initial') || values.includes('none')) {
      // css flex: initial ===> flex: 0 1 ===> rn flex 0 1
      // css flex: none ===> css flex: 0 0 ===> rn flex 0 0
      if (values.length === 1) {
        // 添加 basis 和 shrink
        // value=initial 则 flexShrink=1，其他场景都是0
        cssMap.push(...[{ prop: 'flexGrow', value: 0 }, { prop: 'flexShrink', value: +(values[0] === 'initial') }])
      } else {
        error(`Value of [${prop}] in ${selector} is invalid, When setting the value of flex to none or initial, only one value is supported.`)
      }
      return cssMap
    }
    // 只有1-2个值且最后的值是flexBasis 的有效值（auto或者有单位百分比、px等）
    // 在设置 flex basis 有效值的场景下，如果没有设置 grow 和 shrink，则默认为1
    // 单值 flex: 1 1 <flex-basis>
    // 双值 flex: <flex-grow> 1 <flex-basis>
    // 三值 flex: <flex-grow> <flex-shrink> <flex-basis>
    for (let i = 0; i < 3; i++) {
      if (i < 2) {
        // 添加 grow 和 shrink
        const isValid = isNumber(values[0]) || cssVariableExp.test(values[0])
        // 兜底 1
        const val = isValid ? values[0] : 1
        const item = getIntegersFlex({ prop: AbbreviationMap[prop][i], value: val, selector })
        item && cssMap.push(item)
        isValid && values.shift()
      } else {
        // 添加 flexBasis
        // 有单位(百分比、px等) 的 value 赋值 flexBasis，auto 不处理，兜底 0
        const val = values[0] || 0
        if (val !== 'auto') {
          cssMap.push({
            prop: 'flexBasis',
            value: val
          })
        }
      }
    }
    return cssMap
  }

  const formatFontFamily = ({ prop, value, selector }) => {
    // 去掉引号 取逗号分隔后的第一个
    const newVal = value.replace(/"|'/g, '').trim()
    const values = parseValues(newVal, ',')
    if (!newVal || !values.length) {
      error(`Value of [${prop}] is invalid in ${selector}, received [${value}], please check again!`)
      return false
    } else if (values.length > 1) {
      warn(`Value of [${prop}] only supports one in ${selector}, received [${value}], and the first one is used by default.`)
    }
    return { prop, value: values[0].trim() }
  }

  const formatBoxShadow = ({ prop, value, selector }, { mode }) => {
    value = value.trim()
    if (value === 'none') {
      return false
    }
    const cssMap = formatAbbreviation({ prop, value, selector }, { mode })
    if (mode === 'android') return cssMap
    // ios 阴影需要额外设置 shadowOpacity=1
    cssMap.push({
      prop: 'shadowOpacity',
      value: 1
    })
    return cssMap
  }

  return {
    supportedModes: ['ios', 'android'],
    rules: [
      { // 背景相关属性的处理
        test: /^(background|background-image|background-size|background-position)$/,
        ios: checkBackgroundImage,
        android: checkBackgroundImage
      },
      { // margin padding 内外边距的处理
        test: /^(margin|padding|border-radius|border-width|border-color)$/,
        ios: formatCompositeVal,
        android: formatCompositeVal
      },
      { // line-height 换算
        test: 'line-height',
        ios: formatLineHeight,
        android: formatLineHeight
      },
      {
        test: 'transform',
        ios: formatTransform,
        android: formatTransform
      },
      {
        test: 'flex',
        ios: formatFlex,
        android: formatFlex
      },
      {
        test: 'font-family',
        ios: formatFontFamily,
        android: formatFontFamily
      },
      {
        test: 'box-shadow',
        ios: formatBoxShadow,
        android: formatBoxShadow
      },
      // 通用的简写格式匹配
      {
        test: new RegExp('^(' + Object.keys(AbbreviationMap).join('|') + ')$'),
        ios: formatAbbreviation,
        android: formatAbbreviation
      },
      // 属性&属性值校验
      {
        test: () => true,
        ios: verification,
        android: verification
      }
    ]
  }
}
