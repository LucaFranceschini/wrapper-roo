import InvocationData from "../lib/metadata.js";
import { assert, describe, it, nop, wrap } from "./setup.js";

describe("Function invocation metadata", () => {
	function Constructor() {}

	// fields exposed in the API
	const exposedPreFields = [
		"function",
		"arguments",
		"constructor",
		"this",
		"boundFunction",
	];
	const exposedPostFields = exposedPreFields.concat(
		"result",
		"exception",
		"success",
	);

	it("should throw on non-function objects", () => {
		assert.throws(() => new InvocationData(null, []), TypeError);
	});

	it("should throw on non-array arguments", () => {
		assert.throws(() => new InvocationData(() => {}, null), TypeError);
	});

	it("should have the original function", () => {
		wrap(nop).withPreHook((data) =>
			assert.deepStrictEqual(data.function, nop),
		)();
	});

	it("should have the correct arguments", () => {
		const args = [1, 2, 3];
		const wrapped = wrap(nop).withPreHook((data) =>
			assert.deepStrictEqual(data.arguments, args),
		);
		wrapped(...args);
	});

	it("should have constructor in constructor calls", () => {
		const Wrapped = wrap(Constructor).withPreHook((data) =>
			assert.deepStrictEqual(data.constructor, Constructor),
		);
		new Wrapped();
	});

	it("should not have constructor in non-constructor calls", () => {
		wrap(nop).withPreHook((data) =>
			assert.deepStrictEqual(data.constructor, undefined),
		)();
	});

	it("should have thrown exception", () => {
		function thrower() {
			throw new Error(42);
		}
		const wrapped = wrap(thrower).withPostHook((data) =>
			assert.deepStrictEqual(data.exception.message, "42"),
		);
		// the exception will still be thrown
		assert.throws(wrapped, /42/);
	});

	it("should have result", () => {
		wrap(() => 42).withPostHook((data) =>
			assert.deepStrictEqual(data.result, 42),
		)();
	});

	it("should have this binding from method call", () => {
		const obj = {};
		obj.method = wrap(nop).withPreHook((data) =>
			assert.deepStrictEqual(data.this, obj),
		);
		obj.method();
	});

	it("should have this binding from Function.bind", () => {
		const obj = {};
		const wrapped = wrap(nop).withPreHook((data) =>
			assert.deepStrictEqual(data.this, obj),
		);
		wrapped.bind(obj)();
	});

	it("should have the same bound function as the custom hook first argument", () => {
		const wrapped = wrap(nop).withCustomHook((data, f) =>
			assert.deepStrictEqual(data.boundFunction, f),
		);
		wrapped();
	});

	it("should have immutable properties (those in the API)", () => {
		const wrapped = wrap(nop).withPrePostHooks(
			(data) => {
				// pre-hook
				for (const property of exposedPostFields) {
					if (data[property]) {
						// some fields may be missing
						const descriptor = Object.getOwnPropertyDescriptor(data, property);
						assert.ok(
							!descriptor.configurable && !descriptor.writable,
							`expected ${data} to have non-configurable non-writable property ${property}`,
						);
					}
				}
			},
			(data) => {
				// post-hook
				for (const property of exposedPostFields) {
					if (data[property]) {
						// some fields may be missing
						const descriptor = Object.getOwnPropertyDescriptor(data, property);
						assert.ok(
							!descriptor.configurable && !descriptor.writable,
							`expected ${data} to have non-configurable non-writable property ${property}`,
						);
					}
				}
			},
		);

		wrapped();
	});
});
