import type {
  MessageValidator,
  MessageValidatorInput,
  ValidatedMessageResult
} from "./message-validator.js";

export class MockMessageValidator implements MessageValidator {
  async validate(input: MessageValidatorInput): Promise<ValidatedMessageResult> {
    const { ruleResult } = input;

    if (ruleResult.intent === "care_log") {
      return {
        intent: "care_log",
        category: ruleResult.category,
        amount: ruleResult.amount,
        unit: ruleResult.unit,
        value: ruleResult.value,
        occurredAt: ruleResult.occurredAt,
        confidence: ruleResult.confidence,
        source: "mock_validator",
        ruleResult
      };
    }

    return {
      intent: "unclassified",
      occurredAt: ruleResult.occurredAt,
      confidence: ruleResult.confidence,
      source: "mock_validator",
      ruleResult
    };
  }
}

