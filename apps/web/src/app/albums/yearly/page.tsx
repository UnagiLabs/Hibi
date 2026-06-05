import { CalendarRange } from "lucide-react";
import Link from "next/link";

import { PhotoTile, SectionHeader } from "@/components/memory-ui";
import { SiteHeader } from "@/components/site-header";
import {
  demoHighlightPhotos,
  demoMilestones,
  demoMonthChapters,
  type DemoMonthChapter
} from "@/lib/demo";
import { getDictionary, parseLocale, withLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function YearlyPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const yearLabel = locale === "ja" ? "2026年" : "2026";
  const totalPhotos = demoMonthChapters.reduce((sum, c) => sum + c.photoCount, 0);

  return (
    <main className="shell">
      <SiteHeader locale={locale} currentPath="/albums/yearly" active="albums" />

      <section className="cover-panel fade-up">
        <p className="eyebrow">{dictionary.yearlyEyebrow}</p>
        <h1>{dictionary.yearlyTitle}</h1>
        <p className="album-copy">{dictionary.yearlyBody}</p>
        <div className="date-chip">
          <CalendarRange size={18} aria-hidden="true" />
          <span>{yearLabel}</span>
        </div>
      </section>

      <section className="fade-up fade-up-1">
        <SectionHeader title={dictionary.yearStats} />
        <div className="stat-grid">
          <div className="metric">
            <strong>{totalPhotos}</strong>
            <span>{dictionary.photos}</span>
          </div>
          <div className="metric">
            <strong>{demoMonthChapters.length}</strong>
            <span>{dictionary.monthChapters}</span>
          </div>
          <div className="metric">
            <strong>{demoMilestones.length}</strong>
            <span>{dictionary.firstTimes}</span>
          </div>
          <div className="metric">
            <strong>{demoHighlightPhotos.length}</strong>
            <span>{dictionary.bestMoments}</span>
          </div>
        </div>
      </section>

      <section className="fade-up fade-up-2">
        <SectionHeader title={dictionary.monthChapters} />
        <div className="chapter-grid">
          {demoMonthChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} locale={locale} />
          ))}
        </div>
      </section>

      <section className="fade-up fade-up-3">
        <SectionHeader title={dictionary.bestMoments} />
        <div className="photo-grid">
          {demoHighlightPhotos.map((photo) => (
            <PhotoTile key={photo.id} photo={photo} locale={locale} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ChapterCard({ chapter, locale }: { chapter: DemoMonthChapter; locale: Locale }) {
  const dictionary = getDictionary(locale);
  return (
    <Link className="chapter-card" href={withLocale("/albums/monthly", locale)}>
      <div className={`chapter-cover tone-${chapter.cover}`} />
      <div className="chapter-meta">
        <strong>{chapter.month[locale]}</strong>
        <span>
          {chapter.photoCount} {dictionary.photos}
        </span>
      </div>
    </Link>
  );
}
