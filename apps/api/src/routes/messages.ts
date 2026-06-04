import type { FastifyInstance } from "fastify";

import { demoContext } from "../demo-context.js";
import { prisma } from "../db.js";

type MessageRequestBody = {
  text?: unknown;
  occurredAt?: unknown;
};

function parseMessageBody(body: unknown):
  | { ok: true; text: string; occurredAt: Date }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const { text, occurredAt } = body as MessageRequestBody;

  if (typeof text !== "string" || text.trim().length === 0) {
    return { ok: false, message: "`text` is required." };
  }

  if (occurredAt !== undefined) {
    if (typeof occurredAt !== "string") {
      return { ok: false, message: "`occurredAt` must be an ISO datetime string." };
    }

    const parsed = new Date(occurredAt);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, message: "`occurredAt` must be a valid ISO datetime string." };
    }

    return { ok: true, text: text.trim(), occurredAt: parsed };
  }

  return { ok: true, text: text.trim(), occurredAt: new Date() };
}

export async function registerMessageRoutes(server: FastifyInstance) {
  server.post("/api/messages", async (request, reply) => {
    const parsed = parseMessageBody(request.body);

    if (!parsed.ok) {
      return reply.status(400).send({
        ok: false,
        error: parsed.message
      });
    }

    const memoryItem = await prisma.memoryItem.create({
      data: {
        familyId: demoContext.familyId,
        memorySpaceId: demoContext.memorySpaceId,
        body: parsed.text,
        sourceText: parsed.text,
        source: "message",
        occurredAt: parsed.occurredAt
      }
    });

    return reply.status(201).send({
      ok: true,
      messageId: memoryItem.id,
      intent: "unclassified",
      reply: "メッセージを保存しました。"
    });
  });
}

