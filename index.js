'use strict'

const buildPrePostHook = require('./lib/prePostHooks')
const wrapWithHook = require('./lib/wrapper')

// fluent API, consider wrap = require('wrapper-roo')
// don't put logic here

module.exports = wrap

function wrap (func) {
  return {
    withCustomHook: hook => wrapWithHook(func, hook),
    withPreHook: pre => wrapWithHook(func, buildPrePostHook(pre, nop)),
    withPostHook: post => wrapWithHook(func, buildPrePostHook(nop, post)),
    withPrePostHooks: (pre, post) => wrapWithHook(func, buildPrePostHook(pre, post))
  }
}

// just wrap the original function, mostly useful for testing purposes
wrap.the = func => wrapWithHook(func, f => f())

function nop () { }
