import assert from "node:assert/strict";

import { parseMessageWithRules } from "./rule-parser.js";

const referenceTime = new Date("2026-06-04T10:30:00+09:00");

function parse(text: string) {
  return parseMessageWithRules(text, {
    referenceTime,
    defaultOccurredAt: referenceTime
  });
}

assertCareLog(parse("ミルク120ml飲んだ"), "milk", { amount: 120, unit: "ml" });
assertCareLog(parse("母乳あげた"), "breastfeeding");
assertCareLog(parse("おっぱい飲んだ"), "breastfeeding");
assertCareLog(parse("今寝た"), "sleep_start");
assertCareLog(parse("起きた!"), "sleep_end");
assertCareLog(parse("うんこした"), "poop");
assertCareLog(parse("おしっこ出た"), "pee");
assertCareLog(parse("体温36.8度"), "temperature", { value: 36.8, unit: "celsius" });

const relative = parse("30分前に起きた");
assert.equal(relative.intent, "care_log");
assert.equal(relative.occurredAt.toISOString(), "2026-06-04T01:00:00.000Z");

const unclassified = parse("今日は機嫌がよかった");
assert.equal(unclassified.intent, "unclassified");

function assertCareLog(
  result: ReturnType<typeof parseMessageWithRules>,
  category: string,
  expected?: { amount?: number; unit?: string; value?: number }
) {
  assert.equal(result.intent, "care_log");

  if (result.intent !== "care_log") {
    return;
  }

  assert.equal(result.category, category);

  if (expected?.amount !== undefined) {
    assert.equal(result.amount, expected.amount);
  }

  if (expected?.unit !== undefined) {
    assert.equal(result.unit, expected.unit);
  }

  if (expected?.value !== undefined) {
    assert.equal(result.value, expected.value);
  }
}

