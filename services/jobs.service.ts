import { jobCategories } from "@/app/data/job-categories";
import { fetchAPI } from "@/lib/strapi-client";
import type {
  EmploymentType,
  Job,
  JobCategory,
  JobFilters,
  JobListResult,
  PaginationMeta,
  SubscriptionPayload,
} from "@/types/jobs";

type StrapiListResponse<T> = {
  data: T[];
  meta?: {
    pagination?: PaginationMeta;
  };
};

type StrapiJobRecord = Partial<Job> & {
  documentId?: string;
  company?: Partial<Job["company"]>;
  category?: Partial<JobCategory>;
};

const PAGE_SIZE = 6;

const mockJobs: Job[] = [
  {
    id: "job-1",
    slug: "logist-minsk",
    title: "Логист",
    company: { id: "company-1", name: "БелТрансСервис", slug: "beltransservis" },
    category: jobCategories[0],
    location: "Минск",
    employmentType: "full-time",
    salaryFrom: 2200,
    salaryTo: 3200,
    currency: "BYN",
    description: "Планирование маршрутов, контроль перевозок и работа с документами.",
    publishedAt: "2026-05-20",
  },
  {
    id: "job-2",
    slug: "frontend-developer-remote",
    title: "Frontend-разработчик",
    company: { id: "company-2", name: "NordSoft", slug: "nordsoft" },
    category: jobCategories[2],
    location: "Удаленно",
    employmentType: "remote",
    salaryFrom: 4500,
    salaryTo: 6500,
    currency: "BYN",
    description: "Разработка интерфейсов на React и поддержка дизайн-системы продукта.",
    publishedAt: "2026-05-18",
  },
  {
    id: "job-3",
    slug: "accountant-gomel",
    title: "Бухгалтер",
    company: { id: "company-3", name: "ФинПартнер", slug: "finpartner" },
    category: jobCategories[3],
    location: "Гомель",
    employmentType: "full-time",
    salaryFrom: 1800,
    salaryTo: 2500,
    currency: "BYN",
    description: "Ведение первичной документации, сверки с контрагентами и отчетность.",
    publishedAt: "2026-05-16",
  },
  {
    id: "job-4",
    slug: "sales-manager-brest",
    title: "Менеджер по продажам",
    company: { id: "company-4", name: "MarketLine", slug: "marketline" },
    category: jobCategories[1],
    location: "Брест",
    employmentType: "full-time",
    salaryFrom: 2000,
    salaryTo: 4200,
    currency: "BYN",
    description: "Работа с входящими заявками, консультации клиентов и ведение CRM.",
    publishedAt: "2026-05-14",
  },
  {
    id: "job-5",
    slug: "hr-specialist-minsk",
    title: "HR-специалист",
    company: { id: "company-5", name: "People Lab", slug: "people-lab" },
    category: { slug: "hr", name: "Управление персоналом" },
    location: "Минск",
    employmentType: "part-time",
    salaryFrom: 1600,
    salaryTo: 2300,
    currency: "BYN",
    description: "Подбор персонала, проведение интервью и сопровождение кандидатов.",
    publishedAt: "2026-05-12",
  },
  {
    id: "job-6",
    slug: "warehouse-worker-vitebsk",
    title: "Работник склада",
    company: { id: "company-6", name: "СкладПро", slug: "skladpro" },
    category: jobCategories[0],
    location: "Витебск",
    employmentType: "contract",
    salaryFrom: 1700,
    salaryTo: 2400,
    currency: "BYN",
    description: "Комплектация заказов, приемка товара и поддержание порядка на складе.",
    publishedAt: "2026-05-10",
  },
  {
    id: "job-7",
    slug: "medical-nurse-minsk",
    title: "Медицинская сестра",
    company: { id: "company-7", name: "МедЦентр", slug: "medcenter" },
    category: jobCategories[4],
    location: "Минск",
    employmentType: "full-time",
    salaryFrom: 1900,
    salaryTo: 2800,
    currency: "BYN",
    description: "Работа с пациентами, помощь врачу и ведение медицинской документации.",
    publishedAt: "2026-05-09",
  },
  {
    id: "job-8",
    slug: "marketing-specialist-remote",
    title: "Специалист по маркетингу",
    company: { id: "company-8", name: "BrandPoint", slug: "brandpoint" },
    category: jobCategories[5],
    location: "Удаленно",
    employmentType: "remote",
    salaryFrom: 2600,
    salaryTo: 4300,
    currency: "BYN",
    description: "Запуск рекламных кампаний, аналитика заявок и работа с контентом.",
    publishedAt: "2026-05-08",
  },
];

