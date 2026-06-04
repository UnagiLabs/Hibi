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
