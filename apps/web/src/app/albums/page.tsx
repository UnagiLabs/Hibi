import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { demoAlbums, type DemoAlbum } from "@/lib/demo";
import { getDictionary, parseLocale, withLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

const ALBUM_EMOJI: Record<DemoAlbum["type"], string> = {
  monthly_highlights: "🗓️",
  yearly_highlights: "🌈",
  on_this_day: "🕰️",
  photo_gallery: "📷",
  care_log_day: "🍼"
};

export default async function AlbumsPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);

  return (
    <main className="shell">
      <SiteHeader locale={locale} currentPath="/albums" active="albums" />

      <section className="fade-up">
        <p className="eyebrow">{dictionary.albumHubTitle}</p>
        <h1>{dictionary.albumHubTitle}</h1>
        <p className="lead" style={{ marginTop: 14 }}>
          {dictionary.albumHubBody}
        </p>
      </section>

      <section className="fade-up fade-up-1" aria-label={dictionary.allAlbums} style={{ marginTop: 30 }}>
        <div className="album-grid">
          {demoAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} locale={locale} />
          ))}
        </div>
      </section>
    </main>
  );
}

function AlbumCard({ album, locale }: { album: DemoAlbum; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const countLabel =
    album.photoCount > 0 ? `${album.photoCount} ${dictionary.photos}` : dictionary.open;

  return (
    <Link className="album-card" href={withLocale(album.href, locale)}>
      <div className={`album-cover tone-${album.cover}`}>
        <span className="cover-emoji" aria-hidden="true">
          {ALBUM_EMOJI[album.type]}
        </span>
      </div>
      <div className="album-body">
        <span>
          <strong>{album.title[locale]}</strong>
          <span>{album.hint[locale]}</span>
        </span>
        <span className="album-count">{countLabel}</span>
      </div>
    </Link>
  );
}
