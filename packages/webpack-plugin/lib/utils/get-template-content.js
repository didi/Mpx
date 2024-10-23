/*
 对template.wxml文件做截取
 @source原始小程序文件
 @name 要匹配的该name的template
 */
module.exports = function (source, name) {
  // 使用正则表达式匹配具有 name 的 template 标签及其所有子元素
  // 正则表达式使用非贪婪匹配来递归匹配嵌套的 template
  const regex = new RegExp(`(<template[^>]*\\bname=["|']${name}["|'][^>]*>).*?`, 'g')

  let startIndex = 0
  let endIndex = 0
  const match = regex.exec(source)
  // 逐个处理匹配到的 template 标签及其内容
  if (match) {
    const matchRes = match[0]
    const reg = /<\/?template\s*[^>]*>/g
    let n = 0
    startIndex = match.index
    endIndex = startIndex + matchRes.length
    let html = source.substr(endIndex)
    while (html) {
      const matchRes = html.match(reg)
      if (matchRes.length) {
        const matchTemp = matchRes[0]
        const matchIndex = html.indexOf(matchTemp)
        const matchLength = matchTemp.length
        const cutLength = matchIndex + matchLength
        if (matchTemp.startsWith('</template>')) {
          if (n === 0) {
            endIndex += cutLength
            break
          } else {
            n--
          }
        } else {
          n++
        }
        endIndex += cutLength
        html = html.substr(cutLength)
      }
    }
  } else {
    return ''
  }
  return source.substring(startIndex, endIndex)
}
