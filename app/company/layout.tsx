import { requireRole } from '@/lib/auth-guard';

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  await requireRole('company');
  return <>{children}</>;
}
