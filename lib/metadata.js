'use strict'

const checkFunction = require('./checkFunction')

// function invocation metadata
module.exports = class InvocationData {
  constructor (func, args, ctor, dis, bound) {
    checkFunction(func, 'function object expected')
    if (!Array.isArray(args)) throw new TypeError('arguments array expected')
    if (ctor !== undefined) checkFunction(ctor, 'function constructor expected')
    checkFunction(bound, 'bound function object expected')

    this.function = func // this is the original function to be wrapped
    this.arguments = args
    this.constructor = ctor
    this.this = dis
    this.boundFunction = bound
  }
}
