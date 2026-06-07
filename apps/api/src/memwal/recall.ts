import type { RecallMemory } from "@mysten-incubation/memwal";

import { demoContext } from "../demo-context.js";
import { prisma } from "../db.js";
import { buildMemWalNamespace, createMemWalClient, isMemWalConfigured } from "./client.js";

const DEFAULT_LIMIT = 5;
const DEFAULT_MAX_DISTANCE = 0.75;

export type MemWalRecallOutcome =
  | {
      status: "disabled";
      reason: "missing_credentials";
      namespace: string;
      results: [];
    }
  | {
      status: "ok";
      namespace: string;
      total: number;
      results: EnrichedRecallResult[];
    }
  | {
      status: "failed";
      namespace: string;
      error: string;
      results: [];
    };

export type EnrichedRecallResult = {
  text: string;
  blobId: string;
  distance: number;
  sourceId: string | null;
  source: RecallSource | null;
};

type RecallSource =
  | {
      type: "care_log";
      id: string;
      category: string;
      amount: number | null;
      unit: string | null;
      value: number | null;
      sourceText: string;
      occurredAt: string;
    }
  | {
      type: "memory_item";
      id: string;
      body: string;
      sourceText: string;
      occurredAt: string;
    }
  | {
      type: "unknown";
      id: string;
    };

export async function recallDemoMemory(query: string, limit = DEFAULT_LIMIT): Promise<MemWalRecallOutcome> {
  return recallHibiMemory({
    familyId: demoContext.familyId,
    memorySpaceId: demoContext.memorySpaceId,
    query,
    limit
  });
}

export async function recallDemoMonthlyHighlights({
  year,
  month,
  limit = DEFAULT_LIMIT
}: {
  year: number;
  month: number;
  limit?: number;
}): Promise<MemWalRecallOutcome> {
  return recallDemoMemory(
    [
      `${year}年${month}月のできるようになったこと`,
      "成長",
      "初めての出来事",
      "milestone",
      "first time"
    ].join(" / "),
    limit
  );
}

async function recallHibiMemory({
  familyId,
  memorySpaceId,
  query,
  limit
}: {
  familyId: string;
  memorySpaceId: string;
  query: string;
  limit: number;
}): Promise<MemWalRecallOutcome> {
  const namespace = buildMemWalNamespace(familyId, memorySpaceId);

  if (!isMemWalConfigured()) {
    return {
      status: "disabled",
      reason: "missing_credentials",
      namespace,
      results: []
    };
  }

  const client = createMemWalClient(namespace);
  if (!client) {
    return {
      status: "disabled",
      reason: "missing_credentials",
      namespace,
      results: []
    };
  }

  try {
    const recalled = await client.recall({
      query,
      topK: limit,
      namespace,
      maxDistance: DEFAULT_MAX_DISTANCE
    });
    const results = await enrichRecallResults(recalled.results);

    return {
      status: "ok",
      namespace,
      total: recalled.total,
      results
    };
  } catch (error) {
    return {
      status: "failed",
      namespace,
      error: error instanceof Error ? error.message : "Unknown MemWal recall error",
      results: []
    };
  }
}

async function enrichRecallResults(results: RecallMemory[]): Promise<EnrichedRecallResult[]> {
  return Promise.all(
    results.map(async (result) => {
      const sourceId = extractSourceId(result.text);
      return {
        text: result.text,
        blobId: result.blob_id,
        distance: result.distance,
        sourceId,
        source: sourceId ? await findRecallSource(sourceId) : null
      };
    })
  );
}

async function findRecallSource(sourceId: string): Promise<RecallSource> {
  const ref = await prisma.memWalMemoryRef.findFirst({
    where: {
      sourceId,
      status: "done"
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (ref?.sourceType === "care_log") {
    const careLog = await prisma.careLog.findUnique({
      where: {
        id: sourceId
      }
    });

    if (careLog) {
      return {
        type: "care_log",
        id: careLog.id,
        category: careLog.category,
        amount: careLog.amount,
        unit: careLog.unit,
        value: careLog.value,
        sourceText: careLog.sourceText,
        occurredAt: careLog.occurredAt.toISOString()
      };
    }
  }

  if (ref?.sourceType === "memory_item") {
    const memoryItem = await prisma.memoryItem.findUnique({
      where: {
        id: sourceId
      }
    });

    if (memoryItem) {
      return {
        type: "memory_item",
        id: memoryItem.id,
        body: memoryItem.body,
        sourceText: memoryItem.sourceText,
        occurredAt: memoryItem.occurredAt.toISOString()
      };
    }
  }

  return {
    type: "unknown",
    id: sourceId
  };
}

function extractSourceId(text: string): string | null {
  const match = text.match(/^Source:\s*(?<sourceId>\S+)/m);
  return match?.groups?.sourceId ?? null;
}
