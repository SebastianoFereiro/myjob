import * as React from "react";

export type BlogPost = {
  href: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  date: string;
  author: string;
  excerpt?: string;
};

type BlogLatestTechProps = {
  title?: string;
  posts: BlogPost[];
};

function Meta({ date, author }: { date: string; author: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-1 text-sm text-muted-foreground">
      <time>{date}</time><span aria-hidden="true">·</span><span>{author}</span>
    </div>
  );
}

export function BlogLatestTech({
  title = "Советы для поиска работы",
  posts,
}: BlogLatestTechProps) {
  const [featured, ...rest] = posts;

  return (
    <section className="py-16 w-full">
      <div className="container">
        <h2 className="mb-6 text-4xl font-medium tracking-tight text-pretty text-foreground md:text-5xl lg:text-6xl">
          {title}
        </h2>

        <div className="xs:grid-cols-1 mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured ? (
            <div className="relative md:row-span-2 lg:col-span-2">
              <a
                href={featured.href}
                className="block h-fit rounded-lg p-3 md:top-0"
              >
                <img
                  alt={featured.imageAlt}
                  src={featured.imageSrc}
                  className="h-48 w-full rounded-lg object-cover hover:opacity-80 md:h-80 lg:h-96"
                />
                <div className="mt-5 text-left">
                  <Meta date={featured.date} author={featured.author} />
                  <h3 className="text-lg md:text-3xl lg:text-4xl">
                    {featured.title}
                  </h3>
                  {featured.excerpt ? (
                    <p className="mt-4 text-muted-foreground">
                      {featured.excerpt}
                    </p>
                  ) : null}
                </div>
              </a>
            </div>
          ) : null}

          {rest.map((post) => (
            <a key={post.title} href={post.href} className="rounded-lg p-3">
              <img
                alt={post.imageAlt}
                src={post.imageSrc}
                className="h-48 w-full rounded-lg object-cover hover:opacity-80"
              />
              <div className="mt-5 text-left">
                <Meta date={post.date} author={post.author} />
                <h3 className="text-lg">{post.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
