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
    title: "Product",
    links: [
      { label: "Overview", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Marketplace", href: "#" },
      { label: "Features", href: "#" },
      { label: "Integrations", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Team", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Status", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guides", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Sales", href: "#" },
      { label: "Advertise", href: "#" },
    ],
  },
];

const defaultBottomLinks: FooterLink[] = [
  { label: "Terms and Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

export function Footer({
  logoSrc = "/images/logo/shadcnblocks-logo-word.svg",
  logoAlt = "Logo",
  logoHref = "/",
  description = "Finely crafted blocks built with Shadcn UI.",
  columns = defaultColumns,
  copyright = "© 2024. All rights reserved.",
  bottomLinks = defaultBottomLinks,
}: FooterProps) {
  return (
    <section className="w-full bg-muted">
      <div className="container mx-auto py-16 lg:py-20">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {/* Brand */}
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center lg:justify-start">
                <a href={logoHref} className="inline-flex items-center">
                  <img
                    alt={logoAlt}
                    title={logoAlt}
                    className="h-7 dark:invert"
                    src={logoSrc}
                  />
                </a>
              </div>

              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Columns */}
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold tracking-tight">
                  {col.title}
                </h3>

                <ul className="space-y-4 text-sm text-muted-foreground">
                  {col.links.map((l) => (
                    <li
                      key={l.label}
                      className="font-medium hover:text-primary"
                    >
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </footer>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60 bg-[color-mix(in_oklch,var(--muted)_90%,var(--foreground)_10%)]">
        <div className="container mx-auto flex flex-col justify-between gap-4 py-4 text-xs font-medium text-muted-foreground md:flex-row md:items-center">
          <p>{copyright}</p>

          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {bottomLinks.map((l) => (
              <li key={l.label} className="underline hover:text-primary">
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
