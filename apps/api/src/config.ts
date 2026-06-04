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
  host: process.env.HOST ?? DEFAULT_HOST,
  port: readPort(process.env.PORT),
  webBaseUrl: process.env.HIBI_WEB_URL ?? "http://localhost:3000"
};

