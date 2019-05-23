import test from 'ava'
import {error, Errors} from '../src'

;[
  [error('foo'), Error, {
    message: 'foo'
  }],
  [error({
    message: 'foo'
  }), Error, {
    message: 'foo'
  }],
  [error('foo', TypeError), TypeError, {
    message: 'foo'
  }],
  [error({
    message: 'foo',
    code: 'bar'
  }), Error, {
    message: 'foo',
    code: 'bar'
  }]
]
.forEach(([err, Ctor, object], i) => {
  test(`err(): ${i}`, t => {
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

const factoryError = 'factory must be a function'
const notDefinedError = 'notDefined must be a function'

;[
  [
    'A', {
      message: 'foo'
    },
    [],
    'foo',
    // factory
    null,
    // E error
    false
  ],
  ['B', {message: 'foo %s'}, ['bar'], 'foo bar'],
  ['B', {message: a => 'foo ' + a}, ['bar'], 'foo bar'],
  ['C', {message: 'foo %s', ctor: TypeError}, ['bar'], 'foo bar'],
  ['D', {message: 'foo %s', ctor: TypeError}, ['bar'], 'foo bar',
    () => error({message: 'foo bar', code: 'D', args: ['bar']}, TypeError)],
  ['E', {}, [], '', 'not a function', factoryError]

].forEach(([code, preset, args, message, factory, EError], i) => {
  test(`error.E(): ${i}, ${code}`, t => {
    const error = new Errors()
    const E = error.E

    try {
      E(code, preset, factory)
    } catch (e) {
      t.is(e.message, EError, 'E error message')
      return
    }

    if (EError) {
      t.fail('E should fails')
      return
    }

    const err = error.error(code, ...args)
    t.is(err instanceof (preset.ctor || Error), true, 'type')
    t.is(err.message, message, 'message')
    t.is(err.code, code, 'code')
    t.deepEqual(err.args, args, 'args')

    Object.keys(preset).forEach(key => {
      if (key === 'ctor' || key === 'message') {
        return
      }

      t.is(err[key], preset[key], key)
    })
  })
})

test('constructor factory error', async t => {
  try {
    new Errors({factory: 'a'})
  } catch (e) {
    t.is(e.message, factoryError, 'message')
    return
  }

  t.fail('should fail')
})

test('constructor notDefined error', async t => {
  try {
    new Errors({notDefined: 'a'})
  } catch (e) {
    t.is(e.message, notDefinedError, 'message')
    return
  }

  t.fail('should fail')
})

test('notDefined', async t => {
  const {error} = new Errors()
  const e = error('A', 'foo')

  t.is(e.message, 'foo')
  t.is(e.code, 'A')
})

test('language', t => {
  const {E, i18n, error} = new Errors()
  E('A', {
    message: 'foo %s'
  })

  E('B', {
    message: 'foo %s2'
  })

  const map = {
    'foo %s': 'fake foo'
  }

  i18n(m => map[m] || m)

  t.is(error('A', 'bar').message, 'fake foo bar', 'message A')
  t.is(error('B', 'bar').message, 'foo bar2', 'message B')
})

test('E: only message', t => {
  const {error, E} = new Errors
  E('A', 'b %s')

  const e = error('A', 'c')
  t.is(e.code, 'A')
  t.is(e.message, 'b c')
})

test('factory with i18n', t => {
  const {error, E, i18n} = new Errors
  i18n(m => 'b')

  E('A', {
    message: 'a'
  }, function ({code, preset: {message}, args: [err], _}) {
    const e = new Error()
    e.message = _(message)
    e.code = code
    e.errMessage = err.message
    return e
  })

  const err = new Error('blah')
  const e = error('A', err)
  t.is(e.code, 'A')
  t.is(e.message, 'b')
  t.is(e.errMessage, err.message)
})

test('E(code, message, ctor)', async t => {
  const {error, E} = new Errors
  E('A', 'b', TypeError)

  t.throws(() => {
    throw error('A')
  }, 'b', TypeError)
})

test('prefix: [foo]', async t => {
  const {error, E} = new Errors({
    prefix: '[foo] '
  })
  E('A', 'b', TypeError)
  E('B', {
    message: 'c',
    ctor: RangeError
  })

  t.throws(() => {
    throw error('A')
  }, '[foo] b', TypeError)

  t.throws(() => {
    throw error('B')
  }, '[foo] c', RangeError)
})

test('code prefix: FOO_', async t => {
  const {error, E} = new Errors({
    codePrefix: 'FOO_'
  })
  E('A', 'b', TypeError)

  t.throws(() => {
    throw error('A')
  }, {
    code: 'FOO_A'
  })
})

