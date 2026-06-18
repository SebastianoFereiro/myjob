import { fetchAPI, getStrapiMediaURL } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";
import type { BlogArticle } from "@/types/blog";

type StrapiMediaField =
  | string
  | {
      url?: string;
      alternativeText?: string;
      data?: {
        attributes?: {
          url?: string;
          alternativeText?: string;
        };
      };
    };

type StrapiBlogRecord = {
  id?: string | number;
  documentId?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  cover?: StrapiMediaField;
  image?: StrapiMediaField;
  publishedAt?: string;
};

const BLOG_ENDPOINT = "/blog";

const fallbackArticles: BlogArticle[] = [
  {
    id: "blog-1",
    slug: "quick-job-response",
    imageUrl: "/images/blog-1.png",
    imageAlt: "Команда обсуждает рабочие задачи",
    title: "Как быстро откликаться на вакансии и не терять хорошие предложения",
    publishedAt: "2026-05-26",
    author: "MyJOB",
    excerpt:
      "Короткий чек-лист для соискателей: резюме, сопроводительное письмо, фильтры поиска и подписка на новые вакансии.",
    content:
      "Подготовьте короткое резюме, сохраните понятные фильтры поиска и откликайтесь на подходящие вакансии в тот же день. Так хорошие предложения не теряются в потоке.",
  },
  {
    id: "blog-2",
    slug: "popular-professions",
    imageUrl: "/images/blog-1.png",
    imageAlt: "Рабочее место специалиста",
    title: "Какие профессии чаще всего ищут работодатели",
    publishedAt: "2026-05-24",
    author: "Редакция",
    content:
      "Работодатели чаще всего ищут специалистов, которые быстро включаются в процессы: логистика, продажи, сервис, финансы и цифровые профессии.",
  },
  {
    id: "blog-3",
    slug: "recruiter-call",
    imageUrl: "/images/blog-1.png",
    imageAlt: "Собеседование кандидата",
    title: "Как подготовиться к первому разговору с рекрутером",
    publishedAt: "2026-05-22",
    author: "Редакция",
    content:
      "Перед разговором перечитайте вакансию, подготовьте вопросы по графику и задачам, а также коротко сформулируйте свой опыт.",
  },
  {
    id: "blog-4",
    slug: "vacancy-description-check",
    imageUrl: "/images/blog-1.png",
    imageAlt: "Работа с документами",
    title: "Что важно проверить в описании вакансии",
    publishedAt: "2026-05-20",
    author: "MyJOB",
    content:
      "Проверьте обязанности, формат работы, зарплатную вилку, город, требования и контактный сценарий отклика.",
  },
  {
    id: "blog-5",
    slug: "clear-vacancy-copy",
    imageUrl: "/images/blog-1.png",
    imageAlt: "Команда в офисе",
    title: "Как работодателю написать понятную вакансию",
    publishedAt: "2026-05-18",
    author: "MyJOB",
    content:
      "Пишите конкретно: задачи, условия, требования, этапы отбора и преимущества работы должны быть видны с первого чтения.",
  },
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveMedia(media?: StrapiMediaField) {
  if (typeof media === "string") {
    return {
      url: getStrapiMediaURL(media),
      alt: "Иллюстрация статьи",
    };
  }

  return {
    url: getStrapiMediaURL(
      media?.url || media?.data?.attributes?.url || undefined,
    ),
    alt:
      media?.alternativeText ||
      media?.data?.attributes?.alternativeText ||
      "Иллюстрация статьи",
  };
}

function mapStrapiBlog(record: StrapiBlogRecord): BlogArticle {
  const image = resolveMedia(record.cover || record.image);
  const id = String(record.documentId || record.id || record.slug || record.title);

  return {
    id,
    slug: record.slug || slugify(record.title || id),
    title: record.title || "Статья",
    excerpt: record.excerpt,
    content: record.content || "",
    author: record.author || "MyJOB",
    imageUrl: image.url || "/images/blog-1.png",
    imageAlt: image.alt,
    publishedAt: record.publishedAt || new Date().toISOString(),
  };
}

export async function getBlogArticles(limit?: number) {
  if (!process.env.NEXT_PUBLIC_STRAPI_URL && !process.env.STRAPI_URL) {
    return limit ? fallbackArticles.slice(0, limit) : fallbackArticles;
  }

  try {
    const params = new URLSearchParams();
    params.set("populate", "*");
    params.set("sort[0]", "publishedAt:desc");
    params.set("pagination[page]", "1");
    params.set("pagination[pageSize]", String(limit || 24));

    const response = await fetchAPI<StrapiListResponse<StrapiBlogRecord>>(
      `${BLOG_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 300, tags: ["blog"] } },
    );
    const articles = response.data
      .map((record) => mapStrapiBlog(unwrapStrapiRecord(record)))
      .filter((article) => Boolean(article.slug && article.title));

    return articles.length > 0 ? articles : fallbackArticles.slice(0, limit);
  } catch {
    return limit ? fallbackArticles.slice(0, limit) : fallbackArticles;
  }
}

export async function getBlogArticleBySlug(slug: string) {
  const articles = await getBlogArticles();
  return articles.find((article) => article.slug === slug) || null;
}

