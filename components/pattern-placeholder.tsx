import { Button } from "@/components/ui/button";
import { ToolsStackSection } from "./tools-stack-section";
import { Feature154 } from "./feature-list";
import { BlogPost, BlogLatestTech } from "./blog-latest-tech";
import { CategoryCatalog } from "./category-catalog";
import { SearchFilters } from "./jobs/search-filters";

const posts: BlogPost[] = [
  {
    href: "#",
    imageSrc: "/images/blog-1.png",
    imageAlt: "Команда обсуждает рабочие задачи",
    title: "Как быстро откликаться на вакансии и не терять хорошие предложения",
    date: "26 мая 2026",
    author: "MyJOB",
    excerpt:
      "Короткий чек-лист для соискателей: резюме, сопроводительное письмо, фильтры поиска и подписка на новые вакансии.",
  },
  {
    href: "#",
    imageSrc: "/images/blog-1.png",
    imageAlt: "Рабочее место специалиста",
    title: "Какие профессии чаще всего ищут работодатели",
    date: "24 мая 2026",
    author: "Редакция",
  },
  {
    href: "#",
    imageSrc: "/images/blog-1.png",
    imageAlt: "Собеседование кандидата",
    title: "Как подготовиться к первому разговору с рекрутером",
    date: "22 мая 2026",
    author: "Редакция",
  },
  {
    href: "#",
    imageSrc: "/images/blog-1.png",
    imageAlt: "Работа с документами",
    title: "Что важно проверить в описании вакансии",
    date: "20 мая 2026",
    author: "MyJOB",
  },
  {
    href: "#",
    imageSrc: "/images/blog-1.png",
    imageAlt: "Команда в офисе",
    title: "Как работодателю написать понятную вакансию",
    date: "18 мая 2026",
    author: "MyJOB",
  },
];

const PatternPlaceholder = () => {
  return (
    <div className="relative z-10">
      <div className="container py-28 md:py-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-medium tracking-tight text-pretty text-foreground md:text-5xl lg:text-6xl">
              Работа для людей, на которых все держится.
            </h1>
            <p className="mx-auto max-w-2xl font-light tracking-tighter text-pretty text-muted-foreground md:text-lg lg:text-xl">
              202 актуальные вакансии каждый день.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <a href="#vacancies">Искать работу</a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="#resume">Разместить резюме</a>
            </Button>
          </div>
          <SearchFilters />
          <CategoryCatalog />
          <Feature154 />
          <ToolsStackSection />
          <BlogLatestTech posts={posts} />
        </div>
      </div>
    </div>
  );
};

export { PatternPlaceholder };
