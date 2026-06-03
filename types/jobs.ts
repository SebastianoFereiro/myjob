export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "remote";

export type JobCategory = {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  count?: number;
};

export type JobCompany = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

export type Job = {
  // ID и идентификаторы
  id: string;
  documentId: string;
  slug: string;
  
  // Базовая информация
  title: string;
  description: string;
  company: JobCompany;
  
  // Категории и типы
  category: JobCategory;
  categories?: JobCategory[];
  jobType?: string;
  level?: string;
  education?: string;
  experience?: string;
  
  // Локация
  region?: string;
  cities?: string[];
  city?: string;
  location: string;
  employmentType: EmploymentType;
  
  // Зарплата
  salaryFrom?: number;
  salaryTo?: number;
  salary?: string | number;
  currency: string;
  
  // Требования
  requirements?: string;
  conditions?: string;
  
  // Даты
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  deadline?: string;
  startDate?: string;
  finishDate?: string;
  
  // Статус
  isActive?: boolean;
  
  // Дополнительно
  sortOrder?: number;
  image?: string;
};

export type JobFilters = {
  query?: string;
  location?: string;
  type?: EmploymentType | "";
  category?: string;
  page?: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type JobListResult = {
  jobs: Job[];
  pagination: PaginationMeta;
};

export type SubscriptionPayload = {
  email: string;
  query?: string;
  location?: string;
  type?: EmploymentType | "";
  category?: string;
};
