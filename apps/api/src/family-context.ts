import type { FastifyRequest } from "fastify";

import { config } from "./config.js";
import { demoContext } from "./demo-context.js";

type FamilyContext = {
  familyId: string;
  userId: string;
  memorySpaceId: string;
  authenticated: boolean;
  source: "demo" | "wallet";
  walletAddress?: string;
};

export type FamilyContextResult =
  | {
      ok: true;
      context: FamilyContext;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export async function resolveFamilyContext(request: FastifyRequest): Promise<FamilyContextResult> {
  const walletAddress = readWalletAddress(request);

  if (!walletAddress) {
    return {
      ok: true,
      context: {
        ...demoContext,
        source: "demo",
        authenticated: false
      }
    };
  }

  const binding = config.familyContextMap[walletAddress];

  if (!binding) {
    return {
      ok: false,
      status: 403,
      error: `No Hibi family context is configured for wallet ${walletAddress}.`
    };
  }

  return {
    ok: true,
    context: {
      familyId: binding.familyId,
      userId: binding.userId,
      memorySpaceId: binding.memorySpaceId,
      walletAddress,
      source: "wallet",
      authenticated: true
    }
  };
}

function readWalletAddress(request: FastifyRequest): string | null {
  const headerValue = request.headers["x-hibi-wallet"];
  const fromHeader =
    typeof headerValue === "string"
      ? headerValue
      : Array.isArray(headerValue)
        ? headerValue[0]
        : undefined;

  const rawQuery =
    typeof request.query === "object" && request.query !== null && "walletAddress" in request.query
      ? (request.query as { walletAddress?: string }).walletAddress
      : undefined;

  const candidate =
    typeof rawQuery === "string" && rawQuery.trim().length > 0
      ? rawQuery
      : typeof fromHeader === "string" && fromHeader.trim().length > 0
        ? fromHeader
        : null;

  if (!candidate) {
    return null;
  }

  const normalized = candidate.trim().toLowerCase();

  if (!/^0x[a-f0-9]{64}$/i.test(normalized)) {
    return null;
  }

  return normalized;
}
