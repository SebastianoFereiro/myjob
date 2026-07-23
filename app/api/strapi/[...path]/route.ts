import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const STRAPI_URL = (process.env.STRAPI_URL || "https://atlantis.myjob.by").replace(/\/$/, "");

function withErrorHandler(fn: (request: NextRequest, params: { path: string[] }) => Promise<NextResponse>) {
  return async (request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => {
    try {
      return await fn(request, await params);
    } catch (err) {
      console.error("Strapi proxy unhandled error:", err);
      return NextResponse.json(
        { error: { message: err instanceof Error ? err.message : "Strapi proxy error" } },
        { status: 500 },
      );
    }
  };
}

async function handleStrapiProxy(request: NextRequest, params: { path: string[] }) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: { message: "Unauthorized" } },
      { status: 403 },
    );
  }

  const userId = session.user.id;
  const strapiPath = params.path.join("/");

  let url: string;

  if (request.method === "GET") {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    // Добавляем userId для списков cvs и resumes
    if (
      strapiPath === "cvs" || strapiPath === "cvs/" ||
      strapiPath === "resumes" || strapiPath === "resumes/"
    ) {
      searchParams.set("filters[userId][$eq]", userId);
    }
    const searchString = searchParams.toString();
    url = `${STRAPI_URL}/api/${strapiPath}${searchString ? `?${searchString}` : ""}`;
  } else {
    const searchString = request.nextUrl.searchParams.toString();
    url = `${STRAPI_URL}/api/${strapiPath}${searchString ? `?${searchString}` : ""}`;
  }

  const isWriteMethod = request.method !== "GET" && request.method !== "HEAD";
  const token = isWriteMethod
    ? (process.env.STRAPI_API_WRITE_TOKEN || process.env.STRAPI_API_TOKEN)
    : process.env.STRAPI_API_TOKEN;

  if (!token) {
    console.error("STRAPI_API_TOKEN is not set");
    return NextResponse.json(
      { error: { message: "Strapi API token is not configured" } },
      { status: 500 },
    );
  }

  // console.log(`[STRAPI PROXY] method=${request.method} path=${strapiPath} usingWriteToken=${!!isWriteMethod && !!process.env.STRAPI_API_WRITE_TOKEN}`);

  let body: string | undefined;

  if (isWriteMethod) {
    // Читаем тело как текст, чтобы избежать ошибок при пустом/битом JSON
    const raw = await request.text();
    if (raw) {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return NextResponse.json(
          { error: { message: "Invalid JSON in request body" } },
          { status: 400 },
        );
      }
      body = JSON.stringify({
        ...parsed,
        data: {
          ...((parsed.data as Record<string, unknown>) || {}),
          userId,
        },
      });
    }
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    // Strapi может вернуть 204 No Content (успешный DELETE без тела)
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = { error: { message: `Сервер Strapi вернул пустой ответ (${response.status})` } };
    }

    // console.log(`[STRAPI PROXY] response status=${response.status} body=`, JSON.stringify(data).slice(0, 500));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (err) {
    console.error("Strapi proxy fetch error:", err);
    return NextResponse.json(
      { error: { message: "Strapi proxy error" } },
      { status: 500 },
    );
  }
}

const handler = withErrorHandler(handleStrapiProxy);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
