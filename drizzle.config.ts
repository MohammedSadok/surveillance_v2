import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: "mysql://root:@localhost:3306/app",
    // host: "localhost",
    // user: "root",
    // password: "",
    // database: "app",
    // port: 3306,
  },
  verbose: true,
  strict: true,
});
