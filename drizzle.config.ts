import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./lib/drizzle",
  dialect: "mysql",
  verbose: true,
  strict: true,
});
