export type { BlogPost, Author, Category } from '../types/strapi-collections';

export interface BlogArticle {
  id: string;
  slug: string;
  imageUrl?: string;
  imageAlt?: string;
  title: string;
  publishedAt: string;
  author: string;
  excerpt?: string;
  content: string;
}
