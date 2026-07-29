// ========================================================================
// ЕДИНЫЙ ИСТОЧНИК ENUM-ОПЦИЙ
// ========================================================================
// Все enum-опции в одном месте. Типы и компоненты импортируют отсюда.
// При добавлении/изменении значения — править только этот файл.
// ========================================================================

// ========================================================================
// Базовый интерфейс
// ========================================================================
export interface EnumOption {
  value: string;
  label: string;
}

// ========================================================================
// CV / Vacancy — Тип занятости
// ========================================================================
export const EMPLOYMENT_OPTIONS = [
  { value: 'full-time',   label: 'Полная занятость' },
  { value: 'part-time',   label: 'Частичная занятость' },
  { value: 'contract',    label: 'Проектная работа' },
  { value: 'internship',  label: 'Стажировка' },
  { value: 'remote',      label: 'Удаленно' },
  { value: 'remote',      label: 'Удаленно' },
  { value: 'vachta',    label: 'Работа вахтой' },
{ value: 'podrabotka',    label: 'Подработка' },
{ value: 'rabota-bez-opyta',    label: 'Работа без опыта' }
] as const satisfies readonly EnumOption[];

// ========================================================================
// CV — Уровень должности
// ========================================================================
export const LEVEL_OPTIONS = [
  { value: 'top',         label: 'Топ-менеджмент' },
  { value: 'middle',      label: 'Руководители среднего звена' },
  { value: 'specialist',  label: 'Специалисты' },
  { value: 'worker',      label: 'Рабочий персонал' },
  { value: 'junior',      label: 'Начинающие специалисты' },
  { value: 'intern',      label: 'Стажеры' },
] as const satisfies readonly EnumOption[];

// ========================================================================
// CV — Опыт работы
// ========================================================================
export const EXPERIENCE_OPTIONS = [
  { value: 'none',  label: 'Нет опыта' },
  { value: '1-3',   label: 'От 1 года до 3 лет' },
  { value: '3-5',   label: 'От 3 до 5 лет' },
  { value: '5+',    label: 'Более 5 лет' },
] as const satisfies readonly EnumOption[];

// ========================================================================
// CV — Образование
// ========================================================================
export const EDUCATION_OPTIONS = [
  { value: 'none',           label: 'Не требуется' },
  { value: 'basic',          label: 'Базовое' },
  { value: 'secondary',      label: 'Среднее' },
  { value: 'specialized',    label: 'Средне специальное' },
  { value: 'vocational',     label: 'Профессионально-техническое' },
  { value: 'higher',         label: 'Высшее' },
] as const satisfies readonly EnumOption[];

// ========================================================================
// Resume — Тип занятости (отдельный enum, отличается от CV)
// ========================================================================
export const RESUME_EMPLOYMENT_OPTIONS = [
  { value: 'full-day',   label: 'Полный день' },
  { value: 'hybrid',     label: 'Гибридный формат' },
  { value: 'remote',     label: 'Удаленный формат' },
  { value: 'contract',   label: 'Контракт' },
] as const satisfies readonly EnumOption[];

// ========================================================================
// Resume — Валюта
// ========================================================================
export const RESUME_CURRENCY_OPTIONS = [
  { value: 'BYN', label: 'BYN' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
] as const satisfies readonly EnumOption[];

// ========================================================================
// CV — Валюта
// ========================================================================
export const CURRENCY_OPTIONS = [
  { value: 'BYN', label: 'BYN' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
] as const satisfies readonly EnumOption[];

// ========================================================================
// Vacancy (legacy) — Уровень опыта
// ========================================================================
export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'junior',  label: 'Junior' },
  { value: 'middle',  label: 'Middle' },
  { value: 'senior',  label: 'Senior' },
  { value: 'lead',    label: 'Lead' },
] as const satisfies readonly EnumOption[];

// ========================================================================
// Вспомогательные функции
// ========================================================================

/** Получить label по value */
export function getOptionLabel(options: readonly EnumOption[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Получить value по label */
export function getOptionValue(options: readonly EnumOption[], label: string): string {
  return options.find((o) => o.label === label)?.value ?? label;
}

/** Создать map: value -> label */
export function getOptionsMap(options: readonly EnumOption[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const opt of options) {
    map[opt.value] = opt.label;
  }
  return map;
}

/** Создать map: label -> value */
export function getReverseOptionsMap(options: readonly EnumOption[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const opt of options) {
    map[opt.label] = opt.value;
  }
  return map;
}
