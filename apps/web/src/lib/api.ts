export type CareLog = {
  id: string;
  category: string;
  amount: number | null;
  unit: string | null;
  value: number | null;
  sourceText: string;
  occurredAt: string;
};

export type Album = {
  id: string;
  type: string;
  title: string;
  targetYear: number | null;
  targetMonth: number | null;
  status: string;
  manifestWalrusBlobId: string | null;
  manifestSha256: string | null;
};

export type BootstrapResponse =
  | {
      ok: true;
      state: "ready";
      view: {
        id: string;
        type: string;
        status: string;
        rangeStart: string;
        rangeEnd: string;
      };
      album?: Album | null;
      careLogs: CareLog[];
    }
  | {
      ok: false;
      state?: "not_found" | "revoked" | "expired" | "unsupported_view_type";
      error?: string;
      viewType?: string;
    };

export type MonthlyAlbumHighlight = {
  text: string;
  blobId: string;
  distance: number;
  sourceId: string | null;
  source:
    | {
        type: "memory_item";
        id: string;
        body: string;
        sourceText: string;
        occurredAt: string;
      }
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
        type: "unknown";
        id: string;
      }
    | null;
};

export type MonthlyAlbumResponse =
  | {
      ok: true;
      albumId: string | null;
      title: string;
      targetYear: number;
      targetMonth: number;
      memwalHighlights:
        | {
            status: "ok";
            namespace: string;
            total: number;
            results: MonthlyAlbumHighlight[];
          }
        | {
            status: "disabled";
            reason: string;
            namespace: string;
            results: [];
          }
        | {
            status: "failed";
            namespace: string;
            error: string;
            results: [];
          };
    }
  | {
      ok: false;
      error: string;
    };

export async function fetchMemoryView(viewId: string): Promise<BootstrapResponse> {
  const apiBaseUrl = process.env.HIBI_API_URL ?? "http://127.0.0.1:4000";
  const response = await fetch(
    `${apiBaseUrl.replace(/\/$/, "")}/api/memory-views/${encodeURIComponent(viewId)}/bootstrap`,
    {
      cache: "no-store"
    }
  );

  const data = (await response.json()) as BootstrapResponse;

  if (!response.ok && data.ok !== false) {
    return {
      ok: false,
      state: response.status === 404 ? "not_found" : "unsupported_view_type"
    };
  }

  return data;
}

export async function fetchMonthlyAlbum(params?: {
  targetYear?: number;
  targetMonth?: number;
}): Promise<MonthlyAlbumResponse> {
  const apiBaseUrl = process.env.HIBI_API_URL ?? "http://127.0.0.1:4000";
  const searchParams = new URLSearchParams();

  if (params?.targetYear) {
    searchParams.set("targetYear", String(params.targetYear));
  }

  if (params?.targetMonth) {
    searchParams.set("targetMonth", String(params.targetMonth));
  }

  const query = searchParams.toString();

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/albums/monthly${query ? `?${query}` : ""}`,
      {
        cache: "no-store"
      }
    );
    const data = (await response.json()) as MonthlyAlbumResponse;

    if (!response.ok && data.ok !== false) {
      return {
        ok: false,
        error: "Cannot load monthly album."
      };
    }

    return data;
  } catch {
    return {
      ok: false,
      error: "Cannot connect to Hibi API."
    };
  }
}
