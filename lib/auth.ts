import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as authSchema from "./db/schema/auth";
import { sendResetPasswordMail, sendVerificationMail } from "./mail/send";

const APP_URL =
  process.env.BETTER_AUTH_URL || process.env.APP_URL || "https://myjob.by";

// true => обязательная верификация email (вход заблокирован до подтверждения)
const requireEmailVerification =
  process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === "true";

export const auth = betterAuth({
  baseURL: APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification,
    resetPasswordTokenExpiresIn: 3600, // 1 час
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordMail(user, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationMail(user, url);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: true,
      },
      companyId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  rateLimit: {
    window: 60, // 1 minute
    max: 100,   // 100 requests per window
  },
  trustedOrigins: [APP_URL, "http://localhost:3000"],
});
