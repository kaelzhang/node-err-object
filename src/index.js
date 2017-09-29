export default (thing, Ctor = Error) => {
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
