import { fetchAPI } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";

import { mapCategoryToIrrby } from "@/app/data/irrby-category-map";
import { lookupCity } from "@/app/data/belarus-cities";
import {
  CFD_IRRBY_SEX_DEFAULT,
  cf_currency,
  cfd_irrby_experience,
  CFD_IRRBY_EXPERIENCE_DEFAULT,
  cfd_irrby_education,
  CFD_IRRBY_EDUCATION_DEFAULT,
  cfd_irrby_stud,
  CFD_IRRBY_STUD_DEFAULT,
  cfd_irrby_view,
  CFD_IRRBY_VIEW_DEFAULT,
  cfd_irrby_employment,
  CFD_IRRBY_EMPLOYMENT_DEFAULT,
  cfd_irrby_place,
  CFD_IRRBY_PLACE_DEFAULT,
  cfd_irrby_payment,
  CFD_IRRBY_PAYMENT_DEFAULT,
  dictLookup,
} from "@/app/data/irrby-dictionaries";

// ================================================================
// STRAPI RAW TYPES
// ================================================================

type StrapiCompanyRef = {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  description?: string;
  siteUrl?: string;
  email?: string;
  phone?: string;
  logo?: { url?: string } | null;
};

type StrapiCVRecord = {
  id?: number;
  documentId?: string;
  slug?: string;
  title?: string;
  position?: string;
  description?: string;
  requirements?: string | null;
  conditions?: string | null;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  currency?: string;
  employmentType?: string | null;
  location?: string | null;
  city?: string | null;
  level_job?: string | null;
  experience_job?: string | null;
  education_job?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  isActive?: boolean;
  deadline?: string | null;
  datetime_finish?: string | null;
  premium_from?: string | null;
  premium_to?: string | null;
  company?: StrapiCompanyRef | null;
  category?: { id?: number; documentId?: string; name?: string; title?: string; slug?: string } | null;
};

// ================================================================
// HELPERS
// ================================================================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen);
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL || "https://myjob.by"
  ).replace(/\/$/, "");
}

function getRecordName(value?: string | { name?: string; title?: string } | null): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.title || "";
}

