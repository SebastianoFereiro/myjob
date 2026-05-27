import type { Metadata } from "next";

import Header from "@/components/header";
import { Footer } from "@/components/footer";



import { navigationItems } from "@/app/data/navigation";
import CompanyListingPage from "@/components/jobs/job-company-list";

export const metadata: Metadata = {
  title: "Компании | MyJOB",
  description:
    "Каталог компаний с открытыми вакансиями, фильтрацией и поиском.",
};

export default function CompaniesPage() {
  return (
    <>
      <Header navigationData={navigationItems} />

      <main className="flex-1">
        <CompanyListingPage />
      </main>

      <Footer />
    </>
  );
}