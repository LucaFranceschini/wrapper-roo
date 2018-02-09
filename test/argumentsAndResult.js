'use strict'

const { nop, wrap } = require('./setup')

describe('arguments and result checking', function () {
  it('should throw if preHook is not a function', function () {
    (() => wrap(nop).withPreHook('hey')).should.throw(TypeError)
  })

  it('should throw if postHook is not a function', function () {
    (() => wrap(nop).withPostHook('ho')).should.throw(TypeError)
  })

  it('should return a function', function () {
    wrap.the(nop).should.be.a('function')
  })

  it('should return a different function', function () {
    wrap.the(nop).should.not.equal(nop)
  })
})
