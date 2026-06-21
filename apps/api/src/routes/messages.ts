import type { FastifyInstance } from "fastify";

import { createMessageValidator } from "../ai/validator-factory.js";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { parseMessageWithRules } from "../intent/rule-parser.js";
import { rememberCareLog, rememberMemoryItem } from "../memwal/remember.js";
import { resolveFamilyContext } from "../family-context.js";
import { getLocalDayRange } from "../time/day-range.js";

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
    const contextResult = await resolveFamilyContext(request);

    if (!contextResult.ok) {
      return reply.status(contextResult.status).send({
        ok: false,
        error: contextResult.error
      });
    }

    const familyContext = contextResult.context;

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
      const dayRange = getLocalDayRange(validatedResult.occurredAt);
      const { careLog, viewSession } = await prisma.$transaction(async (tx) => {
        const careLog = await tx.careLog.create({
          data: {
            familyId: familyContext.familyId,
            memorySpaceId: familyContext.memorySpaceId,
            category: validatedResult.category,
            amount: validatedResult.amount,
            unit: validatedResult.unit,
            value: validatedResult.value,
            sourceText: parsed.text,
            occurredAt: validatedResult.occurredAt
          }
        });
        const viewSession = await tx.memoryViewSession.create({
          data: {
            familyId: familyContext.familyId,
            memorySpaceId: familyContext.memorySpaceId,
            viewType: "care_log_day",
            rangeStart: dayRange.start,
            rangeEnd: dayRange.end
          }
        });

        return { careLog, viewSession };
      });
      const viewUrl = buildViewUrlWithContext(viewSession.id, familyContext);
      const memwal = await rememberCareLog(careLog);

      return reply.status(201).send({
        ok: true,
        careLogId: careLog.id,
        viewId: viewSession.id,
        viewUrl,
        intent: validatedResult.intent,
        category: validatedResult.category,
        confidence: validatedResult.confidence,
        validator: validatedResult.source,
        occurredAt: validatedResult.occurredAt.toISOString(),
        rangeStart: dayRange.start.toISOString(),
        rangeEnd: dayRange.end.toISOString(),
        memwal,
        reply: buildCareLogReply(
          validatedResult.category,
          validatedResult.amount,
          validatedResult.unit,
          validatedResult.value,
          viewUrl
        )
      });
    }

    const memoryItem = await prisma.memoryItem.create({
      data: {
        familyId: familyContext.familyId,
        memorySpaceId: familyContext.memorySpaceId,
        body: parsed.text,
        sourceText: parsed.text,
        source: "message",
        occurredAt: validatedResult.occurredAt
      }
    });
    const memwal = await rememberMemoryItem(memoryItem);

    return reply.status(201).send({
      ok: true,
      messageId: memoryItem.id,
      intent: validatedResult.intent,
      confidence: validatedResult.confidence,
      validator: validatedResult.source,
      memwal,
      reply: "メッセージを保存しました。"
    });
  });
}

function buildCareLogReply(
  category: string,
  amount?: number,
  unit?: string,
  value?: number,
  viewUrl?: string
): string {
  const suffix = viewUrl ? ` 今日の育児ログはこちらです。${viewUrl}` : "";

  switch (category) {
    case "milk":
      return amount && unit ? `ミルク${amount}${unit}を記録しました。${suffix}` : `ミルクを記録しました。${suffix}`;
    case "breastfeeding":
      return `授乳を記録しました。${suffix}`;
    case "sleep_start":
      return `睡眠開始を記録しました。${suffix}`;
    case "sleep_end":
      return `起床を記録しました。${suffix}`;
    case "poop":
      return `うんちを記録しました。${suffix}`;
    case "pee":
      return `おしっこを記録しました。${suffix}`;
    case "temperature":
      return value === undefined ? `体温を記録しました。${suffix}` : `体温${value}度を記録しました。${suffix}`;
    default:
      return `育児ログを記録しました。${suffix}`;
  }
}

function buildViewUrlWithContext(
  viewId: string,
  familyContext?: {
    source: "demo" | "wallet";
    walletAddress?: string;
  }
): string {
  if (familyContext?.source !== "wallet" || !familyContext.walletAddress) {
    return buildViewUrl(viewId);
  }

  const query = new URLSearchParams();
  query.set("walletAddress", familyContext.walletAddress);

  return `${config.webBaseUrl.replace(/\/$/, "")}/v/${viewId}?${query}`;
}

function buildViewUrl(viewId: string): string {
  return `${config.webBaseUrl.replace(/\/$/, "")}/v/${viewId}`;
}
