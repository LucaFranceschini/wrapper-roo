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

  // only one between exception and result should be defined
  // don't give the same name to fields and setters, it leads to infinite recursion

  set result (res) {
    if (this.hasOwnProperty('_exception')) throw new Error('cannot set both result and exception')
    this._result = res
  }
  get result () { return this._result }

  set exception (e) {
    if (this.hasOwnProperty('_result')) throw new Error('cannot set both result and exception')
    this._exception = e
  }
  get exception () { return this._exception }
}
