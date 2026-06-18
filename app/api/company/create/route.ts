import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { fetchAPI } from "@/lib/strapi-client";
import { NextResponse } from "next/server";

type CreateCompanyResponse = {
  data: {
    documentId: string;
    id?: number;
    name: string;
    slug: string;
    [key: string]: unknown;
  }[];
};

type StrapiCreateResponse = {
  data: {
    documentId: string;
    id?: number;
    name: string;
    slug: string;
    [key: string]: unknown;
  };
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    if (session.user.companyId) {
      return NextResponse.json(
        { error: "Компания уже зарегистрирована" },
        { status: 409 },
      );
    }

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Название компании обязательно" }, { status: 400 });
    }

    if (!body.ynp?.trim()) {
      return NextResponse.json({ error: "УНП обязателен" }, { status: 400 });
    }

    const ynp = body.ynp.trim();

    // Ищем компанию с таким УНП (create-or-find)
    const existingRes = await fetchAPI<CreateCompanyResponse>(
      `/companies?filters[ynp][$eq]=${encodeURIComponent(ynp)}&pagination[pageSize]=1`,
    );

    let companyDocumentId: string;
    let companyName: string;
    let companySlug: string;

    if (existingRes?.data?.[0]?.documentId) {
      // Компания уже существует — привязываем
      const existing = existingRes.data[0];
      companyDocumentId = existing.documentId;
      companyName = existing.name;
      companySlug = existing.slug;
      console.log(`Found existing company: ${companyName} (${companyDocumentId})`);
    } else {
      // Создаём новую компанию
      const slug = body.name
        .trim()
        .toLowerCase()
        .replace(/[а-яё]/g, (ch: string) => {
          const map: Record<string, string> = {
            а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
            ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
            н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
            ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
            ы: "y", э: "e", ю: "yu", я: "ya",
          };
          return map[ch] ?? ch;
        })
        .replace(/[^a-z0-9-_.~]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/\.+/g, ".")
        .slice(0, 200);

      const strapiPayload: Record<string, unknown> = {
        name: body.name.trim(),
        slug,
        ynp,
        isActive: false,
      };

      if (body.description) strapiPayload.description = body.description;
      if (body.industry) strapiPayload.industry = body.industry;
      if (body.size) strapiPayload.size = body.size;
      if (body.location) strapiPayload.location = body.location;

      const response = await fetchAPI<StrapiCreateResponse>("/companies", {
        method: "POST",
        body: JSON.stringify({ data: strapiPayload }),
      });

      if (!response?.data?.documentId) {
        console.error("Strapi create company failed:", response);
        return NextResponse.json(
          { error: "Не удалось создать компанию" },
          { status: 502 },
        );
      }

      companyDocumentId = response.data.documentId;
      companyName = response.data.name;
      companySlug = response.data.slug;
    }

    // Привязываем companyId к пользователю
    try {
      await db
        .update(user)
        .set({ companyId: companyDocumentId })
        .where(eq(user.id, session.user.id));
    } catch (updateError) {
      console.error("Failed to update user companyId:", updateError);
      return NextResponse.json(
        { error: "Не удалось привязать компанию к пользователю" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      company: {
        documentId: companyDocumentId,
        name: companyName,
        slug: companySlug,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера";
    console.error("Company creation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
