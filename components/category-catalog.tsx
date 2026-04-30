import * as React from "react";

type CategoryLayout = "default" | "wide" | "tall";

export type CategoryItem = {
  title: string;
  meta?: string;
  image: string;
  alt?: string;
  href?: string;
  layout?: CategoryLayout;
};

type CategoryCatalogProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: CategoryItem[];
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const layoutClasses: Record<CategoryLayout, string> = {
  default: "",
  wide: "lg:col-span-2",
  tall: "lg:row-span-2",
};

const defaultItems: CategoryItem[] = [
  {
    title: "Gaming Controller",
    meta: "$199",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/img7.jpeg",
    layout: "default",
  },
  {
    title: "Wireless Headphones",
    meta: "$189",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/img6.jpeg",
    layout: "wide",
  },
  {
    title: "Smart Watch",
    meta: "$249",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/img11.jpeg",
    layout: "tall",
  },
  {
    title: "Bluetooth Speaker",
    meta: "$179",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/img14.jpeg",
    layout: "wide",
  },
  {
    title: "Mechanical Keyboard",
    meta: "$219",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/img13.jpeg",
    layout: "default",
  },
];

function CategoryCard({ item }: { item: CategoryItem }) {
  const layout = item.layout ?? "default";

  const cardClassName = cx(
    "group/card relative h-60 w-full overflow-hidden rounded-3xl bg-transparent md:h-[17.5rem] lg:h-full",
    layoutClasses[layout],
  );

  const content = (
    <div className="relative h-full w-full">
      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-black/40 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 group-focus-within/card:opacity-100" />

      {/* Image */}
      <div className="relative h-full w-full bg-muted">
        <img
          src={item.image}
          alt={item.alt ?? item.title}
          width={1000}
          height={1000}
          className="h-full w-full scale-[1.15] object-cover transition-transform duration-700 group-hover/card:scale-105 group-focus-within/card:scale-105"
        />
      </div>

      {/* Text */}
      <div className="absolute bottom-4 left-4 z-20 translate-y-3 text-white opacity-0 transition-all duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100">
        <p className="text-xl font-bold">{item.title}</p>
        {item.meta ? <p className="text-sm font-normal">{item.meta}</p> : null}
      </div>
    </div>
  );

  if (item.href) {
    return (
      <a href={item.href} className={cardClassName} aria-label={item.title}>
        {content}
      </a>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

export function CategoryCatalog({
  eyebrow = "Разделы",
  title = "Exclusive shadcnblocks",
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,",
  items = defaultItems,
}: CategoryCatalogProps) {
  return (
    <section className="relative h-full w-full overflow-hidden py-16">
      <div className="container relative flex h-full w-full flex-col items-center justify-center">
        <div className="relative z-10 flex flex-col items-center justify-center gap-5">
          {/* <p className="text-center text-muted-foreground">{description}</p> */}
        </div>

        <div className="relative mt-[34px] grid w-full grid-cols-1 justify-center gap-[10px] sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[17.5rem]">
          {items.map((item) => (
            <CategoryCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
