import type { RuleParserResult } from "../intent/rule-parser.js";

export type ValidatedMessageResult =
  | {
      intent: "care_log";
      category: "milk" | "breastfeeding" | "sleep_start" | "sleep_end" | "poop" | "pee" | "temperature";
      amount?: number;
      unit?: string;
      value?: number;
      occurredAt: Date;
      confidence: number;
      source: "mock_validator" | "llm_validator";
      ruleResult: RuleParserResult;
    }
  | {
      intent: "unclassified";
      occurredAt: Date;
      confidence: number;
      source: "mock_validator" | "llm_validator";
      ruleResult: RuleParserResult;
    };

export type MessageValidatorInput = {
  text: string;
  ruleResult: RuleParserResult;
};

export interface MessageValidator {
  validate(input: MessageValidatorInput): Promise<ValidatedMessageResult>;
}

