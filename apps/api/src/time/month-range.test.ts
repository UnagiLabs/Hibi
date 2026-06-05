import assert from "node:assert/strict";

import { getLocalMonthRangeFromParts } from "./month-range.js";

const range = getLocalMonthRangeFromParts(2026, 6);

assert.equal(range.year, 2026);
assert.equal(range.month, 6);
assert.equal(range.start.getDate(), 1);
assert.equal(range.start.getHours(), 0);
assert.equal(range.end.getMonth(), 6);
assert.equal(range.end.getDate(), 1);
