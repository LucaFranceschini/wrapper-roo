'use strict'

const assert = require('assert')  // TODO REMOVE

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')  // load after dirty-chai
const wrap = require('./index')

const should = chai.should()  // use should-style assertions
chai.use(dirtyChai)  // lint-friendly assertions
chai.use(sinonChai)  // Sinon mocking framework

// arrows are discouraged within Mocha, use regular functions
describe('wrapPrePostHooks(func, preHook, postHook)', function () {
  // helpers and utils
  function nop () { }
  function throwError () { throw new Error() }
  function throw42 () { throw new Error(42) }
  function Box (value) { this.value = value }
  const spy = sinon.spy()

  function gimme42 () { return 42 }
  function gimmeThis () { return this }
  class Person {
    constructor (name) {
      this.name = name
    }
  }

  // make the spy reusable
  beforeEach(function () {
    spy.resetHistory()
  })

  it('should throw if preHook is not a function', function () {
    (() => wrap(nop).withPreHook('hey')).should.throw(TypeError)
  })

  it('should propagate the error if preHook throws', function () {
    wrap(nop).withPreHook(throw42).should.throw(/42/)
  })

  it('should invoke preHook exactly once', function () {
    const wrapped = wrap(nop).withPreHook(spy)
    wrapped()
    spy.should.have.been.calledOnce()
  })

  it('should throw if postHook is not a function', function () {
    (() => wrap(nop).withPostHook('ho')).should.throw(TypeError)
  })

  it('should propagate the error if postHook throws', function () {
    wrap(nop).withPostHook(throw42).should.throw(/42/)
  })

  it('should throw postHook error even if func throws', function () {
    wrap(throwError).withPostHook(throw42).should.throw(/42/)
  })

  it('should call postHook exactly once even if func throws', function () {
    const wrapped = wrap(throw42).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should call postHook exactly once even if it throws', function () {
    const spy = sinon.spy(throw42)
    const wrapped = wrap(nop).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should invoke postHook exactly once', function () {
    const wrapped = wrap(nop).withPostHook(spy)
    wrapped()
    spy.should.have.been.calledOnce()
  })

  it('should invoke postHook even when func throws', function () {
    const wrapped = wrap(throw42).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should invoke hooks and func in the right order', function () {
    const preSpy = sinon.spy()
    const postSpy = sinon.spy()
    const wrapped = wrap(spy).withPrePostHooks(preSpy, postSpy)
    wrapped()
    preSpy.should.have.been.calledImmediatelyBefore(spy)
    postSpy.should.have.been.calledImmediatelyAfter(spy)
  })

  it('should return a function', function () {
    wrap(nop).justBecause().should.be.a('function')
  })

  it('should return a different function', function () {
    wrap(nop).justBecause().should.not.equal(nop)
  })

  it('should invoke func exactly once', function () {
    const wrapped = wrap(spy).justBecause()
    wrapped()
    spy.should.have.been.calledOnce()
  })

  it('should forward arguments', function () {
    const args = [1, 2, 3]
    const wrapped = wrap(spy).justBecause()
    wrapped(...args)
    spy.should.always.have.been.calledWithExactly(...args)
  })

  it('should forward return value', function () {
    const wrapped = wrap(gimme42).justBecause()
    wrapped().should.equal(42)
  })

  it('should re-throw the same error', function () {
    wrap(throw42).justBecause().should.throw(/42/)
  })

  // default `this` binding is `undefined` in strict mode for non-arrows
  it('should preserve default this binding (undefined)', function () {
    const wrapped = wrap(gimmeThis).justBecause()
    should.equal(wrapped(), gimmeThis())
  })

  it('should preserve bind() explicit binding', function () {
    // do not bind to 'this' here, it would be the Mocha context
    // it is cyclic so not printable in case of errors
    const obj = { }
    const bound = gimmeThis.bind(obj)
    const wrapped = wrap(bound).justBecause()
    wrapped().should.equal(obj)
  })

  it('should not change constructed objects', function () {
    const Wrapped = wrap(Box).justBecause()
    new Wrapped(42).should.deep.equal(new Box(42))
  })

  it('should preserve prototype link in constructor calls', function () {
    const Wrapped = wrap(Box).justBecause()
    const box = new Wrapped(42)
    Object.getPrototypeOf(box).should.equal(Box.prototype)
  })

  it('should preserve call() explicit binding', function () {
    const wrapped = wrap(gimmeThis).justBecause()
    const obj = { }
    wrapped.call(obj).should.equal(gimmeThis.call(obj))
  })

  // vanilla functions have 'prototype' property by default
  // however some functions don't, like bound functions
  it('should not introduce prototype property', function () {
    const bound = nop.bind(null)  // bind 'this' to null, don't care
    const wrapped = wrap(bound).justBecause()
    bound.should.not.have.own.property('prototype')
    wrapped.should.not.have.property('prototype')  // not even inherited
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
    const Bound = Foo.bind(null)  // bind 'this' to null, don't care
    Bound.should.not.have.property('prototype')

    // now add a prototype property (this shouldn't happen in real code...)
    Bound.prototype = { }
    // note that this has nothing to do with the original one
    Bound.prototype.should.not.equal(Foo.prototype)

    // new objects should get the original prototype, not the bound one
    let prototype = Object.getPrototypeOf(new Bound())
    prototype.should.equal(Foo.prototype)
    prototype.should.not.equal(Bound.prototype)

    // and the same happens with the wrapper
    const Wrapped = wrap(Bound).justBecause()
    prototype = Object.getPrototypeOf(new Wrapped())
    prototype.should.equal(Foo.prototype)
    prototype.should.not.equal(Bound.prototype)
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
    const WrappedPair = wrap(Pair).justBecause()
    const WrappedPair42 = wrap(Pair42).justBecause()

    new Pair(42, 'foo').should.deep.equal(new Pair42('foo'))
    new WrappedPair(42, 'foo').should.deep.equal(new WrappedPair42('foo'))
    new Pair42('foo').should.deep.equal(new WrappedPair42('foo'))
  })

  it('should preserve function name', function () {
    wrap(nop).justBecause().name.should.equal(nop.name)
  })

  it('should preserve number of expected arguments', function () {
    // wrap a function with a number of arguments > 0 not to involve defaults
    wrap(Box).justBecause().length.should.equal(Box.length)
  })

  it('should preserve prototype property', function () {
    wrap(Box).justBecause().prototype.should.equal(Box.prototype)
  })

  it('should preserve the internal prototype', function () {
    // change prototype and check if it is preserved
    // (otherwise all functions use the same one)
    function foo () { }
    Object.setPrototypeOf(foo, { })

    const wrapped = wrap(foo).justBecause()
    const originalProto = Object.getPrototypeOf(foo)
    const wrappedProto = Object.getPrototypeOf(wrapped)
    wrappedProto.should.equal(originalProto)
  })

  /* The following tests only look at own properties because inherited ones are
   * handled by copying the internal prototype. Also, descriptor flags are set
   * to non-default values to do more meaningful tests.
   */

  it('should copy own property data descriptors', function () {
    function foo () { }
    const descriptor = {
      configurable: true,
      enumerable: true,
      value: 42,
      writable: true
    }
    Object.defineProperty(foo, 'bar', descriptor)
    wrap(foo).justBecause().should.have.ownPropertyDescriptor('bar', descriptor)
  })

  it('should preserve prototype descriptors list', function () {
    const originalDescriptors = Object.getOwnPropertyDescriptors(nop)
    const wrappedDescriptors = Object.getOwnPropertyDescriptors(wrap(nop).justBecause())
    wrappedDescriptors.should.deep.equal(originalDescriptors)
  })

  it('should work with getters', function () {
    function idiot () { }
    Object.defineProperty(idiot, 'name', { get: () => 'luca' })
    wrap(idiot).justBecause().name.should.equal(idiot.name)
  })

  it('should work with setters', function () {
    function idiot () { }
    Object.defineProperty(idiot, 'name', {
      get: function () { return this._name },
      set: function (name) { return (this._name = name) }
    })
    const wrapped = wrap(idiot).justBecause()
    wrapped.name = 'Forrest'
    ;(wrapped.name).should.equal('Forrest')
  })

  it('should work with arrow functions', function () {
    const double = n => n * 2
    const wrapped = wrap(double).justBecause()
    wrapped(42).should.equal(84)
  })

  it('should throw when using arrows as constructors', function () {
    const Wrapped = wrap(() => { }).justBecause()
    ;(() => new Wrapped()).should.throw(TypeError)
  })

  it('should work with default parameter values', function () {
    function argOr42 (arg = 42) { return arg }
    const wrapped = wrap(argOr42).justBecause()
    wrapped().should.equal(42)
    wrapped(7).should.equal(7)
  })

  it('should work when func is a class (constructor)', function () {
    const WrappedPerson = wrap(Person).justBecause()
    assert.deepStrictEqual(new Person('alonzo'), new WrappedPerson('alonzo'))
  })

  it('should throw when func is a class but new is not used', function () {
    const WrappedPerson = wrap(Person).justBecause()
    assert.throws(() => WrappedPerson('haskell'), TypeError)
  })

  it('should work with class inheritance', function () {
    class FullNamePerson extends Person {
      constructor (firstName, lastName) {
        super(firstName + ' ' + lastName)
      }
    }
    const WrappedFullNamePerson = wrap(FullNamePerson).justBecause()
    assert.strictEqual(new WrappedFullNamePerson('ada', 'lovelace').name,
                       new Person('ada lovelace').name)
  })

  it('should preserve class static methods', function () {
    class NiceGuy {
      static sayHi () { return 'hi' }
    }
    const WrappedNiceGuy = wrap(NiceGuy).justBecause()
    assert.strictEqual(WrappedNiceGuy.sayHi(), 'hi')
  })

  it('should preserve Symbol properties of func', function () {
    function foo () { }
    const symbol = Symbol('shh')
    foo[symbol] = 'top secret'
    const wrapped = wrap(foo).justBecause()
    assert.strictEqual(wrapped[symbol], foo[symbol])
  })

  it('should work with generator functions', function () {
    // start inclusive, end exclusive
    function * range (start, end) {
      while (start < end) yield start++
    }
    let sum = 0
    const wrappedRange = wrap(range).justBecause()
    for (const i of wrappedRange(1, 4)) sum += i
    assert.strictEqual(sum, 6)
  })

  it('should preserve non-constructibility', function () {
    // since ES7 generators are not constructible
    function * gen () { }
    const Wrapped = wrap(gen).justBecause()
    assert(() => new Wrapped(), TypeError)
  })

  it('should preserve new.target', function () {
    function someConstructor () { }
    const WrappedArray = wrap(Array).justBecause()
    // use the given constructor but inherit from (Wrapped)Array
    const object = Reflect.construct(WrappedArray, [], someConstructor)
    assert.strictEqual(Object.getPrototypeOf(object),
                       someConstructor.prototype)
    assert(Array.isArray(object))
  })
})
