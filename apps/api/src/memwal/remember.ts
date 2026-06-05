import type { CareLog, MemoryItem } from "@prisma/client";

import { prisma } from "../db.js";
import { buildMemWalNamespace, createMemWalClient, isMemWalConfigured } from "./client.js";

const REMEMBER_TIMEOUT_MS = 60_000;
const REMEMBER_POLL_INTERVAL_MS = 1_500;

type MemWalSourceType = "care_log" | "memory_item";

export type MemWalRememberOutcome =
  | {
      status: "disabled";
      reason: "missing_credentials";
      namespace: string;
    }
  | {
      status: "done";
      refId: string;
      namespace: string;
      jobId?: string;
      blobId: string;
    }
  | {
      status: "failed";
      refId: string;
      namespace: string;
      jobId?: string;
      error: string;
    };

type RememberInput = {
  familyId: string;
  memorySpaceId: string;
  sourceType: MemWalSourceType;
  sourceId: string;
  text: string;
};

export async function rememberCareLog(careLog: CareLog): Promise<MemWalRememberOutcome> {
  return rememberHibiMemory({
    familyId: careLog.familyId,
    memorySpaceId: careLog.memorySpaceId,
    sourceType: "care_log",
    sourceId: careLog.id,
    text: buildCareLogMemoryText(careLog)
  });
}

export async function rememberMemoryItem(memoryItem: MemoryItem): Promise<MemWalRememberOutcome> {
  return rememberHibiMemory({
    familyId: memoryItem.familyId,
    memorySpaceId: memoryItem.memorySpaceId,
    sourceType: "memory_item",
    sourceId: memoryItem.id,
    text: buildMemoryItemText(memoryItem)
  });
}

async function rememberHibiMemory(input: RememberInput): Promise<MemWalRememberOutcome> {
  const namespace = buildMemWalNamespace(input.familyId, input.memorySpaceId);

  if (!isMemWalConfigured()) {
    return {
      status: "disabled",
      reason: "missing_credentials",
      namespace
    };
  }

  const client = createMemWalClient(namespace);
  if (!client) {
    return {
      status: "disabled",
      reason: "missing_credentials",
      namespace
    };
  }

  const ref = await prisma.memWalMemoryRef.create({
    data: {
      familyId: input.familyId,
      memorySpaceId: input.memorySpaceId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      namespace,
      status: "pending",
      textPreview: truncate(input.text, 240)
    }
  });

  let jobId: string | undefined;

  try {
    const accepted = await client.remember(input.text, namespace);
    jobId = accepted.job_id;
    await prisma.memWalMemoryRef.update({
      where: { id: ref.id },
      data: {
        jobId,
        status: accepted.status || "pending"
      }
    });

    const result = await client.waitForRememberJob(jobId, {
      pollIntervalMs: REMEMBER_POLL_INTERVAL_MS,
      timeoutMs: REMEMBER_TIMEOUT_MS
    });

    await prisma.memWalMemoryRef.update({
      where: { id: ref.id },
      data: {
        jobId: result.job_id ?? jobId,
        blobId: result.blob_id,
        status: "done"
      }
    });

    return {
      status: "done",
      refId: ref.id,
      namespace,
      jobId: result.job_id ?? jobId,
      blobId: result.blob_id
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown MemWal remember error";
    await prisma.memWalMemoryRef.update({
      where: { id: ref.id },
      data: {
        jobId,
        status: "failed",
        error: message
      }
    });

    return {
      status: "failed",
      refId: ref.id,
      namespace,
      jobId,
      error: message
    };
  }
}

function buildCareLogMemoryText(careLog: CareLog): string {
  const details = [
    careLog.amount !== null && careLog.unit ? `Amount: ${careLog.amount}${careLog.unit}` : undefined,
    careLog.value !== null ? `Value: ${careLog.value}` : undefined
  ].filter(Boolean);

  return [
    "[care_log]",
    `Date: ${careLog.occurredAt.toISOString()}`,
    `Type: ${careLog.category}`,
    ...details,
    `Summary: ${summarizeCareLog(careLog)}`,
    `Source: ${careLog.id}`,
    `Original note: ${careLog.sourceText}`
  ].join("\n");
}

function summarizeCareLog(careLog: CareLog): string {
  switch (careLog.category) {
    case "milk":
      return careLog.amount !== null && careLog.unit
        ? `Milk ${careLog.amount}${careLog.unit} was recorded.`
        : "Milk was recorded.";
    case "breastfeeding":
      return "Breastfeeding was recorded.";
    case "sleep_start":
      return "Sleep start was recorded.";
    case "sleep_end":
      return "Wake-up was recorded.";
    case "poop":
      return "Poop diaper was recorded.";
    case "pee":
      return "Pee diaper was recorded.";
    case "temperature":
      return careLog.value !== null
        ? `Body temperature ${careLog.value} degrees was recorded.`
        : "Body temperature was recorded.";
    default:
      return "A care log was recorded.";
  }
}

function buildMemoryItemText(memoryItem: MemoryItem): string {
  return [
    "[daily_memory]",
    `Date: ${memoryItem.occurredAt.toISOString()}`,
    `Summary: ${memoryItem.body}`,
    `Source: ${memoryItem.id}`,
    `Original note: ${memoryItem.sourceText}`
  ].join("\n");
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}
