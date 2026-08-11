import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { fetchAPI } from "@/lib/strapi-client";

// ---------------------------------------------------------------------------
// Валидация полей (серверная, дублирует клиентскую)
// ---------------------------------------------------------------------------
const registerCompanySchema = z.object({
  name: z
    .string({ error: "Введите название компании" })
    .trim()
    .min(2, { error: "Название компании слишком короткое" })
    .max(200, { error: "Название компании слишком длинное" }),
  ynp: z
    .string({ error: "Укажите УНП" })
    .trim()
    .regex(/^\d{9}$/, { error: "УНП должен содержать 9 цифр" }),
  email: z.email({ error: "Введите корректный email" }),
  password: z
    .string({ error: "Введите пароль" })
    .min(8, { error: "Пароль должен содержать минимум 8 символов" }),
  consent: z
    .boolean({ error: "Необходимо дать согласие" })
    .refine((v) => v === true, { error: "Необходимо дать согласие на обработку данных" }),
});

type StrapiListCompany = {
  data?: { documentId?: string; name?: string; slug?: string }[];
};

type StrapiCreateCompany = {
  data?: { documentId?: string; name?: string; slug?: string };
};

type SignUpResponseBody = {
  token?: string | null;
  user?: { id?: string; email?: string; name?: string; role?: string };
  message?: string;
  code?: string;
};

/** Транслитерация названия в slug (совпадает с прежней логикой). */
function buildSlug(name: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
    ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
    ы: "y", э: "e", ю: "yu", я: "ya",
  };
  return name
    .toLowerCase()
    .replace(/[а-яё]/g, (ch: string) => map[ch] ?? ch)
    .replace(/[^a-z0-9-_.~]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\.+/g, ".")
    .slice(0, 200);
}

function jsonError(code: string, message: string, status: number, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ code, message, ...(fieldErrors ? { fieldErrors } : {}) }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("VALIDATION_FAILED", "Некорректный запрос", 400);
  }

  const parsed = registerCompanySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return jsonError(
      "VALIDATION_FAILED",
      "Проверьте правильность заполнения полей",
      400,
      fieldErrors,
    );
  }

  const { name, ynp, email, password } = parsed.data;
  const slug = buildSlug(name);

  // -------------------------------------------------------------------------
  // 1. Проверка уникальности slug и ynp в Strapi (компания ещё не создана)
  // -------------------------------------------------------------------------
  try {
    const byYnp = await fetchAPI<StrapiListCompany>(
      `/companies?filters[ynp][$eq]=${encodeURIComponent(ynp)}&pagination[pageSize]=1`,
    );
    if (byYnp?.data?.[0]?.documentId) {
      return jsonError(
        "COMPANY_YNP_EXISTS",
        "Компания с таким УНП уже зарегистрирована",
        409,
      );
    }

    const bySlug = await fetchAPI<StrapiListCompany>(
      `/companies?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`,
    );
    if (bySlug?.data?.[0]?.documentId) {
      return jsonError(
        "COMPANY_SLUG_EXISTS",
        "Компания с таким названием уже зарегистрирована",
        409,
      );
    }
  } catch (err) {
    console.error("[company/register] uniqueness check failed:", err);
    return jsonError("COMPANY_CREATE_FAILED", "Не удалось проверить данные компании", 502);
  }

  // -------------------------------------------------------------------------
  // 2. Создаём компанию в Strapi (до регистрации пользователя)
  // -------------------------------------------------------------------------
  let companyDocumentId: string;
  try {
    const created = await fetchAPI<StrapiCreateCompany>("/companies", {
      method: "POST",
      body: JSON.stringify({
        data: { name, slug, ynp, isActive: false },
      }),
    });
    if (!created?.data?.documentId) {
      console.error("[company/register] Strapi create company failed:", created);
      return jsonError("COMPANY_CREATE_FAILED", "Не удалось создать компанию", 502);
    }
    companyDocumentId = created.data.documentId;
  } catch (err) {
    console.error("[company/register] Strapi create company error:", err);
    return jsonError("COMPANY_CREATE_FAILED", "Не удалось создать компанию", 502);
  }

  // -------------------------------------------------------------------------
  // 3. Регистрируем пользователя в Better-Auth (только после успеха в Strapi)
  // -------------------------------------------------------------------------
  let signUpRes: Response;
  let signUpBody: SignUpResponseBody = {};
  try {
    signUpRes = (await auth.api.signUpEmail({
      body: { name, email, password, role: "company" },
      asResponse: true,
    })) as unknown as Response;
    signUpBody = (await signUpRes.json().catch(() => ({}))) as SignUpResponseBody;
  } catch (err) {
    console.error("[company/register] Better-Auth signUp threw:", err);
    await deleteCompany(companyDocumentId);
    return jsonError("USER_CREATE_FAILED", "Не удалось создать аккаунт", 500);
  }

  if (!signUpRes.ok || !signUpBody?.user?.id) {
    const code = signUpBody?.code;
    console.error("[company/register] Better-Auth signUp failed:", signUpRes.status, JSON.stringify(signUpBody));
    await deleteCompany(companyDocumentId);
    // Отправляем русское сообщение сразу — не полагаемся на клиентский словарь
    const isDuplicate =
      code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";
    return jsonError(
      isDuplicate ? "USER_ALREADY_EXISTS" : "USER_CREATE_FAILED",
      isDuplicate
        ? "Пользователь с таким email уже зарегистрирован"
        : "Не удалось создать аккаунт. Попробуйте позже.",
      signUpRes.status || 500,
    );
  }

  const userId = signUpBody.user.id;

  // -------------------------------------------------------------------------
  // 4. Привязываем companyId к пользователю
  // -------------------------------------------------------------------------
  try {
    await db
      .update(user)
      .set({ companyId: companyDocumentId })
      .where(eq(user.id, userId));
  } catch (err) {
    console.error("[company/register] failed to bind companyId:", err);
    await deleteCompany(companyDocumentId);
    return jsonError("COMPANY_BIND_FAILED", "Не удалось привязать компанию к аккаунту", 500);
  }

  // -------------------------------------------------------------------------
  // 5. Ответ: проксируем куки сессии Better-Auth + данные
  // -------------------------------------------------------------------------
  const response = NextResponse.json({
    success: true,
    verificationPending: !signUpBody.token,
    user: { ...signUpBody.user, companyId: companyDocumentId },
    company: { documentId: companyDocumentId, name, slug },
  });

  const setCookies: string[] =
    typeof signUpRes.headers.getSetCookie === "function"
      ? signUpRes.headers.getSetCookie()
      : [];
  if (setCookies.length === 0) {
    const single = signUpRes.headers.get("set-cookie");
    if (single) setCookies.push(single);
  }
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

async function deleteCompany(documentId: string): Promise<void> {
  try {
    await fetchAPI(`/companies/${documentId}`, { method: "DELETE" });
  } catch (err) {
    console.error("[company/register] rollback delete failed:", err);
  }
}
