import { CalendarDays } from "lucide-react";

import { PhotoTile, SectionHeader } from "@/components/memory-ui";
import { SiteHeader } from "@/components/site-header";
import { demoHighlightPhotos, demoMilestones, demoNotes } from "@/lib/demo";
import { getDictionary, parseLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function MonthlyPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const monthLabel = locale === "ja" ? "2026年6月" : "June 2026";

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
            <strong>{demoMilestones.length}</strong>
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
        <MilestoneChips locale={locale} />
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
