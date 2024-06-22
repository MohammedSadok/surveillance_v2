import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./lib/drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    port: parseInt(process.env.DATABASE_PORT!),
    database: process.env.DATABASE_NAME!,
    password: process.env.DATABASE_PASSWORD!,
  },
  // verbose: true,
  strict: true,
});
