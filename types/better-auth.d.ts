import "better-auth";

declare module "better-auth" {
  interface User {
    role: "user" | "company";
    companyId?: string;
  }
}
