export type Locale = "ja" | "en";

export type Dictionary = {
  appName: string;
  tagline: string;

  // nav
  nav: {
    home: string;
    albums: string;
    thisMonth: string;
    thisYear: string;
    onThisDay: string;
    careLog: string;
  };

  // home
  homeHeroTitle: string;
  homeHeroBody: string;
  openViewUrl: string;
  checkApiStatus: string;
  homeShowcaseTitle: string;
  homeShowcaseHint: string;
  homeShowcaseAlbumTitle: string;
  homeShowcaseAlbumBody: string;
  homeShowcaseAlbumCover: string;
  homeShowcaseAlbumLink: string;
  homeShowcaseCareLogTitle: string;
  homeShowcaseCareLogBody: string;
  homeShowcaseCareLogListLabel: string;
  homeShowcaseCareLogLink: string;
  homeHowToTitle: string;
  homeHowToHint: string;
  homeHowToSteps: {
    title: string;
    detail: string;
  }[];
  quickActions: string;
  quickActionsHint: string;
  recentViews: string;
  recentViewsHint: string;
  openView: string;
  noRecentViews: string;

  // quick action cards
  actions: {
    thisMonth: { title: string; hint: string };
    thisYear: { title: string; hint: string };
    onThisDay: { title: string; hint: string };
    openAlbum: { title: string; hint: string };
    careLog: { title: string; hint: string };
    photoLibrary: { title: string; hint: string };
  };

  // album hub
  albumHubTitle: string;
  albumHubBody: string;
  allAlbums: string;
  open: string;
  photos: string;
  emptyAlbums: string;

  // monthly
  monthlyEyebrow: string;
  monthlyTitle: string;
  monthlyBody: string;
  highlightPhotos: string;
  milestones: string;
  monthNotes: string;
  careSummary: string;

  // yearly
  yearlyEyebrow: string;
  yearlyTitle: string;
  yearlyBody: string;
  bestMoments: string;
  monthChapters: string;
  growthTimeline: string;
  yearStats: string;
  firstTimes: string;

  // on this day
  onThisDayTitle: string;
  yearsAgoToday: (n: number) => string;
  aroundThisDate: string;
  noMemoriesToday: string;

  // care log / view
  careLog: string;
  todayLog: string;
  monthlyAlbum: string;
  monthHighlights: string;
  monthSummary: string;
  photosComingSoon: string;
  savedCareLogs: string;
  timeline: string;
  sourceText: string;
  entries: string;
  noLogs: string;
  ready: string;

  // archive status
  archiveStatus: string;
  archiveStatusHint: string;
  storageProof: string;
  walrusSaved: string;
  walrusPending: string;
  manifestHash: string;
  memwalRemembered: string;
  suiVerified: string;
  demoMode: string;
  viewDetails: string;

  // states
  notFound: string;
  expired: string;
  revoked: string;
  unsupported: string;
  apiUnavailable: string;
  backHome: string;

  // misc
  language: string;
  wallet: string;
  walletPrompt: string;
  walletConnected: string;
  walletDemoMode: string;
  familyAccess: string;
  comingSoon: string;
  ja: string;
  en: string;
  categories: Record<string, string>;
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    appName: "Hibi",
    tagline: "Family memories, remembered.",

    nav: {
      home: "Home",
      albums: "Albums",
      thisMonth: "This Month",
      thisYear: "This Year",
      onThisDay: "On This Day",
      careLog: "Care Log"
    },

    homeHeroTitle: "Family memories, remembered.",
    homeHeroBody:
      "Open childcare logs and growth albums created from chat, then connect a Sui wallet to prepare for family archive verification.",
    openViewUrl: "Open a View URL",
    checkApiStatus: "Check API status",
    homeShowcaseTitle: "Try the Hibi experience",
    homeShowcaseHint: "Albums and care logs shown as they appear in the product.",
    homeShowcaseAlbumTitle: "Monthly growth album",
    homeShowcaseAlbumBody:
      "Photos, milestones, and notes are grouped into a friendly timeline for each month.",
    homeShowcaseAlbumCover: "Album preview",
    homeShowcaseAlbumLink: "Open album page",
    homeShowcaseCareLogTitle: "Care log timeline",
    homeShowcaseCareLogBody:
      "Daily care records are easy to scan by day, time, and note.",
    homeShowcaseCareLogListLabel: "Care log preview",
    homeShowcaseCareLogLink: "Open care log page",
    homeHowToTitle: "How to use Hibi",
    homeHowToHint: "Start with two terminals and try it in four simple steps.",
    homeHowToSteps: [
      {
        title: "Run Hibi API",
        detail: "Start API on one terminal and keep it available at `http://127.0.0.1:4000`."
      },
      {
        title: "Run Hibi Web",
        detail: "Start the web app on another terminal and open `http://127.0.0.1:3000`."
      },
      {
        title: "Connect wallet",
        detail: "Connect a Sui wallet that owns the FamilyMemberSBT to unlock family access."
      },
      {
        title: "View memories",
        detail: "Open a View URL from your local API and explore album / care log pages."
      }
    ],
    quickActions: "Where to next?",
    quickActionsHint: "Jump straight into your family memories.",
    recentViews: "Recently opened",
    recentViewsHint: "Pick up where you left off.",
    openView: "Open",
    noRecentViews: "No views opened yet. Try a quick action above.",

    actions: {
      thisMonth: { title: "This Month", hint: "Best photos & moments this month" },
      thisYear: { title: "This Year", hint: "Growth & events of the year" },
      onThisDay: { title: "On This Day", hint: "A year ago today, and before" },
      openAlbum: { title: "Open Album", hint: "Browse all your albums" },
      careLog: { title: "Care Log", hint: "Look back on daily care" },
      photoLibrary: { title: "Photo Library", hint: "All your saved photos" }
    },

    albumHubTitle: "Albums",
    albumHubBody: "Monthly, yearly, and on-this-day memories — all in one place.",
    allAlbums: "All albums",
    open: "Open",
    photos: "photos",
    emptyAlbums: "No albums yet. They will appear here once memories are saved.",

    monthlyEyebrow: "Monthly Highlights",
    monthlyTitle: "This Month",
    monthlyBody: "The good photos, notes, and little milestones from this month.",
    highlightPhotos: "Highlight photos",
    milestones: "Milestones",
    monthNotes: "Notes",
    careSummary: "Care summary",

    yearlyEyebrow: "Yearly Highlights",
    yearlyTitle: "This Year",
    yearlyBody: "A year of growth, gathered month by month.",
    bestMoments: "Best moments",
    monthChapters: "Monthly chapters",
    growthTimeline: "Growth timeline",
    yearStats: "Year in numbers",
    firstTimes: "First times",

    onThisDayTitle: "On This Day",
    yearsAgoToday: (n: number) => (n === 1 ? "1 year ago today" : `${n} years ago today`),
    aroundThisDate: "Around this date",
    noMemoriesToday: "No memories found for this day yet.",

    careLog: "Care Log",
    todayLog: "Daily Care Log",
    monthlyAlbum: "Growth Album",
    monthHighlights: "Monthly Highlights",
    monthSummary: "A monthly view created from saved family care logs.",
    photosComingSoon: "Photo albums will be added in the next step.",
    savedCareLogs: "Saved care logs",
    timeline: "Timeline",
    sourceText: "Original note",
    entries: "entries",
    noLogs: "No care logs have been recorded for this day.",
    ready: "Saved",

    archiveStatus: "Archive status",
    archiveStatusHint: "Where your memories are safely kept.",
    storageProof: "Storage proof",
    walrusSaved: "Saved to Walrus",
    walrusPending: "Manifest ready",
    manifestHash: "Manifest hash",
    memwalRemembered: "Remembered by MemWal",
    suiVerified: "Verified on Sui",
    demoMode: "Demo mode",
    viewDetails: "View details",

    notFound: "This view was not found.",
    expired: "This view has expired.",
    revoked: "This view has been revoked.",
    unsupported: "This view type is not supported yet.",
    apiUnavailable: "Cannot connect to Hibi API.",
    backHome: "Back to Home",

    language: "Language",
    wallet: "Wallet",
    walletPrompt: "Connect wallet",
    walletConnected: "Connected wallet",
    walletDemoMode: "Demo mode for now. This will verify FamilyVault ownership later.",
    familyAccess: "Family access",
    comingSoon: "Coming soon",
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
  },

  ja: {
    appName: "Hibi",
    tagline: "家族の日々を、未来に残す。",

    nav: {
      home: "ホーム",
      albums: "アルバム",
      thisMonth: "今月",
      thisYear: "今年",
      onThisDay: "去年の今日",
      careLog: "育児ログ"
    },

    homeHeroTitle: "家族の日々を、未来に残す。",
    homeHeroBody:
      "チャットから生まれた育児ログや成長アルバムを開いて、Suiウォレットを接続すると家族アーカイブの確認に進めます。",
    openViewUrl: "ビューURLを開く",
    checkApiStatus: "API状態を確認",
    homeShowcaseTitle: "Hibi の使い方を試してみる",
    homeShowcaseHint: "アルバムと育児ログが、こんな表示になるイメージです。",
    homeShowcaseAlbumTitle: "月ごとのアルバム",
    homeShowcaseAlbumBody: "写真やメモ、マイルストーンが月単位でまとまり、成長の流れが見やすくなります。",
    homeShowcaseAlbumCover: "アルバムの見え方",
    homeShowcaseAlbumLink: "アルバムを見る",
    homeShowcaseCareLogTitle: "育児ログ",
    homeShowcaseCareLogBody: "毎日の記録を時系列で確認できる、サッと見えるタイムラインです。",
    homeShowcaseCareLogListLabel: "育児ログの見え方",
    homeShowcaseCareLogLink: "育児ログを見る",
    homeHowToTitle: "Hibi の使い方",
    homeHowToHint: "2つの端末でAPIとWebを起動し、4ステップで確認できます。",
    homeHowToSteps: [
      {
        title: "APIを起動",
        detail: "1つ目のターミナルでAPIを起動し、`http://127.0.0.1:4000` を待ち状態にします。"
      },
      {
        title: "Webを起動",
        detail: "2つ目のターミナルでWebを起動し、`http://127.0.0.1:3000` へアクセスします。"
      },
      {
        title: "ウォレット接続",
        detail: "FamilyMemberSBTを持つSuiウォレットを接続して、ファミリー認証を有効化します。"
      },
      {
        title: "画面を開く",
        detail: "`POST /api/messages` または `POST /api/albums/generate` の返却viewUrlで閲覧します。"
      }
    ],
    quickActions: "今日はどこを見る？",
    quickActionsHint: "家族の思い出にすぐ飛べます。",
    recentViews: "最近開いたビュー",
    recentViewsHint: "続きからどうぞ。",
    openView: "開く",
    noRecentViews: "まだビューを開いていません。上のボタンから試せます。",

    actions: {
      thisMonth: { title: "今月", hint: "今月のいい写真と出来事" },
      thisYear: { title: "今年", hint: "今年の成長とイベント" },
      onThisDay: { title: "去年の今日", hint: "1年前の今日、その前も" },
      openAlbum: { title: "アルバムを開く", hint: "すべてのアルバムを見る" },
      careLog: { title: "育児ログ", hint: "毎日の記録を振り返る" },
      photoLibrary: { title: "写真ライブラリ", hint: "保存した写真すべて" }
    },

    albumHubTitle: "アルバム",
    albumHubBody: "月ごと・年ごと・去年の今日。思い出をひとつの場所に。",
    allAlbums: "すべてのアルバム",
    open: "開く",
    photos: "枚",
    emptyAlbums: "まだアルバムがありません。記録が保存されるとここに表示されます。",

    monthlyEyebrow: "今月のハイライト",
    monthlyTitle: "今月",
    monthlyBody: "今月のいい写真、メモ、ちいさな成長をまとめました。",
    highlightPhotos: "ハイライト写真",
    milestones: "できるようになったこと",
    monthNotes: "メモ",
    careSummary: "育児サマリー",

    yearlyEyebrow: "今年のハイライト",
    yearlyTitle: "今年",
    yearlyBody: "1年の成長を、月ごとにまとめました。",
    bestMoments: "ベストな瞬間",
    monthChapters: "月別チャプター",
    growthTimeline: "成長タイムライン",
    yearStats: "今年の数字",
    firstTimes: "はじめての記録",

    onThisDayTitle: "去年の今日",
    yearsAgoToday: (n: number) => `${n}年前の今日`,
    aroundThisDate: "この日のまわり",
    noMemoriesToday: "この日の思い出はまだありません。",

    careLog: "育児ログ",
    todayLog: "今日の育児ログ",
    monthlyAlbum: "成長アルバム",
    monthHighlights: "今月のハイライト",
    monthSummary: "日々の記録から、この月の成長をまとめています。",
    photosComingSoon: "写真アルバムは次のステップで追加します。",
    savedCareLogs: "保存された育児ログ",
    timeline: "タイムライン",
    sourceText: "入力メモ",
    entries: "件",
    noLogs: "この日の育児ログはまだありません。",
    ready: "保存済み",

    archiveStatus: "アーカイブ状態",
    archiveStatusHint: "思い出が安全に保管されている場所。",
    storageProof: "保存の証明",
    walrusSaved: "Walrusに保存済み",
    walrusPending: "Manifest生成済み",
    manifestHash: "Manifest hash",
    memwalRemembered: "MemWalが記憶",
    suiVerified: "Suiで検証済み",
    demoMode: "デモモード",
    viewDetails: "詳細を見る",

    notFound: "このビューは見つかりません。",
    expired: "このビューは期限切れです。",
    revoked: "このビューは取り消されています。",
    unsupported: "このビュー形式はまだ表示できません。",
    apiUnavailable: "Hibi APIに接続できません。",
    backHome: "ホームに戻る",

    language: "Language",
    wallet: "ウォレット",
    walletPrompt: "ウォレットを接続",
    walletConnected: "接続済みウォレット",
    walletDemoMode: "現在はdemo modeです。次の段階でFamilyVault確認に使います。",
    familyAccess: "家族アクセス",
    comingSoon: "準備中",
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
  }
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function parseLocale(value: string | string[] | undefined): Locale {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "ja" ? "ja" : "en";
}

/** Build a path that preserves the current locale as a query param. */
export function withLocale(path: string, locale: Locale): string {
  if (locale === "en") {
    return path;
  }
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=ja`;
}
