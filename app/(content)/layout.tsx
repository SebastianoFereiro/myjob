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
    <html lang="ru-BY" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
