import type { FastifyInstance } from "fastify";

import { buildMonthlyAlbumManifest } from "../albums/manifest.js";
import { config } from "../config.js";
import { demoContext } from "../demo-context.js";
import { prisma } from "../db.js";
import { recallDemoMonthlyHighlights, type EnrichedRecallResult } from "../memwal/recall.js";
import { getLocalMonthRange, getLocalMonthRangeFromParts } from "../time/month-range.js";
import { archiveAlbumManifestToWalrus } from "../walrus/client.js";

type GenerateAlbumBody = {
  targetYear?: unknown;
  targetMonth?: unknown;
};

type MonthlyAlbumQuery = {
  targetYear?: unknown;
  targetMonth?: unknown;
};

export async function registerAlbumRoutes(server: FastifyInstance) {
  server.get<{ Querystring: MonthlyAlbumQuery }>("/api/albums/monthly", async (request, reply) => {
    const parsed = parseMonthInput(request.query);

    if (!parsed.ok) {
      return reply.status(400).send({
        ok: false,
        error: parsed.message
      });
    }

    const monthRange = parsed.monthRange;
    const album = await prisma.album.findFirst({
      where: {
        familyId: demoContext.familyId,
        memorySpaceId: demoContext.memorySpaceId,
        type: "monthly_growth_album",
        targetYear: monthRange.year,
        targetMonth: monthRange.month
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return reply.send({
      ok: true,
      albumId: album?.id ?? null,
      title: album?.title ?? buildMonthlyAlbumTitle(monthRange.year, monthRange.month),
      targetYear: monthRange.year,
      targetMonth: monthRange.month,
      manifestWalrusBlobId: album?.manifestWalrusBlobId ?? null,
      manifestSha256: album?.manifestSha256 ?? null,
      status: album?.status ?? "not_generated",
      memwalHighlights: await buildMonthlyMemWalHighlights(monthRange)
    });
  });

  server.post("/api/albums/generate", async (request, reply) => {
    const parsed = parseMonthInput(request.body);

    if (!parsed.ok) {
      return reply.status(400).send({
        ok: false,
        error: parsed.message
      });
    }

    const monthRange = parsed.monthRange;
    const title = buildMonthlyAlbumTitle(monthRange.year, monthRange.month);
    const { album, viewSession } = await prisma.$transaction(async (tx) => {
      const existingAlbum = await tx.album.findFirst({
        where: {
          familyId: demoContext.familyId,
          memorySpaceId: demoContext.memorySpaceId,
          type: "monthly_growth_album",
          targetYear: monthRange.year,
          targetMonth: monthRange.month
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      const album =
        existingAlbum ??
        (await tx.album.create({
          data: {
            familyId: demoContext.familyId,
            memorySpaceId: demoContext.memorySpaceId,
            type: "monthly_growth_album",
            title,
            targetYear: monthRange.year,
            targetMonth: monthRange.month,
            status: "generated"
          }
        }));
      const viewSession = await tx.memoryViewSession.create({
        data: {
          familyId: demoContext.familyId,
          memorySpaceId: demoContext.memorySpaceId,
          albumId: album.id,
          viewType: "monthly_growth_album",
          rangeStart: monthRange.start,
          rangeEnd: monthRange.end
        }
      });

      return { album, viewSession };
    });
    const viewUrl = buildViewUrl(viewSession.id);
    const [memwalHighlights, careLogs] = await Promise.all([
      buildMonthlyMemWalHighlights(monthRange),
      prisma.careLog.findMany({
        where: {
          familyId: demoContext.familyId,
          memorySpaceId: demoContext.memorySpaceId,
          occurredAt: {
            gte: monthRange.start,
            lt: monthRange.end
          }
        },
        orderBy: {
          occurredAt: "asc"
        }
      })
    ]);
    const manifestArtifact = buildMonthlyAlbumManifest({
      albumId: album.id,
      familyId: album.familyId,
      memorySpaceId: album.memorySpaceId,
      title: album.title,
      targetYear: monthRange.year,
      targetMonth: monthRange.month,
      periodStart: monthRange.start,
      periodEnd: monthRange.end,
      highlights: memwalHighlights.status === "ok" ? memwalHighlights.results : [],
      careLogs
    });
    const walrusArtifact = await archiveAlbumManifestToWalrus(manifestArtifact);
    const updatedAlbum = await prisma.album.update({
      where: {
        id: album.id
      },
      data: {
        manifestSha256: manifestArtifact.sha256,
        manifestWalrusBlobId: walrusArtifact.status === "done" ? walrusArtifact.blobId : album.manifestWalrusBlobId,
        status: walrusArtifact.status === "done" ? "archived" : "generated"
      }
    });

    return reply.status(201).send({
      ok: true,
      albumId: updatedAlbum.id,
      viewId: viewSession.id,
      viewUrl,
      title: updatedAlbum.title,
      targetYear: monthRange.year,
      targetMonth: monthRange.month,
      manifestWalrusBlobId: updatedAlbum.manifestWalrusBlobId,
      manifestSha256: updatedAlbum.manifestSha256,
      status: updatedAlbum.status,
      memwalHighlights,
      walrusArtifact,
      reply: `${updatedAlbum.title}を用意しました。${viewUrl}`
    });
  });
}

function parseMonthInput(input: unknown):
  | { ok: true; monthRange: ReturnType<typeof getLocalMonthRange> }
  | { ok: false; message: string } {
  if (input === undefined || input === null) {
    return { ok: true, monthRange: getLocalMonthRange(new Date()) };
  }

  if (typeof input !== "object") {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const { targetYear, targetMonth } = input as GenerateAlbumBody;
  const parsedYear = parseOptionalInteger(targetYear);
  const parsedMonth = parseOptionalInteger(targetMonth);

  if (targetYear === undefined && targetMonth === undefined) {
    return { ok: true, monthRange: getLocalMonthRange(new Date()) };
  }

  if (parsedYear === null || parsedMonth === null) {
    return { ok: false, message: "`targetYear` and `targetMonth` must be integers." };
  }

  if (parsedYear < 2000 || parsedYear > 2100 || parsedMonth < 1 || parsedMonth > 12) {
    return { ok: false, message: "`targetYear` or `targetMonth` is out of range." };
  }

  return { ok: true, monthRange: getLocalMonthRangeFromParts(parsedYear, parsedMonth) };
}

function buildViewUrl(viewId: string): string {
  return `${config.webBaseUrl.replace(/\/$/, "")}/v/${viewId}`;
}

function buildMonthlyAlbumTitle(year: number, month: number): string {
  return `${year}年${month}月の成長アルバム`;
}

function parseOptionalInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  return null;
}

async function buildMonthlyMemWalHighlights(monthRange: ReturnType<typeof getLocalMonthRange>) {
  return filterMonthlyHighlights(
    await recallDemoMonthlyHighlights({
      year: monthRange.year,
      month: monthRange.month,
      limit: 8
    }),
    monthRange
  );
}

function filterMonthlyHighlights(
  recall: Awaited<ReturnType<typeof recallDemoMonthlyHighlights>>,
  monthRange: ReturnType<typeof getLocalMonthRange>
) {
  if (recall.status !== "ok") {
    return recall;
  }

  return {
    ...recall,
    results: recall.results.filter((result) => isInMonth(result, monthRange))
  };
}

function isInMonth(result: EnrichedRecallResult, monthRange: ReturnType<typeof getLocalMonthRange>): boolean {
  const occurredAt = result.source?.type === "care_log" || result.source?.type === "memory_item"
    ? new Date(result.source.occurredAt)
    : null;

  return Boolean(
    occurredAt &&
      occurredAt.getTime() >= monthRange.start.getTime() &&
      occurredAt.getTime() < monthRange.end.getTime()
  );
}
