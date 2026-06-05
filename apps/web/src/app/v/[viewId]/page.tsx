import {
  Baby,
  CalendarDays,
  CircleAlert,
  Droplets,
  Heart,
  Images,
  Languages,
  Milk,
  Moon,
  Sparkles,
  Sun,
  Thermometer,
  Toilet
} from "lucide-react";
import Link from "next/link";

import { WalletSlot } from "@/components/wallet-slot";
import type { CareLog } from "@/lib/api";
import { fetchMemoryView } from "@/lib/api";
import { formatCareLogValue, formatDateRange, formatMonthRange, formatTime } from "@/lib/format";
import { getDictionary, parseLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ viewId: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function MemoryViewPage({ params, searchParams }: PageProps) {
  const { viewId } = await params;
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const response = await safeFetchMemoryView(viewId);

  if (!response.ok) {
    return (
      <main className="shell">
        <TopBar viewId={viewId} locale={locale} />
        <StatusPanel
          title={dictionary.appName}
          message={messageForState(response.state, dictionary)}
          locale={locale}
        />
      </main>
    );
  }

  if (response.view.type === "monthly_growth_album") {
    return (
      <main className="shell">
        <TopBar viewId={viewId} locale={locale} />
        <AlbumView response={response} locale={locale} />
      </main>
    );
  }

  return (
    <main className="shell">
      <TopBar viewId={viewId} locale={locale} />
      <CareLogView response={response} locale={locale} />
    </main>
  );
}

function CareLogView({
  response,
  locale
}: {
  response: Extract<Awaited<ReturnType<typeof fetchMemoryView>>, { ok: true }>;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <section className="view-layout">
      <div className="summary-panel">
        <div className="brand-mark">{dictionary.appName}</div>
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
  response: Extract<Awaited<ReturnType<typeof fetchMemoryView>>, { ok: true }>;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const highlights = buildHighlights(response.careLogs, locale);
  const title = response.album?.title ?? dictionary.monthlyAlbum;

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
        <div className="photo-placeholder">
          <Images size={34} aria-hidden="true" />
          <span>{dictionary.photosComingSoon}</span>
        </div>
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

async function safeFetchMemoryView(viewId: string) {
  try {
    return await fetchMemoryView(viewId);
  } catch {
    return {
      ok: false as const,
      state: undefined
    };
  }
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

function TopBar({ viewId, locale }: { viewId: string; locale: Locale }) {
  return (
    <div className="top-bar">
      <WalletSlot locale={locale} />
      <LanguageSwitch viewId={viewId} locale={locale} />
    </div>
  );
}

function LanguageSwitch({ viewId, locale }: { viewId: string; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const otherLocale = locale === "ja" ? "en" : "ja";

  return (
    <nav className="language-switch" aria-label={dictionary.language}>
      <Languages size={16} aria-hidden="true" />
      <Link href={`/v/${viewId}?lang=${otherLocale}`}>
        {locale === "ja" ? dictionary.en : dictionary.ja}
      </Link>
    </nav>
  );
}

function StatusPanel({
  title,
  message,
  locale
}: {
  title: string;
  message: string;
  locale: Locale;
}) {
  return (
    <section className="empty-state">
      <div className="brand-mark">{title}</div>
      <CircleAlert size={36} aria-hidden="true" />
      <p>{message}</p>
      <Link className="text-link" href={`/?lang=${locale}`}>
        {title}
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
