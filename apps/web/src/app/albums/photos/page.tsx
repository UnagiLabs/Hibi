import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { fetchMediaAssets, type MediaAssetPhoto } from "@/lib/api";
import { getDictionary, parseLocale, withLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function PhotosPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const response = await fetchMediaAssets();
  const photos = response.ok ? response.photos : [];

  return (
    <main className="shell">
      <SiteHeader locale={locale} currentPath="/albums/photos" active="albums" />

      <section className="fade-up">
        <p className="eyebrow">{dictionary.albumHubTitle}</p>
        <h1>{locale === "ja" ? "写真ライブラリ" : "Photo Library"}</h1>
        <p className="lead" style={{ marginTop: 14 }}>
          {locale === "ja" ? "OpenClawから保存した写真をまとめて見返せます。" : "Browse photos saved from OpenClaw."}
        </p>
      </section>

      <section className="fade-up fade-up-1" style={{ marginTop: 30 }}>
        {photos.length > 0 ? (
          <div className="photo-grid">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <p>{locale === "ja" ? "保存済みの写真はまだありません。" : "No saved photos yet."}</p>
          </div>
        )}
      </section>
    </main>
  );
}

function PhotoCard({ photo, locale }: { photo: MediaAssetPhoto; locale: Locale }) {
  return (
    <Link className="photo-tile photo-tile-image" href={withLocale(`/albums/photos/${photo.id}`, locale)}>
      <img src={photo.url} alt={photo.caption} />
      <span className="photo-caption">{photo.caption}</span>
    </Link>
  );
}
