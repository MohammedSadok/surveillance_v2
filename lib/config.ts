import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

function singleton<Value>(name: string, value: () => Value): Value {
  const globalAny: any = global;
  globalAny.__singletons = globalAny.__singletons || {};

  if (!globalAny.__singletons[name]) {
    globalAny.__singletons[name] = value();
  }

  return globalAny.__singletons[name];
}

function createDatabaseConnection() {
  const poolConnection = mysql.createPool({
    host: "localhost",
    user: "root",
    port: 3306,
    database: "app",
  });

  return drizzle(poolConnection, {
    schema,
    logger: true,
    mode: "default",
  });
}

const db = singleton("db", createDatabaseConnection);

export { db, schema };
