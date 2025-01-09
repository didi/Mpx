const { compileTemplate, warnFn, errorFn } = require('../util')

describe('template should transform correct', function () {
  afterEach(() => {
    warnFn.mockClear()
    errorFn.mockClear()
  })

  it('same attr with or without at mode', function () {
    const input1 = '<view class="normal" class@ali="ali" >123</view>'
    const output1 = compileTemplate(input1)
    expect(output1).toBe('<view class="ali">123</view>')
    const input2 = '<view class="normal" class@wx="wx" >123</view>'
    const output2 = compileTemplate(input2)
    expect(output2).toBe('<view class="normal">123</view>')
  })

  it('work correct in wx mode', function () {
    const input1 = '<view @wx>123</view>'
    const output1 = compileTemplate(input1)
    expect(output1).toBe('')
    const input2 = '<view t1@wx="ttt">123</view>'
    const output2 = compileTemplate(input2, { mode: 'wx' })
    expect(output2).toBe('<view t1="ttt">123</view>')
  })

  it('only keep it when mode be ali', function () {
    const input = '<ali-view @ali test@ali="ttt">123</ali-view>'
    const output1 = compileTemplate(input)
    expect(output1).toBe('<ali-view test="ttt">123</ali-view>')
    const output2 = compileTemplate(input, { mode: 'wx' })
    expect(output2).toBe('')
  })

  it('will remove with child node if mode not match', function () {
    const input = '<ali-view @ali|swan test@ali="ttt"><ttt bindtap="handleTap">123</ttt></ali-view>'
    const output = compileTemplate(input, { mode: 'wx' })
    expect(output).toBe('')
  })

  it('will trans child node without atMode declaration even if parent is matched mode', function () {
    const input = '<ali-view @ali test="ttt"><ttt bindtap="handleTap">123</ttt></ali-view>'
    const output = compileTemplate(input, { mode: 'ali' })
    expect(output).toBe('<ali-view test="ttt"><ttt onTap="handleTap">123</ttt></ali-view>')
  })

  it('work correct with multi mode', function () {
    const input = '<ali-view @ali|swan test@ali="ttt"><ttt bindtap="handleTap">123</ttt></ali-view>'

    const aliOutput = compileTemplate(input, { mode: 'ali' })
    expect(aliOutput).toBe('<ali-view test="ttt"><ttt onTap="handleTap">123</ttt></ali-view>')

    const swanOutput = compileTemplate(input, { mode: 'swan' })
    expect(swanOutput).toBe('<ali-view><ttt bindtap="handleTap">123</ttt></ali-view>')
  })

  it('without error report when use condition syntax', function () {
    const input = '<button open-type@ali="{{testVal}}" scope@ali="phoneNumber" onGetAuthorize@ali="alipayPhonenumberLogin" onError@ali="onGetPhoneNumberError">手机号授权登录</button>'
    const output = compileTemplate(input)
    expect(warnFn).not.toHaveBeenCalled()
    expect(output).toBe('<button open-type="{{testVal}}" scope="phoneNumber" onGetAuthorize="alipayPhonenumberLogin" onError="onGetPhoneNumberError">手机号授权登录</button>')
  })

  it('should no trans for specific attr if matched mode', function () {
    // 默认会按规则进行自动转换
    const inputBefore = '<button open-type="getUserInfo">获取用户信息</button>'
    const outputBefore = compileTemplate(inputBefore)
    expect(outputBefore).toBe('<button open-type="getAuthorize" scope="userInfo">获取用户信息</button>')

    // 通过@指定mode后，不再走转换规则
    const input = '<button open-type@ali="getUserInfo">获取用户信息</button>'
    const output = compileTemplate(input)
    expect(output).toBe('<button open-type="getUserInfo">获取用户信息</button>')
  })

  it('should work correct with web mode', function () {
    const input = '<button @click@web="handleClick">获取用户信息</button>'
    const output = compileTemplate(input, { mode: 'web' })
    expect(output).toBe("<mpx-button @click='(e)=>__invoke(e, [[\"handleClick\"]])'>获取用户信息</mpx-button>")
  })

  it('should work normal if no attr in tag', function () {
    const input = '<button>获取用户信息</button>'
    const output = compileTemplate(input)
    expect(output).toBe('<button>获取用户信息</button>')
  })

  it('if attr name matched mode name should work correct', function () {
    const input = '<button ali@(swan|qq)="handleClick">获取用户信息</button>'
    const output = compileTemplate(input)
    expect(output).toBe('<button>获取用户信息</button>')

    const input2 = '<button wx="123">获取用户信息</button>'
    const output2 = compileTemplate(input2)
    expect(output2).toBe('<button wx="123">获取用户信息</button>')
  })

  it('if attr name matched mode and env name should work correct', function () {
    const input = '<button @click@ali:didi="getUserInfo">获取用户信息</button>'
    const output = compileTemplate(input, { env: 'didi', mode: 'ali' })
    expect(output).toBe('<button @click="getUserInfo">获取用户信息</button>')

    const input2 = '<button @click@(ali:qingju:didi|swan)="getUserInfo">获取用户信息</button>'
    const output2 = compileTemplate(input2, { env: 'didi', mode: 'ali' })
    expect(output2).toBe('<button @click="getUserInfo">获取用户信息</button>')

    const input3 = '<button @click@:qingju="getUserInfo">获取用户信息</button>'
    const output3 = compileTemplate(input3, { env: 'didi', mode: 'ali' })
    expect(output3).toBe('<button>获取用户信息</button>')

    const input4 = '<button @click@:qingju="getUserInfo" @:didi>获取用户信息</button>'
    const output4 = compileTemplate(input4, { env: 'didi', mode: 'ali' })
    expect(output4).toBe('<button>获取用户信息</button>')

    const input5 = '<button @:qingju>获取用户信息</button>'
    const output5 = compileTemplate(input5, { env: 'didi', mode: 'ali' })
    expect(output5).toBe('')

    const input6 = '<button @click@:qingju:didi="getUserInfo">获取用户信息</button>'
    const output6 = compileTemplate(input6, { env: 'didi', mode: 'ali' })
    expect(output6).toBe('<button @click="getUserInfo">获取用户信息</button>')

    const input7 = '<button hello@="123">获取用户信息</button>'
    const output7 = compileTemplate(input7, { env: 'didi', mode: 'ali' })
    expect(output7).toBe('<button hello@="123">获取用户信息</button>')

    const input8 = '<button hello@@:didi="123">获取用户信息</button>'
    const output8 = compileTemplate(input8, { env: 'didi', mode: 'ali' })
    expect(output8).toBe('<button hello@="123">获取用户信息</button>')

    const input9 = '<button hello@@@ali:didi="123">获取用户信息</button>'
    const output9 = compileTemplate(input9, { env: 'didi', mode: 'ali' })
    expect(output9).toBe('<button hello@@="123">获取用户信息</button>')

    const input10 = '<button hello@@@didi:didi="123">获取用户信息</button>'
    const output10 = compileTemplate(input10, { env: 'didi', mode: 'ali' })
    expect(output10).toBe('<button hello@@@didi:didi="123">获取用户信息</button>')
  })

  it('should work correct when multi mode or env', function () {
    const input1 = '<button @wx:didi|ali:didi>获取用户信息</button>'
    const output1 = compileTemplate(input1, { env: 'didi', mode: 'ali' })
    expect(output1).toBe('<button>获取用户信息</button>')
    const input2 = '<button @ali:didi|wx:didi>获取用户信息</button>'
    const output2 = compileTemplate(input2, { env: 'didi', mode: 'ali' })
    expect(output2).toBe('<button>获取用户信息</button>')
  })

  it('should attr trans correct when implicit mode', function () {
    const input1 = '<button @wx:didi|ali:didi bindtap="test">获取用户信息</button>'
    const output1 = compileTemplate(input1, { env: 'didi', mode: 'ali' })
    expect(output1).toBe('<button bindtap="test">获取用户信息</button>')

    const input2 = '<button @_wx:didi|_ali:didi bindtap="test">获取用户信息</button>'
    const output2 = compileTemplate(input2, { env: 'didi', mode: 'ali' })
    expect(output2).toBe('<button onTap="test">获取用户信息</button>')

    const input3 = '<button @:didi bindtap="test">获取用户信息</button>'
    const output3 = compileTemplate(input3, { env: 'didi', mode: 'ali' })
    expect(output3).toBe('<button onTap="test">获取用户信息</button>')
  })

  it('should mpxTagName trans correct', function () {
    const input1 = '<button mpxTagName@ali:didi="view">获取用户信息</button>'
    const output1 = compileTemplate(input1, { env: 'didi', mode: 'ali' })
    expect(output1).toBe('<view>获取用户信息</view>')

    const input2 = '<button mpxTagName@ali:didi="view" bindtap="test">获取用户信息</button>'
    const output2 = compileTemplate(input2, { env: 'didi', mode: 'ali' })
    expect(output2).toBe('<view onTap="test">获取用户信息</view>')
  })
})
