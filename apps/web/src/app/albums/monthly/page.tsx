import { CalendarDays, Sparkles } from "lucide-react";

import { PhotoTile, SectionHeader } from "@/components/memory-ui";
import { SiteHeader } from "@/components/site-header";
import { demoHighlightPhotos, demoMilestones, demoNotes } from "@/lib/demo";
import { fetchMonthlyAlbum, type MonthlyAlbumHighlight } from "@/lib/api";
import { getDictionary, parseLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{
    lang?: string | string[];
    targetYear?: string | string[];
    targetMonth?: string | string[];
  }>;
};

export default async function MonthlyPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const targetYear = parseIntegerParam(query.targetYear);
  const targetMonth = parseIntegerParam(query.targetMonth);
  const monthlyAlbum = await fetchMonthlyAlbum({
    targetYear,
    targetMonth
  });
  const highlightResults =
    monthlyAlbum.ok && monthlyAlbum.memwalHighlights.status === "ok"
      ? monthlyAlbum.memwalHighlights.results
      : [];
  const displayYear = monthlyAlbum.ok ? monthlyAlbum.targetYear : targetYear ?? 2026;
  const displayMonth = monthlyAlbum.ok ? monthlyAlbum.targetMonth : targetMonth ?? 6;
  const monthLabel = formatMonthLabel(displayYear, displayMonth, locale);

  return (
    <main className="shell">
      <SiteHeader locale={locale} currentPath="/albums/monthly" active="albums" />

      <section className="cover-panel fade-up">
        <p className="eyebrow">{dictionary.monthlyEyebrow}</p>
        <h1>{dictionary.monthlyTitle}</h1>
        <p className="album-copy">{dictionary.monthlyBody}</p>
        <div className="date-chip">
          <CalendarDays size={18} aria-hidden="true" />
          <span>{monthLabel}</span>
        </div>
        <div className="metric-strip">
          <div>
            <strong>{demoHighlightPhotos.length}</strong>
            <span>{dictionary.highlightPhotos}</span>
          </div>
          <div>
            <strong>{highlightResults.length || demoMilestones.length}</strong>
            <span>{dictionary.milestones}</span>
          </div>
        </div>
      </section>

      <section className="fade-up fade-up-1">
        <SectionHeader eyebrow={dictionary.monthlyEyebrow} title={dictionary.highlightPhotos} />
        <div className="photo-grid">
          {demoHighlightPhotos.map((photo) => (
            <PhotoTile key={photo.id} photo={photo} locale={locale} />
          ))}
        </div>
      </section>

      <section className="fade-up fade-up-2">
        <SectionHeader title={dictionary.milestones} />
        {highlightResults.length > 0 ? (
          <MemWalHighlights highlights={highlightResults} locale={locale} />
        ) : (
          <MilestoneChips locale={locale} />
        )}
      </section>

      <section className="fade-up fade-up-3">
        <SectionHeader title={dictionary.monthNotes} />
        <div className="note-list">
          {demoNotes.map((note) => (
            <div className="note-card" key={note.id}>
              <span className="note-date">{note.date[locale]}</span>
              <p>{note.text[locale]}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function MemWalHighlights({
  highlights,
  locale
}: {
  highlights: MonthlyAlbumHighlight[];
  locale: Locale;
}) {
  return (
    <div className="note-list">
      {highlights.map((highlight) => (
        <div className="note-card" key={highlight.blobId}>
          <span className="note-date">
            <Sparkles size={14} aria-hidden="true" />
            MemWal
          </span>
          <p>{getHighlightLabel(highlight, locale)}</p>
        </div>
      ))}
    </div>
  );
}

function MilestoneChips({ locale }: { locale: Locale }) {
  return (
    <div className="chip-list">
      {demoMilestones.map((milestone) => (
        <span className="chip" key={milestone.id}>
          <span className="emoji" aria-hidden="true">
            {milestone.emoji}
          </span>
          {milestone.label[locale]}
        </span>
      ))}
    </div>
  );
}

function getHighlightLabel(highlight: MonthlyAlbumHighlight, locale: Locale): string {
  if (highlight.source?.type === "memory_item") {
    return highlight.source.body;
  }

  if (highlight.source?.type === "care_log") {
    return locale === "ja"
      ? `${highlight.source.sourceText} を思い出として見つけました`
      : `Found care memory: ${highlight.source.sourceText}`;
  }

  const summary = highlight.text.match(/^Summary:\s*(?<summary>.+)$/m);
  return summary?.groups?.summary ?? highlight.text;
}

function parseIntegerParam(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !/^\d+$/.test(raw)) {
    return undefined;
  }

  return Number.parseInt(raw, 10);
}

function formatMonthLabel(year: number, month: number, locale: Locale): string {
  if (locale === "ja") {
    return `${year}年${month}月`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, 1));
}
