import { NextResponse } from "next/server";
import { generateYandexFeedXml } from "@/services/yandex-feed.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const xml = await generateYandexFeedXml();

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Yandex feed generation error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="utf-8"?>
<error>Failed to generate feed</error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      },
    );
  }
}
