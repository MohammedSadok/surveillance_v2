import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Enums
export const TimePeriod = ["MORNING", "AFTERNOON"] as const;
export const RoomType = ["CLASSROOM", "AMPHITHEATER"] as const;

export const users = mysqlTable("user", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  isAdmin: boolean("isAdmin").notNull().default(false),
});
