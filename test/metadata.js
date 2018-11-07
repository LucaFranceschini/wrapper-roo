'use strict'

const { nop, should, wrap } = require('./setup')
const InvocationData = require('../lib/metadata')

describe('Function invocation metadata', function () {
  function Constructor () { }

  // fields exposed in the API
  const exposedPreFields = [
    'function',
    'arguments',
    'constructor',
    'this',
    'boundFunction'
  ]
  const exposedPostFields = exposedPreFields.concat(
    'result',
    'exception',
    'success'
  )

  it('should throw on non-function objects', function () {
    (() => new InvocationData(null, [])).should.throw(TypeError)
  })

  it('should throw on non-array arguments', function () {
    (() => new InvocationData(() => {}, null)).should.throw(TypeError)
  })

  it('should have the original function', function () {
    wrap(nop).withPreHook(data => data.function.should.equal(nop))()
  })

  it('should have the correct arguments', function () {
    const args = [1, 2, 3]
    const wrapped = wrap(nop).withPreHook(data => data.arguments.should.deep.equal(args))
    wrapped(...args)
  })

  it('should have constructor in constructor calls', function () {
    const Wrapped = wrap(Constructor).withPreHook(data => data.constructor.should.equal(Constructor))
    // I am actually calling for the side effect, disable warning
    new Wrapped() // eslint-disable-line no-new
  })

  it('should not have constructor in non-constructor calls', function () {
    wrap(nop).withPreHook(data => should.equal(data.constructor, undefined))()
  })

  it('should have thrown exception', function () {
    function thrower () { throw new Error(42) }
    const wrapped = wrap(thrower).withPostHook(data => data.exception.message.should.equal('42'))
    // the exception will still be thrown
    wrapped.should.throw(/42/)
  })

  it('should have result', function () {
    wrap(() => 42).withPostHook(data => data.result.should.equal(42))()
  })

  it('should have this binding from method call', function () {
    const obj = { }
    obj.method = wrap(nop).withPreHook(data => data.this.should.equal(obj))
    obj.method()
  })

  it('should have this binding from Function.bind', function () {
    const obj = { }
    const wrapped = wrap(nop).withPreHook(data => data.this.should.equal(obj))
    wrapped.bind(obj)()
  })

  it('should have the same bound function as the custom hook first argument', function () {
    wrap(nop).withCustomHook((data, f) => data.boundFunction.should.equal(f))()
  })

  it('should have immutable properties (those in the API)', function () {
    const wrapped = wrap(nop).withPrePostHooks(
      data => { // pre-hook
        for (const property of exposedPostFields) {
          if (data[property]) {  // some fields may be missing
            data.should.have.immutableField(property)
          }
        }
      },
      data => { // post-hook
        for (const property of exposedPostFields) {
          if (data[property]) {  // some fields may be missing
            data.should.have.immutableField(property)
          }
        }
      }
    )

    wrapped()
  })
})
