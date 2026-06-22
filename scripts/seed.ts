// ========================================================================
// SEED SCRIPT: Companies & Vacancies
// Запуск: npx tsx scripts/seed.ts
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

const CATEGORY_MAP: Record<string, string> = {
  logistics: "transport-i-logistika",
  sales: "torgovlya-i-prodazhi",
  it: "it-internet-telekom",
  finance: "finansy-i-bankovskoe-delo",
  medicine: "zdravoohranenie-i-medicina",
  marketing: "marketing-reklama-pr",
};

const COMPANIES = [
  {
    name: "ООО ТехноПрогресс",
    slug: "technoprogress",
    description: "Современная IT-компания, разрабатывающая программное обеспечение для бизнеса.",
    siteUrl: "https://technoprogress.by",
    logoColor: "#2563EB",
  },
  {
    name: "ООО БелЛогистик",
    slug: "bellogistic",
    description: "Крупный логистический оператор по всей Беларуси.",
    siteUrl: "https://bellogistic.by",
    logoColor: "#059669",
  },
  {
    name: "ЗАО МедСервисГрупп",
    slug: "medservicegroup",
    description: "Сеть медицинских центров и лабораторий.",
    siteUrl: "https://medservice.by",
    logoColor: "#DC2626",
  },
  {
    name: "ООО ФинансКонсалт",
    slug: "financeconsult",
    description: "Консалтинг в сфере финансов и бухгалтерии.",
    siteUrl: "https://financeconsult.by",
    logoColor: "#7C3AED",
  },
  {
    name: "ИП Иванов А.С. МаркетингАгентство",
    slug: "marketingagency",
    description: "Креативное маркетинговое агентство полного цикла.",
    siteUrl: "https://marketingagency.by",
    logoColor: "#D97706",
  },
];

interface VacancySeed {
  title: string;
  description: string;
  requirements: string;
  conditions: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  currency: string;
  employmentType: string | null;
  location: string;
  category_slug: string;
}

