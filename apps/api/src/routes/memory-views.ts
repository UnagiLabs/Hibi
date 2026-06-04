import type { FastifyInstance } from "fastify";

import { prisma } from "../db.js";
import { getLocalDayRange } from "../time/day-range.js";

type MemoryViewParams = {
  id?: string;
};

export async function registerMemoryViewRoutes(server: FastifyInstance) {
  server.get<{ Params: MemoryViewParams }>("/api/memory-views/:id/bootstrap", async (request, reply) => {
    const viewId = request.params.id;

    if (!viewId) {
      return reply.status(400).send({
        ok: false,
        error: "`id` is required."
      });
    }

    const viewSession = await prisma.memoryViewSession.findUnique({
      where: { id: viewId }
    });

    if (!viewSession) {
      return reply.status(404).send({
        ok: false,
        state: "not_found"
      });
    }

    if (viewSession.status === "revoked") {
      return reply.status(403).send({
        ok: false,
        state: "revoked"
      });
    }

    if (viewSession.expiresAt && viewSession.expiresAt.getTime() <= Date.now()) {
      return reply.status(410).send({
        ok: false,
        state: "expired"
      });
    }

    if (viewSession.viewType !== "care_log_day") {
      return reply.status(400).send({
        ok: false,
        state: "unsupported_view_type",
        viewType: viewSession.viewType
      });
    }

    const fallbackRange = getLocalDayRange(viewSession.createdAt);
    const rangeStart = viewSession.rangeStart ?? fallbackRange.start;
    const rangeEnd = viewSession.rangeEnd ?? fallbackRange.end;
    const careLogs = await prisma.careLog.findMany({
      where: {
        familyId: viewSession.familyId,
        memorySpaceId: viewSession.memorySpaceId,
        occurredAt: {
          gte: rangeStart,
          lt: rangeEnd
        }
      },
      orderBy: {
        occurredAt: "asc"
      }
    });

    return reply.send({
      ok: true,
      state: "ready",
      view: {
        id: viewSession.id,
        type: viewSession.viewType,
        status: viewSession.status,
        rangeStart: rangeStart.toISOString(),
        rangeEnd: rangeEnd.toISOString()
      },
      careLogs: careLogs.map((careLog) => ({
        id: careLog.id,
        category: careLog.category,
        amount: careLog.amount,
        unit: careLog.unit,
        value: careLog.value,
        sourceText: careLog.sourceText,
        occurredAt: careLog.occurredAt.toISOString()
      }))
    });
  });
}

