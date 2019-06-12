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

- supports to define error codes and messages in advance before use.
- provides cleaned error stack and we can manage the stack sanitizer by using [`error-stack`](https://github.com/kaelzhang/error-stack) (since 5.1.0)

## Why

Tired writing code like this:

```js
const error = new SomeError('message')
error.code = 'SOME_ERROR'
```

There are tremendous modules about custom errors in the NPM, but NONE of those is usable.

## Install

```sh
$ npm i err-object
```

## Usage

```js
import {error} from 'err-object'
const message = 'message'

error(message)
// Error
// - message

error({
  message,
  name: 'ImplementError',
  code: 'ERR_IMPL'
})
// Error
// - message
// - name: 'ImplementError'
// - code: 'ERR_IMPL'

error(message, TypeError)
// TypeError
// - message
```

### Creates error templates to manage multiple error types

We could use this to standardize the error objects of the whole project.

```js
import {
  Errors,
  error as _error
} from 'err-object'
import util from 'util'

const {E, error, i18n} = new Errors()

// Error code, and message
E('ERR_NO_PERMISSION', 'you do not have permission to do this')

E('ERR_INVALID_TYPE', 'number expected but got %s', TypeError)
// Which is equivalent to:

// Error code
E('ERR_INVALID_TYPE', {
  // Custom error type
  ctor: TypeError,
  // Message template which will be formatted by `util.format`
  message: 'number expected but got %s'
})

// The equivalent default factory
const factory = ({code, preset, args, _}) => {
  const {
    ctor = Error,
    message: messageTemplate,
    ...others
  } = preset

  const message = util.format(_(messageTemplate), ...args)
  return _error({
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

## error(thing, ctor)

- **thing** `String|Object`
- **ctor** `Class=Error`

## new Errors(options)

- **options?** `Object`
  - **factory?** `Function(code, preset, ...args)` the default error factory (the default value please see above)
  - **notDefined?** `Function(code, ...args)=exitOnNotDefined` will create the error object if the given `code` is not defined by `error.E`. Since `5.0.0`, if the given error code is not defined by `error.E`, it will throw an error and exit the current process.
  - ~~**prefix?** `string`~~ Deprecated in `4.4.0`
  - **messagePrefix?** `string` the message prefix for every error message. New in `4.4.0`
  - **codePrefix?** `string` the code prefix. New in `4.4.0`
  - **filterStackSources?** `Array<path>=[]` defines source paths to be filtered out from error stacks. New in `5.1.0`

### error.E(code, preset, factory)
### error.E(code, template, ctor)

Define an error preset.

- **code** `string` define the error code
- **preset** `?Object`
  - **ctor** `?Error=Error` the constructor of the error
  - **template** `?(string | Function(...args))` the message template which will be formatted by `util.format()`
  - other property/properties that you want to add to the error object.
- **factory** `?Function({code, preset, args, _})` the error factory
  - **_** `?Function=(x=>x)` the `i18nConverter` function which defaults to the function that just returns the argument.

Returns `this`

### error.TE(code, template)

> new in `4.5.0`

Define a TypeError, in favor of using `new TypeError('should be ..., but got `something`')`

```js
const {error, TE} = new Errors()

TE('INVALID_OPTIONS', 'options must be an object')

throw error('INVALID_OPTIONS', undefined)
// TypeError: options must be an object, but got `undefined`
```

### error.i18n(i18nConverter)

- **i18nConverter** `Function(string): string`

Specify the i18n mapping function which receives the message template and returns the converted message template.

Returns `this`

### error.error(code, ...args)

Creates a standard error object by code.

- **code**
- **args** `Array<any>` which will be passed and spreaded into `factory` after the `code` and the `preset` parameters.

Returns `Error` And if a given `code` is not defined by `error.E()`, the return value will be `notDefined(code, ...args)`

## message prefix

```js
const {E, error} = new Errors({
  messagePrefix: '[err-object] ',
  codePrefix: 'CORE_'
})

E('FATAL_ERROR', 'this is a fatal error')

const err = error('FATAL_ERROR')

console.log(err.message)
// [err-object] this is a fatal error
// - code: 'CORE_FATAL_ERROR'
```

### options.filterStackSources

/path/to/a.js (before):

```js
const {error, E} = new Error()
E('FOO', 'bar')
module.exports = code => error(code)
```

/path/to/b.js
```js
const error = require('./a')
const err = error('FOO')

console.log(err.stack)
// Error: bar
//     at Object.<anonymous> (/path/to/a.js:3:1)
//     at error (/path/to/b.js:2:13)
//     ...
```

Let's take a look at the error stack above, the `/path/to/a.js` line is actually useless.

Then how to get rid of the first stack trace line? We can use `options.filterStackSources`

/path/to/a.js (after):

```js
const {error, E} = new Error({
  filterStackSources: [
    // Filter out the current source file
    __filename
  ]
})
E('FOO', 'bar')
module.exports = code => error(code)
```

Then,

```js
console.log(err.stack)
// Error: bar
//     at error (/path/to/b.js:2:13)
//     ...
```

## License

MIT
