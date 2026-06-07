import { MemWal } from "@mysten-incubation/memwal";
import type { HealthResult } from "@mysten-incubation/memwal";

import { config } from "../config.js";

type MemWalStatus =
  | {
      status: "disabled";
      reason: "missing_credentials";
      serverUrl: string;
    }
  | {
      status: "ok";
      serverUrl: string;
      relayerStatus: string;
      version: string;
    }
  | {
      status: "error";
      serverUrl: string;
      message: string;
    };

export function isMemWalConfigured(): boolean {
  return Boolean(config.memwal.accountId && config.memwal.privateKey);
}

export function buildMemWalNamespace(familyId: string, memorySpaceId: string): string {
  return [
    config.memwal.namespacePrefix,
    config.memwal.env,
    familyId,
    memorySpaceId
  ].join(":");
}

export function createMemWalClient(namespace: string): MemWal | null {
  if (!isMemWalConfigured()) {
    return null;
  }

  return MemWal.create({
    key: config.memwal.privateKey!,
    accountId: config.memwal.accountId!,
    serverUrl: config.memwal.serverUrl,
    namespace
  });
}

export async function checkMemWal(): Promise<MemWalStatus> {
  if (!isMemWalConfigured()) {
    return {
      status: "disabled",
      reason: "missing_credentials",
      serverUrl: config.memwal.serverUrl
    };
  }

  try {
    const client = createMemWalClient(`${config.memwal.namespacePrefix}:${config.memwal.env}:health`);
    if (!client) {
      return {
        status: "disabled",
        reason: "missing_credentials",
        serverUrl: config.memwal.serverUrl
      };
    }

    const health: HealthResult = await client.health();
    return {
      status: "ok",
      serverUrl: config.memwal.serverUrl,
      relayerStatus: health.status,
      version: health.version
    };
  } catch (error) {
    return {
      status: "error",
      serverUrl: config.memwal.serverUrl,
      message: error instanceof Error ? error.message : "Unknown MemWal error"
    };
  }
}
