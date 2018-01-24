[![Build Status](https://travis-ci.org/kaelzhang/node-err-object.svg?branch=master)](https://travis-ci.org/kaelzhang/node-err-object)
[![Coverage](https://codecov.io/gh/kaelzhang/node-err-object/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/node-err-object)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/node-err-object?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/node-err-object)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/err-object.svg)](http://badge.fury.io/js/err-object)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/err-object.svg)](https://www.npmjs.org/package/err-object)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/node-err-object.svg)](https://david-dm.org/kaelzhang/node-err-object)
-->

# err-object

Custom error object.

Tired writing code like this:

```js
const error = new SomeError('message')
error.code = 'SOME_ERROR'
```

There are tremendous modules about custom errors in the NPM, but NONE of those could be usable.

## Install

```sh
$ npm install err-object
```

## Usage

```js
import err from 'err-object'
const message = 'message'

err(message)
// Error
// - message

err({
  message,
  name: 'ImplementError',
  code: 'ERR_IMPL'
})
// Error
// - message
// - name: 'ImplementError'
// - code: 'ERR_IMPL'

err(message, TypeError)
// TypeError
// - message
```

### Creates error templates to manage multiple error types

We could use this to standardize the error objects of the whole project.

```js
import err, {Errors} from 'err-object'
import util from 'util'

const {E, error, i18n} = new Errors()

// Error code, and message
E('ERR_NO_PERMISSION', 'you do not have permission to do this')

// Error code
E('ERR_INVALID_TYPE', {
  // Custom error type
  ctor: TypeError,
  // Message template which will be formatted by `util.format`
  message: 'number expected but got %s'
})

const factory = (code, preset, ...args) => {
  const {
    ctor = Error,
    message: messageTemplate,
    ...others
  } = preset

  const message = util.format(messageTemplate, ...args)
  return err({
    ...others,
    code,
    message,
    args
  }, Error)
}

E('ERR_INVALID_TYPE_2', {
  // Custom error type
  ctor: TypeError,
  // Message template which will be formatted by `util.format`
  message: 'number expected but got %s'

// We can define our custom error factory,
// and the default error factory is:
}, factory)

error('ERR_NO_PERMISSION')
// Error
// - code: 'ERR_NO_PERMISSION'
// - message: 'you do not have permission to do this'

error('ERR_INVALID_TYPE', 'string')
// TypeError
// - code: 'ERR_INVALID_TYPE'
// - message: 'number expected but got string'
// - args: ['string']

error('ERR_INVALID_TYPE_2', 'string')
// The same return value of the last statement

// The constructor `Errors` accepts a `options.factory` parameter,
// to define the default error factory.
// And so the following statement is equivalent to `new Errors()`
new Errors({
  factory
})

const ZH_CN_MAP = {
  'number expected but got %s': '期望 number 类型但实际为 %s'
}

i18n(message => ZH_CN_MAP[message] || message)

error('ERR_INVALID_TYPE', 'string')
// TypeError
// - code: 'ERR_INVALID_TYPE'
// - message: '期望 number 类型但实际为 string'
// - args: ['string']
```

## err(thing, ctor)

- **thing** `String|Object`
- **ctor** `Class=Error`

## new Errors(options)

- **options** `?Object`
  - **factory** `?Function(code, preset, ...args)` the default error factory (the default value please see above)
  - **notDefined** `?Function(code, ...args)` will create the error object if the given `code` is not defined.

### error.E(code, preset, factory)

Define an error preset.

- **code** `string` define the error code
- **preset** `?Object`
  - **ctor** `?Error=Error` the constructor of the error
  - **template** `?(string | Function(...args))` the message template which will be formatted by `util.format()`
  - other property/properties that you want to add to the error object.
- **factory** `?Function(code, preset, ...args)` the error factory

Returns `this`

### error.i18n(i18nConverter)

- **i18nConverter** `Function(string): string`

Specify the i18n mapping function which receives the message template and returns the converted message template.

Returns `this`

### error.error(code, ...args)

Creates a standard error object by code.

- **code**
- **args** `Array<any>` which will be passed and spreaded into `factory` after the `code` and the `preset` parameters.

Returns `Error` And if a given `code` is not defined by `error.E()`, the return value will be `notDefined(code, ...args)`

## License

MIT
