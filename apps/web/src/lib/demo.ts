import type { Locale } from "./i18n";

/**
 * Frontend demo data so the album experience is fully navigable before the
 * `/api/albums/*` endpoints exist. Photos are represented as soft color tones
 * rather than image URLs so the layout reads as "memories" without real media.
 */

export type Tone = "pink" | "yellow" | "green" | "blue";

export type DemoPhoto = {
  id: string;
  tone: Tone;
  caption: Record<Locale, string>;
};

export type DemoAlbum = {
  id: string;
  type: "monthly_highlights" | "yearly_highlights" | "on_this_day" | "photo_gallery" | "care_log_day";
  href: string;
  cover: Tone;
  title: Record<Locale, string>;
  hint: Record<Locale, string>;
  photoCount: number;
};

export type DemoMilestone = {
  id: string;
  emoji: string;
  label: Record<Locale, string>;
};

export type DemoNote = {
  id: string;
  date: Record<Locale, string>;
  text: Record<Locale, string>;
};

const photo = (id: string, tone: Tone, en: string, ja: string): DemoPhoto => ({
  id,
  tone,
  caption: { en, ja }
});

export const demoHighlightPhotos: DemoPhoto[] = [
  photo("p1", "yellow", "Morning by the window", "窓辺の朝"),
  photo("p2", "pink", "First real giggle", "はじめての大笑い"),
  photo("p3", "green", "Park walk", "公園のおさんぽ"),
  photo("p4", "blue", "Bath time splash", "おふろでバシャバシャ"),
  photo("p5", "pink", "Nap on dad", "パパの上でお昼寝"),
  photo("p6", "yellow", "New hat", "あたらしい帽子")
];

export const demoMilestones: DemoMilestone[] = [
  { id: "m1", emoji: "🌱", label: { en: "Rolled over", ja: "寝返りした" } },
  { id: "m2", emoji: "😊", label: { en: "Smiled at us", ja: "笑いかけてくれた" } },
  { id: "m3", emoji: "🍚", label: { en: "First solid food", ja: "はじめての離乳食" } },
  { id: "m4", emoji: "👋", label: { en: "Waved hello", ja: "バイバイできた" } }
];

export const demoNotes: DemoNote[] = [
  {
    id: "n1",
    date: { en: "Jun 2", ja: "6月2日" },
    text: { en: "Slept through the night for the first time.", ja: "はじめて朝までぐっすり眠れた。" }
  },
  {
    id: "n2",
    date: { en: "Jun 4", ja: "6月4日" },
    text: { en: "Laughed so hard at the dog. Pure joy.", ja: "犬を見て大笑い。しあわせ。" }
  }
];

export const demoAlbums: DemoAlbum[] = [
  {
    id: "a-month",
    type: "monthly_highlights",
    href: "/albums/monthly",
    cover: "yellow",
    title: { en: "This Month", ja: "今月" },
    hint: { en: "June 2026 · best photos & moments", ja: "2026年6月 · いい写真と出来事" },
    photoCount: 24
  },
  {
    id: "a-year",
    type: "yearly_highlights",
    href: "/albums/yearly",
    cover: "pink",
    title: { en: "This Year", ja: "今年" },
    hint: { en: "2026 · growth, month by month", ja: "2026年 · 月ごとの成長" },
    photoCount: 188
  },
  {
    id: "a-otd",
    type: "on_this_day",
    href: "/albums/on-this-day",
    cover: "green",
    title: { en: "On This Day", ja: "去年の今日" },
    hint: { en: "A year ago today, and before", ja: "1年前の今日、その前も" },
    photoCount: 6
  },
  {
    id: "a-care",
    type: "care_log_day",
    href: "/v/demo",
    cover: "blue",
    title: { en: "Care Log", ja: "育児ログ" },
    hint: { en: "Look back on daily care", ja: "毎日の記録を振り返る" },
    photoCount: 0
  }
];

export type DemoMonthChapter = {
  id: string;
  month: Record<Locale, string>;
  cover: Tone;
  photoCount: number;
};

export const demoMonthChapters: DemoMonthChapter[] = [
  { id: "c1", month: { en: "Jan", ja: "1月" }, cover: "blue", photoCount: 12 },
  { id: "c2", month: { en: "Feb", ja: "2月" }, cover: "pink", photoCount: 9 },
  { id: "c3", month: { en: "Mar", ja: "3月" }, cover: "green", photoCount: 18 },
  { id: "c4", month: { en: "Apr", ja: "4月" }, cover: "yellow", photoCount: 21 },
  { id: "c5", month: { en: "May", ja: "5月" }, cover: "pink", photoCount: 16 },
  { id: "c6", month: { en: "Jun", ja: "6月" }, cover: "yellow", photoCount: 24 }
];

export type DemoMemoryYear = {
  id: string;
  yearsAgo: number;
  photos: DemoPhoto[];
  note: Record<Locale, string>;
};

export const demoOnThisDay: DemoMemoryYear[] = [
  {
    id: "y1",
    yearsAgo: 1,
    photos: [
      photo("otd1", "pink", "First steps in the garden", "庭ではじめての一歩"),
      photo("otd2", "yellow", "Ice cream face", "アイスで口まわりベタベタ")
    ],
    note: { en: "Took three wobbly steps before tumbling into the grass.", ja: "3歩あるいて、草の上にころん。" }
  },
  {
    id: "y2",
    yearsAgo: 2,
    photos: [photo("otd3", "green", "Tiny hands, big yawn", "ちいさな手、大きなあくび")],
    note: { en: "So small. Slept most of the day.", ja: "とても小さくて、一日中ねんね。" }
  }
];

export type DemoRecentView = {
  id: string;
  href: string;
  tone: Tone;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
};

export const demoRecentViews: DemoRecentView[] = [
  {
    id: "r1",
    href: "/v/demo",
    tone: "yellow",
    title: { en: "Daily Care Log", ja: "今日の育児ログ" },
    subtitle: { en: "Today · 8 entries", ja: "今日 · 8件" }
  },
  {
    id: "r2",
    href: "/albums/monthly",
    tone: "pink",
    title: { en: "This Month", ja: "今月" },
    subtitle: { en: "June 2026", ja: "2026年6月" }
  },
  {
    id: "r3",
    href: "/albums/on-this-day",
    tone: "green",
    title: { en: "On This Day", ja: "去年の今日" },
    subtitle: { en: "1 year ago", ja: "1年前" }
  }
];

export type ArchiveStatusItem = {
  id: "walrus" | "memwal" | "sui";
  state: "ok" | "demo";
  proof: string;
};

export const demoArchiveStatus: ArchiveStatusItem[] = [
  { id: "walrus", state: "demo", proof: "blob: 0x9f3c…demo" },
  { id: "memwal", state: "demo", proof: "recall ready" },
  { id: "sui", state: "demo", proof: "pointer: 0x12ab…demo" }
];
