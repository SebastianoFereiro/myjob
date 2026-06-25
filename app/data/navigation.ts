export type NavigationItem = {
  slug: string;
  name: string;
};

export const navigationItems: NavigationItem[] = [
 
  { name: "Вакансии", slug: "/jobs" },
 
  { name: "Компании", slug: "/companies" },
   { name: "Статьи", slug: "/blog" },
  { name: "Контакты", slug: "/contacts" },
];
