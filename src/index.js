const util = require('util')
const parse = require('error-stack')

const cleanStack = (err, pathsToFilter = []) => {
  pathsToFilter = pathsToFilter.concat(__filename)

  const {stack} = err
  const parsed = parse(stack)
  .filter(({source}) => !pathsToFilter.includes(source))

  err.stack = parsed.format()
  return err
}

const createError = (thing, Ctor = Error) => {
  if (typeof thing === 'string') {
    return new Ctor(thing)
  }

  const {
    message,
    ...others
  } = thing

  const err = new Ctor(message)
  Object.assign(err, others)
  return err
}

const error = (...args) => {
  const err = createError(...args)
  return cleanStack(err)
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

const checkFunction = (subject, name) => {
  if (typeof subject !== 'function') {
    throw error(`[err-object] ${name} must be a function`, TypeError)
  }
}

const JUST_RETURN = s => s

const exitOnNotDefined = code => {
  const err = error(`[err-object] code "${code}" is not defined`)
  err.code = 'ERROR_CODE_NOT_DEFINED'

  /* istanbul ignore next */
  throw err
  /* istanbul ignore next */
  process.exit(1)
}

const BUT_GOT = ', but got `%s`'

class Errors {
  constructor ({
    factory,
    notDefined,
    i18n = JUST_RETURN,
    prefix,
    codePrefix,
    messagePrefix = prefix,
    filterStackSources = []
  } = {}) {
    this._errors = Object.create(null)

    this._factory = factory || _factory
    this._notDefined = notDefined || exitOnNotDefined
    this._ = i18n
    this._messagePrefix = messagePrefix
    this._codePrefix = codePrefix
    this._filterStackSources = filterStackSources

    checkFunction(this._factory, 'factory')
    checkFunction(this._notDefined, 'notDefined')

    this.E = this.E.bind(this)
    this.TE = this.TE.bind(this)
    this.error = this.error.bind(this)
    this.i18n = this.i18n.bind(this)
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

    if (this._messagePrefix && preset.message) {
      preset.message = this._messagePrefix + preset.message
    }

    code = this._decorateCode(code)

    checkFunction(factory, 'factory')

    this._errors[code] = [preset, factory]
    return this
  }

  TE (code, message) {
    this.E(code, message + BUT_GOT, TypeError)
    return this
  }

  _decorateCode (code) {
    return this._codePrefix
      ? this._codePrefix + code
      : code
  }

  _create (code, ...args) {
    code = this._decorateCode(code)

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

  error (...args) {
    const err = this._create(...args)
    return cleanStack(err, this._filterStackSources)
  }
}

module.exports = {
  Errors,
  error
}
