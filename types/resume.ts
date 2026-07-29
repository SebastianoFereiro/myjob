import type {
  RESUME_EMPLOYMENT_OPTIONS,
  RESUME_CURRENCY_OPTIONS,
} from '@/lib/enum-options';

export type EmploymentType = (typeof RESUME_EMPLOYMENT_OPTIONS)[number]['value'];
export type Currency = (typeof RESUME_CURRENCY_OPTIONS)[number]['value'];

export interface SkillItem {
  name: string;
  level: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  specialty: string;
  startYear: number;
  endYear?: number;
}

export interface LanguageItem {
  language: string;
  level: string;
}

export interface ResumeFormData {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  position: string;
  salary: number | null;
  currency: Currency;
  employmentType: EmploymentType;
  location: string;
  skills: SkillItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  languages: LanguageItem[];
  about: string;
  isPublished: boolean;
}

export interface Resume {
  id: string;
  documentId: string;
  title: string;
  slug: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  position: string;
  salary: number | null;
  currency: Currency;
  employmentType: EmploymentType;
  location: string;
  skills: SkillItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  languages: LanguageItem[];
  about: string;
  isPublished: boolean;
  userId: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
