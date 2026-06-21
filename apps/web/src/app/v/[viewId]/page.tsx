import {
  Baby,
  CalendarDays,
  Droplets,
  Heart,
  Images,
  Milk,
  Moon,
  Sparkles,
  Sun,
  Thermometer,
  Toilet
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import type { BootstrapResponse, CareLog, MediaAssetPhoto } from "@/lib/api";
import { fetchMemoryView } from "@/lib/api";
import { formatCareLogValue, formatDateRange, formatMonthRange, formatTime } from "@/lib/format";
import { getDictionary, parseLocale, withLocale, type Locale } from "@/lib/i18n";

type ReadyMemoryViewResponse = Extract<BootstrapResponse, { ok: true }>;

type PageProps = {
  params: Promise<{ viewId: string }>;
  searchParams: Promise<{
    lang?: string | string[];
    walletAddress?: string | string[];
  }>;
};

export default async function MemoryViewPage({ params, searchParams }: PageProps) {
  const { viewId } = await params;
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const walletAddress = parseWalletAddress(query.walletAddress);
  const currentPath = `/v/${viewId}`;

  if (viewId === "demo") {
    return (
      <main className="shell">
        <SiteHeader locale={locale} currentPath={currentPath} active="careLog" />
        <CareLogView response={buildDemoCareLogResponse(locale)} locale={locale} />
      </main>
    );
  }

  const response = await safeFetchMemoryView(viewId, { walletAddress });

  if (!response.ok) {
    return (
      <main className="shell">
        <SiteHeader locale={locale} currentPath={currentPath} active="careLog" />
        <StatusPanel message={messageForState(response.state, dictionary)} locale={locale} />
      </main>
    );
  }

  if (response.view.type === "monthly_growth_album") {
    return (
      <main className="shell">
        <SiteHeader locale={locale} currentPath={currentPath} active="albums" />
        <AlbumView response={response} locale={locale} />
      </main>
    );
  }

  return (
    <main className="shell">
      <SiteHeader locale={locale} currentPath={currentPath} active="careLog" />
      <CareLogView response={response} locale={locale} />
    </main>
  );
}

function CareLogView({
  response,
  locale
}: {
  response: ReadyMemoryViewResponse;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <section className="view-layout">
      <div className="summary-panel">
        <div className="brand-mark">
          <Image
            src="/HiBi.png"
            alt={dictionary.appName}
            width={760}
            height={760}
            priority
            className="brand-mark-image"
          />
        </div>
        <p className="eyebrow">{dictionary.tagline}</p>
        <h1>{dictionary.todayLog}</h1>
        <div className="date-chip">
          <CalendarDays size={18} aria-hidden="true" />
          <span>{formatDateRange(response.view.rangeStart, locale)}</span>
        </div>
        <div className="metric-strip" aria-label={dictionary.careLog}>
          <div>
            <strong>{response.careLogs.length}</strong>
            <span>{dictionary.entries}</span>
          </div>
          <div>
            <strong>{dictionary.ready}</strong>
            <span>{dictionary.careLog}</span>
          </div>
        </div>
        <SoftIllustration />
      </div>

      <TimelinePanel careLogs={response.careLogs} locale={locale} />
    </section>
  );
}

function AlbumView({
  response,
  locale
}: {
  response: ReadyMemoryViewResponse;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const highlights = buildHighlights(response.careLogs, locale);
  const title = response.album?.title ?? dictionary.monthlyAlbum;
  const photos = response.photos ?? [];

  return (
    <section className="album-layout">
      <div className="album-cover">
        <p className="eyebrow">{dictionary.monthlyAlbum}</p>
        <h1>{title}</h1>
        <p className="album-copy">{dictionary.monthSummary}</p>
        <div className="date-chip">
          <CalendarDays size={18} aria-hidden="true" />
          <span>{formatMonthRange(response.view.rangeStart, locale)}</span>
        </div>
        <div className="metric-strip" aria-label={dictionary.monthlyAlbum}>
          <div>
            <strong>{response.careLogs.length}</strong>
            <span>{dictionary.savedCareLogs}</span>
          </div>
          <div>
            <strong>{highlights.length}</strong>
            <span>{dictionary.monthHighlights}</span>
          </div>
        </div>
        {photos.length > 0 ? (
          <div className="photo-grid album-photo-grid">
            {photos.slice(0, 6).map((photo) => (
              <UploadedPhotoTile key={photo.id} photo={photo} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="photo-placeholder">
            <Images size={34} aria-hidden="true" />
            <span>{dictionary.photosComingSoon}</span>
          </div>
        )}
      </div>

      <section className="timeline-panel" aria-labelledby="album-heading">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{dictionary.monthNotes}</p>
            <h2 id="album-heading">{dictionary.monthHighlights}</h2>
          </div>
        </div>
        <div className="highlight-grid">
          {highlights.map((highlight) => (
            <div className="highlight-card" key={highlight.category}>
              <div className={`category-icon ${highlight.category}`}>
                <highlight.Icon size={19} aria-hidden="true" />
              </div>
              <strong>{highlight.label}</strong>
              <span>{highlight.count}</span>
            </div>
          ))}
        </div>
        <TimelinePanel careLogs={response.careLogs.slice(0, 8)} locale={locale} compact />
      </section>
    </section>
  );
}

function UploadedPhotoTile({ photo, locale }: { photo: MediaAssetPhoto; locale: Locale }) {
  return (
    <Link className="photo-tile photo-tile-image" href={withLocale(`/albums/photos/${photo.id}`, locale)}>
      <img src={photo.url} alt={photo.caption} />
      <span className="photo-caption">{photo.caption}</span>
    </Link>
  );
}

function TimelinePanel({
  careLogs,
  locale,
  compact = false
}: {
  careLogs: CareLog[];
  locale: Locale;
  compact?: boolean;
}) {
  const dictionary = getDictionary(locale);

  return (
    <section className={compact ? "timeline-panel embedded" : "timeline-panel"} aria-labelledby="timeline-heading">
      {!compact ? (
        <div className="panel-header">
          <div>
            <p className="eyebrow">{dictionary.careLog}</p>
            <h2 id="timeline-heading">{dictionary.timeline}</h2>
          </div>
        </div>
      ) : null}
      {careLogs.length === 0 ? (
        <div className="empty-state compact">
          <Baby size={28} aria-hidden="true" />
          <p>{dictionary.noLogs}</p>
        </div>
      ) : (
        <ol className="timeline-list">
          {careLogs.map((log) => (
            <CareLogItem key={log.id} log={log} locale={locale} />
          ))}
        </ol>
      )}
    </section>
  );
}

function SoftIllustration() {
  return (
    <div className="soft-illustration" aria-hidden="true">
      <div className="phone-frame">
        <div className="phone-top" />
        <div className="mini-log pink" />
        <div className="mini-log yellow" />
        <div className="mini-log green" />
        <div className="mini-log blue" />
      </div>
      <div className="spark">
        <Sparkles size={28} />
      </div>
    </div>
  );
}

async function safeFetchMemoryView(viewId: string, context: { walletAddress?: string }) {
  try {
    return await fetchMemoryView(viewId, context);
  } catch {
    return {
      ok: false as const,
      state: undefined
    };
  }
}

function buildDemoCareLogResponse(locale: Locale): ReadyMemoryViewResponse {
  const copy = {
    en: {
      milk: "Drank 120ml of milk",
      sleepEnd: "Slept through the night",
      pee: "Diaper changed",
      poop: "Poop recorded",
      temperature: "Morning temperature checked",
      sleepStart: "Nap started",
      breastfeeding: "Nursed after the walk",
      milkEvening: "Drank 90ml after smiling at the window light"
    },
    ja: {
      milk: "ミルク120ml飲んだ",
      sleepEnd: "朝までぐっすり眠れた",
      pee: "おむつを替えた",
      poop: "うんちを記録",
      temperature: "朝の体温をチェック",
      sleepStart: "お昼寝を開始",
      breastfeeding: "お散歩のあとに授乳",
      milkEvening: "窓の光を見て笑ったあと、ミルク90ml"
    }
  }[locale];

  const careLogs: CareLog[] = [
    {
      id: "demo-care-1",
      category: "sleep_end",
      amount: null,
      unit: null,
      value: null,
      sourceText: copy.sleepEnd,
      occurredAt: "2026-06-04T06:40:00.000Z"
    },
    {
      id: "demo-care-2",
      category: "milk",
      amount: 120,
      unit: "ml",
      value: null,
      sourceText: copy.milk,
      occurredAt: "2026-06-04T07:20:00.000Z"
    },
    {
      id: "demo-care-3",
      category: "pee",
      amount: null,
      unit: null,
      value: null,
      sourceText: copy.pee,
      occurredAt: "2026-06-04T08:05:00.000Z"
    },
    {
      id: "demo-care-4",
      category: "poop",
      amount: null,
      unit: null,
      value: null,
      sourceText: copy.poop,
      occurredAt: "2026-06-04T09:10:00.000Z"
    },
    {
      id: "demo-care-5",
      category: "temperature",
      amount: null,
      unit: null,
      value: 36.7,
      sourceText: copy.temperature,
      occurredAt: "2026-06-04T10:00:00.000Z"
    },
    {
      id: "demo-care-6",
      category: "sleep_start",
      amount: null,
      unit: null,
      value: null,
      sourceText: copy.sleepStart,
      occurredAt: "2026-06-04T12:30:00.000Z"
    },
    {
      id: "demo-care-7",
      category: "breastfeeding",
      amount: 15,
      unit: "min",
      value: null,
      sourceText: copy.breastfeeding,
      occurredAt: "2026-06-04T15:15:00.000Z"
    },
    {
      id: "demo-care-8",
      category: "milk",
      amount: 90,
      unit: "ml",
      value: null,
      sourceText: copy.milkEvening,
      occurredAt: "2026-06-04T17:45:00.000Z"
    }
  ];

  return {
    ok: true,
    state: "ready",
    view: {
      id: "demo",
      type: "care_log_day",
      status: "active",
      rangeStart: "2026-06-04T00:00:00.000Z",
      rangeEnd: "2026-06-05T00:00:00.000Z"
    },
    album: null,
    careLogs,
    photos: []
  };
}

function parseWalletAddress(value?: string | string[]): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return undefined;
  }

  const normalized = raw.trim().toLowerCase();
  return /^0x[a-f0-9]{64}$/i.test(normalized) ? normalized : undefined;
}

function CareLogItem({ log, locale }: { log: CareLog; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const Icon = iconForCategory(log.category);
  const label = dictionary.categories[log.category as keyof typeof dictionary.categories] ?? log.category;

  return (
    <li className="timeline-item">
      <time dateTime={log.occurredAt}>{formatTime(log.occurredAt, locale)}</time>
      <div className={`category-icon ${log.category}`}>
        <Icon size={19} aria-hidden="true" />
      </div>
      <div className="log-content">
        <div className="log-main">
          <strong>{label}</strong>
          <span>{formatCareLogValue(log, dictionary)}</span>
        </div>
        <p>{log.sourceText}</p>
      </div>
    </li>
  );
}

function StatusPanel({ message, locale }: { message: string; locale: Locale }) {
  const dictionary = getDictionary(locale);
  return (
    <section className="empty-state fade-up">
      <span className="empty-emoji" aria-hidden="true">
        🍼
      </span>
      <p>{message}</p>
      <Link className="primary-link" href={withLocale("/", locale)}>
        {dictionary.backHome}
      </Link>
    </section>
  );
}

function messageForState(state: string | undefined, dictionary: ReturnType<typeof getDictionary>) {
  switch (state) {
    case "not_found":
      return dictionary.notFound;
    case "expired":
      return dictionary.expired;
    case "revoked":
      return dictionary.revoked;
    case "unsupported_view_type":
      return dictionary.unsupported;
    default:
      return dictionary.apiUnavailable;
  }
}

function iconForCategory(category: string) {
  switch (category) {
    case "milk":
      return Milk;
    case "breastfeeding":
      return Baby;
    case "sleep_start":
      return Moon;
    case "sleep_end":
      return Sun;
    case "poop":
      return Toilet;
    case "pee":
      return Droplets;
    case "temperature":
      return Thermometer;
    default:
      return Sparkles;
  }
}

function buildHighlights(careLogs: CareLog[], locale: Locale) {
  const dictionary = getDictionary(locale);
  const counts = new Map<string, number>();

  for (const log of careLogs) {
    counts.set(log.category, (counts.get(log.category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, count]) => ({
      category,
      count,
      Icon: iconForCategory(category),
      label: dictionary.categories[category] ?? category
    }))
    .concat(
      counts.size === 0
        ? [
            {
              category: "memory",
              count: 0,
              Icon: Heart,
              label: dictionary.monthHighlights
            }
          ]
        : []
    );
}
