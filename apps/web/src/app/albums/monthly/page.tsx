import { Archive, Brain, CalendarDays, FileCheck, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { PhotoTile, SectionHeader } from "@/components/memory-ui";
import { SiteHeader } from "@/components/site-header";
import { demoHighlightPhotos, demoMilestones, demoNotes } from "@/lib/demo";
import { fetchMonthlyAlbum, type MonthlyAlbumHighlight, type MonthlyAlbumPhoto, type MonthlyAlbumResponse } from "@/lib/api";
import { getDictionary, parseLocale, withLocale, type Locale } from "@/lib/i18n";
import { hibiSuiContract } from "@/lib/sui-contract";

type PageProps = {
  searchParams: Promise<{
    lang?: string | string[];
    targetYear?: string | string[];
    targetMonth?: string | string[];
    walletAddress?: string | string[];
  }>;
};

export default async function MonthlyPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const targetYear = parseIntegerParam(query.targetYear);
  const targetMonth = parseIntegerParam(query.targetMonth);
  const walletAddress = parseWalletAddress(query.walletAddress);
  const monthlyAlbum = await fetchMonthlyAlbum(
    {
    targetYear,
    targetMonth
    },
    { walletAddress }
  );
  const highlightResults =
    monthlyAlbum.ok && monthlyAlbum.memwalHighlights.status === "ok"
      ? monthlyAlbum.memwalHighlights.results
      : [];
  const displayYear = monthlyAlbum.ok ? monthlyAlbum.targetYear : targetYear ?? 2026;
  const displayMonth = monthlyAlbum.ok ? monthlyAlbum.targetMonth : targetMonth ?? 6;
  const uploadedPhotos = monthlyAlbum.ok ? monthlyAlbum.photos : [];
  const showUploadedPhotos = uploadedPhotos.length >= 3;
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
            <strong>{showUploadedPhotos ? uploadedPhotos.length : demoHighlightPhotos.length}</strong>
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
          {showUploadedPhotos
            ? uploadedPhotos.map((photo) => <UploadedPhotoTile key={photo.id} photo={photo} locale={locale} />)
            : demoHighlightPhotos.map((photo) => <PhotoTile key={photo.id} photo={photo} locale={locale} />)}
        </div>
      </section>

      <section className="fade-up fade-up-2">
        <ArchiveProofCard
          locale={locale}
          albumStatus={monthlyAlbum.ok ? monthlyAlbum.status : "offline"}
          manifestWalrusBlobId={monthlyAlbum.ok ? monthlyAlbum.manifestWalrusBlobId : null}
          manifestSha256={monthlyAlbum.ok ? monthlyAlbum.manifestSha256 : null}
          memwalHighlights={monthlyAlbum.ok ? monthlyAlbum.memwalHighlights : null}
        />
      </section>

      <section className="fade-up fade-up-3">
        <SectionHeader title={dictionary.milestones} />
        {highlightResults.length > 0 ? (
          <MemWalHighlights highlights={highlightResults} locale={locale} />
        ) : (
          <MilestoneChips locale={locale} />
        )}
      </section>

      <section className="fade-up fade-up-4">
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

function parseWalletAddress(value?: string | string[]): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return undefined;
  }

  const normalized = raw.trim().toLowerCase();
  return /^0x[a-f0-9]{64}$/i.test(normalized) ? normalized : undefined;
}

function UploadedPhotoTile({ photo, locale }: { photo: MonthlyAlbumPhoto; locale: Locale }) {
  return (
    <Link className="photo-tile photo-tile-image" href={withLocale(`/albums/photos/${photo.id}`, locale)}>
      <img src={photo.url} alt={photo.caption} />
      <span className="photo-caption">{photo.caption}</span>
    </Link>
  );
}

