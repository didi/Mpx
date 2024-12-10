import { boxShadowsBase, boxShadows } from '@unocss/preset-mini/rules'

const findShadowColorRule = () => {
  return boxShadows.find(rule => {
    if (rule[0] instanceof RegExp && rule[0].test('shadow')) {
      return rule
    }
    return false
  }) || []
}

const shadowColorRule = findShadowColorRule()

export default [
  [shadowColorRule[0], (match, context) => {
    const rawHandler = shadowColorRule[1]
    const rawResult = rawHandler(match, context)
    if (rawResult['box-shadow']) {
      return {
        ...boxShadowsBase,
        ...rawResult
      }
    } else {
      // 工具类
      return rawResult
    }
  }]
]
