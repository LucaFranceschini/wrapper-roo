'use strict'

import { wrap } from './setup.js'

describe('ES6 classes', function () {
  class Person {
    constructor (name) {
      this.name = name
    }
  }

  it('should work when wrapped function is a class (constructor)', function () {
    const WrappedPerson = wrap.the(Person)
    new Person('alonzo').should.be.deep.equal(new WrappedPerson('alonzo'))
  })

  it('should throw when wrapped function is a class but new is not used', function () {
    (() => Person('haskell')).should.throw(TypeError)
    const WrappedPerson = wrap.the(Person)
    ;(() => WrappedPerson('curry')).should.throw(TypeError)
  })

  it('should work with class inheritance', function () {
    class FullNamePerson extends Person {
      constructor (firstName, lastName) {
        super(firstName + ' ' + lastName)
      }
    }
    const WrappedFullNamePerson = wrap.the(FullNamePerson)
    new WrappedFullNamePerson('ada', 'lovelace').name
      .should.equal(new Person('ada lovelace').name)
  })

  it('should preserve class static methods', function () {
    class NiceGuy {
      static sayHi () { return 'hi' }
    }
    const WrappedNiceGuy = wrap.the(NiceGuy)
    WrappedNiceGuy.sayHi().should.equal(NiceGuy.sayHi())
  })
})
