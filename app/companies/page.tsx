import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import Header from '@/components/header';
import { Footer } from '@/components/footer';
import { navigationItems } from '@/app/data/navigation';
import { getCompanies } from '@/services/companies.service';
import CompanyListingClient from './CompanyListingClient';

export const metadata: Metadata = {
  title: 'Компании | MyJOB',
  description: 'Каталог компаний с открытыми вакансиями, фильтрацией и поиском.',
};

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <>
      <Header navigationData={navigationItems} />
      <main className="flex-1">
        <CompanyListingClient companies={companies} />
      </main>
      <Footer />
    </>
  );
}
