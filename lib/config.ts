import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
const poolConnection = mysql.createPool({
  host: "localhost",
  user: "root",
  port: 3306,
  database: "app",
});

export const db = drizzle(poolConnection, {
  schema,
  logger: true,
  mode: "default",
});
