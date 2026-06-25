import { fetchAPI } from '@/lib/strapi-client';
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from '@/lib/strapi-record';
import type { Page, FooterGroup } from '@/types/strapi-collections';
import type { SeoMetadata } from '@/types/seo';

const PAGE_ENDPOINT = '/pages';

function mapPage(raw: Record<string, unknown>): Page {
  const record = unwrapStrapiRecord(raw);
  const blocks = (record.blocks as Record<string, unknown>[]) ?? [];
  return {
    id: Number(record.id),
    documentId: String(record.documentId ?? ''),
    title: String(record.title ?? ''),
    slug: String(record.slug ?? ''),
    SEO: (record.SEO as SeoMetadata) ?? null,
    blocks: blocks.map((b) => ({
      ...b,
      id: String(b.id),
      __component: String(b.__component),
    })) as Page['blocks'],
    footer_group: (record.footer_group as FooterGroup) ?? 'none',
    footer_order: (record.footer_order as number) ?? null,
    footer_label: (record.footer_label as string) ?? null,
    publishedAt: (record.publishedAt as string) ?? null,
    createdAt: String(record.createdAt ?? ''),
    updatedAt: String(record.updatedAt ?? ''),
  };
}

// Fallback данные на случай недоступности Strapi
const fallbackPages: Record<string, Page> = {
  about: {
    id: 0,
    documentId: 'fallback-about',
    title: 'О проекте',
    slug: 'about',
    SEO: null,
    blocks: [
      {
        __component: 'page.hero',
        id: 'fb-hero-1',
        title: 'О проекте MyJOB',
        subtitle: 'Мы помогаем соискателям найти работу мечты, а работодателям — лучших сотрудников.',
        image: null,
      },
      {
        __component: 'page.rich-text',
        id: 'fb-rt-1',
        content:
          '## Наша миссия\n\nMyJOB создан для того, чтобы сделать рынок труда в Беларуси прозрачным и доступным.\n\n## Что мы предлагаем\n\n- **Соискателям:** тысячи актуальных вакансий\n- **Работодателям:** доступ к базе кандидатов',
      },
    ],
    footer_group: 'none',
    footer_order: null,
    footer_label: null,
    publishedAt: null,
    createdAt: '',
    updatedAt: '',
  },
  help: {
    id: 0,
    documentId: 'fallback-help',
    title: 'Помощь',
    slug: 'help',
    SEO: null,
    blocks: [
      {
        __component: 'page.hero',
        id: 'fb-hero-2',
        title: 'Помощь и поддержка',
        subtitle: 'Ответы на частые вопросы и контактная информация',
        image: null,
      },
      {
        __component: 'page.faq',
        id: 'fb-faq-1',
        title: 'Часто задаваемые вопросы',
        items: [
          { question: 'Как создать резюме?', answer: 'Перейдите в раздел «Разместить резюме», заполните форму.' },
          { question: 'Как работодателю разместить вакансию?', answer: 'Зарегистрируйтесь как компания, заполните профиль.' },
          { question: 'Сколько стоят услуги платформы?', answer: 'Базовый функционал для соискателей бесплатный.' },
        ],
      },
      {
        __component: 'page.contact-info',
        id: 'fb-ci-1',
        email: 'support@myjob.by',
        phone: '+375 (00) 000-00-00',
        address: 'г. Минск, Республика Беларусь',
        work_hours: 'Пн-Пт: 9:00 - 18:00',
      },
    ],
    footer_group: 'none',
    footer_order: null,
    footer_label: null,
    publishedAt: null,
    createdAt: '',
    updatedAt: '',
  },
  pricing: {
    id: 0,
    documentId: 'fallback-pricing',
    title: 'Тарифы',
    slug: 'pricing',
    SEO: null,
    blocks: [
      {
        __component: 'page.hero',
        id: 'fb-hero-3',
        title: 'Тарифы для работодателей',
        subtitle: 'Выберите подходящий план для поиска сотрудников',
        image: null,
      },
      {
        __component: 'page.pricing-table',
        id: 'fb-pt-1',
        title: 'Наши тарифы',
        items: [
          {
            name: 'Базовый', price: 'Бесплатно', period: 'навсегда',
            features: ['1 активная вакансия', 'Доступ к базе кандидатов'],
            highlighted: false, button_text: 'Начать', button_url: '/company/dashboard',
          },
          {
            name: 'Стандарт', price: '49 BYN', period: 'в месяц',
            features: ['До 10 активных вакансий', 'Расширенный поиск'],
            highlighted: true, button_text: 'Выбрать', button_url: '/company/dashboard',
          },
          {
            name: 'Профессиональный', price: '99 BYN', period: 'в месяц',
            features: ['Неограниченное количество вакансий', 'Полный доступ'],
            highlighted: false, button_text: 'Связаться', button_url: '/contacts',
          },
        ],
      },
    ],
    footer_group: 'none',
    footer_order: null,
    footer_label: null,
    publishedAt: null,
    createdAt: '',
    updatedAt: '',
  },
  terms: {
    id: 0,
    documentId: 'fallback-terms',
    title: 'Пользовательское соглашение',
    slug: 'terms',
    SEO: null,
    blocks: [
      {
        __component: 'page.rich-text',
        id: 'fb-rt-2',
        content:
          '# Пользовательское соглашение\n\nНастоящее Соглашение регулирует отношения между ЧП «МедиаШарм» и пользователем платформы MyJOB.\n\n## 1. Общие положения\n\n1.1. Используя платформу, Пользователь подтверждает согласие с условиями Соглашения.\n\n## 2. Регистрация\n\n2.1. Для доступа к полному функционалу необходима регистрация.\n\n## 3. Реквизиты\n\nЧП «МедиаШарм», г. Минск, Республика Беларусь',
      },
    ],
    footer_group: 'none',
    footer_order: null,
    footer_label: null,
    publishedAt: null,
    createdAt: '',
    updatedAt: '',
  },
  privacy: {
    id: 0,
    documentId: 'fallback-privacy',
    title: 'Политика конфиденциальности',
    slug: 'privacy',
    SEO: null,
    blocks: [
      {
        __component: 'page.rich-text',
        id: 'fb-rt-3',
        content:
          '# Политика конфиденциальности\n\nНастоящая Политика определяет порядок обработки персональных данных пользователей платформы MyJOB.\n\n## 1. Собираемые данные\n\nПри регистрации мы собираем имя, email, номер телефона и информацию о профессиональном опыте.\n\n## 2. Цели обработки\n\nДанные используются для предоставления доступа к функционалу платформы и улучшения сервиса.',
      },
    ],
    footer_group: 'none',
    footer_order: null,
    footer_label: null,
    publishedAt: null,
    createdAt: '',
    updatedAt: '',
  },
};

