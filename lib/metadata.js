// function invocation metadata
module.exports = class Metadata {
  constructor (func, args) {
    this.function = func
    this.arguments = args
  }
}
