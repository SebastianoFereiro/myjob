import { requireRole } from '@/lib/auth-guard';

export default async function SubmitResumeLayout({ children }: { children: React.ReactNode }) {
  await requireRole('user');
  return <>{children}</>;
}
