export type NavigationItem = {
  title: string;
  href: string;
};

export const navigationItems: NavigationItem[] = [
  { title: "Главная", href: "/" },
  { title: "Вакансии", href: "/jobs" },
  { title: "Компании", href: "/companies" },
  { title: "Контакты", href: "/contacts" },
];
