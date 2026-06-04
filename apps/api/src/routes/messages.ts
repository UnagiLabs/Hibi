import type { FastifyInstance } from "fastify";

import { createMessageValidator } from "../ai/validator-factory.js";
import { demoContext } from "../demo-context.js";
import { prisma } from "../db.js";
import { parseMessageWithRules } from "../intent/rule-parser.js";

const messageValidator = createMessageValidator();

type MessageRequestBody = {
  text?: unknown;
  occurredAt?: unknown;
};

function parseMessageBody(body: unknown):
  | { ok: true; text: string; defaultOccurredAt: Date }
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

    return { ok: true, text: text.trim(), defaultOccurredAt: parsed };
  }

  return { ok: true, text: text.trim(), defaultOccurredAt: new Date() };
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

    const ruleResult = parseMessageWithRules(parsed.text, {
      referenceTime: new Date(),
      defaultOccurredAt: parsed.defaultOccurredAt
    });
    const validatedResult = await messageValidator.validate({
      text: parsed.text,
      ruleResult
    });

    if (validatedResult.intent === "care_log") {
      const careLog = await prisma.careLog.create({
        data: {
          familyId: demoContext.familyId,
          memorySpaceId: demoContext.memorySpaceId,
          category: validatedResult.category,
          amount: validatedResult.amount,
          unit: validatedResult.unit,
          value: validatedResult.value,
          sourceText: parsed.text,
          occurredAt: validatedResult.occurredAt
        }
      });

      return reply.status(201).send({
        ok: true,
        careLogId: careLog.id,
        intent: validatedResult.intent,
        category: validatedResult.category,
        confidence: validatedResult.confidence,
        validator: validatedResult.source,
        occurredAt: validatedResult.occurredAt.toISOString(),
        reply: buildCareLogReply(
          validatedResult.category,
          validatedResult.amount,
          validatedResult.unit,
          validatedResult.value
        )
      });
    }

    const memoryItem = await prisma.memoryItem.create({
      data: {
        familyId: demoContext.familyId,
        memorySpaceId: demoContext.memorySpaceId,
        body: parsed.text,
        sourceText: parsed.text,
        source: "message",
        occurredAt: validatedResult.occurredAt
      }
    });

    return reply.status(201).send({
      ok: true,
      messageId: memoryItem.id,
      intent: validatedResult.intent,
      confidence: validatedResult.confidence,
      validator: validatedResult.source,
      reply: "メッセージを保存しました。"
    });
  });
}

function buildCareLogReply(
  category: string,
  amount?: number,
  unit?: string,
  value?: number
): string {
  switch (category) {
    case "milk":
      return amount && unit ? `ミルク${amount}${unit}を記録しました。` : "ミルクを記録しました。";
    case "breastfeeding":
      return "授乳を記録しました。";
    case "sleep_start":
      return "睡眠開始を記録しました。";
    case "sleep_end":
      return "起床を記録しました。";
    case "poop":
      return "うんちを記録しました。";
    case "pee":
      return "おしっこを記録しました。";
    case "temperature":
      return value === undefined ? "体温を記録しました。" : `体温${value}度を記録しました。`;
    default:
      return "育児ログを記録しました。";
  }
}