const VACANCIES: VacancySeed[] = [
  // logistics -> transport-i-logistika
  { title: "Кладовщик", description: "Работа на современном складе класса А.", requirements: "Опыт от 1 года.", conditions: "График 5/2, соцпакет.", salaryFrom: 1200, salaryTo: 1600, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск, ул. Тимирязева, 67", category_slug: "logistics" },
  { title: "Водитель-экспедитор", description: "Доставка товаров по Минску и области.", requirements: "Права кат. C, стаж от 3 лет.", conditions: "Офиц. трудоустройство, премии.", salaryFrom: 1400, salaryTo: 2000, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "logistics" },
  { title: "Менеджер по логистике", description: "Координация транспортных потоков.", requirements: "Высшее образование, опыт от 2 лет.", conditions: "Гибкий график, ДМС.", salaryFrom: 1800, salaryTo: 2500, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "logistics" },
  { title: "Оператор склада", description: "Работа с WMS на складе.", requirements: "Базовые знания ПК.", conditions: "Сменный график, премии.", salaryFrom: 1000, salaryTo: 1300, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "logistics" },

  // sales -> torgovlya-i-prodazhi
  { title: "Менеджер по продажам", description: "Продажа IT-решений (B2B).", requirements: "Опыт в B2B от 1 года.", conditions: "Оклад + %, обучение.", salaryFrom: 1500, salaryTo: 4000, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "sales" },
  { title: "Продавец-консультант", description: "Консультация в магазине электроники.", requirements: "Коммуникабельность.", conditions: "График 2/2, скидки.", salaryFrom: 800, salaryTo: 1500, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск, ТЦ Galleria", category_slug: "sales" },
  { title: "Руководитель отдела продаж", description: "Управление командой 10+ человек.", requirements: "Опыт управления от 3 лет.", conditions: "Высокий оклад + % от оборота.", salaryFrom: 3500, salaryTo: 5000, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "sales" },
  { title: "Специалист по работе с клиентами", description: "Поддержка клиентов в чатах.", requirements: "Грамотная речь.", conditions: "Удаленный формат.", salaryFrom: 900, salaryTo: 1200, currency: "BYN", employmentType: "Удаленно", location: "г. Минск", category_slug: "sales" },

  // it -> it-internet-telekom
  { title: "Frontend-разработчик React", description: "Разработка интерфейсов.", requirements: "React, TypeScript, Next.js от 2 лет.", conditions: "Гибкий график, удаленка, ДМС.", salaryFrom: 3000, salaryTo: 5000, currency: "BYN", employmentType: "Удаленно", location: "г. Минск", category_slug: "it" },
  { title: "Backend-разработчик Node.js", description: "Микросервисная архитектура.", requirements: "Node.js, PostgreSQL, Redis от 3 лет.", conditions: "Оборудование от компании.", salaryFrom: 3500, salaryTo: 5500, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "it" },
  { title: "DevOps-инженер", description: "CI/CD, Kubernetes, автоматизация.", requirements: "Docker, K8s, CI/CD от 2 лет.", conditions: "Удаленно, релокация.", salaryFrom: 4000, salaryTo: 6000, currency: "BYN", employmentType: "Удаленно", location: "г. Минск", category_slug: "it" },
  { title: "QA Engineer Manual", description: "Тестирование веб-приложений.", requirements: "SQL, Postman, от 1 года.", conditions: "Гибкий график, обучение.", salaryFrom: 1500, salaryTo: 2500, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "it" },
  { title: "Стажер-разработчик", description: "Программа стажировки.", requirements: "Базовые знания JS/TS.", conditions: "Оплачиваемая стажировка.", salaryFrom: 500, salaryTo: 800, currency: "BYN", employmentType: "Стажировка", location: "г. Минск", category_slug: "it" },

  // finance -> finansy-i-bankovskoe-delo
  { title: "Бухгалтер", description: "Бухгалтерский учет юрлиц.", requirements: "Опыт от 2 лет, 1С.", conditions: "Стабильный график.", salaryFrom: 1500, salaryTo: 2200, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "finance" },
  { title: "Финансовый аналитик", description: "Анализ показателей и планирование.", requirements: "Высшее экономическое.", conditions: "Бонусы по результатам.", salaryFrom: 2500, salaryTo: 4000, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "finance" },
  { title: "Экономист", description: "Планово-экономический отдел.", requirements: "Опыт от 1 года.", conditions: "Полный соцпакет.", salaryFrom: 1200, salaryTo: 1700, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "finance" },

  // medicine -> zdravoohranenie-i-medicina
  { title: "Врач-терапевт", description: "Амбулаторный прием в частной клинике.", requirements: "Диплом врача, сертификат.", conditions: "ДМС, профразвитие.", salaryFrom: 2500, salaryTo: 4000, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "medicine" },
  { title: "Медицинская сестра", description: "Работа в стационаре.", requirements: "Среднее медицинское.", conditions: "Сменный график, льготы.", salaryFrom: 1000, salaryTo: 1500, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "medicine" },
  { title: "Администратор клиники", description: "Встреча пациентов, запись.", requirements: "Коммуникабельность.", conditions: "График 5/2, скидки.", salaryFrom: 900, salaryTo: 1200, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "medicine" },

  // marketing -> marketing-reklama-pr
  { title: "SMM-менеджер", description: "Ведение соцсетей и контент.", requirements: "Опыт от 1 года, портфолио.", conditions: "Свободный график.", salaryFrom: 1200, salaryTo: 2000, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "marketing" },
  { title: "Graphic Designer", description: "Дизайн макетов и брендов.", requirements: "Figma, Photoshop, портфолио.", conditions: "Проектная работа.", salaryFrom: 1500, salaryTo: 3000, currency: "BYN", employmentType: "Проектная работа", location: "г. Минск", category_slug: "marketing" },
  { title: "PR-менеджер", description: "Управление репутацией компании.", requirements: "Опыт в PR от 2 лет.", conditions: "Интересные проекты.", salaryFrom: 2000, salaryTo: 3000, currency: "BYN", employmentType: "Полная занятость", location: "г. Минск", category_slug: "marketing" },
  { title: "SEO-специалист", description: "Продвижение сайтов.", requirements: "SEO-инструменты, опыт от 1 года.", conditions: "Удаленно, KPI-бонусы.", salaryFrom: 1000, salaryTo: 1800, currency: "BYN", employmentType: "Удаленно", location: "г. Минск", category_slug: "marketing" },
];

// ========================================================================
// HELPERS
// ========================================================================

async function api<T = unknown>(path: string, options?: RequestInit): Promise<T> {
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

async function uploadImage(svgContent: string, filename: string) {
  const formData = new FormData();
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  formData.append("files", blob, filename);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Upload error: ${JSON.stringify(json)}`);
  return json[0] as { id: number; url: string };
}

function generateLogoSvg(name: string, color: string): string {
  const initials = name
    .replace(/^(ООО|ЗАО|ИП)\s+/, "")
    .split(/[\s.]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="30" fill="url(#bg)"/>
  <rect x="10" y="10" width="180" height="180" rx="25" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="2"/>
  <text x="100" y="110" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text>
</svg>`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ========================================================================
// MAIN
// ========================================================================

async function main() {
  console.log("=== SEED START ===");

  // 1. Fetch existing categories
  console.log("\n--- Fetching categories ---");
  const allCategories = await api<{ data: Array<{ id: number; slug: string }> }>(
    "/categories?pagination[pageSize]=100"
  );
  const allCatMap: Record<string, number> = {};
  for (const c of allCategories.data) {
    allCatMap[c.slug] = Number(c.id);
  }
  console.log(`  Found ${allCategories.data.length} categories`);

  const categoryIds: Record<string, number> = {};
  for (const [internalSlug, strapiSlug] of Object.entries(CATEGORY_MAP)) {
    if (allCatMap[strapiSlug]) {
      categoryIds[internalSlug] = allCatMap[strapiSlug];
      console.log(`  [MAP] ${internalSlug} -> ${strapiSlug} (id=${allCatMap[strapiSlug]})`);
    } else {
      console.error(`  [ERROR] Category "${strapiSlug}" not found`);
      process.exit(1);
    }
  }

  // 2. Companies with logos
  console.log("\n--- Companies ---");
  const companyIds: Record<string, number> = {};

  for (const comp of COMPANIES) {
    const existing = await api<{ data: Array<{ id: number }> }>(
      `/companies?filters[slug][$eq]=${comp.slug}&pagination[pageSize]=1`
    );

    if (existing.data?.[0]) {
      companyIds[comp.slug] = Number(existing.data[0].id);
      console.log(`  [OK] ${comp.name} (id=${existing.data[0].id})`);
      continue;
    }

    const svgContent = generateLogoSvg(comp.name, comp.logoColor);
    const logoFile = await uploadImage(svgContent, `logo-${comp.slug}.svg`);
    console.log(`  [UPLOAD] logo for ${comp.name} (fileId=${logoFile.id})`);

    const created = await api<{ data: { id: number } }>("/companies", {
      method: "POST",
      body: JSON.stringify({
        data: { name: comp.name, slug: comp.slug, description: comp.description, siteUrl: comp.siteUrl, logo: logoFile.id },
      }),
    });
    companyIds[comp.slug] = Number(created.data.id);
    console.log(`  [CREATE] ${comp.name} (id=${created.data.id})`);
  }

  // 3. Vacancies (CVs)
  console.log("\n--- Vacancies ---");
  let createdCount = 0;
  let skipCount = 0;

  const companySlugs = COMPANIES.map((c) => c.slug);

  for (const vac of VACANCIES) {
    const slug = slugify(vac.title);

    const existing = await api<{ data: Array<{ id: number }> }>(
      `/cvs?filters[slug][$eq]=${slug}&pagination[pageSize]=1`
    );

    if (existing.data?.[0]) {
      console.log(`  [SKIP] ${vac.title}`);
      skipCount++;
      continue;
    }

    const catIdx = Object.keys(CATEGORY_MAP).indexOf(vac.category_slug);
    const companySlug = companySlugs[catIdx % companySlugs.length];

    const payload: Record<string, unknown> = {
      title: vac.title,
      slug,
      description: vac.description,
      requirements: vac.requirements,
      conditions: vac.conditions,
      salaryFrom: vac.salaryFrom,
      salaryTo: vac.salaryTo,
      currency: vac.currency,
      employmentType: vac.employmentType,
      location: vac.location,
      sortOrder: 100,
      isActive: true,
      publishedAt: new Date().toISOString(),
      company: companyIds[companySlug],
      category: categoryIds[vac.category_slug],
    };

    await api("/cvs", {
      method: "POST",
      body: JSON.stringify({ data: payload }),
    });
    console.log(`  [CREATE] ${vac.title} -> ${companySlug}`);
    createdCount++;
  }

  console.log(`\n=== SEED COMPLETE ===`);
  console.log(`  Categories: ${Object.keys(categoryIds).length}`);
  console.log(`  Companies: ${Object.keys(companyIds).length}`);
  console.log(`  Vacancies: ${createdCount} created, ${skipCount} skipped`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

export {};