function ArchiveProofCard({
  locale,
  albumStatus,
  manifestWalrusBlobId,
  manifestSha256,
  memwalHighlights
}: {
  locale: Locale;
  albumStatus: string;
  manifestWalrusBlobId: string | null;
  manifestSha256: string | null;
  memwalHighlights: Extract<MonthlyAlbumResponse, { ok: true }>["memwalHighlights"] | null;
}) {
  const dictionary = getDictionary(locale);
  const copy = proofCopy(locale);
  const walrusReady = Boolean(manifestWalrusBlobId);
  const manifestReady = Boolean(manifestSha256);
  const memwalReady = memwalHighlights?.status === "ok";
  const suiReady = Boolean(hibiSuiContract.familyVaultId && hibiSuiContract.packageId);
  const walrusProof = manifestWalrusBlobId ? shortenProof(manifestWalrusBlobId) : null;
  const manifestProof = manifestSha256 ? shortenProof(manifestSha256) : null;
  const proofRows = [
    {
      id: "walrus",
      Icon: Archive,
      ready: walrusReady,
      label: "Walrus",
      title: walrusReady ? copy.walrusSaved : manifestReady ? copy.manifestReady : copy.pending,
      proof: walrusProof ?? manifestProof ?? copy.localApiRequired,
      meta: manifestProof ? `${copy.manifestHash}: ${manifestProof}` : `${copy.albumStatus}: ${albumStatus}`
    },
    {
      id: "memwal",
      Icon: Brain,
      ready: memwalReady,
      label: "MemWal",
      title: memwalReady ? copy.memwalRecalled : memwalHighlights?.status === "failed" ? copy.failed : copy.pending,
      proof: memwalReady ? `${memwalHighlights.total} ${copy.recallResults}` : copy.localApiRequired,
      meta: memwalHighlights?.namespace ? `${copy.namespace}: ${shortenProof(memwalHighlights.namespace)}` : copy.namespacePending
    },
    {
      id: "sui",
      Icon: ShieldCheck,
      ready: suiReady,
      label: "Sui",
      title: suiReady ? copy.suiConfigured : copy.pending,
      proof: suiReady ? `${hibiSuiContract.network} FamilyVault` : copy.contractMissing,
      meta: hibiSuiContract.familyVaultId ? `${copy.vault}: ${shortenProof(hibiSuiContract.familyVaultId)}` : copy.vaultPending
    }
  ];

  return (
    <div className="archive-card proof-card">
      <SectionHeader
        eyebrow={dictionary.storageProof}
        title={copy.title}
        hint={copy.hint}
      />
      <div className="archive-rows">
        {proofRows.map((row) => (
          <div className="archive-row proof-row" key={row.id}>
            <span className={`status-dot ${row.ready ? "ok" : "demo"}`} aria-hidden="true" />
            <row.Icon size={18} aria-hidden="true" />
            <div className="proof-main">
              <span className="proof-label">{row.label}</span>
              <strong>{row.title}</strong>
              <span className="proof-meta">{row.meta}</span>
            </div>
            <span className="proof">{row.proof}</span>
          </div>
        ))}
        <div className="archive-row proof-row proof-row-compact">
          <span className={`status-dot ${manifestReady ? "ok" : "demo"}`} aria-hidden="true" />
          <FileCheck size={18} aria-hidden="true" />
          <div className="proof-main">
            <span className="proof-label">{copy.integrity}</span>
            <strong>{manifestReady ? dictionary.manifestHash : copy.pending}</strong>
          </div>
          <span className="proof">{manifestProof ?? copy.localApiRequired}</span>
        </div>
      </div>
    </div>
  );
}

function proofCopy(locale: Locale) {
  if (locale === "ja") {
    return {
      title: "Archive Proof",
      hint: "このアルバムがMemWal / Walrus / Suiのどこに接続されているかを1枚で確認できます。",
      walrusSaved: "AlbumManifest保存済み",
      manifestReady: "Manifest生成済み",
      memwalRecalled: "Recall結果あり",
      suiConfigured: "FamilyVault設定済み",
      pending: "ローカル実行待ち",
      failed: "取得失敗",
      localApiRequired: "local API required",
      manifestHash: "Manifest hash",
      albumStatus: "Album status",
      namespace: "Namespace",
      namespacePending: "MemWal namespace is shown after local recall.",
      recallResults: "results",
      contractMissing: "contract settings missing",
      vault: "Vault",
      vaultPending: "FamilyVault ID is not configured.",
      integrity: "Integrity"
    };
  }

  return {
    title: "Archive Proof",
    hint: "One card showing where this album connects to MemWal, Walrus, and Sui.",
    walrusSaved: "AlbumManifest saved",
    manifestReady: "Manifest generated",
    memwalRecalled: "Recall results found",
    suiConfigured: "FamilyVault configured",
    pending: "Waiting for local run",
    failed: "Fetch failed",
    localApiRequired: "local API required",
    manifestHash: "Manifest hash",
    albumStatus: "Album status",
    namespace: "Namespace",
    namespacePending: "MemWal namespace is shown after local recall.",
    recallResults: "results",
    contractMissing: "contract settings missing",
    vault: "Vault",
    vaultPending: "FamilyVault ID is not configured.",
    integrity: "Integrity"
  };
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

function shortenProof(value: string): string {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`;
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