function formatIsoDate(isoString?: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const mo = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${y}-${mo}-${day}T${h}:${mi}:${s}`;
}

function addDays(dateStr: string | undefined | null, days: number): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return formatIsoDate(d.toISOString());
}

// ================================================================
// SOURCE-ID: hash от documentId
// ================================================================

function hashDocumentId(docId: string): number {
  let hash = 0;
  for (let i = 0; i < docId.length; i++) {
    hash += docId.charCodeAt(i);
  }
  return 90000 + hash;
}

// ================================================================
// ФОРМАТИРОВАНИЕ ТЕЛЕФОНА
// ================================================================

function formatPhones(phoneRaw?: string | null): string | null {
  if (!phoneRaw) return null;
  const parts = phoneRaw.split(/[,;\/\n]+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join(", ");
}

// ================================================================
// BUILD STORE-AD XML
// ================================================================

function buildStoreAdXml(
  record: StrapiCVRecord,
  index: number,
): string {
  const docId = record.documentId || String(record.id || index);
  const slug = record.slug || "";
  const title = record.title || record.position || "Вакансия";
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/jobs/${slug}-${docId}`;

  // Категория
  const categorySlug = typeof record.category === "object" && record.category
    ? (record.category.slug || "")
    : "";
  const irrbyCategory = mapCategoryToIrrby(categorySlug);

  // Source-id
  const sourceId = hashDocumentId(docId);

  // Даты
  const validFrom = formatIsoDate(record.createdAt);
  const validTill = formatIsoDate(record.datetime_finish || record.deadline)
    || addDays(record.createdAt, 30);

  // Компания
  const company = record.company;
  const companyName = getRecordName(company);

  // Телефон
  const phone = company?.phone || null;
  const phoneFormatted = formatPhones(phone);

  // Город -> регион
  const cityName = record.city || null;
  const cityInfo = lookupCity(cityName);

  // Price: числовое значение (приоритет salaryTo, затем salaryFrom)
  const priceValue = record.salaryTo ?? record.salaryFrom ?? null;

  // Currency: код BYN/USD/EUR (не руб./$/€)
  const currencyCode = (record.currency || "BYN").toUpperCase();

  // Experience
  const experience = dictLookup(cfd_irrby_experience, record.experience_job, CFD_IRRBY_EXPERIENCE_DEFAULT);

  // Education
  const education = dictLookup(cfd_irrby_education, record.education_job, CFD_IRRBY_EDUCATION_DEFAULT);

  // Employment
  const employment = dictLookup(cfd_irrby_employment, record.employmentType, CFD_IRRBY_EMPLOYMENT_DEFAULT);

  // Text (description) - richtext -> plain text, truncate
  const description = record.description || "";
  const textPlain = truncate(stripHtml(description), 3000);

  // Title - truncate to 250
  const titleTrimmed = truncate(title, 250);

  // ================================================================
  // <title>
  // ================================================================
  const titleXml = `      <title>${escapeXml(titleTrimmed)}</title>`;

  // ================================================================
  // <description>
  // ================================================================
  const descXml = `      <description>${escapeXml(textPlain)}</description>`;

  // ================================================================
  // <price value="..." currency="...">
  // ================================================================
  const priceXml = priceValue !== null
    ? `      <price value="${priceValue}" currency="${escapeXml(currencyCode)}"></price>`
    : "";

  // ================================================================
  // <products> (premium)
  // ================================================================
  const isPremium = !!(record.premium_from && record.premium_to
    && record.premium_from <= new Date().toISOString()
    && record.premium_to >= new Date().toISOString());

  const productsXml = isPremium && record.premium_from
    ? [
        `      <products>`,
        `        <product name="premium" type="7" validfrom="${formatIsoDate(record.premium_from)}"/>`,
        `      </products>`,
      ].join("\n")
    : "";

  // ================================================================
  // <custom-fields>
  // ================================================================
  const fields: { name: string; value: string }[] = [];

  fields.push({ name: "region", value: cityInfo.region });
  fields.push({ name: "address_city", value: cityInfo.regionalCenter });
  fields.push({ name: "web", value: escapeXml(url) });

  if (companyName) {
    fields.push({ name: "contact", value: escapeXml(companyName) });
  }
  if (phoneFormatted) {
    fields.push({ name: "phone", value: escapeXml(phoneFormatted) });
  }

  fields.push({ name: "sex", value: CFD_IRRBY_SEX_DEFAULT });
  fields.push({ name: "experience", value: experience });
  fields.push({ name: "education", value: education });
  fields.push({ name: "stud", value: CFD_IRRBY_STUD_DEFAULT });
  fields.push({ name: "view", value: CFD_IRRBY_VIEW_DEFAULT });
  fields.push({ name: "employment", value: employment });
  fields.push({ name: "workplace", value: CFD_IRRBY_PLACE_DEFAULT });
  fields.push({ name: "payment", value: CFD_IRRBY_PAYMENT_DEFAULT });

  const fieldsXml = fields
    .map((f) => `        <field name="${escapeXml(f.name)}">${escapeXml(f.value)}</field>`)
    .join("\n");

  const customFieldsXml = [
    `      <custom-fields>`,
    fieldsXml,
    `      </custom-fields>`,
  ].join("\n");

  // ================================================================
  // СБОРКА store-ad
  // ================================================================
  return [
    `    <store-ad`,
    `      validfrom="${validFrom}"`,
    `      validtill="${validTill}"`,
    `      source-id="${sourceId}"`,
    `      category="${escapeXml(irrbyCategory)}"`,
    `    >`,
    titleXml,
    descXml,
    priceXml,
    productsXml,
    customFieldsXml,
    `    </store-ad>`,
  ].filter(Boolean).join("\n");
}

// ================================================================
// PUBLIC API
// ================================================================

export async function generateIrrbyFeedXml(): Promise<string> {
  const params = new URLSearchParams();
  params.set("populate", "*");
  params.set("filters[isActive][$eq]", "true");
  params.set("sort[0]", "publishedAt:desc");
  params.set("pagination[pageSize]", "500");

  const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
    `/cvs?${params.toString()}`,
    { next: { revalidate: 2700, tags: ["irrby-feed"] } },
  );

  const records = response.data || [];

  const adsXml = records
    .map((r) => unwrapStrapiRecord(r as Record<string, unknown>))
    .map((r, i) => buildStoreAdXml(r as StrapiCVRecord, i))
    .join("\n");

  const xml = [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<users>`,
    `  <user deactivate-untouched="false">`,
    `    <match>`,
    `      <user-name>import:job minsk-irr</user-name>`,
    `    </match>`,
    adsXml,
    `  </user>`,
    `</users>`,
  ].join("\n");

  return xml;
}
