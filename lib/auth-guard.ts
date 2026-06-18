import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/auth";

export async function getServerSession() {
  const h = await headers();
  return auth.api.getSession({ headers: h });
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) redirect("/auth/login");
  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect(role === "company" ? "/dashboard" : "/company/dashboard");
  }
  return session;
}
