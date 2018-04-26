const checkFunction = require('./checkFunction')

// function invocation metadata
module.exports = class Metadata {
  constructor (func, args) {
    checkFunction(func, 'function object expected')
    if (!Array.isArray(args)) throw new TypeError('arguments array expected')

    this.function = func
    this.arguments = args
  }
}
