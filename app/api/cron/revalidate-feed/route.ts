import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    const ok = authHeader === `Bearer ${expectedSecret}` || querySecret === expectedSecret;
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const secret = expectedSecret ? `&secret=${encodeURIComponent(expectedSecret)}` : "";
    const res = await fetch(`${appUrl}/api/revalidate?tag=yandex-feed${secret}`);
    const data = await res.json();

    return NextResponse.json({
      revalidated: res.ok,
      tag: "yandex-feed",
      status: res.status,
      data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Revalidation failed", details: String(err) },
      { status: 500 },
    );
  }
}
