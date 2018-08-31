'use strict'

const { nop, wrap } = require('./setup')
const InvocationMetadata = require('../lib/metadata')

describe('Function invocation metadata', function () {
  it('should throw on non-function objects', function () {
    (() => new InvocationMetadata(null, [])).should.throw(TypeError)
  })

  it('should throw on non-array arguments', function () {
    (() => new InvocationMetadata(() => {}, null)).should.throw(TypeError)
  })

  it('should throw on non-boolean isCtor', function () {
    (() => new InvocationMetadata(nop, [], 42)).should.throw(TypeError)
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

  it('should recognize constructors', function () {
    function hook (metadata) {
      metadata.isConstructor.should.be.true()
    }

    wrap(nop).withPreHook(hook)()
  })
})