function fallbackCategory(record: StrapiJobRecord): JobCategory {
  const category = record.category;

  if (category?.slug && category?.name) {
    return { slug: category.slug, name: category.name };
  }

  return { slug: "other", name: "Другое" };
}

function mapStrapiJob(record: StrapiJobRecord): Job {
  return {
    id: String(record.documentId || record.id || record.slug),
    slug: record.slug || String(record.documentId || record.id),
    title: record.title || "Вакансия",
    company: {
      id: String(record.company?.id || "company"),
      name: record.company?.name || "Компания",
      slug: record.company?.slug || "company",
      logoUrl: record.company?.logoUrl,
    },
    category: fallbackCategory(record),
    location: record.location || "Не указано",
    employmentType: (record.employmentType || "full-time") as EmploymentType,
    salaryFrom: record.salaryFrom,
    salaryTo: record.salaryTo,
    currency: record.currency || "BYN",
    description: record.description || "",
    publishedAt: record.publishedAt || new Date().toISOString(),
  };
}

function filterMockJobs(filters: JobFilters) {
  const query = filters.query?.trim().toLowerCase();
  const location = filters.location?.trim().toLowerCase();

  return mockJobs.filter((job) => {
    const matchesQuery = query
      ? `${job.title} ${job.company.name} ${job.description} ${job.category.name}`
          .toLowerCase()
          .includes(query)
      : true;
    const matchesLocation = location
      ? job.location.toLowerCase().includes(location)
      : true;
    const matchesType = filters.type ? job.employmentType === filters.type : true;
    const matchesCategory = filters.category
      ? job.category.slug === filters.category
      : true;

    return matchesQuery && matchesLocation && matchesType && matchesCategory;
  });
}

function paginateJobs(jobs: Job[], page = 1): JobListResult {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const pageCount = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const offset = (safePage - 1) * PAGE_SIZE;

  return {
    jobs: jobs.slice(offset, offset + PAGE_SIZE),
    pagination: {
      page: safePage,
      pageSize: PAGE_SIZE,
      pageCount,
      total: jobs.length,
    },
  };
}

function buildJobsQuery(filters: JobFilters) {
  const params = new URLSearchParams();
  params.set("populate", "*");
  params.set("sort[0]", "publishedAt:desc");
  params.set("pagination[page]", String(filters.page || 1));
  params.set("pagination[pageSize]", String(PAGE_SIZE));

  if (filters.query) {
    params.set("filters[title][$containsi]", filters.query);
  }

  if (filters.location) {
    params.set("filters[location][$containsi]", filters.location);
  }

  if (filters.type) {
    params.set("filters[employmentType][$eq]", filters.type);
  }

  if (filters.category) {
    params.set("filters[category][slug][$eq]", filters.category);
  }

  return params.toString();
}

export function getCategoryCounts() {
  return jobCategories.map((category) => ({
    ...category,
    count: mockJobs.filter((job) => job.category.slug === category.slug).length,
  }));
}

export async function getJobs(filters: JobFilters = {}): Promise<JobListResult> {
  if (!process.env.NEXT_PUBLIC_STRAPI_URL && !process.env.STRAPI_URL) {
    return paginateJobs(filterMockJobs(filters), filters.page);
  }

  try {
    const response = await fetchAPI<StrapiListResponse<StrapiJobRecord>>(
      `/jobs?${buildJobsQuery(filters)}`,
      { next: { revalidate: 60 } },
    );
    const jobs = response.data.map(mapStrapiJob);

    return {
      jobs,
      pagination: response.meta?.pagination || paginateJobs(jobs, filters.page).pagination,
    };
  } catch {
    return paginateJobs(filterMockJobs(filters), filters.page);
  }
}

export async function createJobSubscription(payload: SubscriptionPayload) {
  return fetchAPI("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ data: payload }),
  });
}
