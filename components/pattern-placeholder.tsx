import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeroSection from "./hero-section-01";
import { ToolsStackSection } from "./tools-stack-section";
import { ProductList1 } from "./product-list1";
import { Feature154 } from "./feature-list";
import { BlogPost, BlogLatestTech } from "./blog-latest-tech";
import { CategoryCatalog } from "./category-catalog";

const posts: BlogPost[] = [
  {
    href: "#",
    imageSrc:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    imageAlt:
      "The Future of AI: How Machine Learning is Transforming Industries",
    title: "The Future of AI: How Machine Learning is Transforming Industries",
    date: "June 15, 2024",
    author: "Alex Johnson",
    excerpt:
      "Explore how artificial intelligence and machine learning technologies are revolutionizing various industries, from healthcare to manufacturing, and learn about the latest innovations shaping our future.",
  },
  {
    href: "#",
    imageSrc:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    imageAlt: "Principles of Minimalist Design: Less is More in Modern UX/UI",
    title: "Principles of Minimalist Design: Less is More in Modern UX/UI",
    date: "June 12, 2024",
    author: "Maya Patel",
  },
  {
    href: "#",
    imageSrc:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    imageAlt:
      "Remote Work Revolution: How Companies are Adapting to the New Normal",
    title:
      "Remote Work Revolution: How Companies are Adapting to the New Normal",
    date: "June 10, 2024",
    author: "David Chen",
  },
  {
    href: "#",
    imageSrc:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    imageAlt: "Building Scalable Applications with Microservices Architecture",
    title: "Building Scalable Applications with Microservices Architecture",
    date: "June 8, 2024",
    author: "Sarah Williams",
  },
  {
    href: "#",
    imageSrc:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    imageAlt: "Content Marketing Strategies That Drive Organic Traffic in 2024",
    title: "Content Marketing Strategies That Drive Organic Traffic in 2024",
    date: "June 5, 2024",
    author: "James Rodriguez",
  },
];

const PatternPlaceholder = () => {
  return (
    <div className="relative z-10">
      <div className="container py-28 md:py-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          {/* <Badge variant="default">MyJOB.BY</Badge> */}
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-medium tracking-tight text-pretty text-foreground md:text-5xl lg:text-6xl">
              Работа для людей, на которых все держится.
            </h1>
            <p className="mx-auto max-w-2xl font-light tracking-tighter text-pretty text-muted-foreground md:text-lg lg:text-xl">
              202 актуальные вакансии каждый день.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button>Искать работу</Button>
            <Button variant="secondary">Разместить резюме</Button>
          </div>
          <CategoryCatalog />
          {/* <ProductList1 /> */}
          <Feature154 />
          <ToolsStackSection />
          <BlogLatestTech posts={posts} />
        </div>
      </div>
    </div>
  );
};

export { PatternPlaceholder };
