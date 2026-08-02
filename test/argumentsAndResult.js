'use strict'

import { assert, describe, it, nop, wrap } from './setup.js'

describe('Arguments and result checking', function () {
  it('should throw if object to be wrapped is not a function', function () {
    assert.throws(
		() => wrap.the('shit'),
		TypeError
	)
  })

  it('should throw if pre-hook is not a function', function () {
    assert.throws(
		() => wrap(nop).withPreHook('hey'),
		TypeError
	)
  })

  it('should throw if post-hook is not a function', function () {
    assert.throws(
		() => wrap(nop).withPostHook('ho'),
		TypeError
	)
  })

  it('should throw if custom hook is not a function', function () {
    assert.throws(
		() => wrap(nop).withCustomHook("let's go"),
		TypeError
	)
  })

  it('should return a function', function () {
	  const wrapped = wrap.the(nop)
	  assert.strictEqual(typeof wrapped, 'function')
  })

  it('should return a different function', function () {
	  assert.notStrictEqual(wrap.the(nop), nop)
  })
})
