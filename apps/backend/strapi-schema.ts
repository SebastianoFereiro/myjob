// ========================================================================
// СТРАПИ 5: СХЕМА КОЛЛЕКЦИЙ (Source of Truth)
// ========================================================================
// Агент: изменяй этот файл при добавлении/изменении коллекций Strapi.
// После изменений синхронизируй types/strapi-collections.ts (фронтенд).
// ========================================================================

// ========================================================================
// 1. КОЛЛЕКЦИЯ: Company
// ========================================================================
// Тип: Collection Type
// Плагин: нет (собственный)
// API ID: company, companies
// Отношения: User (created_by), Vacancy (1:M)
// ========================================================================

export const CompanySchema = {
  collectionName: 'companies',
  info: {
    singularName: 'company',
    pluralName: 'companies',
    displayName: 'Company',
    description: 'Компании-работодатели',
  },
  options: {
    draftAndPublish: false,      // нет черновиков
  },
  pluginOptions: {
    'i18n': {
      localized: true,           // мультиязычность
    },
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
      maxLength: 200,
      pluginOptions: { i18n: { localized: true } },
    },
    slug: {
      type: 'uid',
      targetField: 'name',
      required: true,
    },
    description: {
      type: 'richtext',
      required: true,
      pluginOptions: { i18n: { localized: true } },
    },
    logo: {
      type: 'media',
      allowedTypes: ['images'],
      multiple: false,
      required: false,
    },
    website: {
      type: 'string',
      required: false,
    },
    industry: {
      type: 'enumeration',
      enum: [
        'IT',
        'Finance',
        'Healthcare',
        'Education',
        'Manufacturing',
        'Retail',
        'Construction',
        'Transportation',
        'Energy',
        'Media',
        'Agriculture',
        'Real Estate',
        'Other',
      ],
      required: true,
    },
    size: {
      type: 'enumeration',
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      required: true,
    },
    location: {
      type: 'string',
      required: true,
      maxLength: 300,
      pluginOptions: { i18n: { localized: true } },
    },
    ynp: {
      type: 'string',
      required: true,
      maxLength: 20,
    },
    founded_year: {
      type: 'integer',
      required: false,
      min: 1800,
      max: 2030,
    },
    // --- Отношения ---
    // vacancies: relation 1:M (inverse от Vacancy.company)
    // created_by: relation User (автоматически Strapi)
  },
} as const;

// ========================================================================
// 2. КОЛЛЕКЦИЯ: Vacancy
// ========================================================================
// Тип: Collection Type
// API ID: vacancy, vacancies
// Отношения: Company (M:1), Category (M:1), User (created_by)
// ========================================================================

export const VacancySchema = {
  collectionName: 'vacancies',
  info: {
    singularName: 'vacancy',
    pluralName: 'vacancies',
    displayName: 'Vacancy',
    description: 'Вакансии компаний',
  },
  options: {
    draftAndPublish: true,       // черновики/публикация
  },
  pluginOptions: {
    'i18n': {
      localized: true,
    },
  },
  attributes: {
    title: {
      type: 'string',
      required: true,
      maxLength: 200,
      pluginOptions: { i18n: { localized: true } },
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      required: true,
    },
    description: {
      type: 'richtext',
      required: true,
      pluginOptions: { i18n: { localized: true } },
    },
    responsibilities: {
      type: 'richtext',
      required: true,
      pluginOptions: { i18n: { localized: true } },
    },
    requirements: {
      type: 'richtext',
      required: true,
      pluginOptions: { i18n: { localized: true } },
    },
    conditions: {
      type: 'richtext',
      required: true,
      pluginOptions: { i18n: { localized: true } },
    },
    salary_min: {
      type: 'integer',
      required: false,
      min: 0,
    },
    salary_max: {
      type: 'integer',
      required: false,
      min: 0,
    },
    salary_currency: {
      type: 'string',
      required: true,
      default: 'RUB',
      maxLength: 3,
    },
    salary_period: {
      type: 'enumeration',
      enum: ['month', 'year', 'hour'],
      required: true,
      default: 'month',
    },
    employment_type: {
      type: 'enumeration',
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      required: true,
    },
    experience_level: {
      type: 'enumeration',
      enum: ['junior', 'middle', 'senior', 'lead'],
      required: true,
    },
    location: {
      type: 'string',
      required: true,
      maxLength: 300,
      pluginOptions: { i18n: { localized: true } },
    },
    remote_possible: {
      type: 'boolean',
      required: true,
      default: false,
    },
    key_skills: {
      type: 'json',              // массив строк
      required: false,
    },
    status: {
      type: 'enumeration',
      enum: ['draft', 'published', 'archived'],
      required: true,
      default: 'draft',
    },
    views_count: {
      type: 'integer',
      required: true,
      default: 0,
      min: 0,
    },
    applications_count: {
      type: 'integer',
      required: true,
      default: 0,
      min: 0,
    },
    expires_at: {
      type: 'datetime',
      required: false,
    },
    // --- Отношения ---
    // company: relation M:1 -> Company
    // category: relation M:1 -> Category
    // created_by: relation User (автоматически Strapi)
  },
} as const;

