import { Archive, CalendarDays, FileImage, Hash, ImageOff } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { fetchMediaAsset, type MediaAssetPhoto } from "@/lib/api";
import { getDictionary, parseLocale, withLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ photoId: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function PhotoDetailPage({ params, searchParams }: PageProps) {
  const { photoId } = await params;
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const response = await fetchMediaAsset(photoId);

  return (
    <main className="shell">
      <SiteHeader locale={locale} currentPath={`/albums/photos/${photoId}`} active="albums" />
      {response.ok ? (
        <PhotoDetail photo={response.photo} locale={locale} />
      ) : (
        <section className="empty-state fade-up">
          <ImageOff size={30} aria-hidden="true" />
          <p>{locale === "ja" ? "この写真は見つかりません。" : "This photo was not found."}</p>
          <Link className="primary-link" href={withLocale("/albums/photos", locale)}>
            {dictionary.backHome}
          </Link>
        </section>
      )}
    </main>
  );
}

function PhotoDetail({ photo, locale }: { photo: MediaAssetPhoto; locale: Locale }) {
  return (
    <section className="photo-detail-layout fade-up">
      <figure className="photo-detail-image">
        <img src={photo.url} alt={photo.caption} />
      </figure>

      <div className="photo-detail-panel">
        <p className="eyebrow">{locale === "ja" ? "写真" : "Photo"}</p>
        <h1>{photo.caption}</h1>
        <div className="date-chip">
          <CalendarDays size={18} aria-hidden="true" />
          <span>{formatDateTime(photo.occurredAt, locale)}</span>
        </div>

        <div className="photo-meta-grid">
          <MetaRow
            icon={<Archive size={18} aria-hidden="true" />}
            label={locale === "ja" ? "Walrus Blob" : "Walrus Blob"}
            value={photo.walrusBlobId ? shortenProof(photo.walrusBlobId) : "-"}
          />
          <MetaRow
            icon={<Hash size={18} aria-hidden="true" />}
            label="SHA-256"
            value={photo.sha256 ? shortenProof(photo.sha256) : "-"}
          />
          <MetaRow
            icon={<FileImage size={18} aria-hidden="true" />}
            label={locale === "ja" ? "ファイル" : "File"}
            value={photo.originalName ?? "Photo"}
          />
        </div>

        <Link className="primary-link" href={withLocale("/albums/photos", locale)}>
          {locale === "ja" ? "写真一覧へ" : "Back to photos"}
        </Link>
      </div>
    </section>
  );
}

function MetaRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="archive-row">
      {icon}
      <strong>{label}</strong>
      <span className="proof">{value}</span>
    </div>
  );
}

function formatDateTime(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function shortenProof(value: string): string {
  if (value.length <= 24) {
    return value;
  }

  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}
