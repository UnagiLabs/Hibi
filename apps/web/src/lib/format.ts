import type { CareLog } from "./api";
import type { Dictionary, Locale } from "./i18n";

export function formatDateRange(start: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(start));
}

export function formatMonthRange(start: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long"
  }).format(new Date(start));
}

export function formatTime(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatCareLogValue(log: CareLog, dictionary: Dictionary): string {
  if (log.category === "temperature" && log.value !== null) {
    return `${log.value}°C`;
  }

  if (log.amount !== null && log.unit) {
    return `${log.amount}${log.unit}`;
  }

  return dictionary.categories[log.category as keyof typeof dictionary.categories] ?? log.category;
}
