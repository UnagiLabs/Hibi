import { normalizeText } from "./normalize.js";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

export function parseOccurredAtFromText(
  text: string,
  referenceTime: Date,
  defaultOccurredAt: Date
): Date {
  const normalized = normalizeText(text);

  const minutesAgo = normalized.match(/(\d+)分前/);
  if (minutesAgo) {
    return new Date(referenceTime.getTime() - Number(minutesAgo[1]) * MINUTE_MS);
  }

  const hoursAgo = normalized.match(/(\d+)時間前/);
  if (hoursAgo) {
    return new Date(referenceTime.getTime() - Number(hoursAgo[1]) * HOUR_MS);
  }

  const colonTime = normalized.match(/(\d{1,2}):(\d{2})/);
  if (colonTime) {
    return withTime(referenceTime, Number(colonTime[1]), Number(colonTime[2]));
  }

  const halfHourTime = normalized.match(/(\d{1,2})時半/);
  if (halfHourTime) {
    return withTime(referenceTime, Number(halfHourTime[1]), 30);
  }

  const japaneseTime = normalized.match(/(\d{1,2})時(?:(\d{1,2})分)?/);
  if (japaneseTime) {
    return withTime(referenceTime, Number(japaneseTime[1]), Number(japaneseTime[2] ?? 0));
  }

  return defaultOccurredAt;
}

function withTime(referenceTime: Date, hour: number, minute: number): Date {
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return referenceTime;
  }

  const occurredAt = new Date(referenceTime);
  occurredAt.setHours(hour, minute, 0, 0);
  return occurredAt;
}

