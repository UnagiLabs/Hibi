import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { fetchAlbums, type AlbumSummary } from "@/lib/api";
import { demoAlbums, type DemoAlbum, type Tone } from "@/lib/demo";
import { getDictionary, parseLocale, withLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{
    lang?: string | string[];
    walletAddress?: string | string[];
  }>;
};

type DisplayAlbum = DemoAlbum | {
  id: string;
  type: string;
  href: string;
  cover: Tone;
  coverSrc?: string;
  title: Record<Locale, string>;
  hint: Record<Locale, string>;
  photoCount: number;
};

const ALBUM_EMOJI: Record<string, string> = {
  monthly_highlights: "🗓️",
  yearly_highlights: "🌈",
  on_this_day: "🕰️",
  photo_gallery: "📷",
  care_log_day: "🍼",
  monthly_growth_album: "🗓️"
};

const ALBUM_TONE: Record<string, Tone> = {
  monthly_highlights: "yellow",
  yearly_highlights: "pink",
  on_this_day: "green",
  photo_gallery: "blue",
  care_log_day: "blue",
  monthly_growth_album: "yellow"
};

const ALBUM_COVER_SRC: Record<string, string> = {
  monthly_highlights: "/IMG_1599.jpeg",
  yearly_highlights: "/IMG_1596.jpeg",
  on_this_day: "/IMG_1593.jpeg",
  photo_gallery: "/IMG_1594.jpeg",
  care_log_day: "/IMG_1598.jpeg",
  monthly_growth_album: "/IMG_1599.jpeg"
};

const MONTH_NAMES: Record<number, string> = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec"
};

export default async function AlbumsPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const walletAddress = parseWalletAddress(query.walletAddress);
  const albumsResponse = await fetchAlbums({
    walletAddress
  });
  const liveAlbums = albumsResponse.ok
    ? albumsResponse.albums.map((album) => toDisplayAlbum(album, locale, walletAddress))
    : [];
  const albums = liveAlbums.length >= 3 ? liveAlbums : mergeDemoAlbums(liveAlbums);

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
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} locale={locale} />
          ))}
        </div>
      </section>
    </main>
  );
}

function AlbumCard({ album, locale }: { album: DisplayAlbum; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const countLabel =
    album.photoCount > 0 ? `${album.photoCount} ${dictionary.photos}` : dictionary.open;

  return (
    <Link className="album-card" href={withLocale(album.href, locale)}>
      <div className={`album-cover tone-${album.cover}${album.coverSrc ? " has-photo" : ""}`}>
        {album.coverSrc ? <img src={album.coverSrc} alt="" loading="lazy" /> : null}
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

function toDisplayAlbum(album: AlbumSummary, locale: Locale, walletAddress?: string): DisplayAlbum {
  const monthLabel = album.targetYear && album.targetMonth
    ? {
        en: `${MONTH_NAMES[album.targetMonth] ?? album.targetMonth} ${album.targetYear}`,
        ja: `${album.targetYear}年${album.targetMonth}月`
      }
    : {
        en: album.type,
        ja: album.type
      };

  return {
    id: album.id,
    type: album.type,
    href: resolveAlbumHref(album, walletAddress),
    cover: ALBUM_TONE[album.type] ?? "blue",
    coverSrc: ALBUM_COVER_SRC[album.type],
    title: {
      en: album.title,
      ja: album.title
    },
    hint: monthLabel,
    photoCount: album.photoCount
  };
}

function resolveAlbumHref(album: AlbumSummary, walletAddress?: string): string {
  if (
    album.type === "monthly_growth_album" &&
    album.targetYear !== null &&
    album.targetMonth !== null
  ) {
    const query = new URLSearchParams({
      targetYear: String(album.targetYear),
      targetMonth: String(album.targetMonth)
    });
    if (walletAddress) {
      query.set("walletAddress", walletAddress);
    }
    return `/albums/monthly?${query.toString()}`;
  }

  if (album.type === "care_log_day") {
    const query = new URLSearchParams();
    if (walletAddress) {
      query.set("walletAddress", walletAddress);
    }

    return query.toString() ? `/v/demo?${query}` : "/v/demo";
  }

  return "/albums";
}

function mergeDemoAlbums(liveAlbums: DisplayAlbum[]): DisplayAlbum[] {
  const liveTypes = new Set(liveAlbums.map((album) => albumFamily(album.type)));
  const fallbackAlbums = demoAlbums.filter((album) => !liveTypes.has(albumFamily(album.type)));

  return [...liveAlbums, ...fallbackAlbums];
}

function albumFamily(type: string): string {
  return type === "monthly_growth_album" ? "monthly_highlights" : type;
}

function parseWalletAddress(value?: string | string[]): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || raw.trim().length === 0) {
    return undefined;
  }

  const normalized = raw.trim().toLowerCase();
  return /^0x[a-f0-9]{64}$/i.test(normalized) ? normalized : undefined;
}
