export type Locale = "ja" | "en";

export type Dictionary = {
  appName: string;
  tagline: string;
  careLog: string;
  todayLog: string;
  monthlyAlbum: string;
  monthHighlights: string;
  monthSummary: string;
  monthNotes: string;
  photosComingSoon: string;
  savedCareLogs: string;
  timeline: string;
  sourceText: string;
  entries: string;
  noLogs: string;
  ready: string;
  notFound: string;
  expired: string;
  revoked: string;
  unsupported: string;
  apiUnavailable: string;
  language: string;
  wallet: string;
  walletPrompt: string;
  walletConnected: string;
  walletDemoMode: string;
  ja: string;
  en: string;
  categories: Record<string, string>;
};

const dictionaries: Record<Locale, Dictionary> = {
  ja: {
    appName: "Hibi",
    tagline: "家族の日々を、未来に残す。",
    careLog: "育児ログ",
    todayLog: "今日の育児ログ",
    monthlyAlbum: "成長アルバム",
    monthHighlights: "今月のハイライト",
    monthSummary: "日々の記録から、この月の成長をまとめています。",
    monthNotes: "月の記録",
    photosComingSoon: "写真アルバムは次のステップで追加します。",
    savedCareLogs: "保存された育児ログ",
    timeline: "タイムライン",
    sourceText: "入力メモ",
    entries: "件",
    noLogs: "この日の育児ログはまだありません。",
    ready: "保存済み",
    notFound: "このビューは見つかりません。",
    expired: "このビューは期限切れです。",
    revoked: "このビューは取り消されています。",
    unsupported: "このビュー形式はまだ表示できません。",
    apiUnavailable: "Hibi APIに接続できません。",
    language: "Language",
    wallet: "ウォレット",
    walletPrompt: "ウォレットを接続",
    walletConnected: "接続済みウォレット",
    walletDemoMode: "現在はdemo modeです。次の段階でFamilyVault確認に使います。",
    ja: "日本語",
    en: "English",
    categories: {
      milk: "ミルク",
      breastfeeding: "授乳",
      sleep_start: "睡眠開始",
      sleep_end: "起床",
      poop: "うんち",
      pee: "おしっこ",
      temperature: "体温"
    }
  },
  en: {
    appName: "Hibi",
    tagline: "Family memories, remembered.",
    careLog: "Care Log",
    todayLog: "Daily Care Log",
    monthlyAlbum: "Growth Album",
    monthHighlights: "Monthly Highlights",
    monthSummary: "A monthly view created from saved family care logs.",
    monthNotes: "Monthly Notes",
    photosComingSoon: "Photo albums will be added in the next step.",
    savedCareLogs: "Saved care logs",
    timeline: "Timeline",
    sourceText: "Original note",
    entries: "entries",
    noLogs: "No care logs have been recorded for this day.",
    ready: "Saved",
    notFound: "This view was not found.",
    expired: "This view has expired.",
    revoked: "This view has been revoked.",
    unsupported: "This view type is not supported yet.",
    apiUnavailable: "Cannot connect to Hibi API.",
    language: "Language",
    wallet: "Wallet",
    walletPrompt: "Connect wallet",
    walletConnected: "Connected wallet",
    walletDemoMode: "Demo mode for now. This will verify FamilyVault ownership later.",
    ja: "日本語",
    en: "English",
    categories: {
      milk: "Milk",
      breastfeeding: "Breastfeeding",
      sleep_start: "Sleep start",
      sleep_end: "Wake",
      poop: "Poop",
      pee: "Pee",
      temperature: "Temperature"
    }
  }
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function parseLocale(value: string | string[] | undefined): Locale {
  return value === "en" ? "en" : "ja";
}
