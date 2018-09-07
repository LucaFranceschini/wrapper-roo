'use strict'

const { nop, wrap } = require('./setup')

/* The following tests only look at own properties because inherited ones are
 * handled by copying the internal prototype. Also, descriptor flags are set
 * to non-default values to do more meaningful tests.
 */
describe('Function object properties', function () {
  function unary (_arg) { }

  it('should preserve function name', function () {
    wrap.the(nop).name.should.equal(nop.name)
  })

  it('should preserve number of expected arguments', function () {
    // wrap a function with a number of arguments > 0 not to involve defaults
    wrap.the(unary).length.should.equal(unary.length)
  })

  it('should preserve prototype property', function () {
    wrap.the(unary).prototype.should.equal(unary.prototype)
  })

  it('should copy own property data descriptors', function () {
    function foo () { }
    const descriptor = {
      configurable: true,
      enumerable: true,
      value: 42,
      writable: true
    }
    Object.defineProperty(foo, 'bar', descriptor)
    wrap.the(foo).should.have.ownPropertyDescriptor('bar', descriptor)
  })

  it('should preserve prototype descriptors list', function () {
    // Object.getOwnPropertyDescriptors was introduced in ES8
    if (Object.getOwnPropertyDescriptors) {
      const originalDescriptors = Object.getOwnPropertyDescriptors(nop)
      const wrappedDescriptors = Object.getOwnPropertyDescriptors(wrap.the(nop))
      wrappedDescriptors.should.deep.equal(originalDescriptors)
    }
  })

  it('should work with getters', function () {
    function idiot () { }
    Object.defineProperty(idiot, 'name', { get: () => 'luca' })
    wrap.the(idiot).name.should.equal(idiot.name)
  })

  it('should work with setters', function () {
    function idiot () { }
    Object.defineProperty(idiot, 'name', {
      get: function () { return this._name },
      set: function (name) { return (this._name = name) }
    })
    const wrapped = wrap.the(idiot)
    wrapped.name = 'forrest'
    ;(wrapped.name).should.equal('forrest')
  })

  it('should preserve Symbol properties of func', function () {
    function foo () { }
    const symbol = Symbol('shh')
    foo[symbol] = 'top secret'
    const wrapped = wrap.the(foo)
    wrapped[symbol].should.equal(foo[symbol])
  })

  // vanilla functions have 'prototype' property by default
  // however some functions don't, like bound functions
  it('should not introduce prototype property', function () {
    const bound = nop.bind(null) // bind 'this' to null, don't care
    const wrapped = wrap.the(bound)
    bound.should.not.have.own.property('prototype')
    wrapped.should.not.have.property('prototype') // not even inherited
  })

  it('should preserve the internal prototype', function () {
    // change prototype and check if it is preserved
    // (otherwise all functions use the same one)
    function foo () { }
    Object.setPrototypeOf(foo, { })
    wrap.the(foo).should.have.prototype(Object.getPrototypeOf(foo))
  })
})
