import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url, method } = await request.json();

  if (!url) {
    return NextResponse.json({ reachable: false, error: "URL is required" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: method || "GET",
      signal: controller.signal,
      redirect: "follow",
    });

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
