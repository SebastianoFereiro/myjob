const FIELD_LABELS: Record<string, string> = {
  slug: "URL-адрес (slug)",
  title: "Название",
  email: "Email",
  phone: "Телефон",
  position: "Должность",
  employmentType: "Тип занятости",
  firstName: "Имя",
  lastName: "Фамилия",
  description: "Описание",
  location: "Местоположение",
  salary: "Зарплата",
  currency: "Валюта",
  company: "Компания",
  category: "Категория",
  city: "Город",
};

function translateField(path: string[]): string {
  return path.map((p) => FIELD_LABELS[p] || p).join(" → ");
}

const ERROR_MAP: Record<string, (err: StrapiErrorDetail, details?: StrapiErrorDetail[]) => string> = {
  ValidationError(err, all) {
    const field = translateField(err.path || []);
    const val = err.value;

    if (err.message === "This attribute must be unique") {
      return `Поле «${field}» уже используется. ${
        val ? `Значение «${val}» занято. ` : ""
      }Измените название или введите другой ${field}.`;
    }

    if (err.message?.startsWith("employmentType must be one of")) {
      return `Выбран недопустимый тип занятости. Выберите один из: Полный день, Гибридный формат, Удаленный формат, Контракт.`;
    }

    if (err.message?.includes("must be")) {
      return `Поле «${field}» заполнено некорректно: ${err.message}.`;
    }

    if (err.message?.includes("required")) {
      return `Поле «${field}» обязательно для заполнения.`;
    }

    // Общие ошибки валидации
    if (all && all.length > 1) {
      return all
        .map((e) => ERROR_MAP.ValidationError?.(e) || `Поле «${translateField(e.path || [])}»: ${e.message}`)
        .join(" ");
    }

    return `Ошибка в поле «${field}»: ${err.message}.`;
  },

  ApplicationError(err) {
    return `Ошибка сервера: ${err.message}. Попробуйте позже.`;
  },
};

type StrapiErrorDetail = {
  path?: string[];
  message?: string;
  name?: string;
  value?: unknown;
};

type StrapiErrorBody = {
  data?: unknown;
  error?: {
    status?: number;
    name?: string;
    message?: string;
    details?: {
      errors?: StrapiErrorDetail[];
    };
  };
};

export function formatStrapiError(json: unknown): string {
  if (!json || typeof json !== "object") return "Неизвестная ошибка. Попробуйте позже.";

  const body = json as StrapiErrorBody;
  const error = body?.error;
  if (!error) return "Неизвестная ошибка. Попробуйте позже.";

  const errorName = error.name || "UnknownError";
  const details = error.details?.errors;

  // Если есть детальные ошибки — показываем их
  if (details && details.length > 0) {
    const formatter = ERROR_MAP[errorName] || ERROR_MAP.ValidationError;
    return formatter(details[0], details);
  }

  // Общее сообщение
  if (error.message?.startsWith("employmentType must be one of")) {
    return 'Выбран недопустимый тип занятости. Выберите один из: Полный день, Гибридный формат, Удаленный формат, Контракт.';
  }

  return `Ошибка: ${error.message || errorName}. Попробуйте позже.`;
}
