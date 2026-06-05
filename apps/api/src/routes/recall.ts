import type { FastifyInstance } from "fastify";

import { recallDemoMemory } from "../memwal/recall.js";

type RecallRequestBody = {
  query?: unknown;
  limit?: unknown;
};

export async function registerRecallRoutes(server: FastifyInstance) {
  server.post("/api/recall", async (request, reply) => {
    const parsed = parseRecallBody(request.body);

    if (!parsed.ok) {
      return reply.status(400).send({
        ok: false,
        error: parsed.message
      });
    }

    const recall = await recallDemoMemory(parsed.query, parsed.limit);

    return reply.send({
      ok: recall.status === "ok",
      query: parsed.query,
      recall
    });
  });
}

function parseRecallBody(body: unknown):
  | { ok: true; query: string; limit: number }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const { query, limit } = body as RecallRequestBody;

  if (typeof query !== "string" || query.trim().length === 0) {
    return { ok: false, message: "`query` is required." };
  }

  if (
    limit !== undefined &&
    (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 20)
  ) {
    return { ok: false, message: "`limit` must be an integer from 1 to 20." };
  }

  return {
    ok: true,
    query: query.trim(),
    limit: typeof limit === "number" ? limit : 5
  };
}
