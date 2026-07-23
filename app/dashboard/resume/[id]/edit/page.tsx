import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { getResumeByDocumentId } from "@/services/resume.service";

export const metadata: Metadata = {
  title: "Редактирование резюме | MyJOB",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditResumePage({ params }: Props) {
  const { id } = await params;
  const resume = await getResumeByDocumentId(id);

  if (!resume) {
    notFound();
  }

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

        <ResumeForm
          mode="edit"
          documentId={id}
          initialData={{
            title: resume.title,
            firstName: resume.firstName,
            lastName: resume.lastName,
            phone: resume.phone,
            email: resume.email,
            position: resume.position,
            salary: resume.salary,
            currency: resume.currency,
            employmentType: resume.employmentType,
            location: resume.location,
            skills: resume.skills,
            experience: resume.experience,
            education: resume.education,
            languages: resume.languages,
            about: resume.about,
            isPublished: resume.isPublished,
          }}
        />
      </div>
    </div>
  );
}