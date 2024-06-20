// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   schema: "./lib/schema.ts",
//   out: "./lib/drizzle",
//   dialect: "mysql",
//   verbose: true,
//   strict: true,
// });

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./lib/drizzle",
  verbose: true,
  strict: true,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
});
