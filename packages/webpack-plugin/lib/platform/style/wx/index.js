const { hump2dash } = require('../../../utils/hump-dash')

module.exports = function getSpec ({ warn, error }) {
  // React Native 双端都不支持的 CSS property
  // RN 仅支持backgroundColor，不支持其他背景相关的属性：/^((?!(-color)).)*background((?!(-color)).)*$/ 包含background且不包含background-color
  // Todo background-image的处理
  const unsupportedPropExp = /^(((?!(-color)).)*background((?!(-color)).)*|box-sizing|white-space|text-overflow)$/
  const unsupportedPropAndroid = /^(text-decoration-style|text-decoration-color|shadow-offset|shadow-opacity|shadow-radius)$/
  const unsupportedPropMode = {
    // React Native ios 不支持的 CSS property
    ios: /^(vertical-align)$/,
    // React Native android 不支持的 CSS property
    android: /^(text-decoration-style|text-decoration-color|shadow-offset|shadow-opacity|shadow-radius)$/
  }
  const unsupportedPropError = ({ prop, mode }) => {
    error(`Property [${prop}] is not supported in React Native ${mode} environment!`)
  }

  // React 某些属性仅支持部分枚举值
  const SUPPORTED_PROP_VAL_ARR = {
    overflow: ['visible', 'hidden', 'scroll'],
    'border-style': ['solid', 'dotted', 'dashed'],
    display: ['flex', 'none'],
    'pointer-events': ['auto', 'none'],
    'vertical-align': ['auto', 'top', 'bottom', 'center'],
    position: ['relative', 'absolute'],
    'font-variant': ['small-caps', 'oldstyle-nums', 'lining-nums', 'tabular-nums', 'proportional-nums'],
    'text-align': ['left', 'right', 'center', 'justify'],
    'font-style': ['normal', 'italic'],
    'font-weight': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    'text-decoration-line': ['none', 'underline', 'line-through', 'underline line-through'],
    'text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
    'user-select': ['auto', 'text', 'none', 'contain', 'all'],
    'align-content': ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around'],
    'align-items': ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    'align-self': ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'none']
  }
  const propValExp = new RegExp('^(' + Object.keys(SUPPORTED_PROP_VAL_ARR).join('|') + ')$')
  const isIllegalValue = ({ prop, value }) => SUPPORTED_PROP_VAL_ARR[prop]?.length > 0 && !SUPPORTED_PROP_VAL_ARR[prop].includes(value)
  const unsupportedValueError = ({ prop, value }) => {
    error(`Property [${prop}] only support value [${SUPPORTED_PROP_VAL_ARR[prop]?.join(',')}] in React Native environment, the value [${value}] does not support!`)
  }

  // 过滤的不合法的属性
  const delRule = ({ prop, value }, { mode }) => {
    if (unsupportedPropExp.test(prop) || unsupportedPropMode[mode].test(prop)) {
      unsupportedPropError({ prop, mode })
      return false
    }
    if (isIllegalValue({ prop, value })) {
      unsupportedValueError({ prop, value })
      return false
    }
  }

  // color & number 值校验
  const ValueType = {
    number: 'number',
    color: 'color',
    default: 'default' // 不校验
  }
  // number 类型支持的单位
  const numberRegExp = /^\s*(\d+(\.\d+)?)(rpx|px|%)?\s*$/
  // RN 不支持的颜色格式
  const colorRegExp = /^\s*(lab|lch|oklab|oklch|color-mix|color|hwb|lch|light-dark).*$/
  const verifyValues = ({ prop, value, valueType }) => {
    // 校验 value 枚举 是否支持
    switch (valueType) {
      case ValueType.color:
        (numberRegExp.test(value)) && warn(`React Native property [${prop}]'s valueType is ${valueType}, we does not set type number`)
        colorRegExp.test(value) && warn('React Native color does not support type [lab,lch,oklab,oklch,color-mix,color,hwb,lch,light-dark]')
        return value
      case ValueType.number:
        (!numberRegExp.test(value)) && warn(`React Native property [${prop}] unit only supports [rpx,px,%]`)
        return value
      default:
        return value
    }
  }

  // 简写转换规则
  const AbbreviationMap = {
    'text-shadow': { // 仅支持 offset-x | offset-y | blur-radius | color 排序
      'textShadowOffset.width': ValueType.number,
      'textShadowOffset.height': ValueType.number,
      textShadowRadius: ValueType.number,
      textShadowColor: ValueType.color
    },
    border: { // 仅支持 width | style | color 这种排序
      borderWidth: ValueType.number,
      borderStyle: ValueType.default,
      borderColor: ValueType.color
    },
    'box-shadow': { // 仅支持 offset-x | offset-y | blur-radius | color 排序
      'shadowOffset.width': ValueType.number,
      'shadowOffset.height': ValueType.number,
      shadowRadius: ValueType.number,
      shadowColor: ValueType.color
    },
    'text-decoration': { // 仅支持 text-decoration-line text-decoration-style text-decoration-color 这种格式
      textDecorationLine: ValueType.default,
      textDecorationStyle: ValueType.default,
      textDecorationColor: ValueType.color
    },
    flex: { // /* Three values: flex-grow | flex-shrink | flex-basis */
      flexGrow: ValueType.number,
      flexShrink: ValueType.number,
      flexBasis: ValueType.number
    },
    'flex-flow': { // 仅支持 flex-flow: <'flex-direction'> or flex-flow: <'flex-direction'> and <'flex-wrap'>
      flexDirection: ValueType.default,
      flexWrap: ValueType.default
    },
    'border-radius': {
      borderTopLeftRadius: ValueType.default,
      borderTopRightRadius: ValueType.default,
      borderBottomRightRadius: ValueType.default,
      borderBottomLeftRadius: ValueType.default
    }
  }

  const formatBoxReviation = ({ prop, value }) => {
    const values = value.trim().split(/\s(?![^()]*\))/)
    const suffix = ['Top', 'Right', 'Bottom', 'Left']

    // validate
    for (let i = 0; i < values.length; i++) {
      verifyValues({ prop, value: values[i], valueType: ValueType.number })
    }

    // format
    switch (values.length) {
      case 1:
        return { prop, value }
      case 2:
        return [{
          prop: `${prop}Vertical`,
          value: values[0]
        }, {
          prop: `${prop}Horizontal`,
          value: values[1]
        }]
      case 3:
        return [{
          prop: `${prop}Top`,
          value: values[0]
        }, {
          prop: `${prop}Horizontal`,
          value: values[1]
        }, {
          prop: `${prop}Bottom`,
          value: values[2]
        }]
      case 4:
        return suffix.map((key, index) => {
          return {
            prop: `${prop}${key}`,
            value: values[index]
          }
        })
    }
  }

  const formatAbbreviation = ({ value, keyMap }) => {
    const values = value.trim().split(/\s(?![^()]*\))/)
    const cssMap = []
    const props = Object.getOwnPropertyNames(keyMap)
    let idx = 0
    // 按值的个数循环赋值
    while (idx < values.length && idx < props.length) {
      const prop = props[idx]
      const valueType = keyMap[prop]
      const dashProp = hump2dash(prop)
      // 校验 value 类型
      const value = verifyValues({ prop, value: values[idx], valueType })
      if (isIllegalValue({ prop: dashProp, value })) {
        // 过滤不支持 value
        unsupportedValueError({ prop: dashProp, value })
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
      } else {
        // 单个值的属性
        cssMap.push({
          prop,
          value
        })
      }
      idx += 1
    }
    return cssMap
  }

  const getAbbreviation = ({ prop, value }) => {
    const keyMap = AbbreviationMap[prop]
    return formatAbbreviation({ prop, value, keyMap })
  }

  // 简写过滤安卓不支持的类型
  const getAbbreviationAndroid = ({ prop, value }, { mode }) => {
    const cssMap = getAbbreviation({ prop, value })
    // android 不支持的 shadowOffset shadowOpacity shadowRadius textDecorationStyle 和 textDecorationStyle
    return cssMap.filter(({ prop }) => { // 不支持的 prop 提示 & 过滤不支持的 prop
      const dashProp = hump2dash(prop)
      if (unsupportedPropAndroid.test(dashProp)) {
        unsupportedPropError({ prop: dashProp, mode })
        return false
      }
      return true
    })
  }

  // 统一校验 value type 值类型
  const checkCommonValue = (valueType) => ({ prop, value }) => {
    verifyValues({ prop, value, valueType })
  }

  const getFontVariant = ({ prop, value }) => {
    if (/^(font-variant-caps|font-variant-numeric|font-variant-east-asian|font-variant-alternates|font-variant-ligatures)$/.test(prop)) {
      error(`Property [${prop}] is not supported in React Native environment, please replace [font-variant]!`)
    }
    prop = 'font-variant'
    // 校验枚举值
    if (isIllegalValue({ prop, value })) {
      unsupportedValueError({ prop, value })
      return false
    }
    return {
      prop,
      value
    }
  }

  const spec = {
    supportedModes: ['ios', 'android'],
    rules: [
      { // RN 不支持的 CSS property
        test: unsupportedPropExp,
        ios: delRule,
        android: delRule
      },
      { // React Native android 不支持的 CSS property
        test: unsupportedPropMode.android,
        android: delRule
      },
      { // React Native ios 不支持的 CSS property
        test: unsupportedPropMode.ios,
        ios: delRule
      },
      { // RN 支持的 CSS property value
        test: propValExp,
        ios: delRule,
        android: delRule
      },
      {
        test: 'box-shadow',
        ios: getAbbreviation,
        android: getAbbreviationAndroid
      },
      {
        test: 'text-decoration',
        ios: getAbbreviation,
        android: getAbbreviationAndroid
      },
      {
        test: /.*font-variant.*/,
        ios: getFontVariant,
        android: getFontVariant
      },
      {
        test: /.*(margin|padding).*/,
        ios: formatBoxReviation,
        android: formatBoxReviation
      },
      // 通用的简写格式匹配
      {
        test: new RegExp('^(' + Object.keys(AbbreviationMap).join('|') + ')$'),
        ios: getAbbreviation,
        android: getAbbreviation
      },
      // 值类型校验放到最后
      { // color 颜色值校验
        test: /.*color.*/i,
        ios: checkCommonValue(ValueType.color),
        android: checkCommonValue(ValueType.color)
      },
      { // number 值校验
        test: /.*width|height|left|right|top|bottom|radius|margin|padding|spacing|offset|size.*/i,
        ios: checkCommonValue(ValueType.number),
        android: checkCommonValue(ValueType.number)
      }
    ]
  }
  return spec
}
