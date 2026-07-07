import { fetchAPI, getStrapiMediaURL } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";

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

type StrapiCategoryRef = {
  id?: number;
  documentId?: string;
  name?: string;
  title?: string;
  slug?: string;
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
  company?: StrapiCompanyRef | null;
  category?: StrapiCategoryRef | null;
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

function formatDate(isoString?: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const mo = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${y}-${mo}-${day} ${h}:${mi}:${s} GMT+3`;
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

// ================================================================
// EMPLOYMENT -> YANDEX MAPPING
// ================================================================

function mapEmployment(employmentType?: string | null): { employment: string; schedule: string } {
  const t = (employmentType || "").toLowerCase().trim();

  if (t.includes("частичн")) {
    return { employment: "Частичная", schedule: "Гибкий" };
  }
  if (t.includes("проект")) {
    return { employment: "Проектная", schedule: "Гибкий" };
  }
  if (t.includes("стаж")) {
    return { employment: "Стажировка", schedule: "Полный день" };
  }
  if (t.includes("удален")) {
    return { employment: "Полная", schedule: "Удаленная работа" };
  }

  return { employment: "Полная", schedule: "Полный день" };
}

// ================================================================
// EXPERIENCE PARSING
// ================================================================

function parseExperience(exp?: string | null): string {
  if (!exp) return "";
  const lower = exp.toLowerCase().trim();
  // "От 1 года до 3 лет" -> "от 1"
  // "Нет опыта" -> ""
  // "Более 5 лет" -> "от 5"
  if (lower.startsWith("от")) {
    const match = lower.match(/от\s*(\d+)/);
    if (match) return `от ${match[1]}`;
  }
  if (lower.startsWith("нет")) return "";
  if (lower.startsWith("более")) {
    const match = lower.match(/более\s*(\d+)/);
    if (match) return `от ${match[1]}`;
  }
  return "";
}

// ================================================================
// SALARY FORMATTING
// ================================================================

function formatSalary(salaryFrom?: number | null, salaryTo?: number | null): string {
  if (!salaryFrom && !salaryTo) return "";
  if (salaryFrom && salaryTo) {
    return `от ${salaryFrom} до ${salaryTo}`;
  }
  if (salaryFrom) return `от ${salaryFrom}`;
  if (salaryTo) return `до ${salaryTo}`;
  return "";
}

function mapCurrency(currency?: string): string {
  return (currency || "BYN").toUpperCase();
}

// ================================================================
// BUILD VACANCY XML
// ================================================================

function buildVacancyXml(
  record: StrapiCVRecord,
  index: number,
): string {
  const docId = record.documentId || String(record.id || index);
  const slug = record.slug || "";
  const title = record.title || record.position || "Вакансия";
  const categoryName = getRecordName(record.category);

  const baseUrl = getAppUrl();
  const utmParams = "srcid=ya_rabota&utm_source=ya_rabota&utm_medium=agregator&utm_campaign=list";
  const url = `${baseUrl}/jobs/${slug}-${docId}?${utmParams}`;

  const emp = mapEmployment(record.employmentType);
  const salary = formatSalary(record.salaryFrom, record.salaryTo);
  const currency = mapCurrency(record.currency);
  const experience = parseExperience(record.experience_job);

  const company = record.company;
  const companyName = company?.name || "";
  const companyDesc = company?.description || "";
  const companySite = company?.siteUrl || "";
  const companyEmail = company?.email || "";
  const companyPhone = company?.phone || "";
  const companyLogo = company?.logo
    ? (typeof company.logo === "object" && "url" in company.logo
        ? getStrapiMediaURL(company.logo.url)
        : "")
    : "";

  // Build location
  const locationParts: string[] = [];
  if (record.city) locationParts.push(record.city);
  if (record.location && record.location !== record.city) {
    locationParts.push(record.location);
  }
  const locationStr = locationParts.length > 0
    ? `Беларусь, ${locationParts.join(", ")}`
    : "Беларусь";

  // Build qualification text
  const qualParts: string[] = [];
  if (record.education_job) {
    qualParts.push(`Образование: ${record.education_job.toLowerCase()}.`);
  }
  if (experience) {
    qualParts.push(`Опыт работы по профилю ${experience}.`);
  }
  const qualification = qualParts.join(" ");

  // Build term text from conditions
  const termText = record.conditions || "";

  return [
    "<vacancy>",
    `  <url>${escapeXml(url)}</url>`,
    `  <creation-date>${formatDate(record.createdAt)}</creation-date>`,
    `  <update-date>${formatDate(record.publishedAt || record.updatedAt)}</update-date>`,
    salary ? `  <salary>${escapeXml(salary)}</salary>` : "",
    currency ? `  <currency>${currency}</currency>` : "",
    `  <category>`,
    `    <industry>${escapeXml(categoryName)}</industry>`,
    `    <specialization />`,
    `  </category>`,
    `  <job-name>${escapeXml(title)}</job-name>`,
    `  <employment>${emp.employment}</employment>`,
    `  <schedule>${emp.schedule}</schedule>`,
    `  <description>${escapeXml(record.description || "")}</description>`,
    `  <term>`,
    `    <contract />`,
    termText ? `    <text>${escapeXml(termText)}</text>` : "",
    `  </term>`,
    `  <requirement>`,
    `    <age />`,
    `    <sex />`,
    record.education_job ? `    <education>${escapeXml(record.education_job)}</education>` : "    <education />",
    experience ? `    <experience>${experience}</experience>` : "    <experience />",
    qualification ? `    <qualification>${escapeXml(qualification)}</qualification>` : "",
    `  </requirement>`,
    `  <addresses>`,
    `    <address>`,
    `      <location>${escapeXml(locationStr)}</location>`,
    `      <lng />`,
    `      <lat />`,
    `    </address>`,
    `  </addresses>`,
    `  <company>`,
    `    <name>${escapeXml(companyName)}</name>`,
    companyDesc ? `    <description>${escapeXml(companyDesc)}</description>` : "",
    companyLogo ? `    <logo>${escapeXml(companyLogo)}</logo>` : "",
    companySite ? `    <site>${escapeXml(companySite)}</site>` : "",
    companyEmail ? `    <email>${escapeXml(companyEmail)}</email>` : "",
    ...(companyPhone
      ? companyPhone.split(/[,;\/\n]+/).map((p) => `    <phone>${escapeXml(p.trim())}</phone>`)
      : []),
    companyName ? `    <contact-name>${escapeXml(companyName)}</contact-name>` : "",
    `    <hr-agency>false</hr-agency>`,
    `  </company>`,
    "</vacancy>",
  ]
    .filter(Boolean)
    .join("\n");
}

// ================================================================
// PUBLIC API
// ================================================================

export async function generateYandexFeedXml(): Promise<string> {
  const params = new URLSearchParams();
  params.set("populate", "*");
  params.set("filters[isActive][$eq]", "true");
  // params.set("filters[datetime_finish][$null]", "true");
  params.set("sort[0]", "publishedAt:desc");
  params.set("pagination[pageSize]", "500");

  const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
    `/cvs?${params.toString()}`,
    { next: { revalidate: 0, tags: ["yandex-feed"] } },
  );

  const records = response.data || [];

  const now = new Date();
  const nowIso = now.toISOString();
  const nowFormatted = formatDate(nowIso);

  const vacanciesXml = records
    .map((r) => unwrapStrapiRecord(r as Record<string, unknown>))
    .map((r, i) => buildVacancyXml(r as StrapiCVRecord, i))
    .join("\n");

  const xml = [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<source creation-time="${nowFormatted}" host="www.myjob.by">`,
    `<vacancies>`,
    vacanciesXml,
    `</vacancies>`,
    `</source>`,
  ].join("\n");

  return xml;
}
