

// require this file in every test suite

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sinon from "sinon";

import wrap from "../index.js";

function nop() {}

export { assert, describe, it, nop, sinon, wrap };