// Footer link pages (только для футера, без URL)
const fallbackFooterLinks: Page[] = [
  {
    id: 0, documentId: 'fb-fl-1', title: 'Найти работу', slug: 'find-job',
    SEO: null, blocks: [], footer_group: 'seekers', footer_order: 0,
    footer_label: 'Найти работу', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-2', title: 'Разместить резюме', slug: 'submit-resume',
    SEO: null, blocks: [], footer_group: 'seekers', footer_order: 1,
    footer_label: 'Разместить резюме', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-3', title: 'Каталог профессий', slug: 'professions',
    SEO: null, blocks: [], footer_group: 'seekers', footer_order: 2,
    footer_label: 'Каталог профессий', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-4', title: 'Советы по поиску', slug: 'tips',
    SEO: null, blocks: [], footer_group: 'seekers', footer_order: 3,
    footer_label: 'Советы по поиску', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-5', title: 'Разместить вакансию', slug: 'post-vacancy',
    SEO: null, blocks: [], footer_group: 'employers', footer_order: 0,
    footer_label: 'Разместить вакансию', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-6', title: 'Найти кандидатов', slug: 'find-candidates',
    SEO: null, blocks: [], footer_group: 'employers', footer_order: 1,
    footer_label: 'Найти кандидатов', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-7', title: 'Тарифы', slug: 'pricing',
    SEO: null, blocks: [], footer_group: 'employers', footer_order: 2,
    footer_label: 'Тарифы', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-8', title: 'Поддержка', slug: 'support',
    SEO: null, blocks: [], footer_group: 'employers', footer_order: 3,
    footer_label: 'Поддержка', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-9', title: 'О проекте', slug: 'about',
    SEO: null, blocks: [], footer_group: 'company', footer_order: 0,
    footer_label: 'О проекте', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-10', title: 'Компании', slug: 'companies',
    SEO: null, blocks: [], footer_group: 'company', footer_order: 1,
    footer_label: 'Компании', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-11', title: 'Контакты', slug: 'contacts',
    SEO: null, blocks: [], footer_group: 'company', footer_order: 2,
    footer_label: 'Контакты', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-12', title: 'Помощь', slug: 'help-main',
    SEO: null, blocks: [], footer_group: 'company', footer_order: 3,
    footer_label: 'Помощь', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-13', title: 'Пользовательское соглашение', slug: 'terms',
    SEO: null, blocks: [], footer_group: 'bottom', footer_order: 0,
    footer_label: 'Пользовательское соглашение', publishedAt: null, createdAt: '', updatedAt: '',
  },
  {
    id: 0, documentId: 'fb-fl-14', title: 'Политика конфиденциальности', slug: 'privacy',
    SEO: null, blocks: [], footer_group: 'bottom', footer_order: 1,
    footer_label: 'Политика конфиденциальности', publishedAt: null, createdAt: '', updatedAt: '',
  },
];

export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate': '*',
    });

    const response = await fetchAPI<StrapiListResponse<Record<string, unknown>>>(
      `${PAGE_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 60, tags: [`page-${slug}`] } },
    );

    if (response.data && response.data.length > 0) {
      return mapPage(response.data[0]);
    }

    // Fallback если в Strapi нет записи
    return fallbackPages[slug] ?? null;
  } catch {
    // Fallback при ошибке запроса
    return fallbackPages[slug] ?? null;
  }
}

export async function getFooterPages(): Promise<Page[]> {
  try {
    const params = new URLSearchParams({
      'filters[footer_group][$ne]': 'none',
      'sort[0]': 'footer_group:asc',
      'sort[1]': 'footer_order:asc',
      'populate': '0',
    });

    const response = await fetchAPI<StrapiListResponse<Record<string, unknown>>>(
      `${PAGE_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 60, tags: ['footer-pages'] } },
    );

    if (response.data && response.data.length > 0) {
      return response.data.map(mapPage);
    }

    return fallbackFooterLinks;
  } catch {
    return fallbackFooterLinks;
  }
}
