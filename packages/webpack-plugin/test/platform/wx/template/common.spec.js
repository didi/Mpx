const { compileTemplate, warnFn, errorFn, lib } = require('../../util')

describe('common spec case', function () {
  afterEach(() => {
    warnFn.mockClear()
    errorFn.mockClear()
  })

  it('should not report error about transform if node removed', () => {
    const input = `
    <view>test</view>
    <live-pusher wx:if="{{__mpx_mode__ === 'wx'}}"></live-pusher>
    `
    compileTemplate(input)
    expect(errorFn).not.toHaveBeenCalled()

    const normalInput = `
    <map covers="123">test</map>
    `
    compileTemplate(normalInput)
    expect(warnFn).toHaveBeenCalled()
  })

  it('should optimize key of for in swan', function () {
    const input1 = '<view wx:for="{{list}}" wx:for-item="t1" wx:for-index="t2" wx:key="u1">123</view>'
    const input2 = '<view wx:for="strings" wx:for-item="t1" wx:for-index="t2" wx:key="u1">123</view>'
    const input3 = '<view wx:for="{{8}}" wx:for-item="t1" wx:for-index="t2" wx:key="u1">123</view>'
    const output1 = compileTemplate(input1, { srcMode: 'wx', mode: 'swan' })
    const output2 = compileTemplate(input2, { srcMode: 'wx', mode: 'swan' })
    const output3 = compileTemplate(input3, { srcMode: 'wx', mode: 'swan' })
    const wxsPath = lib('runtime/swanHelper.wxs')
    expect(output1).toBe(`<import-sjs module="mpxSwanHelper" src="~${wxsPath}"></import-sjs><view s-for="t1, t2 in mpxSwanHelper.processFor(list) trackBy t1.u1">123</view>`)
    expect(output2).toBe(`<import-sjs module="mpxSwanHelper" src="~${wxsPath}"></import-sjs><view s-for='t1, t2 in mpxSwanHelper.processFor("strings") trackBy t1.u1'>123</view>`)
    expect(output3).toBe(`<import-sjs module="mpxSwanHelper" src="~${wxsPath}"></import-sjs><view s-for="t1, t2 in mpxSwanHelper.processFor(8) trackBy t1.u1">123</view>`)
  })

  it('should wrap directive expression in swan', function () {
    const input = `
    <view s-if="show">
      <view s-for="list">
        <view>{{item}}</view>
      </view>
    </view>
    `

    const input2 = `
    <view s-for="item,index in list">
      <view s-if="item.show">{{item.value}}</view>
    </view>
    `
    const output = compileTemplate(input, { srcMode: 'swan', mode: 'swan' })
    const output2 = compileTemplate(input2, { srcMode: 'swan', mode: 'swan' })

    expect(output).toBe('<view s-if="{{show}}"><view s-for="{{list}}"><view>{{item}}</view></view></view>')
    expect(output2).toBe('<view s-for="item,index in list"><view s-if="{{item.show}}">{{item.value}}</view></view>')
  })
})
