import test from 'ava'
import err, {Errors} from '../src'

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
    () => err({message: 'foo bar', code: 'D'}, TypeError)],
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

  i18n({
    'foo %s': 'fake foo'
  })

  const e = error('A', 'bar')
  t.is(e.message, 'fake foo bar', 'message')
})
