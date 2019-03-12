const parserOpts = {
  // Allow returns in the module
  allowReturnOutsideFunction: true
}

const node = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          node: true
        }
      }
    ]
  ]
}

const es5 = {
  presets: ['@babel/preset-env']
}

module.exports = api => {
  api.cache(true)

  return {
    parserOpts,
    env: {
      node,
      es5
    }
  }
}
