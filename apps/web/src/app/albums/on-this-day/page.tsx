import { History, Sparkles } from "lucide-react";

import { PhotoTile } from "@/components/memory-ui";
import { SiteHeader } from "@/components/site-header";
import { demoOnThisDay, type DemoMemoryYear } from "@/lib/demo";
import { getDictionary, parseLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function OnThisDayPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const dateLabel = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    month: "long",
    day: "numeric"
  }).format(new Date("2026-06-05T00:00:00"));

  return (
    <main className="shell">
      <SiteHeader locale={locale} currentPath="/albums/on-this-day" active="onThisDay" />

      <section className="cover-panel fade-up">
        <p className="eyebrow">{dateLabel}</p>
        <h1>{dictionary.onThisDayTitle}</h1>
        <p className="album-copy">{dictionary.aroundThisDate}</p>
        <div className="date-chip">
          <History size={18} aria-hidden="true" />
          <span>{dateLabel}</span>
        </div>
      </section>

      {demoOnThisDay.length === 0 ? (
        <section className="empty-state fade-up fade-up-1">
          <span className="empty-emoji" aria-hidden="true">
            🌙
          </span>
          <p>{dictionary.noMemoriesToday}</p>
        </section>
      ) : (
        <section className="memory-stack fade-up fade-up-1" style={{ marginTop: 30 }}>
          {demoOnThisDay.map((memory) => (
            <MemoryYearBlock key={memory.id} memory={memory} locale={locale} />
          ))}
        </section>
      )}
    </main>
  );
}

function MemoryYearBlock({ memory, locale }: { memory: DemoMemoryYear; locale: Locale }) {
  const dictionary = getDictionary(locale);
  return (
    <article className="memory-year">
      <div className="memory-year-head">
        <span className="year-badge">
          <Sparkles size={15} aria-hidden="true" />
          {dictionary.yearsAgoToday(memory.yearsAgo)}
        </span>
      </div>
      <div className="photo-strip">
        {memory.photos.map((photo) => (
          <PhotoTile key={photo.id} photo={photo} locale={locale} />
        ))}
      </div>
      <p>{memory.note[locale]}</p>
    </article>
  );
}
