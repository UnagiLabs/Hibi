import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { walrus } from "@mysten/walrus";

import { config } from "../config.js";
import type { AlbumManifestArtifact } from "../albums/manifest.js";

type WalrusArchiveOutcome =
  | {
      status: "disabled";
      reason: "missing_sui_private_key";
      sha256: string;
      sizeBytes: number;
    }
  | {
      status: "done";
      blobId: string;
      blobObjectId: string;
      sha256: string;
      sizeBytes: number;
      network: string;
      epochs: number;
    }
  | {
      status: "failed";
      error: string;
      sha256: string;
      sizeBytes: number;
      network: string;
      epochs: number;
    };

type WalrusBlobUploadOutcome =
  | {
      status: "disabled";
      reason: "missing_sui_private_key";
      sha256: string;
      sizeBytes: number;
    }
  | {
      status: "done";
      blobId: string;
      blobObjectId: string;
      sha256: string;
      sizeBytes: number;
      network: string;
      epochs: number;
    }
  | {
      status: "failed";
      error: string;
      sha256: string;
      sizeBytes: number;
      network: string;
      epochs: number;
    };

export async function archiveAlbumManifestToWalrus(
  artifact: AlbumManifestArtifact
): Promise<WalrusArchiveOutcome> {
  return uploadBytesToWalrus({
    bytes: artifact.bytes,
    sha256: artifact.sha256,
    contentType: "application/json",
    attributes: {
        "content-type": "application/json",
        "hibi-kind": "album-manifest",
        "hibi-album-id": artifact.manifest.albumId,
        "hibi-album-type": artifact.manifest.type,
        "hibi-manifest-sha256": artifact.sha256
      }
  });
}

export async function uploadMediaToWalrus({
  bytes,
  sha256,
  contentType,
  mediaAssetId
}: {
  bytes: Uint8Array;
  sha256: string;
  contentType: string;
  mediaAssetId: string;
}): Promise<WalrusBlobUploadOutcome> {
  return uploadBytesToWalrus({
    bytes,
    sha256,
    contentType,
    attributes: {
      "content-type": contentType,
      "hibi-kind": "media-asset",
      "hibi-media-asset-id": mediaAssetId,
      "hibi-media-sha256": sha256
    }
  });
}

export async function readBlobFromWalrus(blobId: string): Promise<Uint8Array> {
  const client = createWalrusClient();
  return client.walrus.readBlob({
    blobId
  });
}

async function uploadBytesToWalrus({
  bytes,
  sha256,
  contentType,
  attributes
}: {
  bytes: Uint8Array;
  sha256: string;
  contentType: string;
  attributes: Record<string, string>;
}): Promise<WalrusBlobUploadOutcome> {
  const sizeBytes = bytes.byteLength;

  if (!config.sui.privateKey) {
    return {
      status: "disabled",
      reason: "missing_sui_private_key",
      sha256,
      sizeBytes
    };
  }

  try {
    const signer = Ed25519Keypair.fromSecretKey(config.sui.privateKey);
    const client = createWalrusClient();
    const { blobId, blobObject } = await client.walrus.writeBlob({
      blob: bytes,
      deletable: false,
      epochs: config.walrus.epochs,
      signer,
      attributes: {
        ...attributes,
        "content-type": contentType
      }
    });

    return {
      status: "done",
      blobId,
      blobObjectId: blobObject.id,
      sha256,
      sizeBytes,
      network: config.sui.network,
      epochs: config.walrus.epochs
    };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown Walrus archive error",
      sha256,
      sizeBytes,
      network: config.sui.network,
      epochs: config.walrus.epochs
    };
  }
}

function createWalrusClient() {
  return new SuiGrpcClient({
    network: config.sui.network,
    baseUrl: buildSuiGrpcUrl(config.sui.network)
  }).$extend(
    walrus({
      uploadRelay: {
        host: config.walrus.uploadRelayUrl,
        sendTip: {
          max: 1_000
        }
      }
    })
  );
}

function buildSuiGrpcUrl(network: string): string {
  if (network === "mainnet") {
    return "https://fullnode.mainnet.sui.io:443";
  }

  return "https://fullnode.testnet.sui.io:443";
}
