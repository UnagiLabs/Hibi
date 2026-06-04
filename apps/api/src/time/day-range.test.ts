import assert from "node:assert/strict";

import { getLocalDayRange } from "./day-range.js";

const range = getLocalDayRange(new Date("2026-06-04T10:30:00+09:00"));

assert.equal(range.start.getHours(), 0);
assert.equal(range.start.getMinutes(), 0);
assert.equal(range.start.getSeconds(), 0);
assert.equal(range.end.getTime() - range.start.getTime(), 24 * 60 * 60 * 1000);

