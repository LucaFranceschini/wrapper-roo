'use strict'

const checkFunction = require('./checkFunction')

// function invocation metadata
module.exports = class InvocationData {
  constructor (func, args, ctor, dis, bound) {
    checkFunction(func, 'function object expected')
    if (!Array.isArray(args)) throw new TypeError('arguments array expected')
    if (ctor !== undefined) checkFunction(ctor, 'function constructor expected')
    checkFunction(bound, 'bound function object expected')

    defineImmutableProperty(this, 'function', func) // this is the original function to be wrapped
    defineImmutableProperty(this, 'arguments', args)
    defineImmutableProperty(this, 'constructor', ctor)
    defineImmutableProperty(this, 'this', dis)
    defineImmutableProperty(this, 'boundFunction', bound)
  }
}

function defineImmutableProperty (object, key, value) {
  Object.defineProperty(object, key, {
    value: value,
    writable: false,
    configurable: false
  })
}
