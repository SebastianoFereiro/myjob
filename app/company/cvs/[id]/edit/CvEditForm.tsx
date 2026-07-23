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
import { updateCv } from '@/services/cv.service';
import type {
  CvVacancy,
  CvVacancyFormData,
  CvEmploymentType,
  CvLevelJob,
  CvExperienceJob,
  CvEducationJob,
  CvCurrency,
  CategoryRef,
} from '@/types/cv';
import type { CityRef } from '@/types/strapi-collections';

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
  cv: CvVacancy;
  categories: CategoryRef[];
}

export function CvEditForm({ cv, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<CityRef[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CvVacancyFormData>({
    title: cv.title,
    position: cv.position,
    description: cv.description,
    requirements: cv.requirements || '',
    conditions: cv.conditions || '',
    salaryFrom: cv.salaryFrom ?? null,
    salaryTo: cv.salaryTo ?? null,
    currency: cv.currency,
    employmentType: (cv.employmentType || '') as CvVacancyFormData['employmentType'],
    location: cv.location,
    cityDocumentId: cv.city?.documentId || null,
    level_job: (cv.level_job || '') as CvVacancyFormData['level_job'],
    experience_job: (cv.experience_job || '') as CvVacancyFormData['experience_job'],
    education_job: (cv.education_job || '') as CvVacancyFormData['education_job'],
    deadline: cv.deadline || '',
    isActive: cv.isActive,
    companyDocumentId: cv.company?.documentId || null,
    categoryDocumentId: cv.category?.documentId || null,
  });

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch('/api/strapi/cities?pagination[pageSize]=100&sort[0]=title:asc');
        if (res.ok) {
          const json = await res.json();
          setCities(
            (json.data || []).map((r: Record<string, unknown>) => ({
              id: (r as { id?: number }).id || 0,
              documentId: (r as { documentId?: string }).documentId || '',
              title: (r as { title?: string }).title || '',
              slug: (r as { slug?: string }).slug || '',
            }) as CityRef),
          );
        }
      } catch {
        // ignore
      } finally {
        setLoadingCities(false);
      }
    }
    loadCities();
  }, []);

  function updateField<K extends keyof CvVacancyFormData>(key: K, value: CvVacancyFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description) {
      setError('Заполните обязательные поля');
      return;
    }

    setLoading(true);

    try {
      await updateCv(cv.documentId, formData);
      router.push('/company/dashboard');
      router.refresh();
    } catch {
      setError('Не удалось обновить вакансию. Попробуйте позже.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company & Category */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Компания и категория</h2>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Компания</Label>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <Building2 className="size-4 shrink-0" />
              <span className="font-medium text-foreground">
                {cv.company?.name || 'Без компании'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Категория</Label>
            <Select
              defaultValue={cv.category?.documentId || undefined}
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
            <Label htmlFor="title">Название вакансии</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Должность</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => updateField('position', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Город</Label>
            <Select
              value={formData.cityDocumentId || ''}
              onValueChange={(value) => updateField('cityDocumentId', value || null)}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.documentId || city.id} value={city.documentId || String(city.id)}>
                    {city.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">Тип занятости</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) => updateField('employmentType', value as CvEmploymentType)}
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

          <div className="space-y-2">
            <Label htmlFor="level_job">Уровень должности</Label>
            <Select
              value={formData.level_job || ''}
              onValueChange={(value) => updateField('level_job', value as CvLevelJob)}
            >
              <SelectTrigger id="level_job">
                <SelectValue />
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
                <SelectValue />
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
                <SelectValue />
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Валюта</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => updateField('currency', value as CvCurrency)}
            >
              <SelectTrigger id="currency">
                <SelectValue />
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
          <Label htmlFor="description">Описание вакансии</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
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
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Условия</Label>
            <Textarea
              id="conditions"
              value={formData.conditions || ''}
              onChange={(e) => updateField('conditions', e.target.value)}
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
              Сохранение...
            </>
          ) : (
            'Сохранить изменения'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
