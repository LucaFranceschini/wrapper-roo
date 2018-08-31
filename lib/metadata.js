const checkFunction = require('./checkFunction')

// function invocation metadata
module.exports = class InvocationMetadata {
  constructor (func, args, newTarget) {
    checkFunction(func, 'function object expected')
    if (!Array.isArray(args)) throw new TypeError('arguments array expected')
    if (newTarget !== undefined) checkFunction(newTarget, 'function constructor expected')

    this.function = func
    this.arguments = args
    this.constructor = newTarget

    // make this class immutable (something more complex is needed for inheritance)
    Object.freeze(this)
  }
}
