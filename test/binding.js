'use strict'

import { expect, wrap } from './setup.js'

describe('Binding', function () {
  function gimmeThis () { return this }

  // default `this` binding is `undefined` in strict mode for non-arrows
  it('should preserve default this binding (undefined)', function () {
    const wrapped = wrap.the(gimmeThis)
    expect(wrapped()).to.equal(gimmeThis())
  })

  it('should preserve bind() explicit binding', function () {
    // do not bind to 'this' here, it would be the Mocha context
    // it is cyclic so not printable in case of errors
    const obj = { }
    const bound = gimmeThis.bind(obj)
    const wrapped = wrap.the(bound)
    wrapped().should.equal(obj)
  })

  it('should preserve call() explicit binding', function () {
    const wrapped = wrap.the(gimmeThis)
    const obj = { }
    wrapped.call(obj).should.equal(gimmeThis.call(obj))
  })

  /* This is seriously evil...
   * Bound functions have no 'prototype' property by default. When they are
   * used in constructor calls, the 'prototype' property of the bound
   * functions is used. A bad man could add a 'prototype' function to the
   * bound function...
   * This means that checking existence of such property is not a reliable way
   * to detect bound functions.
   * Note: we're not talking about the internal [[Prototype]].
   */
  it('should preserve constructor behavior of bound functions', function () {
    function Foo () { }
    const Bound = Foo.bind(null) // bind 'this' to null, don't care
    Bound.should.not.have.property('prototype')

    // now add a prototype property (this shouldn't happen in real code...)
    Bound.prototype = { }
    // note that this has nothing to do with the original one
    Bound.prototype.should.not.equal(Foo.prototype)

    // new objects should get the original prototype, not the bound one
    new Bound().should.have.prototype(Foo.prototype)
    new Bound().should.not.have.prototype(Bound.prototype)

    // and the same happens with the wrapper
    const Wrapped = wrap.the(Bound)
    new Wrapped().should.have.prototype(Foo.prototype)
    new Wrapped().should.not.have.prototype(Bound.prototype)
  })

  it('should allow partial application with Function.bind', function () {
    function Pair (a, b) {
      this.a = a
      this.b = b
    }

    // don't care about 'this' here, just fix first argument
    // 'this' will be overridden by constructor call anyway
    const Pair42 = Pair.bind(null, 42)

    // wrap both
    const WrappedPair = wrap.the(Pair)
    const WrappedPair42 = wrap.the(Pair42)

    new Pair(42, 'foo').should.deep.equal(new Pair42('foo'))
    new WrappedPair(42, 'foo').should.deep.equal(new WrappedPair42('foo'))
    new Pair42('foo').should.deep.equal(new WrappedPair42('foo'))
  })

  it('should be bindable after wrapping', function () {
    // exploit both 'this' binding and (partial) argument binding
    function thisPlusArgs (a, b) { return this + a + b }
    thisPlusArgs.bind(3, 2)(1).should.equal(6)
    wrap.the(thisPlusArgs).bind(3, 2)(1).should.equal(6)
  })
})
