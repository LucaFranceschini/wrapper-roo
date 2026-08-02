'use strict'

import { assert, describe, it, wrap } from './setup.js'

describe('ES6 arrow functions', function () {
  it('should work with arrow functions', function () {
    const wrapped = wrap.the(n => n * 2)
	assert.strictEqual(wrapped(42), 84)
  })

  it('should throw when using arrows as constructors', function () {
    const Wrapped = wrap.the(() => { })
	assert.throws(
		() => new Wrapped(),
		TypeError
	)
  })
})
