import { Metadata } from 'next';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CvList } from './CvList';

export const metadata: Metadata = {
  title: 'Мои вакансии | MyJOB',
  description: 'Управляйте вакансиями вашей компании на MyJOB',
};

export default function CompanyDashboardPage() {
  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Мои вакансии</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управляйте вакансиями вашей компании, создавайте новые.
          </p>
        </div>

        <CvList />
      </div>
    </DashboardLayout>
  );
}
