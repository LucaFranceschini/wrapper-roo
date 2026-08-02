'use strict'

import { assert, describe, it, wrap } from './setup.js'

describe('ES6 classes', function () {
  class Person {
    constructor (name) {
      this.name = name
    }
  }

  it('should work when wrapped function is a class (constructor)', function () {
    const WrappedPerson = wrap.the(Person)
	assert.deepStrictEqual(new Person('alonzo'), new WrappedPerson('alonzo'))
  })

  it('should throw when wrapped function is a class but new is not used', function () {
	assert.throws(
		() => Person('haskell'),
		TypeError
	)
	
    const WrappedPerson = wrap.the(Person)
    assert.throws(
		() => WrappedPerson('curry'),
		TypeError
	)
  })

  it('should work with class inheritance', function () {
    class FullNamePerson extends Person {
      constructor (firstName, lastName) {
        super(firstName + ' ' + lastName)
      }
    }
	
    const WrappedFullNamePerson = wrap.the(FullNamePerson)
	
	assert.deepStrictEqual(
		new WrappedFullNamePerson('ada', 'lovelace').name,
		new Person('ada lovelace').name
	)
  })

  it('should preserve class static methods', function () {
    class NiceGuy {
      static sayHi () { return 'hi' }
    }
	
    const WrappedNiceGuy = wrap.the(NiceGuy)
	assert.deepStrictEqual(NiceGuy.sayHi(), WrappedNiceGuy.sayHi())
  })
})
