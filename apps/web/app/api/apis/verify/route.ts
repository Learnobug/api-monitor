import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url, method, body, bodyType, headers: customHeaders } = await request.json();

  if (!url) {
    return NextResponse.json({ reachable: false, error: "URL is required" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const fetchOptions: RequestInit = {
      method: method || "GET",
      signal: controller.signal,
      redirect: "follow",
    };

    // Merge custom headers with content-type for methods that support a body
    const mergedHeaders: Record<string, string> = { ...(customHeaders ?? {}) };
    if (body && bodyType && bodyType !== "none" && ["POST", "PUT", "PATCH", "DELETE"].includes((method || "GET").toUpperCase())) {
      fetchOptions.body = body;
      mergedHeaders["Content-Type"] = bodyType === "json" ? "application/json" : "text/plain";
    }
    if (Object.keys(mergedHeaders).length > 0) {
      fetchOptions.headers = mergedHeaders;
    }

    const res = await fetch(url, fetchOptions);

    clearTimeout(timeout);

    return NextResponse.json({
      reachable: true,
      status: res.status,
      statusText: res.statusText,
    });
  } catch (err: any) {
    return NextResponse.json({
      reachable: false,
      error: err?.name === "AbortError" ? "Request timed out (10s)" : err?.message ?? "Unknown error",
    });
  }
}
