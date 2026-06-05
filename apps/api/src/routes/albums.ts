import type { FastifyInstance } from "fastify";

import { config } from "../config.js";
import { demoContext } from "../demo-context.js";
import { prisma } from "../db.js";
import { recallDemoMonthlyHighlights, type EnrichedRecallResult } from "../memwal/recall.js";
import { getLocalMonthRange, getLocalMonthRangeFromParts } from "../time/month-range.js";

type GenerateAlbumBody = {
  targetYear?: unknown;
  targetMonth?: unknown;
};

export async function registerAlbumRoutes(server: FastifyInstance) {
  server.post("/api/albums/generate", async (request, reply) => {
    const parsed = parseGenerateAlbumBody(request.body);

    if (!parsed.ok) {
      return reply.status(400).send({
        ok: false,
        error: parsed.message
      });
    }

    const monthRange = parsed.monthRange;
    const title = `${monthRange.year}年${monthRange.month}月の成長アルバム`;
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
    const memwalHighlights = filterMonthlyHighlights(
      await recallDemoMonthlyHighlights({
        year: monthRange.year,
        month: monthRange.month,
        limit: 8
      }),
      monthRange
    );

    return reply.status(201).send({
      ok: true,
      albumId: album.id,
      viewId: viewSession.id,
      viewUrl,
      title: album.title,
      targetYear: monthRange.year,
      targetMonth: monthRange.month,
      memwalHighlights,
      reply: `${album.title}を用意しました。${viewUrl}`
    });
  });
}

function parseGenerateAlbumBody(body: unknown):
  | { ok: true; monthRange: ReturnType<typeof getLocalMonthRange> }
  | { ok: false; message: string } {
  if (body === undefined || body === null) {
    return { ok: true, monthRange: getLocalMonthRange(new Date()) };
  }

  if (typeof body !== "object") {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const { targetYear, targetMonth } = body as GenerateAlbumBody;

  if (targetYear === undefined && targetMonth === undefined) {
    return { ok: true, monthRange: getLocalMonthRange(new Date()) };
  }

  if (!isInteger(targetYear) || !isInteger(targetMonth)) {
    return { ok: false, message: "`targetYear` and `targetMonth` must be integers." };
  }

  if (targetYear < 2000 || targetYear > 2100 || targetMonth < 1 || targetMonth > 12) {
    return { ok: false, message: "`targetYear` or `targetMonth` is out of range." };
  }

  return { ok: true, monthRange: getLocalMonthRangeFromParts(targetYear, targetMonth) };
}

function buildViewUrl(viewId: string): string {
  return `${config.webBaseUrl.replace(/\/$/, "")}/v/${viewId}`;
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
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
