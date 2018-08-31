const checkFunction = require('./checkFunction')

// function invocation metadata
module.exports = class InvocationMetadata {
  constructor (func, args, isCtor) {
    checkFunction(func, 'function object expected')
    if (!Array.isArray(args)) throw new TypeError('arguments array expected')
    if (typeof isCtor !== 'boolean') throw new TypeError('boolean isCtor expected')

    this.function = func
    this.arguments = args
    this.isConstructor = isCtor

    // make this class immutable (something more complex is needed for inheritance)
    Object.freeze(this)
  }
}
