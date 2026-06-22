// ========================================================================
// SEED SCRIPT: Pages
// Запуск: npx tsx scripts/seed-pages.ts
// ========================================================================

const STRAPI_URL = "http://10.0.15.202:1337";
const TOKEN = "9092a88404f4c77027629bc80cda1d0fb866c69cf6c05a6998feb6177658a2546bda636d77145fdc373b8f9a0afa752f0a023bf9acf2095654f6a2b1db3b978d5d9368e43a9a960a21e9afab72711e2358e82adacafcea2ea90b108eeeab66f82c806ba6f00c533b3058c8ea6012003dfd9e554fff001a9af6fdadffbe661939";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

// ========================================================================
// SEED DATA
// ========================================================================

type PageSeed = {
  title: string;
  slug: string;
  meta_description: string;
  blocks: Record<string, unknown>[];
  footer_group: string;
  footer_order: number;
  footer_label: string;
};

const PAGES: PageSeed[] = [
  // --- Страницы с собственным URL ---
  {
    title: "О проекте",
    slug: "about",
    meta_description: "MyJOB — платформа для поиска работы и сотрудников в Беларуси",
    footer_group: "company",
    footer_order: 0,
    footer_label: "О проекте",
    blocks: [
      {
        __component: "page.hero",
        title: "О проекте MyJOB",
        subtitle:
          "Мы помогаем соискателям найти работу мечты, а работодателям — лучших сотрудников. MyJOB — это современная платформа для карьерных возможностей в Беларуси.",
        image: null,
      },
      {
        __component: "page.rich-text",
        content:
          "# Наша миссия\n\nMyJOB создан для того, чтобы сделать рынок труда в Беларуси прозрачным и доступным. Мы объединяем соискателей и работодателей на одной платформе, предлагая удобные инструменты для поиска и подбора персонала.\n\n## Что мы предлагаем\n\n- **Соискателям:** тысячи актуальных вакансий, удобный поиск по категориям, возможность быстро откликнуться и отслеживать статус заявок.\n- **Работодателям:** доступ к базе кандидатов, инструменты для публикации вакансий и управления откликами, статистика по эффективности найма.\n\n## Наши ценности\n\n- **Прозрачность:** честные условия для всех участников платформы\n- **Доступность:** бесплатный базовый функционал для соискателей\n- **Эффективность:** современные алгоритмы подбора\n\n---\n\n*Частное предприятие «МедиаШарм»*",
      },
      {
        __component: "page.team",
        title: "Команда",
        members: [
          {
            name: "Команда MyJOB",
            role: "Разработка и поддержка",
            bio: "Мы — команда профессионалов, увлеченных созданием лучшего сервиса для поиска работы в Беларуси.",
            photo_url: "",
          },
        ],
      },
      {
        __component: "page.cta",
        title: "Присоединяйтесь к MyJOB",
        description: "Начните поиск работы или сотрудников уже сегодня",
        button_text: "Найти вакансии",
        button_url: "/jobs",
      },
    ],
  },
  {
    title: "Помощь",
    slug: "help",
    meta_description: "Часто задаваемые вопросы и контакты поддержки MyJOB",
    footer_group: "seekers",
    footer_order: 3,
    footer_label: "Советы по поиску",
    blocks: [
      {
        __component: "page.hero",
        title: "Помощь и поддержка",
        subtitle: "Ответы на частые вопросы и контактная информация",
        image: null,
      },
      {
        __component: "page.faq",
        title: "Часто задаваемые вопросы",
        items: [
          {
            question: "Как создать резюме?",
            answer:
              "Перейдите в раздел «Разместить резюме», заполните форму с вашими данными, опытом работы и навыками. После отправки резюме появится в базе кандидатов.",
          },
          {
            question: "Как работодателю разместить вакансию?",
            answer:
              "Зарегистрируйтесь как компания, заполните профиль и перейдите в личный кабинет. Там вы сможете создавать и публиковать вакансии.",
          },
          {
            question: "Сколько стоят услуги платформы?",
            answer:
              "Базовый функционал для соискателей бесплатный. Для работодателей доступны бесплатные и платные тарифы — подробнее в разделе «Тарифы».",
          },
          {
            question: "Как изменить данные в резюме?",
            answer:
              "Авторизуйтесь на платформе, перейдите в личный кабинет и отредактируйте нужное резюме.",
          },
          {
            question: "Как удалить аккаунт?",
            answer:
              "Напишите в службу поддержки через форму на странице контактов, и мы поможем удалить ваш аккаунт.",
          },
        ],
      },
      {
        __component: "page.contact-info",
        email: "support@myjob.by",
        phone: "+375 (00) 000-00-00",
        address: "г. Минск, Республика Беларусь",
        work_hours: "Пн-Пт: 9:00 - 18:00",
      },
    ],
  },
  {
    title: "Тарифы",
    slug: "pricing",
    meta_description: "Тарифные планы MyJOB для работодателей",
    footer_group: "employers",
    footer_order: 2,
    footer_label: "Тарифы",
    blocks: [
      {
        __component: "page.hero",
        title: "Тарифы для работодателей",
        subtitle: "Выберите подходящий план для поиска сотрудников",
        image: null,
      },
      {
        __component: "page.pricing-table",
        title: "Наши тарифы",
        items: [
          {
            name: "Базовый",
            price: "Бесплатно",
            period: "навсегда",
            features: [
              "1 активная вакансия",
              "Доступ к базе кандидатов",
              "Базовая статистика",
            ],
            highlighted: false,
            button_text: "Начать",
            button_url: "/company/dashboard",
          },
          {
            name: "Стандарт",
            price: "49 BYN",
            period: "в месяц",
            features: [
              "До 10 активных вакансий",
              "Расширенный поиск кандидатов",
              "Детальная статистика",
              "Приоритетная поддержка",
            ],
            highlighted: true,
            button_text: "Выбрать",
            button_url: "/company/dashboard",
          },
          {
            name: "Профессиональный",
            price: "99 BYN",
            period: "в месяц",
            features: [
              "Неограниченное количество вакансий",
              "Полный доступ к базе кандидатов",
              "API-доступ",
              "Персональный менеджер",
              "Приоритетная поддержка 24/7",
            ],
            highlighted: false,
            button_text: "Связаться",
            button_url: "/contacts",
          },
        ],
      },
      {
        __component: "page.cta",
        title: "Начните бесплатно",
        description: "Попробуйте базовый тариф без ограничений по времени",
        button_text: "Создать компанию",
        button_url: "/company/dashboard",
      },
    ],
  },
  {
    title: "Пользовательское соглашение",
    slug: "terms",
    meta_description: "Пользовательское соглашение MyJOB",
    footer_group: "bottom",
    footer_order: 0,
    footer_label: "Пользовательское соглашение",
    blocks: [
      {
        __component: "page.rich-text",
        content:
          "# Пользовательское соглашение\n\nНастоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между Частным предприятием «МедиаШарм» (далее — Оператор) и пользователем платформы MyJOB (далее — Пользователь).\n\n## 1. Общие положения\n\n1.1. Используя платформу MyJOB, Пользователь подтверждает свое согласие с условиями настоящего Соглашения.\n\n1.2. Оператор оставляет за собой право вносить изменения в Соглашение. Новая редакция вступает в силу с момента ее публикации на платформе.\n\n## 2. Регистрация и учетная запись\n\n2.1. Для доступа к полному функционалу платформы Пользователь должен пройти регистрацию.\n\n2.2. Пользователь обязуется предоставлять достоверную информацию при регистрации.\n\n2.3. Пользователь несет ответственность за сохранность своих учетных данных.\n\n## 3. Права и обязанности сторон\n\n3.1. Пользователь имеет право:\n- Размещать резюме и откликаться на вакансии\n- Создавать профиль компании и публиковать вакансии\n- Получать уведомления о новых предложениях\n\n3.2. Оператор обязуется:\n- Обеспечивать бесперебойную работу платформы\n- Защищать персональные данные Пользователей\n- Предоставлять техническую поддержку\n\n## 4. Ответственность\n\n4.1. Оператор не несет ответственности за достоверность информации, размещенной Пользователями.\n\n4.2. Оператор не гарантирует трудоустройство или подбор персонала.\n\n## 5. Реквизиты Оператора\n\n- **Полное наименование:** Частное предприятие «МедиаШарм»\n- **Юридический адрес:** г. Минск, Республика Беларусь\n- **Email:** info@media-sharm.by\n- **Телефон:** +375 (00) 000-00-00\n\n## 6. Заключительные положения\n\n6.1. Настоящее Соглашение регулируется законодательством Республики Беларусь.\n\n6.2. Все споры решаются путем переговоров. При недостижении согласия — в судебном порядке по месту нахождения Оператора.",
      },
    ],
  },
  {
    title: "Политика конфиденциальности",
    slug: "privacy",
    meta_description: "Политика конфиденциальности MyJOB",
    footer_group: "bottom",
    footer_order: 1,
    footer_label: "Политика конфиденциальности",
    blocks: [
      {
        __component: "page.rich-text",
        content:
          "# Политика конфиденциальности\n\nНастоящая Политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты персональных данных Пользователей платформы MyJOB.\n\n## 1. Собираемые данные\n\n1.1. При регистрации и использовании платформы мы можем собирать:\n- Имя, фамилию, адрес электронной почты\n- Номер телефона\n- Информацию об образовании и опыте работы\n- Данные о компании (для работодателей)\n\n## 2. Цели обработки данных\n\n2.1. Персональные данные используются для:\n- Предоставления доступа к функционалу платформы\n- Поиска и подбора вакансий и кандидатов\n- Улучшения качества сервиса\n- Коммуникации с Пользователем\n\n## 3. Защита данных\n\n3.1. Оператор принимает все необходимые меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.\n\n## 4. Передача данных третьим лицам\n\n4.1. Оператор не передает персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Республики Беларусь.\n\n## 5. Права Пользователя\n\n5.1. Пользователь имеет право:\n- Получить информацию о своих персональных данных\n- Требовать их изменения или удаления\n- Отозвать согласие на обработку данных\n\n## 6. Контактная информация\n\nПо всем вопросам, связанным с обработкой персональных данных, обращайтесь:\n- **Email:** privacy@media-sharm.by\n- **Адрес:** г. Минск, Республика Беларусь\n\n*Дата последнего обновления: 2026 год*",
      },
    ],
  },
  // --- Страницы-ссылки для футера (без собственного URL) ---
  {
    title: "Найти работу",
    slug: "find-job",
    meta_description: "",
    footer_group: "seekers",
    footer_order: 0,
    footer_label: "Найти работу",
    blocks: [],
  },
  {
    title: "Разместить резюме",
    slug: "submit-resume",
    meta_description: "",
    footer_group: "seekers",
    footer_order: 1,
    footer_label: "Разместить резюме",
    blocks: [],
  },
  {
    title: "Каталог профессий",
    slug: "professions",
    meta_description: "",
    footer_group: "seekers",
    footer_order: 2,
    footer_label: "Каталог профессий",
    blocks: [],
  },
  {
    title: "Советы по поиску",
    slug: "tips",
    meta_description: "",
    footer_group: "seekers",
    footer_order: 3,
    footer_label: "Советы по поиску",
    blocks: [],
  },
  {
    title: "Разместить вакансию",
    slug: "post-vacancy",
    meta_description: "",
    footer_group: "employers",
    footer_order: 0,
    footer_label: "Разместить вакансию",
    blocks: [],
  },
  {
    title: "Найти кандидатов",
    slug: "find-candidates",
    meta_description: "",
    footer_group: "employers",
    footer_order: 1,
    footer_label: "Найти кандидатов",
    blocks: [],
  },
  {
    title: "Поддержка",
    slug: "support",
    meta_description: "",
    footer_group: "employers",
    footer_order: 3,
    footer_label: "Поддержка",
    blocks: [],
  },
  {
    title: "Компании",
    slug: "companies",
    meta_description: "",
    footer_group: "company",
    footer_order: 1,
    footer_label: "Компании",
    blocks: [],
  },
  {
    title: "Контакты",
    slug: "contacts",
    meta_description: "",
    footer_group: "company",
    footer_order: 2,
    footer_label: "Контакты",
    blocks: [],
  },
  {
    title: "Помощь (ссылка)",
    slug: "help-main",
    meta_description: "",
    footer_group: "company",
    footer_order: 3,
    footer_label: "Помощь",
    blocks: [],
  },
];

