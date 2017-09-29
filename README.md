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

## License

MIT
