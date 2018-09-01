const checkFunction = require('./checkFunction')

// function invocation metadata
module.exports = class InvocationMetadata {
  constructor (func, args, ctor) {
    checkFunction(func, 'function object expected')
    if (!Array.isArray(args)) throw new TypeError('arguments array expected')
    if (ctor !== undefined) checkFunction(ctor, 'function constructor expected')

    this.function = func // this is the original function to be wrapped
    this.arguments = args
    this.constructor = ctor

    // make this class immutable (something more complex is needed for inheritance)
    Object.freeze(this)
  }
}