// ========================================================================
// HELPERS
// ========================================================================

async function api<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...((options?.headers || {}) as Record<string, string>) },
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(`[ERROR] ${res.status} ${path}:`, JSON.stringify(json, null, 2));
    throw new Error(`API error ${res.status}: ${json?.error?.message || "Unknown"}`);
  }
  return json as T;
}

// ========================================================================
// MAIN
// ========================================================================

async function main() {
  console.log("=== SEED PAGES START ===");

  let createdCount = 0;
  let skipCount = 0;

  for (const page of PAGES) {
    // Check if page already exists
    const existing = await api<{ data: Array<{ id: number }> }>(
      `/pages?filters[slug][$eq]=${page.slug}&pagination[pageSize]=1`,
    );

    if (existing.data?.[0]) {
      console.log(`  [SKIP] ${page.title} (slug=${page.slug})`);
      skipCount++;
      continue;
    }

    // Publish the page
    await api("/pages", {
      method: "POST",
      body: JSON.stringify({
        data: {
          title: page.title,
          slug: page.slug,
          meta_description: page.meta_description,
          blocks: page.blocks,
          footer_group: page.footer_group,
          footer_order: page.footer_order,
          footer_label: page.footer_label,
          publishedAt: new Date().toISOString(),
        },
      }),
    });

    console.log(`  [CREATE] ${page.title} (slug=${page.slug})`);
    createdCount++;
  }

  console.log(`\n=== SEED PAGES COMPLETE ===`);
  console.log(`  Created: ${createdCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Total: ${PAGES.length}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

export {};
