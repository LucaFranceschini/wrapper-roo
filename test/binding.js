

import { assert, describe, it, wrap } from "./setup.js";

describe("Binding", () => {
	function gimmeThis() {
		return this;
	}

	// default `this` binding is `undefined` in strict mode for non-arrows
	it("should preserve default this binding (undefined)", () => {
		const wrapped = wrap.the(gimmeThis);
		assert.strictEqual(wrapped(), gimmeThis());
	});

	it("should preserve bind() explicit binding", () => {
		// do not bind to 'this' here, it would be the testing context
		// it is cyclic so not printable in case of errors
		const obj = {};
		const bound = gimmeThis.bind(obj);
		const wrapped = wrap.the(bound);

		assert.strictEqual(wrapped(), obj);
	});

	it("should preserve call() explicit binding", () => {
		const wrapped = wrap.the(gimmeThis);
		const obj = {};

		assert.strictEqual(wrapped.call(obj), gimmeThis.call(obj));
	});

	/* This is seriously evil...
	 * Bound functions have no 'prototype' property by default. When they are
	 * used in constructor calls, the 'prototype' property of the bound
	 * functions is used. A bad man could add a 'prototype' function to the
	 * bound function...
	 * This means that checking existence of such property is not a reliable way
	 * to detect bound functions.
	 * Note: we're not talking about the internal [[Prototype]].
	 */
	it("should preserve constructor behavior of bound functions", () => {
		function Foo() {}
		const Bound = Foo.bind(null); // bind 'this' to null, don't care
		assert.strictEqual(Object.hasOwn(Bound, "prototype"), false);

		// now add a prototype property (this shouldn't happen in real code...)
		Bound.prototype = {};
		// note that this has nothing to do with the original one
		assert.notEqual(Bound.prototype, Foo.prototype);

		// new objects should get the original prototype, not the bound one
		assert.strictEqual(Object.getPrototypeOf(new Bound()), Foo.prototype);
		assert.notEqual(Object.getPrototypeOf(new Bound()), Bound.prototype);

		// and the same happens with the wrapper
		const Wrapped = wrap.the(Bound);
		assert.strictEqual(Object.getPrototypeOf(new Wrapped()), Foo.prototype);
		assert.notEqual(Object.getPrototypeOf(new Wrapped()), Bound.prototype);
	});

	it("should allow partial application with Function.bind", () => {
		function Pair(a, b) {
			this.a = a;
			this.b = b;
		}

		// don't care about 'this' here, just fix first argument
		// 'this' will be overridden by constructor call anyway
		const Pair42 = Pair.bind(null, 42);

		// wrap both
		const WrappedPair = wrap.the(Pair);
		const WrappedPair42 = wrap.the(Pair42);

		assert.deepStrictEqual(new Pair(42, "foo"), new Pair42("foo"));
		assert.deepStrictEqual(
			new WrappedPair(42, "foo"),
			new WrappedPair42("foo"),
		);
		assert.deepStrictEqual(new Pair42("foo"), new WrappedPair42("foo"));
	});

	it("should be bindable after wrapping", () => {
		// exploit both 'this' binding and (partial) argument binding
		function thisPlusArgs(a, b) {
			return this + a + b;
		}
		assert.strictEqual(thisPlusArgs.bind(3, 2)(1), 6);
		assert.strictEqual(wrap.the(thisPlusArgs).bind(3, 2)(1), 6);
	});
});
