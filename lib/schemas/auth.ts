import { z } from "zod";

export const emailSchema = z.email({ error: "Введите корректный email" });

export const passwordSchema = z
  .string({ error: "Введите пароль" })
  .min(8, { error: "Пароль должен содержать минимум 8 символов" });

/** Регистрация (соискатель или компания). */
export const registerSchema = z
  .object({
    name: z
      .string({ error: "Введите имя" })
      .trim()
      .min(2, { error: "Минимум 2 символа" }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string({ error: "Повторите пароль" }),
    role: z.enum(["user", "company"], { error: "Выберите тип аккаунта" }),
    ynp: z.string().trim().optional(),
    consent: z
      .boolean({ error: "Необходимо дать согласие" })
      .refine((v) => v === true, { error: "Необходимо дать согласие на обработку данных" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Пароли не совпадают",
      });
    }
    if (data.role === "company" && !data.ynp?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["ynp"],
        message: "Укажите УНП компании",
      });
    }
  });

/** Вход. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Введите пароль" }).min(1, { error: "Введите пароль" }),
});

/** Запрос восстановления пароля. */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** Новый пароль после сброса. */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string({ error: "Повторите пароль" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Пароли не совпадают",
      });
    }
  });

/** Контактная форма. */
export const contactSchema = z.object({
  name: z
    .string({ error: "Введите имя" })
    .trim()
    .min(2, { error: "Укажите имя (минимум 2 символа)" })
    .max(100, { error: "Слишком длинное имя" }),
  email: emailSchema,
  subject: z
    .string({ error: "Укажите тему" })
    .trim()
    .min(2, { error: "Укажите тему" })
    .max(200, { error: "Слишком длинная тема" }),
  message: z
    .string({ error: "Введите сообщение" })
    .trim()
    .min(10, { error: "Сообщение слишком короткое (минимум 10 символов)" })
    .max(4000, { error: "Сообщение слишком длинное (максимум 4000 символов)" }),
});

/** Подписка на новые вакансии. */
export const subscribeSchema = z.object({
  email: emailSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
