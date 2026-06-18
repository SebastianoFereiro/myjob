/** Роль пользователя */
export type UserRole = "user" | "company";

/** Модель пользователя */
export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string;
  role: UserRole;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Сессия */
export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Ответ аутентификации */
export type AuthResponse = {
  user: User;
  session: Session;
};

/** Данные для регистрации */
export type RegisterData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

/** Данные для входа */
export type LoginData = {
  email: string;
  password: string;
};

/** Error response from Better-Auth */
export type AuthError = {
  error?: string;
  message?: string;
  status?: number;
};