// ========================================================================
// 3. КОЛЛЕКЦИЯ: Category
// ========================================================================
// Тип: Collection Type
// API ID: category, categories
// Отношения: Vacancy (1:M), BlogPost (M:M)
// ========================================================================

export const CategorySchema = {
  collectionName: 'categories',
  info: {
    singularName: 'category',
    pluralName: 'categories',
    displayName: 'Category',
    description: 'Категории для вакансий и блога',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'i18n': {
      localized: true,
    },
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
      maxLength: 100,
      pluginOptions: { i18n: { localized: true } },
    },
    slug: {
      type: 'uid',
      targetField: 'name',
      required: true,
    },
    description: {
      type: 'richtext',
      required: false,
      pluginOptions: { i18n: { localized: true } },
    },
    icon: {
      type: 'string',            // emoji или class name
      required: false,
      maxLength: 50,
    },
    count: {
      type: 'integer',           // кеш количества вакансий
      required: true,
      default: 0,
      min: 0,
    },
    SEO: {
      type: 'component',
      repeatable: false,
      component: 'shared.seo',
    },
    blocks: {
      type: 'dynamiczone',
      components: [
        'page.hero',
        'page.rich-text',
        'page.faq',
        'page.contact-info',
        'page.pricing-table',
        'page.team',
        'page.cta',
      ],
    },
    text: {
      type: 'richtext',
      required: false,
    },
    // --- Отношения ---
    // vacancies: relation 1:M (inverse от Vacancy.category)
    // blog_posts: relation M:M (inverse от BlogPost.categories)
  },
} as const;

// ========================================================================
// 4. КОЛЛЕКЦИЯ: Blog
// ========================================================================
// Тип: Collection Type
// API ID: blog, blogs
// Атрибуты: title, slug, excerpt, content, images (multiple media), author (string)
// ========================================================================

export const BlogSchema = {
  collectionName: 'blogs',
  info: {
    singularName: 'blog',
    pluralName: 'blogs',
    displayName: 'Blog',
    description: 'Статьи блога по поиску работы',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {},
  attributes: {
    title: {
      type: 'string',
      required: true,
      maxLength: 200,
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      required: true,
    },
    excerpt: {
      type: 'text',
      maxLength: 500,
    },
    content: {
      type: 'richtext',
      required: true,
    },
    images: {
      type: 'media',
      multiple: true,
      allowedTypes: ['images'],
      required: false,
    },
    author: {
      type: 'string',
      maxLength: 100,
    },
    SEO: {
      type: 'component',
      repeatable: false,
      component: 'shared.seo',
    },
  },
} as const;

// ========================================================================
// 5. КОЛЛЕКЦИЯ: Author
// ========================================================================
// Тип: Collection Type
// API ID: author, authors
// Отношения: BlogPost (1:M)
// ========================================================================

export const AuthorSchema = {
  collectionName: 'authors',
  info: {
    singularName: 'author',
    pluralName: 'authors',
    displayName: 'Author',
    description: 'Авторы блога',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'i18n': {
      localized: true,
    },
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
      maxLength: 200,
      pluginOptions: { i18n: { localized: true } },
    },
    avatar: {
      type: 'media',
      allowedTypes: ['images'],
      multiple: false,
      required: false,
    },
    bio: {
      type: 'richtext',
      required: false,
      pluginOptions: { i18n: { localized: true } },
    },
    // --- Отношения ---
    // blog_posts: relation 1:M (inverse от BlogPost.author)
    // created_by: relation User (автоматически Strapi)
  },
} as const;

// ========================================================================
// 6. КОЛЛЕКЦИЯ: Resume
// ========================================================================
// Тип: Collection Type
// API ID: resume, resumes
// Отношения: User (created_by)
// ВНИМАНИЕ: experience и education — JSON поля, НЕ компоненты Strapi
// ========================================================================

export const ResumeSchema = {
  collectionName: 'resumes',
  info: {
    singularName: 'resume',
    pluralName: 'resumes',
    displayName: 'Resume',
    description: 'Резюме соискателей',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    full_name: {
      type: 'string',
      required: true,
      maxLength: 200,
    },
    email: {
      type: 'email',
      required: true,
    },
    phone: {
      type: 'string',
      required: true,
    },
    position: {
      type: 'string',
      required: true,
      maxLength: 200,
    },
    experience: {
      type: 'json',              // массив Experience[]
      required: true,
    },
    education: {
      type: 'json',              // массив Education[]
      required: true,
    },
    skills: {
      type: 'json',              // массив string[]
      required: true,
    },
    summary: {
      type: 'richtext',
      required: true,
    },
    portfolio_url: {
      type: 'string',
      required: false,
    },
    linkedin_url: {
      type: 'string',
      required: false,
    },
    file_url: {
      type: 'string',            // URL загруженного файла
      required: false,
    },
    status: {
      type: 'enumeration',
      enum: ['new', 'reviewed', 'interviewed', 'rejected', 'hired'],
      required: true,
      default: 'new',
    },
    // --- Отношения ---
    // created_by: relation User (автоматически Strapi)
  },
} as const;

