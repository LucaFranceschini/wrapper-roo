'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')  // load after dirty-chai
const wrap = require('./index')

const should = chai.should()  // use should-style assertions
chai.use(dirtyChai)  // lint-friendly assertions
chai.use(sinonChai)  // Sinon mocking framework

// ad-hoc assertion to check prototypes
chai.use(function (_chai, utils) {
  _chai.Assertion.addMethod('prototype', function (expected) {
    const found = Object.getPrototypeOf(this._obj)

    this.assert(
      found === expected,
      // normal and negated assertion message, respectively
      'expected #{this} to have prototype #{exp} but got #{act}',
      'expected #{this} to not have prototype #{act}',
      expected,
      found
    )
  })
})

// arrows are discouraged within Mocha, use regular functions
describe('wrapper', function () {
  // helpers and utils

  function nop () { }
  function throw42 () { throw new Error(42) }
  function Box (value) { this.value = value }
  function gimmeThis () { return this }

  const spy = sinon.spy()

  class Person {
    constructor (name) {
      this.name = name
    }
  }

  it('should return a function', function () {
    wrap.the(nop).should.be.a('function')
  })

  it('should return a different function', function () {
    wrap.the(nop).should.not.equal(nop)
  })

  it('should forward arguments', function () {
    const args = [1, 2, 3]
    const wrapped = wrap.the(spy)
    wrapped(...args)
    spy.should.always.have.been.calledWithExactly(...args)
  })

  it('should forward return value', function () {
    const wrapped = wrap.the(() => 42)
    wrapped().should.equal(42)
  })

  it('should re-throw the same error', function () {
    wrap.the(throw42).should.throw(/42/)
  })

  // default `this` binding is `undefined` in strict mode for non-arrows
  it('should preserve default this binding (undefined)', function () {
    const wrapped = wrap.the(gimmeThis)
    should.equal(wrapped(), gimmeThis())
  })

  it('should preserve bind() explicit binding', function () {
    // do not bind to 'this' here, it would be the Mocha context
    // it is cyclic so not printable in case of errors
    const obj = { }
    const bound = gimmeThis.bind(obj)
    const wrapped = wrap.the(bound)
    wrapped().should.equal(obj)
  })

  it('should not change constructed objects', function () {
    const Wrapped = wrap.the(Box)
    new Wrapped(42).should.deep.equal(new Box(42))
  })

  it('should preserve prototype link in constructor calls', function () {
    const Wrapped = wrap.the(Box)
    const box = new Wrapped(42)
    box.should.have.prototype(Box.prototype)
  })

  it('should preserve call() explicit binding', function () {
    const wrapped = wrap.the(gimmeThis)
    const obj = { }
    wrapped.call(obj).should.equal(gimmeThis.call(obj))
  })

  // vanilla functions have 'prototype' property by default
  // however some functions don't, like bound functions
  it('should not introduce prototype property', function () {
    const bound = nop.bind(null)  // bind 'this' to null, don't care
    const wrapped = wrap.the(bound)
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

  it('should preserve function name', function () {
    wrap.the(nop).name.should.equal(nop.name)
  })

  it('should preserve number of expected arguments', function () {
    // wrap a function with a number of arguments > 0 not to involve defaults
    wrap.the(Box).length.should.equal(Box.length)
  })

  it('should preserve prototype property', function () {
    wrap.the(Box).prototype.should.equal(Box.prototype)
  })

  it('should preserve the internal prototype', function () {
    // change prototype and check if it is preserved
    // (otherwise all functions use the same one)
    function foo () { }
    Object.setPrototypeOf(foo, { })
    wrap.the(foo).should.have.prototype(Object.getPrototypeOf(foo))
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
    wrap.the(foo).should.have.ownPropertyDescriptor('bar', descriptor)
  })

  it('should preserve prototype descriptors list', function () {
    const originalDescriptors = Object.getOwnPropertyDescriptors(nop)
    const wrappedDescriptors = Object.getOwnPropertyDescriptors(wrap.the(nop))
    wrappedDescriptors.should.deep.equal(originalDescriptors)
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

  it('should work with arrow functions', function () {
    const double = n => n * 2
    const wrapped = wrap.the(double)
    wrapped(42).should.equal(84)
  })

  it('should throw when using arrows as constructors', function () {
    const Wrapped = wrap.the(() => { })
    ;(() => new Wrapped()).should.throw(TypeError)
  })

  it('should work with default parameter values', function () {
    function argOr42 (arg = 42) { return arg }
    const wrapped = wrap.the(argOr42)
    wrapped().should.equal(42)
    wrapped(7).should.equal(7)
  })

  it('should work when func is a class (constructor)', function () {
    const WrappedPerson = wrap.the(Person)
    new Person('alonzo').should.be.deep.equal(new WrappedPerson('alonzo'))
  })

  it('should throw when func is a class but new is not used', function () {
    ;(() => Person('haskell')).should.throw(TypeError)
    const WrappedPerson = wrap.the(Person)
    ;(() => WrappedPerson('curry')).should.throw(TypeError)
  })

  it('should work with class inheritance', function () {
    class FullNamePerson extends Person {
      constructor (firstName, lastName) {
        super(firstName + ' ' + lastName)
      }
    }
    const WrappedFullNamePerson = wrap.the(FullNamePerson)
    new WrappedFullNamePerson('ada', 'lovelace').name
      .should.equal(new Person('ada lovelace').name)
  })

  it('should preserve class static methods', function () {
    class NiceGuy {
      static sayHi () { return 'hi' }
    }
    const WrappedNiceGuy = wrap.the(NiceGuy)
    WrappedNiceGuy.sayHi().should.equal(NiceGuy.sayHi())
  })

  it('should preserve Symbol properties of func', function () {
    function foo () { }
    const symbol = Symbol('shh')
    foo[symbol] = 'top secret'
    const wrapped = wrap.the(foo)
    wrapped[symbol].should.equal(foo[symbol])
  })

  it('should work with generator functions', function () {
    // start inclusive, end exclusive
    function * range (start, end) {
      while (start < end) yield start++
    }
    const wrappedRange = wrap.the(range)
    let sum = 0
    for (const i of wrappedRange(1, 4)) sum += i
    sum.should.equal(6)
  })

  it('should preserve non-constructibility of generators (ES7)', function () {
    function * gen () { }
    const WrappedGenerator = wrap.the(gen)
    ;(() => new WrappedGenerator()).should.throw(TypeError)
  })

  it('should preserve new.target', function () {
    function GimmeNewTarget () { return new.target }
    function MyConstructor () { }
    const Wrapped = wrap.the(GimmeNewTarget)
    Reflect.construct(Wrapped, [], MyConstructor).should.equal(MyConstructor)
  })

  it('should be bindable after wrapping', function () {
    // exploit both 'this' binding and (partial) argument binding
    function thisPlusArgs (a, b) { return this + a + b }
    thisPlusArgs.bind(3, 2)(1).should.equal(6)
    wrap.the(thisPlusArgs).bind(3, 2)(1).should.equal(6)
  })

  // foo.apply could be redefined to do something different from function call
  // https://github.com/LucaFranceschini/wrapper-roo/issues/26
  it('should not invoke an overridden apply()', function () {
    function foo () { }
    foo.apply = () => { throw new Error() }
    foo.should.not.throw(Error)
    foo.apply.should.throw(Error)
    wrap.the(foo).should.not.throw(Error)
  })

  // foo.call could be redefined to do something different from function call
  it('should not invoke an overridden call()', function () {
    function foo () { }
    foo.call = () => { throw new Error() }
    foo.should.not.throw(Error)
    foo.call.should.throw(Error)
    wrap.the(foo).should.not.throw(Error)
  })

  // foo.bind could be redefined to do something different from function call
  // old implementation used bind
  it('should not invoke an overridden bind()', function () {
    function foo () { }
    foo.bind = () => { throw new Error() }
    foo.should.not.throw(Error)
    foo.bind.should.throw(Error)
    wrap.the(foo).should.not.throw(Error)
  })

  // Reflect.apply could be redefined to do something different from function call
  it('should not invoke an overridden Reflect.apply()', function () {
    // restore it after the test!
    const originalApply = Reflect.apply

    Reflect.apply = () => { throw new Error() }
    // every use of Reflect.apply will now throw
    ;(() => Reflect.apply(nop)).should.throw(Error)
    wrap.the(nop).should.not.throw(Error)

    Reflect.apply = originalApply
  })

  it('should invoke the custom hook', function () {
    wrap(nop).withHook(spy)()
    spy.should.have.been.calledOnce()
  })

  it('should preserve toString() result', function () {
    wrap.the(nop).toString().should.equal(nop.toString())
  })

  it('should called overridden toString() if any', function () {
    function foo () { }
    foo.toString = spy
    wrap.the(foo).toString()
    spy.should.have.been.calledOnce()
  })

  it('should return original toString() if accessed indirectly', function () {
    function foo () { }
    foo.alias = foo.toString
    wrap.the(foo).alias.should.equal(Function.prototype.toString)
  })

  it('should always return the same toString()', function () {
    wrap.the(nop).toString.should.equal(wrap.the(nop).toString)
  })

  // still can't do this
  it.skip('should return original toString()', function () {
    wrap.the(nop).toString.should.equal(Function.prototype.toString)
  })
})
