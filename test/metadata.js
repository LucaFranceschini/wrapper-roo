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

  it('should contain the original function', function () {
    function hook (metadata) {
      metadata.function.should.equal(nop)
    }

    wrap(nop).withPreHook(hook)()
    wrap(nop).withPostHook(hook)()
    wrap(nop).withPrePostHooks(hook, hook)()
    // custom hooks additionally expects the function to call
    wrap(nop).withCustomHook((f, metadata) => hook(metadata))()
  })

  it('should contain the correct arguments')
})
