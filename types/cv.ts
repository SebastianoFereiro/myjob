export type CvEmploymentType =
  | 'Полная занятость'
  | 'Частичная занятость'
  | 'Проектная работа'
  | 'Стажировка'
  | 'Удаленно';

export type CvLevelJob =
  | 'Топ-менеджмент'
  | 'Руководители среднего звена'
  | 'Специалисты'
  | 'Рабочий персонал'
  | 'Начинающие специалисты'
  | 'Стажеры';

export type CvExperienceJob =
  | 'Нет опыта'
  | 'От 1 года до 3 лет'
  | 'От 3 до 5 лет'
  | 'Более 5 лет';

export type CvEducationJob =
  | 'Не требуется'
  | 'Базовое'
  | 'Среднее'
  | 'Средне специальное'
  | 'Профессионально-техническое'
  | 'Высшее';

export type CvCurrency = 'BYN' | 'USD' | 'EUR';

export interface CompanyRef {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  ynp?: string;
  logo?: { url: string; alternativeText?: string } | null;
  address?: string;
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
  city?: string | null;
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
  SEO?: unknown[];
  Profile?: unknown[];

  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
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
  city?: string;
  level_job?: CvLevelJob | '';
  experience_job?: CvExperienceJob | '';
  education_job?: CvEducationJob | '';
  deadline?: string;
  isActive: boolean;

  // Relations (Strapi 5 — documentId)
  companyDocumentId?: string | null;
  categoryDocumentId?: string | null;
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
