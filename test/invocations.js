'use strict'

const { nop, sinon, spy, wrap } = require('./setup')

describe('number and order of invocations', function () {
  it('should invoke preHook exactly once', function () {
    const wrapped = wrap(nop).withPreHook(spy)
    wrapped()
    spy.should.have.been.calledOnce()
  })

  it('should invoke postHook exactly once', function () {
    const wrapped = wrap(nop).withPostHook(spy)
    wrapped()
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

  it('should invoke func exactly once', function () {
    const wrapped = wrap.the(spy)
    wrapped()
    spy.should.have.been.calledOnce()
  })

  it('should invoke the custom hook', function () {
    wrap(nop).withHook(spy)()
    spy.should.have.been.calledOnce()
  })
})
