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
  const aggregatorResult = await readBlobFromAggregator(blobId);

  if (aggregatorResult.ok) {
    return aggregatorResult.bytes;
  }

  try {
    const client = createWalrusClient();
    return await client.walrus.readBlob({
      blobId
    });
  } catch (error) {
    const sdkError = error instanceof Error ? error.message : "Unknown Walrus SDK read error";
    throw new Error(`Unable to read Walrus blob. Aggregator: ${aggregatorResult.error}. SDK: ${sdkError}`);
  }
}

async function readBlobFromAggregator(blobId: string): Promise<
  | {
      ok: true;
      bytes: Uint8Array;
    }
  | {
      ok: false;
      error: string;
    }
> {
  const aggregatorUrl = config.walrus.aggregatorUrl.replace(/\/$/, "");
  const errors: string[] = [];

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const url = `${aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`;

    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/octet-stream"
        }
      });

      if (response.ok) {
        return {
          ok: true,
          bytes: new Uint8Array(await response.arrayBuffer())
        };
      }

      errors.push(`${response.status} ${response.statusText}: ${await readResponseSnippet(response)}`);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unknown aggregator read error");
    }

    await wait(400 * (attempt + 1));
  }

  return {
    ok: false,
    error: errors.join("; ")
  };
}

async function readResponseSnippet(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 200);
  } catch {
    return "";
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
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
