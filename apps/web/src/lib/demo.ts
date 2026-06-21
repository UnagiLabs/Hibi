import type { Locale } from "./i18n";

/**
 * Frontend demo data so the album experience is fully navigable before the
 * `/api/albums/*` endpoints exist. Some tiles use privacy-safe sample photos;
 * others keep soft color tones for lightweight album placeholders.
 */

export type Tone = "pink" | "yellow" | "green" | "blue";

export type DemoPhoto = {
  id: string;
  tone: Tone;
  src?: string;
  caption: Record<Locale, string>;
};

export type DemoAlbum = {
  id: string;
  type: "monthly_highlights" | "yearly_highlights" | "on_this_day" | "photo_gallery" | "care_log_day";
  href: string;
  cover: Tone;
  coverSrc?: string;
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

const photo = (id: string, tone: Tone, en: string, ja: string, src?: string): DemoPhoto => ({
  id,
  tone,
  src,
  caption: { en, ja }
});

export const demoHighlightPhotos: DemoPhoto[] = [
  photo("p1", "yellow", "Wrapped up after a family drive", "家族で出かけた帰り道", "/IMG_1593.jpeg"),
  photo("p2", "pink", "Tiny newborn blanket", "小さなブランケット", "/IMG_1596.jpeg"),
  photo("p3", "green", "The dogs napping nearby", "そばで眠る犬たち", "/IMG_1594.jpeg"),
  photo("p4", "blue", "A quiet afternoon nap", "静かなお昼寝", "/IMG_1599.jpeg"),
  photo("p5", "pink", "Soft bear outfit", "ふわふわのくまさん服", "/IMG_1598.jpeg"),
  photo("p6", "yellow", "A small ordinary day", "小さな普通の日", "/IMG_1593.jpeg")
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
    coverSrc: "/IMG_1599.jpeg",
    title: { en: "This Month", ja: "今月" },
    hint: { en: "June 2026 · best photos & moments", ja: "2026年6月 · いい写真と出来事" },
    photoCount: 24
  },
  {
    id: "a-year",
    type: "yearly_highlights",
    href: "/albums/yearly",
    cover: "pink",
    coverSrc: "/IMG_1596.jpeg",
    title: { en: "This Year", ja: "今年" },
    hint: { en: "2026 · growth, month by month", ja: "2026年 · 月ごとの成長" },
    photoCount: 188
  },
  {
    id: "a-otd",
    type: "on_this_day",
    href: "/albums/on-this-day",
    cover: "green",
    coverSrc: "/IMG_1593.jpeg",
    title: { en: "On This Day", ja: "去年の今日" },
    hint: { en: "A year ago today, and before", ja: "1年前の今日、その前も" },
    photoCount: 6
  },
  {
    id: "a-photos",
    type: "photo_gallery",
    href: "/albums/photos",
    cover: "yellow",
    coverSrc: "/IMG_1594.jpeg",
    title: { en: "Photo Library", ja: "写真ライブラリ" },
    hint: { en: "All saved photos", ja: "保存した写真すべて" },
    photoCount: 0
  },
  {
    id: "a-care",
    type: "care_log_day",
    href: "/v/demo",
    cover: "blue",
    coverSrc: "/IMG_1598.jpeg",
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
      photo("otd1", "yellow", "Wrapped up after a family drive", "家族で出かけた帰り道", "/IMG_1593.jpeg"),
      photo("otd2", "green", "The dogs napping nearby", "そばで眠る犬たち", "/IMG_1594.jpeg"),
      photo("otd3", "blue", "A quiet afternoon nap", "静かなお昼寝", "/IMG_1599.jpeg")
    ],
    note: {
      en: "A normal day, but exactly the kind of day we forget: a car ride, sleepy dogs, and one small nap.",
      ja: "車でのお出かけ、そばで眠る犬たち、小さなお昼寝。忘れそうな普通の日ほど、あとで見返したくなる。"
    }
  },
  {
    id: "y2",
    yearsAgo: 2,
    photos: [
      photo("otd4", "pink", "First tiny blanket", "はじめての小さなブランケット", "/IMG_1596.jpeg"),
      photo("otd5", "blue", "Soft bear outfit", "ふわふわのくまさん服", "/IMG_1598.jpeg")
    ],
    note: {
      en: "So small that every blanket looked huge. Hibi keeps these early days close without making the family sort everything by hand.",
      ja: "どのブランケットも大きく見えるくらい小さかった頃。Hibiなら、家族が手で整理しなくても初期の記憶を近くに残せる。"
    }
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
