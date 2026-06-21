import { createHash } from "node:crypto";

import type { FastifyInstance, FastifyRequest } from "fastify";

import { prisma } from "../db.js";
import { rememberMemoryItem } from "../memwal/remember.js";
import { resolveFamilyContext } from "../family-context.js";
import { readBlobFromWalrus, uploadMediaToWalrus } from "../walrus/client.js";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

type PhotoUploadFields = {
  caption?: string;
  occurredAt?: string;
};

type ParsedPhotoUpload =
  | {
      ok: true;
      bytes: Buffer;
      filename: string;
      mimeType: string;
      sha256: string;
      fields: PhotoUploadFields;
      occurredAt: Date;
    }
  | {
      ok: false;
      statusCode: number;
      message: string;
    };

export async function registerMediaRoutes(server: FastifyInstance) {
  server.post("/api/photos", async (request, reply) => {
    const contextResult = await resolveFamilyContext(request);

    if (!contextResult.ok) {
      return reply.status(contextResult.status).send({
        ok: false,
        error: contextResult.error
      });
    }

    const familyContext = contextResult.context;

    if (!request.isMultipart()) {
      return reply.status(415).send({
        ok: false,
        error: "Use multipart/form-data with a photo file."
      });
    }

    const parsed = await parsePhotoUpload(request);

    if (!parsed.ok) {
      return reply.status(parsed.statusCode).send({
        ok: false,
        error: parsed.message
      });
    }

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        familyId: familyContext.familyId,
        memorySpaceId: familyContext.memorySpaceId,
        originalName: parsed.filename,
        mimeType: parsed.mimeType,
        sizeBytes: parsed.bytes.byteLength,
        sha256: parsed.sha256,
        status: "uploading"
      }
    });
    const walrus = await uploadMediaToWalrus({
      bytes: parsed.bytes,
      sha256: parsed.sha256,
      contentType: parsed.mimeType,
      mediaAssetId: mediaAsset.id
    });
    const updatedMediaAsset = await prisma.mediaAsset.update({
      where: {
        id: mediaAsset.id
      },
      data: {
        walrusBlobId: walrus.status === "done" ? walrus.blobId : null,
        status: walrus.status === "done" ? "stored" : walrus.status
      }
    });
    const caption = parsed.fields.caption?.trim();
    const memoryItem = caption
      ? await prisma.memoryItem.create({
          data: {
            familyId: familyContext.familyId,
            memorySpaceId: familyContext.memorySpaceId,
            mediaAssetId: updatedMediaAsset.id,
            body: caption,
            sourceText: caption,
            source: "photo",
            occurredAt: parsed.occurredAt
          }
        })
      : null;
    const memwal = memoryItem ? await rememberMemoryItem(memoryItem) : null;

    return reply.status(201).send({
      ok: true,
      mediaAsset: serializeMediaAsset(updatedMediaAsset),
      memoryItemId: memoryItem?.id ?? null,
      walrus,
      memwal
    });
  });

  server.get<{ Params: { mediaId: string } }>("/api/media/:mediaId/blob", async (request, reply) => {
    const contextResult = await resolveFamilyContext(request);

    if (!contextResult.ok) {
      return reply.status(contextResult.status).send({
        ok: false,
        error: contextResult.error
      });
    }

    const familyContext = contextResult.context;

    const mediaAsset = await prisma.mediaAsset.findUnique({
      where: {
        id: request.params.mediaId
      }
    });

    if (!mediaAsset || mediaAsset.familyId !== familyContext.familyId || mediaAsset.memorySpaceId !== familyContext.memorySpaceId) {
      return reply.status(404).send({
        ok: false,
        error: "Media asset was not found."
      });
    }


    if (!mediaAsset.walrusBlobId) {
      return reply.status(409).send({
        ok: false,
        error: "Media asset is not stored on Walrus yet."
      });
    }

    const bytes = await readBlobFromWalrus(mediaAsset.walrusBlobId);

    return reply
      .header("content-type", mediaAsset.mimeType ?? "application/octet-stream")
      .header("cache-control", "public, max-age=300")
      .send(Buffer.from(bytes));
  });
}

async function parsePhotoUpload(request: FastifyRequest): Promise<ParsedPhotoUpload> {
  const fields: PhotoUploadFields = {};
  let bytes: Buffer | null = null;
  let filename = "photo";
  let mimeType = "";
  let fileCount = 0;

  try {
    for await (const part of request.parts({
      limits: {
        fileSize: MAX_PHOTO_BYTES,
        files: 1,
        fields: 4,
        parts: 6
      }
    })) {
      if (part.type === "field") {
        if (part.fieldname === "caption" || part.fieldname === "occurredAt") {
          fields[part.fieldname] = String(part.value ?? "");
        }
        continue;
      }

      fileCount += 1;
      filename = part.filename || filename;
      mimeType = part.mimetype;

      if (!mimeType.startsWith("image/")) {
        await part.toBuffer();
        return {
          ok: false,
          statusCode: 415,
          message: "Only image uploads are supported."
        };
      }

      bytes = await part.toBuffer();
    }
  } catch (error) {
    return {
      ok: false,
      statusCode: 413,
      message: error instanceof Error ? error.message : "Uploaded photo is too large."
    };
  }

  if (fileCount === 0 || !bytes) {
    return {
      ok: false,
      statusCode: 400,
      message: "`file` is required."
    };
  }

  const occurredAt = parseOccurredAt(fields.occurredAt);
  if (!occurredAt) {
    return {
      ok: false,
      statusCode: 400,
      message: "`occurredAt` must be a valid ISO datetime string."
    };
  }

  return {
    ok: true,
    bytes,
    filename,
    mimeType,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    fields,
    occurredAt
  };
}

function parseOccurredAt(value: string | undefined): Date | null {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function serializeMediaAsset(mediaAsset: {
  id: string;
  originalName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  walrusBlobId: string | null;
  sha256: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: mediaAsset.id,
    originalName: mediaAsset.originalName,
    mimeType: mediaAsset.mimeType,
    sizeBytes: mediaAsset.sizeBytes,
    walrusBlobId: mediaAsset.walrusBlobId,
    sha256: mediaAsset.sha256,
    status: mediaAsset.status,
    createdAt: mediaAsset.createdAt.toISOString(),
    url: mediaAsset.walrusBlobId ? `/api/media/${mediaAsset.id}/blob` : null
  };
}
