import { createAuthClient } from "better-auth/react"
import type { auth } from "./auth";

// Infer the session type from the server auth config
type Session = typeof auth.$Infer.Session;

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, useSession, signOut } = authClient;
export type { Session };

// Helper type for user with additional fields
export type AuthUser = Session["user"];
