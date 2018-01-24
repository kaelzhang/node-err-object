const util = require('util')

const error = module.exports = (thing, Ctor = Error) => {
  if (typeof thing === 'string') {
    return new Ctor(thing)
  }

  const {
    message,
    ...others
  } = thing

  const error = new Ctor(message)
  Object.assign(error, others)
  return error
}

const _factory = (e, code, preset, ...args) => {
  const {
    ctor = Error,
    message: messageTemplate,
    ...others
  } = preset

  const message = typeof messageTemplate === 'function'
    ? messageTemplate(...args)
    : util.format(e(messageTemplate), ...args)

  return error({
    ...others,
    code,
    message,
    args
  }, ctor)
}

const _notDefined = (code, message = '') => error({
  code,
  message
})

const checkFunction = (subject, name) => {
  if (typeof subject !== 'function') {
    throw error(`${name} must be a function`, TypeError)
  }
}

const _KEY_I18N = 'err-object:i18n'
const KEY_I18N = typeof Symbol === 'undefined'
  ? _KEY_I18N
  : Symbol(_KEY_I18N)

error.Errors = class {
  constructor ({
    factory,
    notDefined
  } = {}) {
    this._errors = Object.create(null)
    this.E = this.E.bind(this)
    this.error = this.error.bind(this)
    this.i18n = this.i18n.bind(this)
    this._factory = factory || _factory
    this._notDefined = notDefined || _notDefined
    this._language = null

    checkFunction(this._factory, 'factory')
    checkFunction(this._notDefined, 'notDefined')
  }

  [KEY_I18N] (x) {
    return x
  }

  i18n (__) {
    this[KEY_I18N] = __
    return this
  }

  E (code, preset = {}, factory) {
    factory = factory || this._factory

    checkFunction(factory, 'factory')

    this._errors[code] = [preset, factory]
    return this
  }

  error (code, ...args) {
    if (code in this._errors) {
      const [preset, factory] = this._errors[code]
      return factory(this[KEY_I18N], code, preset, ...args)
    }

    return this._notDefined(code, ...args)
  }
}
