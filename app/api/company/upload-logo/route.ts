import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getStrapiURL, getStrapiMediaURL } from "@/lib/strapi-client";

type StrapiUploadResponse = {
  id: number;
  url: string;
  alternativeText?: string;
  [key: string]: unknown;
}[];

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Допустимы только JPEG, PNG, WebP, GIF" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Размер файла не должен превышать 5 МБ" },
        { status: 400 },
      );
    }

    const token = process.env.STRAPI_API_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "API-токен не настроен" },
        { status: 500 },
      );
    }

    // 1. Загружаем файл в Strapi media library
    const uploadFormData = new FormData();
    uploadFormData.append("files", file);

    const uploadRes = await fetch(`${getStrapiURL()}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => "Unknown error");
      console.error("Strapi upload error:", errText);
      return NextResponse.json(
        { error: "Не удалось загрузить файл" },
        { status: 502 },
      );
    }

    const uploadData: StrapiUploadResponse = await uploadRes.json();
    const uploadedFile = uploadData?.[0];

    if (!uploadedFile?.id) {
      return NextResponse.json(
        { error: "Не удалось получить ID загруженного файла" },
        { status: 502 },
      );
    }

    // 2. Привязываем загруженный файл как логотип компании
    const updateRes = await fetch(
      `${getStrapiURL()}/api/companies/${companyId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            logo: uploadedFile.id,
          },
        }),
      },
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text().catch(() => "Unknown error");
      console.error("Strapi company logo update error:", errText);
      return NextResponse.json(
        { error: "Не удалось привязать логотип к компании" },
        { status: 502 },
      );
    }

    await updateRes.json();

    revalidateTag("companies", "default");

    const logoUrl = getStrapiMediaURL(uploadedFile.url);

    return NextResponse.json({
      success: true,
      logoUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Внутренняя ошибка сервера";
    console.error("Company logo upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
