import * as React from "react";

type FooterLink = { label: string; href: string };

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

type FooterProps = {
  logoSrc?: string;
  logoAlt?: string;
  logoHref?: string;
  description?: string;
  columns?: FooterColumn[];
  copyright?: string;
  bottomLinks?: FooterLink[];
};

const defaultColumns: FooterColumn[] = [
  {
    title: "Соискателям",
    links: [
      { label: "Найти работу", href: "#vacancies" },
      { label: "Разместить резюме", href: "#resume" },
      { label: "Каталог профессий", href: "#vacancies" },
      { label: "Советы по поиску", href: "#" },
    ],
  },
  {
    title: "Работодателям",
    links: [
      { label: "Разместить вакансию", href: "#" },
      { label: "Найти кандидатов", href: "#" },
      { label: "Тарифы", href: "#" },
      { label: "Поддержка", href: "#" },
    ],
  },
  {
    title: "MyJOB",
    links: [
      { label: "О проекте", href: "#" },
      { label: "Компании", href: "#" },
      { label: "Контакты", href: "#" },
      { label: "Помощь", href: "#" },
    ],
  },
];

const defaultBottomLinks: FooterLink[] = [
  { label: "Пользовательское соглашение", href: "#" },
  { label: "Политика конфиденциальности", href: "#" },
];

export function Footer({
  logoSrc = "/images/logo-by.png",
  logoAlt = "MyJOB",
  logoHref = "/",
  description = "Вакансии, компании и карьерные возможности для людей, на которых все держится.",
  columns = defaultColumns,
  copyright = "© 2026 MyJOB. Все права защищены.",
  bottomLinks = defaultBottomLinks,
}: FooterProps) {
  return (
    <section className="w-full bg-muted">
      <div className="container mx-auto py-16 lg:py-20">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center lg:justify-start">
                <a href={logoHref} className="inline-flex items-center">
                  <img
                    alt={logoAlt}
                    title={logoAlt}
                    className="h-7"
                    src={logoSrc}
                  />
                </a>
              </div>

              <p className="mt-4 max-w-sm text-sm font-medium text-muted-foreground">
                {description}
              </p>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold tracking-tight">
                  {col.title}
                </h3>

                <ul className="space-y-4 text-sm text-muted-foreground">
                  {col.links.map((link) => (
                    <li key={link.label} className="font-medium hover:text-primary">
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </footer>
      </div>

      <div className="border-t border-border/60 bg-[color-mix(in_oklch,var(--muted)_90%,var(--foreground)_10%)]">
        <div className="container mx-auto flex flex-col justify-between gap-4 py-4 text-xs font-medium text-muted-foreground md:flex-row md:items-center">
          <p>{copyright}</p>

          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {bottomLinks.map((link) => (
              <li key={link.label} className="underline hover:text-primary">
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
