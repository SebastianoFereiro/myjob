import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResumeForm } from "@/components/resume/ResumeForm";

export const metadata: Metadata = {
  title: "Создание резюме | MyJOB",
  description: "Заполните форму, чтобы создать резюме",
};

export default function SubmitResumePage() {
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
              Создание резюме
            </h1>
            <p className="mt-2 text-muted-foreground">
              Заполните форму ниже, чтобы создать резюме. Работодатели увидят его
              в каталоге.
            </p>
          </div>
        </div>

        <ResumeForm />
      </div>
    </div>
  );
}