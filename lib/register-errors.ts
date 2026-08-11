/**
 * Справочник русских сообщений для ошибок регистрации.
 * Покрывает коды Better-Auth, коды роутов регистрации компании и типовые
 * сообщения Strapi, чтобы не показывать пользователю сырой текст сервера.
 */

const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  // --- Better-Auth / серверные коды ---
  USER_ALREADY_EXISTS: "Пользователь с таким email уже зарегистрирован",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Пользователь с таким email уже зарегистрирован",
  EMAIL_TAKEN: "Пользователь с таким email уже зарегистрирован",
  INVALID_EMAIL: "Введите корректный email",
  PASSWORD_TOO_SHORT: "Пароль слишком короткий (минимум 8 символов)",
  WEAK_PASSWORD: "Пароль слишком слабый",
  PASSWORD_MISMATCH: "Пароли не совпадают",
  INVALID_PASSWORD: "Неверный пароль",
  EMAIL_NOT_VERIFIED: "Email не подтверждён. Проверьте почту и перейдите по ссылке из письма.",
  RATE_LIMITED: "Слишком много попыток. Попробуйте позже.",
  FAILED_TO_CREATE_USER: "Не удалось создать аккаунт. Попробуйте позже.",
  FAILED_TO_CREATE_SESSION: "Не удалось создать сессию. Попробуйте позже.",
  INTERNAL_SERVER_ERROR: "Внутренняя ошибка сервера. Попробуйте позже.",

  // --- Коды роута регистрации компании ---
  VALIDATION_FAILED: "Проверьте правильность заполнения полей",
  COMPANY_YNP_EXISTS: "Компания с таким УНП уже зарегистрирована",
  COMPANY_SLUG_EXISTS: "Компания с таким названием уже зарегистрирована",
  COMPANY_CREATE_FAILED: "Не удалось создать компанию. Попробуйте позже.",
  COMPANY_BIND_FAILED: "Не удалось привязать компанию к аккаунту. Обратитесь в поддержку.",
  USER_CREATE_FAILED: "Не удалось создать аккаунт. Попробуйте позже.",
  NOT_AUTHORIZED: "Не авторизован. Войдите заново.",

  // --- Типовые сообщения Strapi ---
  "This attribute must be unique": "Такое значение уже используется",
  "Forbidden": "Недостаточно прав для выполнения операции",
  "Invalid credentials": "Неверные учётные данные",
};

export type RegisterServerError = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
} | null | undefined;

/** Возвращает русское сообщение об ошибке регистрации. */
export function translateRegisterError(error: RegisterServerError): string {
  if (!error) return "";

  if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
    const first = Object.values(error.fieldErrors)[0];
    if (first) return first;
  }

  const code = error.code?.toUpperCase() ?? "";
  if (code && REGISTER_ERROR_MESSAGES[code]) return REGISTER_ERROR_MESSAGES[code];

  if (error.message) {
    // Сервер уже прислал русский текст
    if (/[а-яё]/i.test(error.message)) return error.message;
    const known = REGISTER_ERROR_MESSAGES[error.message];
    if (known) return known;
  }

  return "Произошла ошибка. Попробуйте позже.";
}
