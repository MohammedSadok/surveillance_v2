import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./lib/drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: "mysql://root:@localhost:3306/app",
  },
  // verbose: true,
  strict: true,
});
