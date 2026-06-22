import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { getFooterPages } from "@/services/pages.service";
import type { Page, FooterGroup } from "@/types/strapi-collections";

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
  copyright?: string;
};

// Slug -> href mapping for footer-only pages (no public URL)
const footerHrefMap: Record<string, string> = {
  "find-job": "/jobs",
  "submit-resume": "/resume/submit",
  professions: "/categories",
  tips: "/help",
  "post-vacancy": "/company/dashboard",
  "find-candidates": "/companies",
  support: "/contacts",
  companies: "/companies",
  contacts: "/contacts",
};

function getPageHref(page: Page): string {
  return footerHrefMap[page.slug] ?? `/${page.slug}`;
}

const groupLabels: Record<Exclude<FooterGroup, "none">, string> = {
  seekers: "Соискателям",
  employers: "Работодателям",
  company: "MyJOB",
  bottom: "",
};

function groupPages(pages: Page[]): FooterColumn[] {
  const groups: Record<string, Page[]> = {};

  for (const page of pages) {
    const group = page.footer_group;
    if (group === "none") continue;
    if (!groups[group]) groups[group] = [];
    groups[group].push(page);
  }

  const columns: FooterColumn[] = [];

  // Non-bottom groups
  for (const group of ["seekers", "employers", "company"] as const) {
    const items = groups[group];
    if (!items?.length) continue;
    columns.push({
      title: groupLabels[group],
      links: items.map((p) => ({
        label: p.footer_label ?? p.title,
        href: getPageHref(p),
      })),
    });
  }

  return columns;
}

function getBottomLinks(pages: Page[]): FooterLink[] {
  return (pages
    .filter((p) => p.footer_group === "bottom")
    .sort((a, b) => (a.footer_order ?? 0) - (b.footer_order ?? 0))
    .map((p) => ({
      label: p.footer_label ?? p.title,
      href: getPageHref(p),
    })));
}

export async function Footer({
  logoSrc = "/images/logo-by.png",
  logoAlt = "MyJOB",
  logoHref = "/",
  description = "Вакансии, компании и карьерные возможности для людей, на которых все держится.",
  copyright = "© 2026 MyJOB. Все права защищены.",
}: FooterProps) {
  const pages = await getFooterPages();
  const columns = groupPages(pages);
  const bottomLinks = getBottomLinks(pages);

  return (
    <section className="w-full bg-muted">
      <div className="container mx-auto py-16 lg:py-20">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center lg:justify-start">
                <a href={logoHref} className="inline-flex items-center">
                  <Image
                    alt={logoAlt}
                    title={logoAlt}
                    className="h-7 w-auto"
                    src={logoSrc}
                    width={161}
                    height={26}
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
                      <Link href={link.href}>{link.label}</Link>
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

          {bottomLinks.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {bottomLinks.map((link) => (
                <li key={link.label} className="underline hover:text-primary">
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
