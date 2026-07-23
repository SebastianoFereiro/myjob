// ========================================================================
// СТРАПИ 5: ТИПЫ КОЛЛЕКЦИЙ (Фронтенд)
// ========================================================================
// Агент: изменяй этот файл синхронно с apps/backend/strapi-schema.ts
// Источник истины: apps/backend/strapi-schema.ts
// ========================================================================

import type { SeoMetadata } from '@/types/seo';

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
  documentId?: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  count: number;
  SEO?: SeoMetadata | null;
  blocks?: PageBlock[];
  text?: string | null;
}

// ========================================================================
// CITY
// ========================================================================
export interface City {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  text: string | null;
  SEO: SeoMetadata | null;
  count?: number;
}

export interface CityRef {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  [key: string]: unknown;
}

// ========================================================================
// BLOG POST
// ========================================================================
export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  images: Array<{
    id: number;
    url: string;
    alternativeText: string | null;
  }>;
  author: string;
  SEO?: SeoMetadata | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

// ========================================================================
// PAGE
// ========================================================================
export interface PageHeroBlock {
  __component: 'page.hero';
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
}

export interface PageRichTextBlock {
  __component: 'page.rich-text';
  id: string;
  content: string;
}

export interface PageFaqBlock {
  __component: 'page.faq';
  id: string;
  title: string | null;
  items: Array<{ question: string; answer: string }>;
}

export interface PageContactInfoBlock {
  __component: 'page.contact-info';
  id: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  work_hours: string | null;
}

export interface PagePricingTableBlock {
  __component: 'page.pricing-table';
  id: string;
  title: string | null;
  items: Array<{
    name: string;
    price: string;
    period: string;
    features: string[];
    highlighted: boolean;
    button_text: string;
    button_url: string;
  }>;
}

export interface PageTeamBlock {
  __component: 'page.team';
  id: string;
  title: string | null;
  members: Array<{
    name: string;
    role: string;
    bio: string;
    photo_url: string;
  }>;
}

export interface PageCtaBlock {
  __component: 'page.cta';
  id: string;
  title: string;
  description: string | null;
  button_text: string;
  button_url: string;
}

export type PageBlock =
  | PageHeroBlock
  | PageRichTextBlock
  | PageFaqBlock
  | PageContactInfoBlock
  | PagePricingTableBlock
  | PageTeamBlock
  | PageCtaBlock;

export type FooterGroup = 'seekers' | 'employers' | 'company' | 'bottom' | 'none';

export interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  blocks: PageBlock[];
  SEO?: SeoMetadata | null;
  footer_group: FooterGroup;
  footer_order: number | null;
  footer_label: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  phone?: string;
  email?: string;
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
  position?: string;
  employmentType: EmploymentType;
  salaryFrom?: number;
  salaryTo?: number;
  salary?: string | number;
  currency: string;
  phone?: string;
  email?: string;
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
  SEO?: SeoMetadata | null;

  // Премиум-закрепление
  premium_from?: string | null;
  premium_to?: string | null;
  // Авто-поднятие
  push_from?: string | null;
  push_to?: string | null;
  isPremium?: boolean;
  cityRef?: CityRef;
}

export interface JobFilters {
  query?: string;
  location?: string;
  type?: EmploymentType | '';
  category?: string;
  company?: string;
  level?: string;
  experience?: string;
  education?: string;
  position?: string;
  city?: string;
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
  level?: string;
  experience?: string;
  education?: string;
  position?: string;
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
