import { config } from "./config.js";

type MediaAssetInput = {
  id: string;
  originalName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  walrusBlobId: string | null;
  sha256: string | null;
  status: string;
  createdAt: Date;
};

type MemoryItemInput = {
  body: string;
  occurredAt: Date;
} | null;

export function serializeMediaAssetPhoto(mediaAsset: MediaAssetInput, memoryItem: MemoryItemInput = null) {
  return {
    id: mediaAsset.id,
    caption: memoryItem?.body ?? mediaAsset.originalName ?? "Photo",
    originalName: mediaAsset.originalName,
    mimeType: mediaAsset.mimeType,
    sizeBytes: mediaAsset.sizeBytes,
    walrusBlobId: mediaAsset.walrusBlobId,
    sha256: mediaAsset.sha256,
    status: mediaAsset.status,
    occurredAt: (memoryItem?.occurredAt ?? mediaAsset.createdAt).toISOString(),
    createdAt: mediaAsset.createdAt.toISOString(),
    url: `/api/media/${mediaAsset.id}/blob`,
    pageUrl: buildMediaAssetPageUrl(mediaAsset.id)
  };
}

export function buildMediaAssetPageUrl(mediaAssetId: string): string {
  return `${config.webBaseUrl.replace(/\/$/, "")}/albums/photos/${encodeURIComponent(mediaAssetId)}`;
}

export function buildPhotoGalleryUrl(): string {
  return `${config.webBaseUrl.replace(/\/$/, "")}/albums/photos`;
}
