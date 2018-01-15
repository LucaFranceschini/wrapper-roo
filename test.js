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
  const spy = sinon.spy()

  function gimme42 () { return 42 }
  function gimmeThis () { return this }
  function Box (value) { this.value = value }
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

  it('should not introduce prototype property', function () {
    const bound = nop.bind(null)  // bind 'this' to null, don't care
    const wrapped = wrap(bound).justBecause()
    // bound functions have no 'prototype' property
    bound.should.not.have.own.property('prototype')
    // thus it should not be in the wrapped bound function (not even inherited)
    wrapped.should.not.have.property('prototype')
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
    Foo.prototype.bar = 'baz'
    const Bound = Foo.bind(null)
    assert(!Object.getOwnPropertyNames(Bound).includes('prototype'))
    Bound.prototype = { }
    const Wrapped = wrap(Bound).justBecause()
    assert.strictEqual(new Bound().bar, 'baz')
    assert.strictEqual(new Wrapped().bar, 'baz')
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

    assert.deepStrictEqual(new Pair(42, 'foo'), new Pair42('foo'))
    assert.deepStrictEqual(new WrappedPair(42, 'foo'),
                           new WrappedPair42('foo'))
    assert.deepStrictEqual(new Pair42('foo'), new WrappedPair42('foo'))
    // the other combination does not involve explicit binding
  })

  it('should preserve function name', function () {
    const wrapped = wrap(gimme42).justBecause()
    assert.strictEqual(wrapped.name, gimme42.name)
  })

  it('should preserve number of expected arguments', function () {
    // wrap a function with a number of arguments > 0
    const wrapped = wrap(Box).justBecause()
    assert.strictEqual(wrapped.length, Box.length)
  })

  it('should preserve Function.prototype property', function () {
    // change default prototype property
    const myPrototype = {}
    function foo () { }
    foo.prototype = myPrototype

    const wrapped = wrap(foo).justBecause()
    assert.strictEqual(wrapped.prototype, foo.prototype)
  })

  it('should preserve the internal prototype', function () {
    // change prototype and check if it is preserved
    const myPrototype = {}
    function foo () { }
    Object.setPrototypeOf(foo, myPrototype)

    const wrapped = wrap(foo).justBecause()
    const originalProto = Object.getPrototypeOf(foo)
    const wrappedProto = Object.getPrototypeOf(wrapped)
    assert.strictEqual(originalProto, wrappedProto)
  })

  // this also checks for properties whose key is a Symbol
  it('should copy all own properties', function () {
    // wrap a function with a number of arguments > 0 to avoid default
    const wrapped = wrap(Box).justBecause()
    const originalDescriptors = Object.getOwnPropertyDescriptors(Box)
    const wrappedDescriptors = Object.getOwnPropertyDescriptors(wrapped)
    assert.deepStrictEqual(originalDescriptors, wrappedDescriptors)
  })

  it('should work with getters', function () {
    const idiot = { get name () { return 'luca' } }
    const descriptor = Object.getOwnPropertyDescriptor(idiot, 'name')
    descriptor.get = wrap(descriptor.get).justBecause()
    assert.strictEqual(idiot.name, 'luca')
  })

  it('should work with setters', function () {
    const idiot = {
      set name (name) { this._name = name },
      get name () { return this._name }
    }
    const descriptor = Object.getOwnPropertyDescriptor(idiot, 'name')
    descriptor.set = wrap(descriptor.set).justBecause()
    idiot.name = 'luca'
    assert.strictEqual(idiot._name, 'luca')
  })

  it('should work with arrow functions', function () {
    const double = n => n * 2
    const wrapped = wrap(double).justBecause()
    assert.strictEqual(wrapped(42), 84)
  })

  it('should throw when using arrows as constructors', function () {
    const Wrapped = wrap(() => { }).justBecause()
    assert.throws(() => new Wrapped(), TypeError)
  })

  it('should preserve default parameter values', function () {
    function argOr42 (arg = 42) { return arg }
    const wrapped = wrap(argOr42).justBecause()
    assert.strictEqual(wrapped(), 42)
    assert.strictEqual(wrapped(7), 7)
  })

  it('should preserve rest parameters', function () {
    const args = [1, 2, 3]
    function gimmeRestArgs (...a) { return a }
    const wrapped = wrap(gimmeRestArgs).justBecause()
    assert.deepStrictEqual(wrapped(...args), args)
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
