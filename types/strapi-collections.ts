// ========================================================================
// СТРАПИ 5: ТИПЫ КОЛЛЕКЦИЙ (Фронтенд)
// ========================================================================
// Агент: изменяй этот файл синхронно с apps/backend/strapi-schema.ts
// Источник истины: apps/backend/strapi-schema.ts
// ========================================================================

// ========================================================================
// COMPANY
// ========================================================================
export interface Company {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  website: string | null;
  industry: Industry;
  size: CompanySize;
  location: string;
  founded_year: number | null;
}

export type Industry =
  | 'IT' | 'Finance' | 'Healthcare' | 'Education'
  | 'Manufacturing' | 'Retail' | 'Construction'
  | 'Transportation' | 'Energy' | 'Media'
  | 'Agriculture' | 'Real Estate' | 'Other';

export type CompanySize =
  | '1-10' | '11-50' | '51-200'
  | '201-500' | '500+';

// ========================================================================
// VACANCY
// ========================================================================
export interface Vacancy {
  id: number;
  title: string;
  slug: string;
  company: Company;
  description: string;
  responsibilities: string;
  requirements: string;
  conditions: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: SalaryPeriod;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  location: string;
  remote_possible: boolean;
  key_skills: string[];
  category: Category;
  status: VacancyStatus;
  views_count: number;
  applications_count: number;
  expires_at: string | null;
  published_at: string | null;
}

export type SalaryPeriod = 'month' | 'year' | 'hour';

export type EmploymentType =
  | 'full-time' | 'part-time'
  | 'contract' | 'internship' | 'remote';

export type ExperienceLevel =
  | 'junior' | 'middle' | 'senior' | 'lead';

export type VacancyStatus =
  | 'draft' | 'published' | 'archived';

// ========================================================================
// CATEGORY
// ========================================================================
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  count: number;
}

// ========================================================================
// BLOG POST
// ========================================================================
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  categories: Category[];
  author: Author;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========================================================================
// AUTHOR
// ========================================================================
export interface Author {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
}

// ========================================================================
// RESUME
// ========================================================================
export interface Resume {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  summary: string;
  portfolio_url: string | null;
  linkedin_url: string | null;
  file_url: string | null;
  status: ResumeStatus;
}

export type ResumeStatus =
  | 'new' | 'reviewed'
  | 'interviewed' | 'rejected' | 'hired';

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
}

export type Currency = 'BYN' | 'USD' | 'EUR';

// ========================================================================
// LEGACY TYPES from jobs.ts
// ========================================================================
export interface JobCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface JobCategory {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  count?: number;
}

export interface Job {
  id: string;
  documentId: string;
  slug: string;
  title: string;
  description: string;
  company: JobCompany;
  category: JobCategory | null;
  jobType?: string;
  level?: string;
  education?: string;
  experience?: string;
  region?: string;
  cities?: string[];
  city?: string;
  location: string;
  employmentType: EmploymentType;
  salaryFrom?: number;
  salaryTo?: number;
  salary?: string | number;
  currency: string;
  requirements?: string;
  conditions?: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  deadline?: string;
  startDate?: string;
  finishDate?: string;
  isActive?: boolean;
  sortOrder?: number;
  image?: string;
}

export interface JobFilters {
  query?: string;
  location?: string;
  type?: EmploymentType | '';
  category?: string;
  page?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface JobListResult {
  jobs: Job[];
  pagination: PaginationMeta;
}

export interface SubscriptionPayload {
  email: string;
  query?: string;
  location?: string;
  type?: EmploymentType | '';
  category?: string;
}

// ========================================================================
// FILTERS & QUERY
// ========================================================================
export interface VacancyFilter {
  search?: string;
  category?: string;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  remote_possible?: boolean;
  page?: number;
  page_size?: number;
}

// ========================================================================
// STRAPI API RESPONSE WRAPPER
// ========================================================================
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      page_size: number;
      page_count: number;
      total: number;
    };
  };
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      page_size: number;
      page_count: number;
      total: number;
    };
  };
}