// ========================================================================
// 7. КОЛЛЕКЦИЯ: Page
// ========================================================================
// Тип: Collection Type
// API ID: page, pages
// Атрибуты: title, slug, meta_description, blocks (dynamic zone), footer_*
// ========================================================================

export const PageSchema = {
  collectionName: 'pages',
  info: {
    singularName: 'page',
    pluralName: 'pages',
    displayName: 'Page',
    description: 'Статические страницы с динамическими блоками',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {},
  attributes: {
    title: {
      type: 'string',
      required: true,
      maxLength: 200,
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      required: true,
    },
    meta_description: {
      type: 'text',
      maxLength: 320,
    },
    blocks: {
      type: 'dynamiczone',
      components: [
        'page.hero',
        'page.rich-text',
        'page.faq',
        'page.contact-info',
        'page.pricing-table',
        'page.team',
        'page.cta',
      ],
    },
    footer_group: {
      type: 'enumeration',
      enum: ['seekers', 'employers', 'company', 'bottom', 'none'],
      required: true,
      default: 'none',
    },
    footer_order: {
      type: 'integer',
      min: 0,
    },
    footer_label: {
      type: 'string',
      maxLength: 100,
    },
  },
} as const;

// ========================================================================
// 8. КОЛЛЕКЦИЯ: CV (вакансии — реально используемая)
// ========================================================================
// Тип: Collection Type
// API ID: cv, cvs
// Отношения: Company (M:1), Category (M:1), User (created_by)
// ПОЛЯ premium_*/push_* — для премиум-закрепления и авто-поднятия
// ========================================================================

export const CVSchema = {
  collectionName: 'cvs',
  info: {
    singularName: 'cv',
    pluralName: 'cvs',
    displayName: 'CV',
    description: 'Вакансии компаний (основная коллекция)',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {},
  attributes: {
    title: {
      type: 'string',
      required: true,
      maxLength: 200,
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      required: true,
    },
    position: {
      type: 'string',
      required: false,
      maxLength: 200,
    },
    description: {
      type: 'richtext',
      required: true,
    },
    requirements: {
      type: 'richtext',
      required: false,
    },
    conditions: {
      type: 'richtext',
      required: false,
    },
    salaryFrom: {
      type: 'integer',
      required: false,
      min: 0,
    },
    salaryTo: {
      type: 'integer',
      required: false,
      min: 0,
    },
    currency: {
      type: 'string',
      required: false,
      default: 'BYN',
      maxLength: 3,
    },
    employmentType: {
      type: 'string',
      required: false,
      maxLength: 100,
    },
    location: {
      type: 'string',
      required: false,
      maxLength: 300,
    },
    city: {
      type: 'string',
      required: false,
      maxLength: 200,
    },
    level_job: {
      type: 'string',
      required: false,
      maxLength: 100,
    },
    experience_job: {
      type: 'string',
      required: false,
      maxLength: 100,
    },
    education_job: {
      type: 'string',
      required: false,
      maxLength: 100,
    },
    deadline: {
      type: 'datetime',
      required: false,
    },
    datetime_start: {
      type: 'datetime',
      required: false,
    },
    datetime_finish: {
      type: 'datetime',
      required: false,
    },
    sortOrder: {
      type: 'integer',
      required: false,
      default: 100,
    },
    isActive: {
      type: 'boolean',
      required: false,
      default: true,
    },
    userId: {
      type: 'string',
      required: false,
    },
    // --- Премиум-закрепление ---
    premium_from: {
      type: 'datetime',
      required: false,
    },
    premium_to: {
      type: 'datetime',
      required: false,
    },
    // --- Авто-поднятие ---
    push_from: {
      type: 'datetime',
      required: false,
    },
    push_to: {
      type: 'datetime',
      required: false,
    },
    // --- Отношения ---
    // company: relation M:1 -> Company
    // category: relation M:1 -> Category
    // image: media
    // SEO: component
    // Profile: relation
    // created_by: relation User (автоматически Strapi)
  },
} as const;

// ========================================================================
// ВСПОМОГАТЕЛЬНЫЕ JSON-ТИПЫ (не коллекции, а структуры внутри JSON полей)
// ========================================================================

// Структура объекта внутри Resume.experience
export const ExperienceObject = {
  id: 'string',            // UUID для клиентской идентификации
  company: 'string',
  position: 'string',
  start_date: 'string',    // ISO 8601 date
  end_date: 'string|null', // null если current = true
  current: 'boolean',
  description: 'string',
} as const;

// Структура объекта внутри Resume.education
export const EducationObject = {
  id: 'string',            // UUID
  institution: 'string',
  degree: 'string',
  field: 'string',
  start_date: 'string',    // ISO 8601 date
  end_date: 'string|null',
} as const;

// ========================================================================
// СВОДНАЯ ТАБЛИЦА ОТНОШЕНИЙ
// ========================================================================
/*
  Компания ──1:M──> Вакансия
  Категория ──1:M──> Вакансия
  Пользователь ──1:M──> Резюме (created_by)
  Пользователь ──1:M──> Компания (created_by)
*/