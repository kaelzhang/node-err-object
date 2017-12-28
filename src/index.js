const util = require('util')

const error = module.exports = (thing, Ctor = Error) => {
  if (typeof thing === 'string') {
    return new Ctor(thing)
  }

  const {
    message,
    ...options
  } = thing

  const error = new Ctor(message)
  Object.assign(error, options)
  return error
}

const _factory = (code, preset, ...args) => {
  const {
    ctor = Error,
    message: messageTemplate,
    ...others
  } = preset

  const message = typeof messageTemplate === 'function'
    ? messageTemplate(...args)
    : util.format(messageTemplate, ...args)

  return error({
    ...others,
    code,
    message
  }, ctor)
}

const _notDefined = (code, message = '') => err({
  code,
  message
})

const checkFunction = (subject, name) => {
  if (typeof subject !== 'function') {
    throw error(`${name} must be a function`, TypeError)
  }
}

error.Errors = class {
  constructor ({
    factory,
    notDefined
  } = {}) {
    this._errors = Object.create(null)
    this.E = this.E.bind(this)
    this.error = this.error.bind(this)
    this._factory = factory || _factory
    this._notDefined = notDefined || _notDefined

    checkFunction(this._factory, 'factory')
    checkFunction(this._notDefined, 'notDefined')
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
      return factory(code, preset, ...args)
    }

    return this._notDefined(code, ...args)
  }
}
