const MagicString = require('magic-string')

function cssConditionalStrip(cssContent, defs) {
  const ms = new MagicString(cssContent)

  // 正则匹配 @mpx-if, @mpx-elif, @mpx-else, @mpx-endif 的模式
  const ifPattern = /\/\*\s*@mpx-if\s*\((.*?)\)\s*\*\//gs
  const elifPattern = /\/\*\s*@mpx-elif\s*\((.*?)\)\s*\*\//gs
  const elsePattern = /\/\*\s*@mpx-else\s*\*\//gs
  const endifPattern = /\/\*\s*@mpx-endif\s*\*\//gs

  function evaluateCondition(condition) {
    // 替换变量
    for (const key in defs) {
      condition = condition.replace(new RegExp(`\\b${key}\\b`, 'g'), JSON.stringify(defs[key]))
    }

    // 解析条件表达式
    try {
      return Function('"use strict";return (' + condition + ')')()
    } catch (e) {
      throw new Error(`Failed to evaluate condition: ${condition}`)
    }
  }

  let currentStart = 0
  function processCondition(start, end, condition) {
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
      const elifMatch = elifPattern.exec(ms.original)

      endifPattern.lastIndex = currentStart
      const endifMatch = endifPattern.exec(ms.original)

      const nextIf = ifMatch ? ifMatch.index : Infinity
      const nextElseIf = elifMatch ? elifMatch.index : Infinity
      const nextElse = elseMatch ? elseMatch.index : Infinity
      const nextEndif = endifMatch ? endifMatch.index : Infinity

      const nextMarker = Math.min(nextIf, nextElseIf, nextElse, nextEndif)

      if (nextMarker === Infinity) break

      if (nextMarker === nextElse) {
        // 处理 @mpx-else
        hasElse = true
        elseStart = nextElse
        currentStart = elseMatch.index + elseLen
      } else if (nextMarker === nextElseIf) {
        // 处理 @mpx-elif
        if (!conditionResult) {
          ms.remove(start, nextElseIf)
        }
        if (elifMatch) {
          currentStart = nextElseIf + elifMatch[0].length
          processCondition(nextElseIf, nextElseIf + elifMatch[0].length, elifMatch[1])
        }
      } else if (nextMarker === nextIf) {
        // 处理嵌套的 @mpx-if
        // 如果遇到了新的 @mpx-if，则递归处理
        if (ifMatch) {
          currentStart = nextIf + ifMatch[0].length
          processCondition(nextIf, nextIf + ifMatch[0].length, ifMatch[1])
        }
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
        currentStart = endifMatch.index + endifMatch[0].length
        break
      }
      // 兜底更新当前开始位置
      if (currentStart < nextMarker) {
        currentStart = nextMarker + 1
      }
    }
  }

  // 处理所有条件
  let match
  while ((match = ifPattern.exec(ms.original)) !== null) {
    processCondition(match.index, ifPattern.lastIndex, match[1])
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
