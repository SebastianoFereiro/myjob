export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "remote";

export type JobCategory = {
  slug: string;
  name: string;
};

export type JobCompany = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

export type Job = {
  id: string;
  slug: string;
  title: string;
  company: JobCompany;
  category: JobCategory;
  location: string;
  employmentType: EmploymentType;
  salaryFrom?: number;
  salaryTo?: number;
  currency: string;
  description: string;
  publishedAt: string;
  deadline?: string;
  requirements?: string;
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
