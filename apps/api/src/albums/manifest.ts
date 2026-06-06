import { createHash } from "node:crypto";

import type { CareLog, MediaAsset } from "@prisma/client";

import type { EnrichedRecallResult } from "../memwal/recall.js";

export type AlbumManifestArtifact = {
  manifest: AlbumManifest;
  json: string;
  bytes: Uint8Array;
  sha256: string;
  sizeBytes: number;
};

export type AlbumManifest = {
  schemaVersion: 1;
  albumId: string;
  familyId: string;
  memorySpaceId: string;
  type: "monthly_growth_album";
  title: string;
  targetYear: number;
  targetMonth: number;
  period: {
    start: string;
    end: string;
  };
  generatedAt: string;
  sections: AlbumManifestSection[];
};

type AlbumManifestSection =
  | {
      type: "memwal_highlights";
      items: AlbumManifestHighlightItem[];
    }
  | {
      type: "care_logs";
      items: AlbumManifestCareLogItem[];
    }
  | {
      type: "media_assets";
      items: AlbumManifestMediaAssetItem[];
    };

type AlbumManifestHighlightItem = {
  id: string;
  text: string;
  sourceType: "memory_item" | "care_log" | "unknown" | null;
  sourceId: string | null;
  occurredAt: string | null;
  memwalBlobId: string;
  distance: number;
};

type AlbumManifestCareLogItem = {
  id: string;
  category: string;
  amount: number | null;
  unit: string | null;
  value: number | null;
  sourceText: string;
  occurredAt: string;
};

type AlbumManifestMediaAssetItem = {
  id: string;
  originalName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  walrusBlobId: string | null;
  sha256: string | null;
  status: string;
  createdAt: string;
};

export function buildMonthlyAlbumManifest({
  albumId,
  familyId,
  memorySpaceId,
  title,
  targetYear,
  targetMonth,
  periodStart,
  periodEnd,
  highlights,
  careLogs,
  mediaAssets
}: {
  albumId: string;
  familyId: string;
  memorySpaceId: string;
  title: string;
  targetYear: number;
  targetMonth: number;
  periodStart: Date;
  periodEnd: Date;
  highlights: EnrichedRecallResult[];
  careLogs: CareLog[];
  mediaAssets: MediaAsset[];
}): AlbumManifestArtifact {
  const manifest: AlbumManifest = {
    schemaVersion: 1,
    albumId,
    familyId,
    memorySpaceId,
    type: "monthly_growth_album",
    title,
    targetYear,
    targetMonth,
    period: {
      start: periodStart.toISOString(),
      end: periodEnd.toISOString()
    },
    generatedAt: new Date().toISOString(),
    sections: [
      {
        type: "memwal_highlights",
        items: highlights.map((highlight) => ({
          id: highlight.sourceId ?? highlight.blobId,
          text: buildHighlightText(highlight),
          sourceType: highlight.source?.type ?? null,
          sourceId: highlight.sourceId,
          occurredAt:
            highlight.source?.type === "memory_item" || highlight.source?.type === "care_log"
              ? highlight.source.occurredAt
              : null,
          memwalBlobId: highlight.blobId,
          distance: highlight.distance
        }))
      },
      {
        type: "care_logs",
        items: careLogs.map((careLog) => ({
          id: careLog.id,
          category: careLog.category,
          amount: careLog.amount,
          unit: careLog.unit,
          value: careLog.value,
          sourceText: careLog.sourceText,
          occurredAt: careLog.occurredAt.toISOString()
        }))
      },
      {
        type: "media_assets",
        items: mediaAssets.map((mediaAsset) => ({
          id: mediaAsset.id,
          originalName: mediaAsset.originalName,
          mimeType: mediaAsset.mimeType,
          sizeBytes: mediaAsset.sizeBytes,
          walrusBlobId: mediaAsset.walrusBlobId,
          sha256: mediaAsset.sha256,
          status: mediaAsset.status,
          createdAt: mediaAsset.createdAt.toISOString()
        }))
      }
    ]
  };
  const json = JSON.stringify(manifest, null, 2);
  const bytes = new TextEncoder().encode(json);
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  return {
    manifest,
    json,
    bytes,
    sha256,
    sizeBytes: bytes.byteLength
  };
}

function buildHighlightText(highlight: EnrichedRecallResult): string {
  if (highlight.source?.type === "memory_item") {
    return highlight.source.body;
  }

  if (highlight.source?.type === "care_log") {
    return highlight.source.sourceText;
  }

  const summary = highlight.text.match(/^Summary:\s*(?<summary>.+)$/m);
  return summary?.groups?.summary ?? highlight.text;
}
