import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@/database";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 3,
    },
  },
  advanced: {
    database: { generateId: "uuid" },
  },
  plugins: [nextCookies()],
  basePath: "/api/auth",
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});
