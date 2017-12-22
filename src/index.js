import util from 'util'

const error = (thing, Ctor = Error) => {
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

  const message = util.format(messageTemplate, ...args)
  return err({
    ...others,
    code,
    message
  }, Error)
}

const _notDefined = (code, message = '') => err({
  code,
  message
})

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
  }

  E (code, preset, factory) {
    this._errors[code] = [preset, factory || this._factory]
    return this
  }

  error (code, ...args) {

  }
}
