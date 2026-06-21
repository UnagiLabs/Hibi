export type HibiPluginConfig = {
  apiBaseUrl?: string;
  walletAddress?: string;
};

export function getApiBaseUrl(config: HibiPluginConfig): string {
  return (config.apiBaseUrl ?? process.env.HIBI_API_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");
}
