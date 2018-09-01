'use strict'

const { nop, should, wrap } = require('./setup')
const InvocationMetadata = require('../lib/metadata')

describe('Function invocation metadata', function () {
  function Constructor () { }

  it('should throw on non-function objects', function () {
    (() => new InvocationMetadata(null, [])).should.throw(TypeError)
  })

  it('should throw on non-array arguments', function () {
    (() => new InvocationMetadata(() => {}, null)).should.throw(TypeError)
  })

  it('should contain the original function', function () {
    // custom hooks additionally expects the function to call
    function hook (func, metadata) {
      metadata.function.should.equal(nop)
    }

    wrap(nop).withCustomHook(hook)()
  })

  it('should contain the correct arguments', function () {
    const args = [1, 2, 3]

    // custom hooks additionally expects the function to call
    function hook (func, metadata) {
      metadata.arguments.should.deep.equal(args)
    }

    wrap(nop).withCustomHook(hook)(...args)
  })

  it('should expose constructor in constructor calls', function () {
    function hook (metadata) {
      metadata.constructor.should.equal(Constructor)
    }

    const WrappedCtor = wrap(Constructor).withPreHook(hook)
    // I am actually calling for the side effect, disable warning
    new WrappedCtor() // eslint-disable-line no-new
  })

  it('should not expose constructor in non-constructor calls', function () {
    function hook (metadata) {
      // can't use should fluent API on undefined
      should.equal(metadata.constructor, undefined)
    }

    wrap(nop).withPreHook(hook)()
  })

  it('should expose thrown exception', function () {
    function thrower () { throw new Error(42) }

    function hook (metadata) {
      metadata.exception.message.should.equal('42')
    }

    const wrapped = wrap(thrower).withPostHook(hook)
    try {
      wrapped()
    } catch (e) { }
  })

  it('should expose result', function () {
    function f () { return 42 }

    function hook (metadata) {
      metadata.result.should.equal(42)
    }

    wrap(f).withPostHook(hook)()
  })
})
