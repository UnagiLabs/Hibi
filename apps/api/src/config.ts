import "dotenv/config";

const DEFAULT_PORT = 4000;
const DEFAULT_HOST = "127.0.0.1";

function readPort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return parsed;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  aiProvider: process.env.AI_PROVIDER ?? "mock",
  host: process.env.HOST ?? DEFAULT_HOST,
  port: readPort(process.env.PORT),
  webBaseUrl: process.env.HIBI_WEB_URL ?? "http://localhost:3000",
  memwal: {
    accountId: process.env.MEMWAL_ACCOUNT_ID?.trim() || undefined,
    privateKey:
      process.env.MEMWAL_PRIVATE_KEY?.trim() ||
      process.env.MEMWAL_DELEGATE_PRIVATE_KEY?.trim() ||
      undefined,
    serverUrl:
      process.env.MEMWAL_SERVER_URL?.trim() ||
      "https://relayer.memory.walrus.xyz",
    namespacePrefix: process.env.MEMWAL_NAMESPACE_PREFIX?.trim() || "hibi",
    env: process.env.MEMWAL_ENV?.trim() || "testnet"
  }
};
