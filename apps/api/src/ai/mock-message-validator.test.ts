import assert from "node:assert/strict";

import { parseMessageWithRules } from "../intent/rule-parser.js";

import { MockMessageValidator } from "./mock-message-validator.js";

const referenceTime = new Date("2026-06-04T10:30:00+09:00");
const validator = new MockMessageValidator();

const careLogRuleResult = parseMessageWithRules("ミルク120ml飲んだ", {
  referenceTime,
  defaultOccurredAt: referenceTime
});
const careLogValidated = await validator.validate({
  text: "ミルク120ml飲んだ",
  ruleResult: careLogRuleResult
});

assert.equal(careLogValidated.intent, "care_log");
assert.equal(careLogValidated.source, "mock_validator");

if (careLogValidated.intent === "care_log") {
  assert.equal(careLogValidated.category, "milk");
  assert.equal(careLogValidated.amount, 120);
  assert.equal(careLogValidated.unit, "ml");
}

const unclassifiedRuleResult = parseMessageWithRules("今日は機嫌がよかった", {
  referenceTime,
  defaultOccurredAt: referenceTime
});
const unclassifiedValidated = await validator.validate({
  text: "今日は機嫌がよかった",
  ruleResult: unclassifiedRuleResult
});

assert.equal(unclassifiedValidated.intent, "unclassified");
assert.equal(unclassifiedValidated.source, "mock_validator");

