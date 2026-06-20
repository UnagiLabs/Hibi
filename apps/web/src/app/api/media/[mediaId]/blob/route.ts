const API_BASE_URL = process.env.HIBI_API_URL ?? "http://127.0.0.1:4000";

type RouteContext = {
  params: Promise<{
    mediaId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { mediaId } = await context.params;
  const response = await fetch(
    `${API_BASE_URL.replace(/\/$/, "")}/api/media/${encodeURIComponent(mediaId)}/blob`,
    {
      cache: "no-store"
    }
  );
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const cacheControl = response.headers.get("cache-control");

  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (cacheControl) {
    headers.set("cache-control", cacheControl);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
