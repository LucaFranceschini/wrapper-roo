import { assert, describe, it, nop, wrap } from "./setup.js";

/* The following tests only look at own properties because inherited ones are
 * handled by copying the internal prototype. Also, descriptor flags are set
 * to non-default values to do more meaningful tests.
 */
describe("Function object properties", () => {
	function unary(_arg) {}

	it("should preserve function name", () => {
		assert.strictEqual(wrap.the(nop).name, nop.name);
	});

	it("should preserve number of expected arguments", () => {
		// wrap a function with a number of arguments > 0 not to involve defaults
		assert.strictEqual(wrap.the(unary).length, unary.length);
	});

	it("should preserve prototype property", () => {
		assert.deepStrictEqual(wrap.the(unary).prototype, unary.prototype);
	});

	it("should copy own property data descriptors", () => {
		function foo() {}
		const descriptor = {
			configurable: true,
			enumerable: true,
			value: 42,
			writable: true,
		};
		Object.defineProperty(foo, "bar", descriptor);
		assert.deepStrictEqual(
			Object.getOwnPropertyDescriptor(wrap.the(foo), "bar"),
			descriptor,
		);
	});

	it("should preserve prototype descriptors list", () => {
		// Object.getOwnPropertyDescriptors was introduced in ES8
		if (Object.getOwnPropertyDescriptors) {
			const originalDescriptors = Object.getOwnPropertyDescriptors(nop);
			const wrappedDescriptors = Object.getOwnPropertyDescriptors(
				wrap.the(nop),
			);
			assert.deepStrictEqual(originalDescriptors, wrappedDescriptors);
		}
	});

	it("should work with getters", () => {
		function idiot() {}
		Object.defineProperty(idiot, "name", { get: () => "luca" });
		const wrapped = wrap.the(idiot);
		assert.strictEqual(wrapped.name, idiot.name);
	});

	it("should work with setters", () => {
		function idiot() {}
		Object.defineProperty(idiot, "name", {
			get: function () {
				return this._name;
			},
			set: function (name) {
				this._name = name;
				return this._name;
			},
		});
		const wrapped = wrap.the(idiot);
		wrapped.name = "forrest";
		assert.strictEqual(wrapped.name, "forrest");
	});

	it("should preserve Symbol properties of func", () => {
		function foo() {}
		const symbol = Symbol("shh");
		foo[symbol] = "top secret";
		const wrapped = wrap.the(foo);
		assert.strictEqual(wrapped[symbol], foo[symbol]);
	});

	// vanilla functions have 'prototype' property by default
	// however some functions don't, like bound functions
	it("should not introduce prototype property", () => {
		const bound = nop.bind(null); // bind 'this' to null, don't care
		const wrapped = wrap.the(bound);
		assert.strictEqual(bound.prototype, undefined);
		assert.strictEqual(wrapped.prototype, undefined); // not even inherited
	});

	it("should preserve the internal prototype", () => {
		// change prototype and check if it is preserved
		// (otherwise all functions use the same one)
		function foo() {}
		Object.setPrototypeOf(foo, {});
		assert.deepStrictEqual(
			Object.getPrototypeOf(wrap.the(foo)),
			Object.getPrototypeOf(foo),
		);
	});
});
