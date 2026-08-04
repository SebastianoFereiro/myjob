import { NextRequest, NextResponse } from "next/server";

import { sendContactMail } from "@/lib/mail/send";
import { contactSchema } from "@/lib/schemas/auth";

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Некорректный запрос" } },
      { status: 400 },
    );
  }

  const parsed = await contactSchema.safeParseAsync(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: { message: first?.message || "Некорректные данные" } },
      { status: 400 },
    );
  }

  const ok = await sendContactMail(parsed.data);
  if (!ok) {
    return NextResponse.json(
      { error: { message: "Не удалось отправить сообщение. Попробуйте позже." } },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
