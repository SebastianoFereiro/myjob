'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';
import { createCv } from '@/services/cv.service';
import type {
  CvVacancyFormData,
  CvEmploymentType,
  CvLevelJob,
  CvExperienceJob,
  CvEducationJob,
  CvCurrency,
  CompanyRef,
  CategoryRef,
} from '@/types/cv';

const employmentOptions: { value: CvEmploymentType; label: string }[] = [
  { value: 'Полная занятость', label: 'Полная занятость' },
  { value: 'Частичная занятость', label: 'Частичная занятость' },
  { value: 'Проектная работа', label: 'Проектная работа' },
  { value: 'Стажировка', label: 'Стажировка' },
  { value: 'Удаленно', label: 'Удаленно' },
];

const levelOptions: { value: CvLevelJob; label: string }[] = [
  { value: 'Топ-менеджмент', label: 'Топ-менеджмент' },
  { value: 'Руководители среднего звена', label: 'Руководители среднего звена' },
  { value: 'Специалисты', label: 'Специалисты' },
  { value: 'Рабочий персонал', label: 'Рабочий персонал' },
  { value: 'Начинающие специалисты', label: 'Начинающие специалисты' },
  { value: 'Стажеры', label: 'Стажеры' },
];

const experienceOptions: { value: CvExperienceJob; label: string }[] = [
  { value: 'Нет опыта', label: 'Нет опыта' },
  { value: 'От 1 года до 3 лет', label: 'От 1 года до 3 лет' },
  { value: 'От 3 до 5 лет', label: 'От 3 до 5 лет' },
  { value: 'Более 5 лет', label: 'Более 5 лет' },
];

const educationOptions: { value: CvEducationJob; label: string }[] = [
  { value: 'Не требуется', label: 'Не требуется' },
  { value: 'Базовое', label: 'Базовое' },
  { value: 'Среднее', label: 'Среднее' },
  { value: 'Средне специальное', label: 'Средне специальное' },
  { value: 'Профессионально-техническое', label: 'Профессионально-техническое' },
  { value: 'Высшее', label: 'Высшее' },
];

interface Props {
  company?: CompanyRef;
}

export function CvForm({ company: initialCompany }: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [company] = useState<CompanyRef | null>(
    initialCompany ?? ((session?.user as { company?: CompanyRef } | undefined)?.company ?? null),
  );
  if (!company) return <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [formData, setFormData] = useState<CvVacancyFormData>({
    title: '',
    position: '',
    description: '',
    requirements: '',
    conditions: '',
    salaryFrom: null,
    salaryTo: null,
    currency: 'BYN',
    employmentType: '',
    location: '',
    city: '',
    level_job: '',
    experience_job: '',
    education_job: '',
    deadline: '',
    isActive: true,
    companyDocumentId: company!.documentId,
    categoryDocumentId: null,
  });

  useEffect(() => {
    async function loadRefs() {
      try {
        const res = await fetch('/api/strapi/categories?pagination[pageSize]=100');
        if (res.ok) {
          const json = await res.json();
          setCategories(
            (json.data || []).map((r: Record<string, unknown>) => ({
              id: (r as { id?: number }).id || 0,
              documentId: (r as { documentId?: string }).documentId || '',
              name: (r as { name?: string }).name || (r as { title?: string }).title || '',
              slug: (r as { slug?: string }).slug || '',
            }) as CategoryRef),
          );
        }
      } catch {
        // ignore
      } finally {
        setLoadingRefs(false);
      }
    }

    loadRefs();
  }, []);

  function updateField<K extends keyof CvVacancyFormData>(key: K, value: CvVacancyFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description) {
      setError('Заполните обязательные поля: название и описание вакансии');
      return;
    }

    if (!formData.companyDocumentId) {
      setError('Компания не найдена. Обратитесь в поддержку.');
      return;
    }

    if (!session?.user?.id) {
      setError('Необходимо авторизоваться');
      return;
    }

    setLoading(true);

    try {
      const cv = await createCv(formData);
      router.push(`/company/cvs/${cv.documentId}/edit`);
      router.refresh();
    } catch {
      setError('Не удалось создать вакансию. Попробуйте позже.');
      setLoading(false);
    }
  }

  if (loadingRefs) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company & Category */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Компания и категория</h2>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Компания <span className="text-destructive">*</span>
            </Label>
            <div
              id="companyName"
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
            >
              <Building2 className="size-4 shrink-0" />
              <span className="font-medium text-foreground">
                {company!.name || 'Загрузка...'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Компания привязана к вашему аккаунту и не может быть изменена
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Категория</Label>
            <Select
              value={formData.categoryDocumentId || ''}
              onValueChange={(value) => updateField('categoryDocumentId', value || null)}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.documentId || cat.id} value={cat.documentId || String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Основная информация</h2>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">
              Название вакансии <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Менеджер по продажам"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Должность</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => updateField('position', e.target.value)}
              placeholder="Менеджер по продажам"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Город / Регион</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Минск"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Город проживания</Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Минск"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">Тип занятости</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) => updateField('employmentType', value as CvEmploymentType)}
            >
              <SelectTrigger id="employmentType">
                <SelectValue placeholder="Выберите тип занятости" />
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

          <div className="space-y-2">
            <Label htmlFor="level_job">Уровень должности</Label>
            <Select
              value={formData.level_job || ''}
              onValueChange={(value) => updateField('level_job', value as CvLevelJob)}
            >
              <SelectTrigger id="level_job">
                <SelectValue placeholder="Выберите уровень" />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_job">Опыт работы</Label>
            <Select
              value={formData.experience_job || ''}
              onValueChange={(value) => updateField('experience_job', value as CvExperienceJob)}
            >
              <SelectTrigger id="experience_job">
                <SelectValue placeholder="Выберите опыт" />
              </SelectTrigger>
              <SelectContent>
                {experienceOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education_job">Образование</Label>
            <Select
              value={formData.education_job || ''}
              onValueChange={(value) => updateField('education_job', value as CvEducationJob)}
            >
              <SelectTrigger id="education_job">
                <SelectValue placeholder="Выберите образование" />
              </SelectTrigger>
              <SelectContent>
                {educationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Salary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="salaryFrom">Зарплата от</Label>
            <Input
              id="salaryFrom"
              type="number"
              value={formData.salaryFrom ?? ''}
              onChange={(e) =>
                updateField('salaryFrom', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryTo">Зарплата до</Label>
            <Input
              id="salaryTo"
              type="number"
              value={formData.salaryTo ?? ''}
              onChange={(e) =>
                updateField('salaryTo', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="3000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Валюта</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => updateField('currency', value as CvCurrency)}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Валюта" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BYN">BYN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Завершение</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline || ''}
              onChange={(e) => updateField('deadline', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Описание</h2>
        <Separator />

        <div className="space-y-2">
          <Label htmlFor="description">
            Описание вакансии <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Опишите обязанности, задачи..."
            rows={6}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="requirements">Требования</Label>
            <Textarea
              id="requirements"
              value={formData.requirements || ''}
              onChange={(e) => updateField('requirements', e.target.value)}
              placeholder="Перечислите требования к кандидату..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Условия</Label>
            <Textarea
              id="conditions"
              value={formData.conditions || ''}
              onChange={(e) => updateField('conditions', e.target.value)}
              placeholder="Опишите условия работы и бонусы..."
              rows={5}
            />
          </div>
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
              Публикация...
            </>
          ) : (
            'Опубликовать вакансию'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
