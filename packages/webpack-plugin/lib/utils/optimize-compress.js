class CompressName {
    constructor (chars, allowStartChars) {
        this._arr = []
        //   this._occupiedNames = new Set()
        this._compressMap = new Map()
        // 允许使用的字符, 需要去重
        this.chars = typeof chars === 'string' ? [...new Set(chars.split(''))].join('') : 'abcdefghijklmnopqrstuvwxyz'
        // 首个字符允许的字符（生产变量名时用于指定禁止数字开头）
        this.allowStartChars = [...new Set(allowStartChars.split(''))].join('') || this.chars

        // 检查一下allowStartChars必须都在char中，以防运行阶段出现死循环
        for (const char of this.allowStartChars) {
            if (this.chars.indexOf(char) === -1) {
                throw new Error(`CompressName allowStartChars 包含 chars 中不存在的字符: "${char}"`)
            }
        }
    }

    // 用于获取符合首字母规则的字符的下标
    _findStartCharIndex (startIndex) {
        for (let i = startIndex; i < this.chars.length; i++) {
            if (this.allowStartChars.indexOf(this.chars[i]) !== -1) {
                return i
            }
        }
        return -1
    }

    _generateName () {
        if (this._arr.length === 0) {
            // 首次生成，获取首字母
            this._arr[0] = this._findStartCharIndex(0)
        } else {
            if (this._arr.length === 1) {
                // 只有一个字母，从当前位置往后获取首字母
                this._arr[0] = this._findStartCharIndex(this._arr[0] + 1)
                // 如果获取不到，则直接设置到最大值，后面在来做进位处理
                if (this._arr[0] === -1) this._arr[0] = this.chars.length
            } else {
                // 最后一个字母（非首字母），+1即可
                this._arr[this._arr.length - 1]++
            }

            // 进位处理，如果数组中某一位 = chars.length，则前一项+1，当前项为0
            for (let i = this._arr.length - 1; i >= 0; i--) {
                if (this._arr[i] === this.chars.length) {
                    this._arr[i] = 0
                    if (i === 0) {
                        // 当前为第一位，则再补充一个最小的首位： [10,0] -> [1,0,0]
                        this._arr.unshift(this._findStartCharIndex(0))
                    } else if (i === 1) {
                        // 当前为第二位，进位会影响首位，也需要findStartCharIndex
                        this._arr[i - 1] = this._findStartCharIndex(this._arr[i - 1] + 1)
                        if (this._arr[i - 1] === -1) this._arr[i - 1] = this.chars.length
                    } else {
                        // 其他情况，正常进位即可
                        this._arr[i - 1]++
                    }
                }
            }
        }
        // 获取每一位对应的字符拼接
        return this._arr.map(num => this.chars[num]).join('')
    }

    // 指定不允许使用的key
    // occupiedKey: string[] | string
    _occupiedGenerateName (occupiedKey) {
        let key = this._generateName()

        if (!occupiedKey) return key
        if (typeof occupiedKey === 'string') occupiedKey = [occupiedKey]

        while (occupiedKey.indexOf(key) !== -1) {
            key = this._generateName()
        }
        return key
    }

    compress (source, occupiedKey) {
        if (!this._compressMap.has(source)) {
            this._compressMap.set(source, this._occupiedGenerateName(occupiedKey))
            // this._occupiedNames.add(this._compressMap.get(source))
        }
        return this._compressMap.get(source)
    }
}

const namespaces = {}
function generateVariableNameBySource (source, namespace, occupiedKey) {
    if (!namespaces[namespace]) {
        // 限制只能字母开头
        namespaces[namespace] = new CompressName('abcdefghijklmnopqrstuvwxyz_0123456789', 'abcdefghijklmnopqrstuvwxyz')
    }
    return namespaces[namespace].compress(source, occupiedKey)
}

const isProductionLikeMode = options => {
    return options.mode === 'production' || !options.mode
}

module.exports = {
    generateVariableNameBySource,
    isProductionLikeMode
}
