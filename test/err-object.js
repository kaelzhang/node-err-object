import test from 'ava'
import err from '../src'

;[
  [err('foo'), Error, {
    message: 'foo'
  }],
  [err({
    message: 'foo'
  }), Error, {
    message: 'foo'
  }],
  [err('foo', TypeError), TypeError, {
    message: 'foo'
  }],
  [err({
    message: 'foo',
    code: 'bar'
  }), Error, {
    message: 'foo',
    code: 'bar'
  }]
]
.forEach(([err, Ctor, object], i) => {

  test(String(i), t => {
    try {
      throw err
    } catch (e) {
      t.is(e instanceof Ctor, true, 'ctor')

      Object.keys(object).forEach(key => {
        t.is(err[key], object[key], key)
      })

      return
    }

    t.fail('should fail')
  })
})
