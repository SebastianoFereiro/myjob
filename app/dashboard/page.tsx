import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResumeList } from "./ResumeList";

export const metadata: Metadata = {
  title: "Мои резюме | MyJOB",
  description: "Управляйте своими резюме на MyJOB",
};

export default function DashboardPage() {
  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Мои резюме
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Управляйте своими резюме, создавайте новые и скачивайте в PDF.
            </p>
          </div>
        </div>

        <ResumeList />
      </div>
    </DashboardLayout>
  );
}