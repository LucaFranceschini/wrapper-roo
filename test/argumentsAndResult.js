'use strict'

import { nop, wrap } from './setup.js'

describe('Arguments and result checking', function () {
  it('should throw if object to be wrapped is not a function', function () {
    (() => wrap.the('shit')).should.throw(TypeError)
  })

  it('should throw if pre-hook is not a function', function () {
    (() => wrap(nop).withPreHook('hey')).should.throw(TypeError)
  })

  it('should throw if post-hook is not a function', function () {
    (() => wrap(nop).withPostHook('ho')).should.throw(TypeError)
  })

  it('should throw if custom hook is not a function', function () {
    (() => wrap(nop).withCustomHook("let's go")).should.throw(TypeError)
  })

  it('should return a function', function () {
    wrap.the(nop).should.be.a('function')
  })

  it('should return a different function', function () {
    wrap.the(nop).should.not.equal(nop)
  })
})
