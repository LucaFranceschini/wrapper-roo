'use strict'

// require this file in every test suite

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai') // load after dirty-chai
const wrap = require('../index')

const should = chai.should() // use should-style assertions
chai.use(dirtyChai) // lint-friendly assertions
chai.use(sinonChai) // Sinon mocking framework

const spy = sinon.spy()
beforeEach('make the spy reusable', function () { spy.resetHistory() })

// ad-hoc assertion to check prototypes
chai.use(function (_chai) {
  _chai.Assertion.addMethod('prototype', function (expected) {
    const found = Object.getPrototypeOf(this._obj)

    this.assert(
      found === expected,
      // normal and negated assertion message, respectively
      'expected #{this} to have prototype #{exp} but got #{act}',
      'expected #{this} to not have prototype #{act}',
      expected,
      found
    )
  })
})

// ad-hoc assertion to check non-writable non-configurable class fields
chai.use(function (_chai) {
  _chai.Assertion.addMethod('immutableField', function (key) {
    const descriptor = Object.getOwnPropertyDescriptor(this._obj, key)

    this.assert(
      !(descriptor.configurable || descriptor.writable),
      // normal and negated assertion message, respectively
      'expected #{this} to have non-configurable non-writable property #{exp}',
      'expected #{this} to not have prototype configurable or writable property #{exp}',
      key // expected
    )
  })
})

function nop () { }

module.exports = {
  nop,
  should,
  sinon,
  spy,
  wrap
}
