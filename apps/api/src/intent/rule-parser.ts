import { normalizeText } from "./normalize.js";
import { parseOccurredAtFromText } from "./time.js";

export type HibiIntent = "care_log" | "unclassified";

export type CareLogCategory =
  | "milk"
  | "breastfeeding"
  | "sleep_start"
  | "sleep_end"
  | "poop"
  | "pee"
  | "temperature";

export type RuleParserResult =
  | {
      intent: "care_log";
      category: CareLogCategory;
      amount?: number;
      unit?: string;
      value?: number;
      occurredAt: Date;
      confidence: number;
      source: "rule";
      reason: string;
    }
  | {
      intent: "unclassified";
      occurredAt: Date;
      confidence: number;
      source: "rule";
      reason: string;
    };

type ParseOptions = {
  referenceTime: Date;
  defaultOccurredAt: Date;
};

const breastfeedingWords = ["母乳", "おっぱい", "お乳", "授乳", "乳を", "乳飲"];
const milkWords = ["ミルク", "牛乳", "milk"];
const sleepStartWords = ["寝た", "ねた", "ねんね", "入眠", "寝かしつけ"];
const sleepEndWords = ["起きた", "おきた", "起床", "目覚めた", "目が覚めた"];
const poopWords = ["うんち", "うんこ", "便", "排便", "💩"];
const peeWords = ["おしっこ", "しっこ", "尿", "排尿"];
const temperatureWords = ["体温", "熱", "発熱"];

export function parseMessageWithRules(text: string, options: ParseOptions): RuleParserResult {
  const normalized = normalizeText(text);
  const occurredAt = parseOccurredAtFromText(
    text,
    options.referenceTime,
    options.defaultOccurredAt
  );

  const temperature = parseTemperature(normalized);
  if (temperature !== undefined || includesAny(normalized, temperatureWords)) {
    return {
      intent: "care_log",
      category: "temperature",
      value: temperature,
      unit: "celsius",
      occurredAt,
      confidence: temperature === undefined ? 0.72 : 0.95,
      source: "rule",
      reason: "temperature keyword or value matched"
    };
  }

  if (includesAny(normalized, breastfeedingWords)) {
    return {
      intent: "care_log",
      category: "breastfeeding",
      occurredAt,
      confidence: 0.92,
      source: "rule",
      reason: "breastfeeding synonym matched"
    };
  }

  const milkAmount = parseMlAmount(normalized);
  if (includesAny(normalized, milkWords) || (milkAmount !== undefined && normalized.includes("飲"))) {
    return {
      intent: "care_log",
      category: "milk",
      amount: milkAmount,
      unit: milkAmount === undefined ? undefined : "ml",
      occurredAt,
      confidence: milkAmount === undefined ? 0.82 : 0.96,
      source: "rule",
      reason: "milk synonym or ml amount matched"
    };
  }

  if (includesAny(normalized, sleepEndWords)) {
    return careLog("sleep_end", occurredAt, 0.92, "wake synonym matched");
  }

  if (includesAny(normalized, sleepStartWords)) {
    return careLog("sleep_start", occurredAt, 0.92, "sleep synonym matched");
  }

  if (includesAny(normalized, poopWords)) {
    return careLog("poop", occurredAt, 0.94, "poop synonym matched");
  }

  if (includesAny(normalized, peeWords)) {
    return careLog("pee", occurredAt, 0.9, "pee synonym matched");
  }

  return {
    intent: "unclassified",
    occurredAt,
    confidence: 0.2,
    source: "rule",
    reason: "no rule matched"
  };
}

function careLog(
  category: CareLogCategory,
  occurredAt: Date,
  confidence: number,
  reason: string
): RuleParserResult {
  return {
    intent: "care_log",
    category,
    occurredAt,
    confidence,
    source: "rule",
    reason
  };
}

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(normalizeText(word)));
}

function parseMlAmount(text: string): number | undefined {
  const amount = text.match(/(\d+(?:\.\d+)?)(?:ml|ミリリットル|ミリ)/);
  if (amount) {
    return Number(amount[1]);
  }

  const milkWithoutUnit = text.match(/(?:ミルク|牛乳)(\d+(?:\.\d+)?)/);
  return milkWithoutUnit ? Number(milkWithoutUnit[1]) : undefined;
}

function parseTemperature(text: string): number | undefined {
  const value = text.match(/(\d{2}(?:\.\d+)?)度?/);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value[1]);
  if (parsed < 30 || parsed > 45) {
    return undefined;
  }

  return parsed;
}

