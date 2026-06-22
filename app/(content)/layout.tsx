import type { Metadata } from 'next';
import Header from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'MyJOB',
  description: 'MyJOB - вакансии, компании и карьерные возможности в Беларуси.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
