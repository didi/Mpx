const MagicString = require('magic-string')

function cssConditionalStrip (cssContent, defs) {
  const ms = new MagicString(cssContent)

  // 正则匹配 @mpx-if, @mpx-elif, @mpx-else, @mpx-endif 的模式
  const ifPattern = /\/\*\s*@mpx-if\s*\((.*?)\)\s*\*\//gs
  const elifPattern = /\/\*\s*@mpx-elif\s*\((.*?)\)\s*\*\//gs
  const elsePattern = /\/\*\s*@mpx-else\s*\*\//gs
  const endifPattern = /\/\*\s*@mpx-endif\s*\*\//gs

  function evaluateCondition (condition) {
    // 替换变量
    for (const key in defs) {
      condition = condition.replace(new RegExp(`\\b${key}\\b`, 'g'), JSON.stringify(defs[key]))
    }

    // 解析条件表达式
    try {
      // eslint-disable-next-line no-new-func
      return Function('"use strict";return (' + condition + ')')()
    } catch (e) {
      throw new Error(`Failed to evaluate condition: ${condition}`)
    }
  }

  let currentStart = 0
  function processCondition (start, end, condition) {
    const conditionResult = evaluateCondition(condition)
    let hasElse = false
    let elseStart = -1
    let elseLen = 0
    currentStart = end + 1

    while (currentStart < ms.original.length) {
      elsePattern.lastIndex = currentStart
      const elseMatch = elsePattern.exec(ms.original)
      if (elseMatch) {
        elseLen = elseMatch[0].length
      }

      ifPattern.lastIndex = currentStart
      const ifMatch = ifPattern.exec(ms.original)

      elifPattern.lastIndex = currentStart
      const elseIfMatch = elifPattern.exec(ms.original)

      endifPattern.lastIndex = currentStart
      const endifMatch = endifPattern.exec(ms.original)

      const nextIf = ifMatch ? ifMatch.index : Infinity
      const nextElseIf = elseIfMatch ? elseIfMatch.index : Infinity
      const nextElse = elseMatch ? elseMatch.index : Infinity
      const nextEndif = endifMatch ? endifMatch.index : Infinity

      const nextMarker = Math.min(nextIf, nextElseIf, nextElse, nextEndif)

      if (nextMarker === Infinity) break

      if (nextMarker === nextElse) {
        // 处理 @mpx-else
        hasElse = true
        elseStart = nextElse
        currentStart = elseMatch.index + elseLen
        ms.remove(elseStart, elseStart + elseLen) // 移除 @mpx-else 注释
      } else if (nextMarker === nextElseIf) {
        // 处理 @mpx-elif
        if (!conditionResult) {
          // 前边的if为false，则直接移除前边代码
          ms.remove(start, nextElseIf)
        }
        currentStart = nextElseIf + elseIfMatch[0].length
        ms.remove(nextElseIf, nextElseIf + elseIfMatch[0].length) // 移除 @mpx-elif 注释
        processCondition(nextElseIf, nextElseIf + elseIfMatch[0].length, elseIfMatch[1])
      } else if (nextMarker === nextIf) {
        // 处理嵌套的 @mpx-if
        // 如果遇到了新的 @mpx-if，则递归处理
        currentStart = nextIf + ifMatch[0].length
        ms.remove(nextIf, nextIf + ifMatch[0].length) // 移除 @mpx-if 注释
        processCondition(nextIf, nextIf + ifMatch[0].length, ifMatch[1])
      } else if (nextMarker === nextEndif) {
        // 处理 @mpx-endif block块
        if (conditionResult && hasElse) {
          // 移除 @mpx-else 至 @mpx-endif 代码
          ms.remove(elseStart, endifMatch.index + endifMatch[0].length)
        } else if (!conditionResult && hasElse) {
          ms.remove(start, elseStart + elseLen)
        } else if (!conditionResult) {
          ms.remove(start, endifMatch.index + endifMatch[0].length)
        }
        ms.remove(endifMatch.index, endifMatch.index + endifMatch[0].length) // 移除 @mpx-endif 注释
        currentStart = endifMatch.index + endifMatch[0].length
        break
      }
      // 兜底更新当前开始位置
      if (currentStart < nextMarker) {
        currentStart = nextMarker + 1
      }
    }
  }

  let match
  while ((match = ifPattern.exec(ms.original)) !== null) {
    processCondition(match.index, ifPattern.lastIndex, match[1])
    // 移除匹配到的 @mpx-if 注释
    ms.remove(match.index, match.index + match[0].length)
    ifPattern.lastIndex = currentStart
  }

  return ms.toString()
}

module.exports = function (css) {
  this.cacheable()
  const mpx = this.getMpx()
  const defs = mpx.defs
  return cssConditionalStrip(css, defs)
}
