/** Перевод кодов ошибок Better-Auth на русский язык. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Неверный email или пароль",
  EMAIL_NOT_VERIFIED: "Email не подтверждён. Проверьте почту и перейдите по ссылке из письма.",
  USER_ALREADY_EXISTS: "Пользователь с таким email уже зарегистрирован",
  EMAIL_TAKEN: "Пользователь с таким email уже зарегистрирован",
  USER_NOT_FOUND: "Пользователь не найден",
  PASSWORD_TOO_SHORT: "Пароль слишком короткий",
  WEAK_PASSWORD: "Пароль слишком слабый",
  PASSWORD_MISMATCH: "Пароли не совпадают",
  INVALID_PASSWORD: "Неверный пароль",
  INVALID_TOKEN: "Ссылка недействительна или истекла",
  EMAIL_ALREADY_VERIFIED: "Email уже подтверждён",
  ACCOUNT_BANNED: "Аккаунт заблокирован",
  BANNED: "Аккаунт заблокирован",
  RATE_LIMITED: "Слишком много попыток. Попробуйте позже.",
};

export type AuthErrorLike = { code?: string; message?: string } | null | undefined;

/** Возвращает русское сообщение об ошибке Better-Auth. */
export function translateAuthError(error: AuthErrorLike): string {
  if (!error) return "";
  const code = error.code?.toUpperCase() ?? "";
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (error.message && /[а-яё]/i.test(error.message)) return error.message;
  return "Произошла ошибка. Попробуйте позже.";
}
