import type { SeoMetadata } from '@/types/seo';
import type { CityRef } from '@/types/strapi-collections';
import type {
  EMPLOYMENT_OPTIONS,
  LEVEL_OPTIONS,
  EXPERIENCE_OPTIONS,
  EDUCATION_OPTIONS,
  CURRENCY_OPTIONS,
} from '@/lib/enum-options';

export type CvEmploymentType = (typeof EMPLOYMENT_OPTIONS)[number]['value'];
export type CvLevelJob = (typeof LEVEL_OPTIONS)[number]['value'];
export type CvExperienceJob = (typeof EXPERIENCE_OPTIONS)[number]['value'];
export type CvEducationJob = (typeof EDUCATION_OPTIONS)[number]['value'];
export type CvCurrency = (typeof CURRENCY_OPTIONS)[number]['value'];

export interface CompanyRef {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  ynp?: string;
  address?: string;
  logo?: { url: string; alternativeText?: string } | null;
  description?: string;
  phone?: string;
  email?: string;
  siteUrl?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface CategoryRef {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string;
  [key: string]: unknown;
}

export interface CvVacancy {
  id: string;
  documentId: string;
  strapiId?: number;
  slug: string;
  title: string;
  position: string;
  description: string;
  requirements?: string | null;
  conditions?: string | null;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  currency: CvCurrency;
  employmentType: CvEmploymentType;
  location: string;
  city?: CityRef | null;
  level_job?: CvLevelJob | null;
  experience_job?: CvExperienceJob | null;
  education_job?: CvEducationJob | null;
  deadline?: string | null;
  datetime_start?: string | null;
  datetime_finish?: string | null;
  sortOrder: number;
  isActive: boolean;
  userId: string;

  company: CompanyRef | null;
  category: CategoryRef | null;

  image?: unknown;
  SEO?: SeoMetadata | null;
  Profile?: unknown[];

  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;

  // Премиум-закрепление
  premium_from?: string | null;
  premium_to?: string | null;
  // Теги (массив строк из Strapi tags-input)
  tags?: string[];
  // Авто-поднятие
  push_from?: string | null;
  push_to?: string | null;
}

export interface CvVacancyFormData {
  title: string;
  position: string;
  description: string;
  requirements?: string;
  conditions?: string;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  currency: CvCurrency;
  employmentType: CvEmploymentType | '';
  location: string;
  cityDocumentId?: string | null;
  level_job?: CvLevelJob | '';
  experience_job?: CvExperienceJob | '';
  education_job?: CvEducationJob | '';
  deadline?: string;
  isActive: boolean;

  // Relations (Strapi 5 — documentId)
  companyDocumentId?: string | null;
  categoryDocumentId?: string | null;

  premium_from?: string;
  premium_to?: string;
  push_from?: string;
  push_to?: string;
}

export interface CvFilters {
  query?: string;
  location?: string;
  type?: string;
  category?: string;
  level_job?: string;
  experience_job?: string;
  education_job?: string;
  salary_min?: number;
  salary_max?: number;
  remote_possible?: boolean;
  page?: number;
  page_size?: number;
}

export interface CvListResult {
  vacancies: CvVacancy[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}
