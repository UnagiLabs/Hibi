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
      "Explore a privacy-safe sample family archive, then run the local API to save real photos, care logs, MemWal memories, and Sui/Walrus proofs in your own environment.",
    openViewUrl: "Open sample care log",
    checkApiStatus: "Check API status",
    homeShowcaseTitle: "Sample Family Demo",
    homeShowcaseHint:
      "A public preview with sample family data. The real workflow runs through your local Hibi API.",
    homeShowcaseAlbumTitle: "Monthly growth album",
    homeShowcaseAlbumBody:
      "Photos, milestones, and notes are grouped into a friendly timeline for each month.",
    homeShowcaseAlbumCover: "Privacy-safe album preview",
    homeShowcaseAlbumLink: "Open sample album",
    homeShowcaseCareLogTitle: "Care log timeline",
    homeShowcaseCareLogBody:
      "Daily care records are easy to scan by day, time, and note.",
    homeShowcaseCareLogListLabel: "Privacy-safe care log preview",
    homeShowcaseCareLogLink: "Open sample care log",
    homeHowToTitle: "How to use Hibi",
    homeHowToHint: "Run on your own machine in four steps.",
    homeHowToSteps: [
      {
        title: "Run Hibi API",
        detail: "Start the API service on your own environment at `http://127.0.0.1:4000`."
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
        detail: "Open a View URL returned by your local API and explore album / care log pages."
      }
    ],
    quickActions: "Where to next?",
    quickActionsHint: "Jump into the sample family archive.",
    recentViews: "Sample views",
    recentViewsHint: "Preview the views Hibi returns from the local API.",
    openView: "Open",
    noRecentViews: "No views opened yet. Try a quick action above.",

    actions: {
      thisMonth: { title: "This Month", hint: "Sample monthly album" },
      thisYear: { title: "This Year", hint: "Sample yearly growth view" },
      onThisDay: { title: "On This Day", hint: "Sample memory resurfacing" },
      openAlbum: { title: "Open Album", hint: "Browse sample albums" },
      careLog: { title: "Care Log", hint: "Preview daily care logs" },
      photoLibrary: { title: "Photo Library", hint: "Browse sample saved photos" }
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
    photosComingSoon: "Photos appear here after the local API stores them.",
    savedCareLogs: "Saved care logs",
    timeline: "Timeline",
    sourceText: "Original note",
    entries: "entries",
    noLogs: "No care logs have been recorded for this day.",
    ready: "Saved",

    archiveStatus: "Archive status",
    archiveStatusHint: "Sample proofs show where local memories are archived.",
    storageProof: "Storage proof",
    walrusSaved: "Saved to Walrus",
    walrusPending: "Manifest ready",
    manifestHash: "Manifest hash",
    memwalRemembered: "Remembered by MemWal",
    suiVerified: "Verified on Sui",
    demoMode: "Sample proof",
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
    familyAccess: "Family access",
    comingSoon: "Planned",
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
      "公開サイトでは安全なサンプル家族アーカイブを見せ、実際の写真・育児ログ・MemWal記憶・Sui/Walrus証明はローカルAPIで保存します。",
    openViewUrl: "サンプル育児ログを開く",
    checkApiStatus: "API状態を確認",
    homeShowcaseTitle: "Sample Family Demo",
    homeShowcaseHint: "公開用のサンプル家族データです。実データの保存はローカルHibi APIで動きます。",
    homeShowcaseAlbumTitle: "月ごとのアルバム",
    homeShowcaseAlbumBody: "写真やメモ、マイルストーンが月単位でまとまり、成長の流れが見やすくなります。",
    homeShowcaseAlbumCover: "公開用アルバムプレビュー",
    homeShowcaseAlbumLink: "サンプルアルバムを見る",
    homeShowcaseCareLogTitle: "育児ログ",
    homeShowcaseCareLogBody: "毎日の記録を時系列で確認できる、サッと見えるタイムラインです。",
    homeShowcaseCareLogListLabel: "公開用育児ログプレビュー",
    homeShowcaseCareLogLink: "サンプル育児ログを見る",
    homeHowToTitle: "ローカル自己運用の手順",
    homeHowToHint: "自分の端末で4ステップ。データはあなたの環境で管理できます。",
    homeHowToSteps: [
      {
        title: "APIを起動",
        detail: "まずAPIを起動し、`http://127.0.0.1:4000` で個人環境のバックエンドを起動します。"
      },
      {
        title: "Webを起動",
        detail: "続いてWebを起動し、`http://127.0.0.1:3000` で画面を開きます。"
      },
      {
        title: "ウォレット接続",
        detail: "FamilyMemberSBTを持つSuiウォレットを接続して、ファミリー認証を有効化します。"
      },
      {
        title: "画面を開く",
        detail: "APIのレスポンスで返ってくるviewUrlを開いて、アルバム / 育児ログを閲覧します。"
      }
    ],
    quickActions: "今日はどこを見る？",
    quickActionsHint: "サンプル家族アーカイブをすぐ確認できます。",
    recentViews: "サンプルビュー",
    recentViewsHint: "ローカルAPIが返す画面の見え方を確認できます。",
    openView: "開く",
    noRecentViews: "まだビューを開いていません。上のボタンから試せます。",

    actions: {
      thisMonth: { title: "今月", hint: "サンプル月次アルバム" },
      thisYear: { title: "今年", hint: "サンプル年間成長ビュー" },
      onThisDay: { title: "去年の今日", hint: "記憶の再発見サンプル" },
      openAlbum: { title: "アルバムを開く", hint: "サンプルアルバムを見る" },
      careLog: { title: "育児ログ", hint: "日々の記録をプレビュー" },
      photoLibrary: { title: "写真ライブラリ", hint: "サンプル写真を見る" }
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
    photosComingSoon: "ローカルAPIで写真を保存すると、ここに表示されます。",
    savedCareLogs: "保存された育児ログ",
    timeline: "タイムライン",
    sourceText: "入力メモ",
    entries: "件",
    noLogs: "この日の育児ログはまだありません。",
    ready: "保存済み",

    archiveStatus: "アーカイブ状態",
    archiveStatusHint: "ローカル保存後にどこへ保管されるかを、サンプル証明で示します。",
    storageProof: "保存の証明",
    walrusSaved: "Walrusに保存済み",
    walrusPending: "Manifest生成済み",
    manifestHash: "Manifest hash",
    memwalRemembered: "MemWalが記憶",
    suiVerified: "Suiで検証済み",
    demoMode: "サンプル証明",
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
    familyAccess: "家族アクセス",
    comingSoon: "予定",
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
