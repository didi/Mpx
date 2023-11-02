import { isReactive, isReadonly, readonly, shallowReadonly } from '../src'

describe('reactivity/shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReactive(props.n)).toBe(false)
  })

  test('should make root level properties readonly', () => {
    const props = shallowReadonly({ n: 1 })
    props.n = 2
    expect(props.n).toBe(1)
    expect(
      'Set operation on key "n" failed: target is readonly.'
    ).toHaveBeenWarned()
  })

  // to retain 2.x behavior.
  test('should NOT make nested properties readonly', () => {
    const props = shallowReadonly({ n: { foo: 1 } })

    props.n.foo = 2
    expect(props.n.foo).toBe(2)
    expect(
      'Set operation on key "foo" failed: target is readonly.'
    ).not.toHaveBeenWarned()
  })

  test('should differentiate from normal readonly calls', () => {
    const original = { foo: {} }
    const shallowProxy = shallowReadonly(original)
    const reactiveProxy = readonly(original)
    expect(shallowProxy).not.toBe(reactiveProxy)
    expect(isReadonly(shallowProxy.foo)).toBe(false)
    expect(isReadonly(reactiveProxy.foo)).toBe(true)
  })

  test('non-observable values', () => {
    const assertValue = (value) => {
      shallowReadonly(value)
      expect(
        `value cannot be made reactive: ${String(value)}`
      ).toHaveBeenWarnedLast()
    }

    // number
    assertValue(1)
    // string
    assertValue('foo')
    // boolean
    assertValue(false)
    // null
    assertValue(null)
    // undefined
    assertValue(undefined)
    // symbol
    const s = Symbol('s')
    assertValue(s)
    // bigint
    const bn = BigInt('9007199254740991')
    assertValue(bn)

    // built-ins should work and return same value
    const p = Promise.resolve()
    expect(shallowReadonly(p)).toBe(p)
    // eslint-disable-next-line prefer-regex-literals
    const r = new RegExp('')
    expect(shallowReadonly(r)).toBe(r)
    const d = new Date()
    expect(shallowReadonly(d)).toBe(d)
    const m = new Map()
    expect(shallowReadonly(m)).toBe(m)
    const set = new Set()
    expect(shallowReadonly(set)).toBe(set)
    const wm = new WeakMap()
    expect(shallowReadonly(wm)).toBe(wm)
    const ws = new WeakSet()
    expect(shallowReadonly(ws)).toBe(ws)
  })

  describe('collection/Map', () => {
    ;[Map, WeakMap].forEach(Collection => {
      test('should NOT make the map/weak-map readonly', () => {
        const key = {}
        const val = { foo: 1 }
        const original = new Collection([[key, val]])
        const sroMap = shallowReadonly(original)
        expect(isReadonly(sroMap)).toBe(false)
        expect(isReactive(sroMap)).toBe(false)
        expect(sroMap.get(key)).toBe(val)
      })

      test('should not make nested values readonly', () => {
        const key = {}
        const val = { foo: 1 }
        const original = new Collection([[key, val]])
        const sroMap = shallowReadonly(original)
        expect(isReadonly(sroMap.get(key))).toBe(false)
        expect(isReactive(sroMap.get(key))).toBe(false)

        sroMap.get(key).foo = 2
        expect(
          `Set operation on key "foo" failed: target is readonly.`
        ).not.toHaveBeenWarned()
      })
    })

    test('should not make the value generated by the iterable method readonly', () => {
      const key = {}
      const val = { foo: 1 }
      const original = new Map([[key, val]])
      const sroMap = shallowReadonly(original)

      const values1 = [...sroMap.values()]
      const values2 = [...sroMap.entries()]

      expect(isReadonly(values1[0])).toBe(false)
      expect(isReactive(values1[0])).toBe(false)
      expect(values1[0]).toBe(val)

      values1[0].foo = 2
      expect(
        `Set operation on key "foo" failed: target is readonly.`
      ).not.toHaveBeenWarned()

      expect(isReadonly(values2[0][1])).toBe(false)
      expect(isReactive(values2[0][1])).toBe(false)
      expect(values2[0][1]).toBe(val)

      values2[0][1].foo = 2
      expect(
        `Set operation on key "foo" failed: target is readonly.`
      ).not.toHaveBeenWarned()
    })

    test('should not make the value generated by the forEach method readonly', () => {
      const val = { foo: 1 }
      const original = new Map([['key', val]])
      const sroMap = shallowReadonly(original)

      sroMap.forEach(val => {
        expect(isReadonly(val)).toBe(false)
        expect(isReactive(val)).toBe(false)
        expect(val).toBe(val)

        val.foo = 2
        expect(
          `Set operation on key "foo" failed: target is readonly.`
        ).not.toHaveBeenWarned()
      })
    })
  })

  describe('collection/Set', () => {
    test('should NOT make the set/weak-set readonly', () => {
      ;[Set, WeakSet].forEach(Collection => {
        const obj = { foo: 1 }
        const original = new Collection([obj])
        const sroSet = shallowReadonly(original)
        expect(isReadonly(sroSet)).toBe(false)
        expect(isReactive(sroSet)).toBe(false)
        expect(sroSet.has(obj)).toBe(true)
      })
    })

    test('should not make nested values readonly', () => {
      const obj = { foo: 1 }
      const original = new Set([obj])
      const sroSet = shallowReadonly(original)

      const values = [...sroSet.values()]

      expect(values[0]).toBe(obj)
      expect(isReadonly(values[0])).toBe(false)
      expect(isReactive(values[0])).toBe(false)
      
      values[0].foo = 2
      expect(
        `Set operation on key "foo" failed: target is readonly.`
      ).not.toHaveBeenWarned()
    })

    test('should not make the value generated by the iterable method readonly', () => {
      const val = { foo: 1 }
      const original = new Set([val])
      const sroSet = shallowReadonly(original)

      const values1 = [...sroSet.values()]
      const values2 = [...sroSet.entries()]

      expect(isReadonly(values1[0])).toBe(false)
      expect(isReactive(values1[0])).toBe(false)
      expect(values1[0]).toBe(val)

      values1[0].foo = 2
      expect(
        `Set operation on key "foo" failed: target is readonly.`
      ).not.toHaveBeenWarned()

      expect(isReadonly(values2[0][1])).toBe(false)
      expect(isReactive(values2[0][1])).toBe(false)
      expect(values2[0][1]).toBe(val)

      values2[0][1].foo = 2
      expect(
        `Set operation on key "foo" failed: target is readonly.`
      ).not.toHaveBeenWarned()
    })

    test('should not make the value generated by the forEach method readonly', () => {
      const val = { foo: 1 }
      const original = new Set([val])
      const sroSet = shallowReadonly(original)

      sroSet.forEach(val => {
        expect(isReadonly(val)).toBe(false)
        expect(isReactive(val)).toBe(false)
        expect(val).toBe(val)

        val.foo = 2
        expect(
          `Set operation on key "foo" failed: target is readonly.`
        ).not.toHaveBeenWarned()
      })
    })
  })
})
