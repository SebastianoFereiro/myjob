import * as React from "react";

import { getCategoriesWithCounts } from "@/services/categories.service";

type CategoryLayout = "default" | "wide" | "tall";

export type CategoryItem = {
  title: string;
  meta?: string;
  image: string;
  alt?: string;
  href?: string;
  slug?: string;
  layout?: CategoryLayout;
};

type CategoryCatalogProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: CategoryItem[];
  activeCategory?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const layoutClasses: Record<CategoryLayout, string> = {
  default: "",
  wide: "lg:col-span-2",
  tall: "lg:row-span-2",
};

const layouts: CategoryLayout[] = ["default", "wide", "tall", "wide", "default", "default"];

function mapCategoriesToItems(
  categories: Awaited<ReturnType<typeof getCategoriesWithCounts>>,
) {
  return categories
    .map((category, index) => ({
      title: category.name,
      meta: `${category.count || 0} вакансий`,
      image: category.imageUrl || `/cat/cat-${index % 5}.png`,
      alt: `Раздел ${category.name}`,
      href: `/jobs?category=${category.slug}#vacancies`,
      slug: category.slug,
      layout: layouts[index] || "default",
    }))
    .slice(0, 6);
}

function CategoryCard({
  item,
  active,
}: {
  item: CategoryItem;
  active: boolean;
}) {
  const layout = item.layout ?? "default";

  const cardClassName = cx(
    "group/card relative h-60 w-full overflow-hidden rounded-3xl bg-transparent md:h-[17.5rem] lg:h-full",
    active && "ring-4 ring-primary/70 ring-offset-2 ring-offset-background",
    layoutClasses[layout],
  );

  const content = (
    <div className="relative h-full w-full">
      <div
        className={cx(
          "absolute inset-0 z-10 bg-black/40 transition-opacity duration-500 group-hover/card:opacity-100 group-focus-within/card:opacity-100",
          active ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="relative h-full w-full bg-muted">
        <img
          src={item.image}
          alt={item.alt ?? item.title}
          width={1000}
          height={1000}
          className="h-full w-full scale-[1.15] object-cover transition-transform duration-700 group-hover/card:scale-105 group-focus-within/card:scale-105"
        />
      </div>

      <div
        className={cx(
          "absolute bottom-4 left-4 z-20 text-white transition-all duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100",
          active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <p className="text-xl font-bold">{item.title}</p>
        {item.meta ? <p className="text-sm font-normal">{item.meta}</p> : null}
      </div>
    </div>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className={cardClassName}
        aria-current={active ? "true" : undefined}
        aria-label={`Показать вакансии: ${item.title}`}
      >
        {content}
      </a>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

export async function CategoryCatalog({
  eyebrow = "Разделы",
  title = "Популярные направления",
  description = "Выберите направление, чтобы сразу отфильтровать список вакансий ниже.",
  items,
  activeCategory,
}: CategoryCatalogProps) {
  const catalogItems = items || mapCategoriesToItems(await getCategoriesWithCounts());

  return (
    <section className="relative h-full w-full overflow-hidden py-16">
      <div className="container relative flex h-full w-full flex-col items-center justify-center">
        <div className="relative z-10 flex max-w-3xl flex-col items-center justify-center gap-5 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-pretty text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="relative mt-[34px] grid w-full grid-cols-1 justify-center gap-[10px] sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[17.5rem]">
          {catalogItems.map((item) => (
            <CategoryCard
              key={item.title}
              item={item}
              active={Boolean(item.slug && item.slug === activeCategory)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
