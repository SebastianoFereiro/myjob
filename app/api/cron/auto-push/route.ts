import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = (process.env.STRAPI_URL || "https://atlantis.myjob.by").replace(/\/$/, "");

function authCheck(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return true;
  return authHeader === `Bearer ${expectedSecret}` || querySecret === expectedSecret;
}

async function fetchStrapi<T>(url: string, token: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function updateStrapi(
  documentId: string,
  data: Record<string, unknown>,
  token: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/cvs/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

type StrapiRecord = { documentId?: string; id?: number; [key: string]: unknown };

export async function GET(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const writeToken = process.env.STRAPI_API_WRITE_TOKEN;
  if (!writeToken) {
    return NextResponse.json({ error: "STRAPI_API_WRITE_TOKEN not configured" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const errors: Array<{ stage: string; id: string; error: string }> = [];

  // --- 1. Auto-publish: datetime_start <= now, publishedAt == null, isActive == true ---
  let autoPublished = 0;
  try {
    const publishUrl = `${STRAPI_URL}/api/cvs?filters[datetime_start][$lte]=${encodeURIComponent(now)}&filters[publishedAt][$null]=true&filters[isActive][$eq]=true&pagination[pageSize]=100`;
    const publishBody = await fetchStrapi<{ data: StrapiRecord[] }>(publishUrl, writeToken);
    const toPublish = publishBody?.data ?? [];
    for (const record of toPublish) {
      const docId = record.documentId ?? String(record.id);
      if (!docId) continue;
      const ok = await updateStrapi(docId, { publishedAt: now }, writeToken);
      if (ok) autoPublished++;
      else errors.push({ stage: "publish", id: docId, error: "HTTP error" });
    }
  } catch (err) {
    errors.push({ stage: "publish", id: "batch", error: String(err) });
  }

  // --- 2. Auto-unpublish: datetime_finish < now, isActive == true ---
  let autoUnpublished = 0;
  try {
    const unpublishUrl = `${STRAPI_URL}/api/cvs?filters[datetime_finish][$lt]=${encodeURIComponent(now)}&filters[isActive][$eq]=true&pagination[pageSize]=100`;
    const unpublishBody = await fetchStrapi<{ data: StrapiRecord[] }>(unpublishUrl, writeToken);
    const toUnpublish = unpublishBody?.data ?? [];
    for (const record of toUnpublish) {
      const docId = record.documentId ?? String(record.id);
      if (!docId) continue;
      const ok = await updateStrapi(docId, { isActive: false }, writeToken);
      if (ok) autoUnpublished++;
      else errors.push({ stage: "unpublish", id: docId, error: "HTTP error" });
    }
  } catch (err) {
    errors.push({ stage: "unpublish", id: "batch", error: String(err) });
  }

  // --- 3. Auto-push: push_from <= now, push_to >= now, isActive == true ---
  let autoPushed = 0;
  try {
    const pushUrl = `${STRAPI_URL}/api/cvs?filters[push_from][$lte]=${encodeURIComponent(now)}&filters[push_to][$gte]=${encodeURIComponent(now)}&filters[isActive][$eq]=true&pagination[pageSize]=100`;
    const pushBody = await fetchStrapi<{ data: StrapiRecord[] }>(pushUrl, writeToken);
    const toPush = pushBody?.data ?? [];
    for (const record of toPush) {
      const docId = record.documentId ?? String(record.id);
      if (!docId) continue;
      const ok = await updateStrapi(docId, { publishedAt: now }, writeToken);
      if (ok) autoPushed++;
      else errors.push({ stage: "push", id: docId, error: "HTTP error" });
    }
  } catch (err) {
    errors.push({ stage: "push", id: "batch", error: String(err) });
  }

  return NextResponse.json({
    autoPublished,
    autoUnpublished,
    autoPushed,
    errors: errors.length > 0 ? errors : undefined,
    message: `Опубликовано: ${autoPublished}, снято: ${autoUnpublished}, поднято: ${autoPushed}`,
  });
}
