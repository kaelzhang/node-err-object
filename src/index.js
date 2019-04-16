import util from 'util'

export const error = (thing, Ctor = Error) => {
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

function _factory ({
  _,
  code,
  preset,
  args
}) {
  const {
    ctor = Error,
    message: messageTemplate,
    ...others
  } = preset

  const message = typeof messageTemplate === 'function'
    ? messageTemplate(...args)
    : util.format(_(messageTemplate), ...args)

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

const JUST_RETURN = s => s

export const exitOnNotDefined = code => {
  /* istanbul ignore next */
  throw error(`[err-object] code "${code}" is not defined`)
  /* istanbul ignore next */
  process.exit(1)
}

export class Errors {
  constructor ({
    factory,
    notDefined,
    i18n = JUST_RETURN
  } = {}) {
    this._errors = Object.create(null)
    this.E = this.E.bind(this)
    this.error = this.error.bind(this)
    this.i18n = this.i18n.bind(this)
    this._factory = factory || _factory
    this._notDefined = notDefined || _notDefined
    this._ = i18n

    checkFunction(this._factory, 'factory')
    checkFunction(this._notDefined, 'notDefined')
  }

  i18n (__) {
    this._ = __
    return this
  }

  E (code, preset = {}, factory) {
    if (typeof preset === 'string') {
      return this.E(code, {
        message: preset,
        ctor: factory || Error
      })
    }

    factory = factory || this._factory

    checkFunction(factory, 'factory')

    this._errors[code] = [preset, factory]
    return this
  }

  error (code, ...args) {
    if (code in this._errors) {
      const [preset, factory] = this._errors[code]
      const {_} = this

      return factory({
        _,
        code,
        preset,
        args
      })
    }

    return this._notDefined(code, ...args)
  }
}
