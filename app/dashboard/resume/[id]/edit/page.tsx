import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResumeForm } from "@/components/resume/ResumeForm";

export const metadata: Metadata = {
  title: "Редактирование резюме | MyJOB",
};

export default function EditResumePage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Редактирование резюме
            </h1>
          </div>
        </div>

        <ResumeForm mode="edit" />
      </div>
    </div>
  );
}