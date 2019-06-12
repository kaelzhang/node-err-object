const {Errors} = require('..')

const {error, E} = new Errors({
  filterStackSources: [
    __filename
  ]
})

E('A', 'foo')

module.exports = (...args) => error(...args)
