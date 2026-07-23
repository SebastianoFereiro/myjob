import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const STRAPI_URL = (process.env.STRAPI_URL || "https://atlantis.myjob.by").replace(/\/$/, "");

/**
 * Прокси для Strapi. Проверяет авторизацию и добавляет API-токен.
 * Запрос: POST /api/strapi/company-vacancies
 *         GET  /api/strapi/company-vacancies?filters...
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleStrapiProxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleStrapiProxy(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleStrapiProxy(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleStrapiProxy(request, await params);
}

async function handleStrapiProxy(request: NextRequest, params: { path: string[] }) {
  // Проверяем авторизацию
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

  // Строим URL
  let url: string;

  if (request.method === "GET") {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    // Добавляем userId только для списков cvs, не для одиночных записей
    const cvsCollection = strapiPath === "cvs" || strapiPath === "cvs/";
    if (cvsCollection) {
      searchParams.set("filters[userId][$eq]", userId);
    }
    const searchString = searchParams.toString();
    url = `${STRAPI_URL}/api/${strapiPath}${searchString ? `?${searchString}` : ""}`;
  } else {
    const searchString = request.nextUrl.searchParams.toString();
    url = `${STRAPI_URL}/api/${strapiPath}${searchString ? `?${searchString}` : ""}`;
  }

  // Выбираем токен в зависимости от метода
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

  console.log(`[STRAPI PROXY] method=${request.method} path=${strapiPath} usingWriteToken=${!!isWriteMethod && !!process.env.STRAPI_API_WRITE_TOKEN}`);

  try {
    let body = undefined;

    if (isWriteMethod) {
      const json = await request.json();
      // Добавляем userId из сессии в тело запроса
      body = {
        ...json,
        data: {
          ...json.data,
          userId,
        },
      };
    }

    const response = await fetch(url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = { error: { message: `Сервер Strapi вернул пустой ответ (${response.status})` } };
    }

    console.log(`[STRAPI PROXY] response status=${response.status} body=`, JSON.stringify(data).slice(0, 500));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (err) {
    console.error("Strapi proxy error:", err);
    return NextResponse.json(
      { error: { message: "Strapi proxy error" } },
      { status: 500 },
    );
  }
}