'use strict'

import { assert, describe, it, nop, sinon, wrap } from './setup.js'

describe('toString method', function () {
  it('should preserve toString() result', function () {
	  assert.strictEqual(wrap.the(nop).toString(), nop.toString())
  })

  it('should called overridden toString() if any', function () {
    function foo () { }
	const spy = sinon.spy()
    foo.toString = spy
    wrap.the(foo).toString()
	sinon.assert.calledOnce(spy)
  })

  it('should return original toString() if accessed indirectly', function () {
    function foo () { }
    foo.alias = foo.toString
	assert.strictEqual(wrap.the(foo).alias, Function.prototype.toString)
  })

  it('should always return the same toString()', function () {
	  assert.strictEqual(wrap.the(nop).toString(), wrap.the(nop).toString())
  })

  it('should not throw directly calling Function.prototype.toString on wrapped function', function () {
    const wrapped = wrap.the(nop)
	assert.doesNotThrow(() => Function.prototype.toString.call(wrapped))
  })
})
