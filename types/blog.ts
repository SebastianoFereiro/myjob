export type BlogArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  author: string;
  imageUrl: string;
  imageAlt: string;
  publishedAt: string;
};

