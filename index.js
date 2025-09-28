'use strict'

import buildPrePostHook from './lib/prePostHooks.js'
import wrapWithHook from './lib/wrapper.js'

// fluent API, consider wrap = require('wrapper-roo')
// don't put logic here

export default wrap

function wrap (func) {
  return {
    withCustomHook: hook => wrapWithHook(func, hook),
    withPreHook: pre => wrapWithHook(func, buildPrePostHook(pre, nop)),
    withPostHook: post => wrapWithHook(func, buildPrePostHook(nop, post)),
    withPrePostHooks: (pre, post) => wrapWithHook(func, buildPrePostHook(pre, post))
  }
}

// just wrap the original function, mostly useful for testing purposes
wrap.the = func => wrapWithHook(func, (data, f) => f())

function nop () { }
