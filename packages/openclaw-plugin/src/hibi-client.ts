import { getApiBaseUrl, type HibiPluginConfig } from "./config.js";

type HibiRequestOptions = {
  signal?: AbortSignal;
};

export type RememberTextResponse = {
  ok: boolean;
  reply?: string;
  viewId?: string;
  viewUrl?: string;
  intent?: string;
  category?: string;
  memwal?: {
    status: string;
    blobId?: string;
    namespace?: string;
  };
  error?: string;
};

export type RecallMemoryResponse = {
  ok: boolean;
  recall?: {
    status: string;
    namespace?: string;
    total?: number;
    results?: Array<{
      text: string;
      blobId: string;
      sourceId: string | null;
    }>;
  };
  error?: string;
};

export type GenerateMonthlyAlbumResponse = {
  ok: boolean;
  albumId?: string;
  viewId?: string;
  viewUrl?: string;
  title?: string;
  status?: string;
  manifestWalrusBlobId?: string | null;
  manifestSha256?: string | null;
  walrusArtifact?: {
    status: string;
    blobId?: string;
    blobObjectId?: string;
  };
  suiRecord?: {
    status: string;
    digest?: string;
    explorerUrl?: string;
  };
  error?: string;
};

export class HibiClient {
  readonly #apiBaseUrl: string;

  constructor(config: HibiPluginConfig) {
    this.#apiBaseUrl = getApiBaseUrl(config);
  }

  rememberText(text: string, options: HibiRequestOptions = {}): Promise<RememberTextResponse> {
    return this.#post("/api/messages", { text }, options);
  }

  recallMemory(query: string, options: HibiRequestOptions = {}): Promise<RecallMemoryResponse> {
    return this.#post("/api/recall", { query }, options);
  }

  generateMonthlyAlbum(
    input: {
      targetYear?: number;
      targetMonth?: number;
    },
    options: HibiRequestOptions = {}
  ): Promise<GenerateMonthlyAlbumResponse> {
    return this.#post("/api/albums/generate", input, options);
  }

  async #post<T>(path: string, body: unknown, options: HibiRequestOptions): Promise<T> {
    const response = await fetch(`${this.#apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body),
      signal: options.signal
    });
    const payload = (await response.json()) as T;

    if (!response.ok) {
      const message = typeof payload === "object" && payload && "error" in payload
        ? String(payload.error)
        : `Hibi API request failed with ${response.status}`;
      throw new Error(message);
    }

    return payload;
  }
}
