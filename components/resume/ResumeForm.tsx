"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { createResume, updateResume } from "@/services/resume.service";
import type {
  ResumeFormData,
  Currency,
  EmploymentType,
  ExperienceItem,
  EducationItem,
  SkillItem,
  LanguageItem,
} from "@/types/resume";
import {
  RESUME_EMPLOYMENT_OPTIONS,
  RESUME_CURRENCY_OPTIONS,
} from "@/lib/enum-options";

const employmentOptions: { value: EmploymentType; label: string }[] =
  RESUME_EMPLOYMENT_OPTIONS.map((opt) => ({ value: opt.value as EmploymentType, label: opt.label }));

const skillLevels = [
  { value: "beginner", label: "Начальный" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" },
  { value: "expert", label: "Эксперт" },
];

const languageLevels = [
  { value: "a1", label: "A1 — Начальный" },
  { value: "a2", label: "A2 — Элементарный" },
  { value: "b1", label: "B1 — Средний" },
  { value: "b2", label: "B2 — Выше среднего" },
  { value: "c1", label: "C1 — Продвинутый" },
  { value: "c2", label: "C2 — В совершенстве" },
  { value: "native", label: "Родной" },
];

interface Props {
  initialData?: ResumeFormData;
  documentId?: string;
  mode?: "create" | "edit";
}

// Нормализация элементов: все ключи обязательны (контролируемые инпуты).
// Данные из Strapi могут не содержать часть полей -> value={undefined} ломает правку.
function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeExperience(items: ExperienceItem[] | null | undefined): ExperienceItem[] {
  return (Array.isArray(items) ? items : []).map((item) => ({
    company: item.company ?? "",
    position: item.position ?? "",
    startDate: toDateInputValue(item.startDate),
    endDate: toDateInputValue(item.endDate),
    current: item.current ?? false,
    description: item.description ?? "",
  }));
}

function normalizeEducation(items: EducationItem[] | null | undefined): EducationItem[] {
  return (Array.isArray(items) ? items : []).map((item) => ({
    institution: item.institution ?? "",
    degree: item.degree ?? "",
    specialty: item.specialty ?? "",
    startYear: item.startYear ?? new Date().getFullYear(),
    endYear: item.endYear ?? undefined,
  }));
}

function normalizeSkills(items: SkillItem[] | null | undefined): SkillItem[] {
  return (Array.isArray(items) ? items : []).map((item) => ({
    name: item.name ?? "",
    level: item.level ?? "intermediate",
  }));
}

function normalizeLanguages(items: LanguageItem[] | null | undefined): LanguageItem[] {
  return (Array.isArray(items) ? items : []).map((item) => ({
    language: item.language ?? "",
    level: item.level ?? "b1",
  }));
}

export function ResumeForm({
  initialData,
  documentId,
  mode = "create",
}: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultFormData: ResumeFormData = {
    title: initialData?.title || "",
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    email: initialData?.email || session?.user?.email || "",
    position: initialData?.position || "",
    salary: initialData?.salary || null,
    currency: initialData?.currency || "BYN",
    employmentType: initialData?.employmentType || RESUME_EMPLOYMENT_OPTIONS[0].value,
    location: initialData?.location || "",
    skills: normalizeSkills(initialData?.skills),
    experience: normalizeExperience(initialData?.experience),
    education: normalizeEducation(initialData?.education),
    languages: normalizeLanguages(initialData?.languages),
    about: initialData?.about || "",
    isPublished: initialData?.isPublished !== false,
  };

  const [formData, setFormData] = useState<ResumeFormData>(defaultFormData);

  function updateField<K extends keyof ResumeFormData>(
    key: K,
    value: ResumeFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  // Experience handlers
  function addExperience() {
    const newItem: ExperienceItem = {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, newItem],
    }));
  }

  function updateExperience(index: number, field: string, value: string | boolean) {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  }

  function removeExperience(index: number) {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  // Education handlers
  function addEducation() {
    const newItem: EducationItem = {
      institution: "",
      degree: "",
      specialty: "",
      startYear: new Date().getFullYear(),
    };
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, newItem],
    }));
  }

  function updateEducation(index: number, field: string, value: string | number) {
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  }

  function removeEducation(index: number) {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  // Skills handlers
  function addSkill() {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", level: "intermediate" as const }],
    }));
  }

  function updateSkill(index: number, field: string, value: string) {
    setFormData((prev) => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, skills: updated };
    });
  }

  function removeSkill(index: number) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  // Languages handlers
  function addLanguage() {
    setFormData((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        { language: "", level: "b1" as const },
      ],
    }));
  }

  function updateLanguage(index: number, field: string, value: string) {
    setFormData((prev) => {
      const updated = [...prev.languages];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, languages: updated };
    });
  }

  function removeLanguage(index: number) {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.lastName || !formData.position) {
      setError("Заполните обязательные поля: имя, фамилия и желаемая должность");
      return;
    }

    if (!session?.user?.id) {
      setError("Необходимо авторизоваться");
      return;
    }

    setLoading(true);

    try {
      if (mode === "edit" && documentId) {
        await updateResume(documentId, formData);
      } else {
        await createResume(formData);
      }
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить резюме. Попробуйте позже.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Личная информация</h2>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Имя <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Иван"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Фамилия <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Иванов"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="ivan@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+375 (29) 123-45-67"
            />
          </div>
        </div>
      </div>

      {/* Desired Position */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Желаемая должность</h2>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="position">
              Должность <span className="text-destructive">*</span>
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => updateField("position", e.target.value)}
              placeholder="Frontend-разработчик"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Город / Регион</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Минск"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">
              Тип занятости <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) =>
                updateField("employmentType", value as EmploymentType)
              }
            >
              <SelectTrigger id="employmentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employmentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="salary">Желаемая ЗП</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary || ""}
                onChange={(e) =>
                  updateField(
                    "salary",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Валюта</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  updateField("currency", value as Currency)
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESUME_CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Опыт работы</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExperience}
          >
            <Plus className="mr-1 size-3.5" />
            Добавить
          </Button>
        </div>
        <Separator />

        {formData.experience.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Добавьте ваш опыт работы
          </p>
        )}

        {formData.experience.map((item, index) => (
          <div key={index} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Место работы {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-destructive"
                onClick={() => removeExperience(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Компания"
                value={item.company}
                onChange={(e) =>
                  updateExperience(index, "company", e.target.value)
                }
              />
              <Input
                placeholder="Должность"
                value={item.position}
                onChange={(e) =>
                  updateExperience(index, "position", e.target.value)
                }
              />
              <Input
                type="date"
                placeholder="Начало"
                value={item.startDate}
                onChange={(e) =>
                  updateExperience(index, "startDate", e.target.value)
                }
              />
              <Input
                type="date"
                placeholder="Окончание"
                value={item.endDate || ""}
                onChange={(e) =>
                  updateExperience(index, "endDate", e.target.value)
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`current-${index}`}
                checked={item.current || false}
                onChange={(e) => {
                  updateExperience(index, "current", e.target.checked);
                  if (e.target.checked) updateExperience(index, "endDate", "");
                }}
                className="rounded border-gray-300"
              />
              <label
                htmlFor={`current-${index}`}
                className="text-sm text-muted-foreground"
              >
                По настоящее время
              </label>
            </div>

            <Textarea
              placeholder="Описание обязанностей и достижений"
              value={item.description}
              onChange={(e) =>
                updateExperience(index, "description", e.target.value)
              }
              rows={2}
            />
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Образование</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEducation}
          >
            <Plus className="mr-1 size-3.5" />
            Добавить
          </Button>
        </div>
        <Separator />

        {formData.education.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Добавьте ваше образование
          </p>
        )}

        {formData.education.map((item, index) => (
          <div key={index} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Образование {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-destructive"
                onClick={() => removeEducation(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Учебное заведение"
                value={item.institution}
                onChange={(e) =>
                  updateEducation(index, "institution", e.target.value)
                }
              />
              <Input
                placeholder="Степень"
                value={item.degree}
                onChange={(e) =>
                  updateEducation(index, "degree", e.target.value)
                }
              />
              <Input
                placeholder="Специальность"
                value={item.specialty}
                onChange={(e) =>
                  updateEducation(index, "specialty", e.target.value)
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Год начала"
                  value={item.startYear}
                  onChange={(e) =>
                    updateEducation(index, "startYear", Number(e.target.value))
                  }
                />
                <Input
                  type="number"
                  placeholder="Год окончания"
                  value={item.endYear || ""}
                  onChange={(e) =>
                    updateEducation(
                      index,
                      "endYear",
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Навыки</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSkill}
          >
            <Plus className="mr-1 size-3.5" />
            Добавить
          </Button>
        </div>
        <Separator />

        {formData.skills.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Добавьте ваши навыки
          </p>
        )}

        {formData.skills.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <Input
              placeholder="Название навыка"
              value={item.name}
              onChange={(e) => updateSkill(index, "name", e.target.value)}
              className="flex-1"
            />
            <div className="w-40 shrink-0">
              <Select
                value={item.level}
                onValueChange={(value) => updateSkill(index, "level", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive shrink-0"
              onClick={() => removeSkill(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Языки</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLanguage}
          >
            <Plus className="mr-1 size-3.5" />
            Добавить
          </Button>
        </div>
        <Separator />

        {formData.languages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Добавьте языки, которыми владеете
          </p>
        )}

        {formData.languages.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <Input
              placeholder="Язык"
              value={item.language}
              onChange={(e) => updateLanguage(index, "language", e.target.value)}
              className="flex-1"
            />
            <div className="w-48 shrink-0">
              <Select
                value={item.level}
                onValueChange={(value) => updateLanguage(index, "level", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive shrink-0"
              onClick={() => removeLanguage(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* About */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">О себе</h2>
        <Separator />

        <Textarea
          value={formData.about}
          onChange={(e) => updateField("about", e.target.value)}
          placeholder="Расскажите о себе, своих целях и достижениях..."
          rows={5}
        />
      </div>

      {/* Publish toggle */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Публикация</h2>
        <Separator />
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-4">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) => updateField("isPublished", e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-foreground">
            Опубликовать резюме
          </label>
          <span className="ml-auto text-xs text-muted-foreground">
            {formData.isPublished
              ? "Резюме видно работодателям в каталоге"
              : "Резюме скрыто из каталога"}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить резюме"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}