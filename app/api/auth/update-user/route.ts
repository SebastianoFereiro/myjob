import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (role !== "user" && role !== "company") {
      return NextResponse.json({ error: "Недопустимая роль" }, { status: 400 });
    }

    await auth.api.updateUser({
      body: {
        role,
      },
      headers: await headers(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка обновления пользователя:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
