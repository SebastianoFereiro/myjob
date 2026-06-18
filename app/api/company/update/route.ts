import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { fetchAPI } from "@/lib/strapi-client";

type StrapiUpdateResponse = {
  data: {
    documentId: string;
    id?: number;
    name: string;
    [key: string]: unknown;
  };
};

// Реальные поля коллекции Company в Strapi (из CompanyRef в types/cv.ts)
const ALLOWED_FIELDS = [
  "name",
  "description",
  "siteUrl",
  "address",
  "phone",
  "email",
] as const;

async function tryUpdate(
  companyId: string,
  fields: Record<string, unknown>,
): Promise<StrapiUpdateResponse> {
  const attempts: Array<Record<string, unknown>> = [fields];

  for (const key of Object.keys(fields)) {
    const subset = { ...fields };
    delete subset[key];
    attempts.push(subset);
  }

  const tried = new Set<string>();

  for (const attempt of attempts) {
    const key = Object.keys(attempt).sort().join(",");
    if (tried.has(key)) continue;
    tried.add(key);

    try {
      return await fetchAPI<StrapiUpdateResponse>(
        `/companies/${companyId}`,
        {
          method: "PUT",
          body: JSON.stringify({ data: attempt }),
        },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("Invalid key")) throw err;
      console.warn(`Strapi rejected [${key}], trying subset`);
    }
  }

  const fieldNames = Object.keys(fields).join(", ");
  throw new Error(
    `Ни одно из полей (${fieldNames}) не удалось обновить в Strapi. Возможно, поля отсутствуют в схеме.`,
  );
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    if (session.user.role !== "company") {
      return NextResponse.json(
        { error: "Доступ только для компаний" },
        { status: 403 },
      );
    }

    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: "Компания не зарегистрирована" },
        { status: 404 },
      );
    }

    const body = await request.json();

    const data: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (!data.name?.toString().trim()) {
      return NextResponse.json(
        { error: "Название компании обязательно" },
        { status: 400 },
      );
    }

    const response = await tryUpdate(companyId, data);

    if (!response?.data?.documentId) {
      return NextResponse.json(
        { error: "Не удалось обновить компанию" },
        { status: 502 },
      );
    }

    revalidateTag("companies", "default");

    return NextResponse.json({
      success: true,
      company: {
        documentId: response.data.documentId,
        name: response.data.name,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Внутренняя ошибка сервера";
    console.error("Company update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
