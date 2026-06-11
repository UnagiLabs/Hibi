import { defineToolPlugin } from "openclaw/plugin-sdk/tool-plugin";
import { Type } from "typebox";

import { HibiClient } from "./hibi-client.js";
import type { HibiPluginConfig } from "./config.js";

const configSchema = Type.Object(
  {
    apiBaseUrl: Type.Optional(
      Type.String({
        description: "Base URL for the Hibi API.",
        default: "http://127.0.0.1:4000"
      })
    )
  },
  {
    additionalProperties: false
  }
);

export default defineToolPlugin({
  id: "hibi",
  name: "Hibi",
  description: "Chat-first family memory tools backed by Hibi API, MemWal, Walrus, and Sui.",
  activation: {
    onStartup: false,
    onCapabilities: ["tool"]
  },
  configSchema,
  tools: (tool) => [
    tool({
      name: "hibi_remember_text",
      label: "Remember Hibi Text",
      description:
        "Save a childcare log or family memory to Hibi. Hibi API handles DB persistence, MemWal remember, and view URL creation.",
      parameters: Type.Object({
        text: Type.String({
          description: "The user's original note, for example 'ミルク120ml飲んだ'."
        })
      }),
      async execute({ text }, config: HibiPluginConfig, context) {
        context.signal?.throwIfAborted();
        const client = new HibiClient(config);
        const result = await client.rememberText(text, {
          signal: context.signal
        });

        return {
          ok: result.ok,
          reply: result.reply,
          viewUrl: result.viewUrl,
          intent: result.intent,
          category: result.category,
          memwalStatus: result.memwal?.status,
          memwalBlobId: result.memwal?.blobId
        };
      }
    }),
    tool({
      name: "hibi_recall_memory",
      label: "Recall Hibi Memory",
      description:
        "Ask Hibi to recall long-term family memories from MemWal, such as recent milestones.",
      parameters: Type.Object({
        query: Type.String({
          description: "The recall question, for example '最近できるようになったことは？'."
        })
      }),
      async execute({ query }, config: HibiPluginConfig, context) {
        context.signal?.throwIfAborted();
        const client = new HibiClient(config);
        const result = await client.recallMemory(query, {
          signal: context.signal
        });

        return {
          ok: result.ok,
          status: result.recall?.status,
          namespace: result.recall?.namespace,
          total: result.recall?.total,
          results: result.recall?.results?.map((item) => ({
            text: item.text,
            blobId: item.blobId,
            sourceId: item.sourceId
          })) ?? []
        };
      }
    }),
    tool({
      name: "hibi_upload_photo",
      label: "Upload Hibi Photo",
      description:
        "Save a family photo to Hibi. Hibi API stores the image on Walrus, creates media metadata, and remembers the caption in MemWal when provided.",
      parameters: Type.Object({
        imageBase64: Type.String({
          description:
            "Base64-encoded image bytes. A data URL such as data:image/jpeg;base64,... is also accepted."
        }),
        filename: Type.String({
          description: "Original filename, for example 'first-rollover.jpg'."
        }),
        mimeType: Type.String({
          description: "Image MIME type, for example 'image/jpeg' or 'image/png'."
        }),
        caption: Type.Optional(
          Type.String({
            description: "Optional caption or memory note to save with the photo."
          })
        ),
        occurredAt: Type.Optional(
          Type.String({
            description: "Optional ISO datetime for when the photo memory happened."
          })
        )
      }),
      async execute({ imageBase64, filename, mimeType, caption, occurredAt }, config: HibiPluginConfig, context) {
        context.signal?.throwIfAborted();
        const client = new HibiClient(config);
        const result = await client.uploadPhoto(
          {
            imageBase64,
            filename,
            mimeType,
            caption,
            occurredAt
          },
          {
            signal: context.signal
          }
        );

        return {
          ok: result.ok,
          mediaAssetId: result.mediaAsset?.id,
          mediaAssetUrl: result.mediaAsset?.url,
          mediaAssetStatus: result.mediaAsset?.status,
          mediaAssetWalrusBlobId: result.mediaAsset?.walrusBlobId,
          memoryItemId: result.memoryItemId,
          walrusStatus: result.walrus?.status,
          walrusBlobId: result.walrus?.blobId,
          memwalStatus: result.memwal?.status,
          memwalBlobId: result.memwal?.blobId
        };
      }
    }),
    tool({
      name: "hibi_generate_monthly_album",
      label: "Generate Hibi Monthly Album",
      description:
        "Generate a monthly growth album. Hibi API gathers MemWal highlights, archives the AlbumManifest to Walrus, records the pointer on Sui, and returns a view URL.",
      parameters: Type.Object({
        targetYear: Type.Optional(
          Type.Number({
            description: "Target year. Omit to use the current local month."
          })
        ),
        targetMonth: Type.Optional(
          Type.Number({
            description: "Target month from 1 to 12. Omit to use the current local month."
          })
        )
      }),
      async execute({ targetYear, targetMonth }, config: HibiPluginConfig, context) {
        context.signal?.throwIfAborted();
        const client = new HibiClient(config);
        const result = await client.generateMonthlyAlbum(
          {
            targetYear,
            targetMonth
          },
          {
            signal: context.signal
          }
        );

        return {
          ok: result.ok,
          title: result.title,
          status: result.status,
          viewUrl: result.viewUrl,
          manifestWalrusBlobId: result.manifestWalrusBlobId,
          manifestSha256: result.manifestSha256,
          walrusStatus: result.walrusArtifact?.status,
          walrusBlobId: result.walrusArtifact?.blobId,
          suiStatus: result.suiRecord?.status,
          suiDigest: result.suiRecord?.digest,
          suiExplorerUrl: result.suiRecord?.explorerUrl
        };
      }
    })
  ]
});
