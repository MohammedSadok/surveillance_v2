import {
  boolean,
  date,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
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

export const sessionExam = mysqlTable("sessionExam", {
  id: int("id").autoincrement().primaryKey(),
  isValidated: boolean("isValidated").notNull().default(false),
  type: varchar("type", { length: 50 }).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
});

export const timeSlot = mysqlTable("timeSlot", {
  id: int("id").autoincrement().primaryKey(),
  date: date("date").notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  timePeriod: varchar("timePeriod", { length: 20 }).notNull(),
  sessionExamId: int("sessionExamId")
    .references(() => sessionExam.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const option = mysqlTable("option", {
  id: varchar("id", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
});

export const moduleTable = mysqlTable(
  "module",
  {
    id: varchar("id", { length: 20 }).notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    optionId: varchar("optionId", { length: 20 })
      .references(() => option.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.optionId] }),
    };
  }
);

export const exam = mysqlTable("exam", {
  id: int("id").autoincrement().primaryKey(),
  module: varchar("module", { length: 20 })
    .references(() => moduleTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  timeSlotId: int("timeSlotId")
    .references(() => timeSlot.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  responsibleId: int("responsibleId")
    .references(() => teacher.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const student = mysqlTable("student", {
  id: int("id").autoincrement().primaryKey(),
  cin: varchar("cin", { length: 10 }).notNull(),
  firstName: varchar("firstName", { length: 50 }).notNull(),
  lastName: varchar("lastName", { length: 50 }).notNull(),
  sessionExamId: int("sessionExamId")
    .references(() => sessionExam.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  moduleId: varchar("moduleId", { length: 20 })
    .references(() => moduleTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const department = mysqlTable("department", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const teacher = mysqlTable("teacher", {
  id: int("id").autoincrement().primaryKey(),
  lastName: varchar("lastName", { length: 50 }).notNull(),
  firstName: varchar("firstName", { length: 50 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 15 }).notNull(),
  email: varchar("email", { length: 50 }).notNull(),
  isDispense: boolean("isDispense").notNull().default(false),
  departmentId: int("departmentId")
    .references(() => department.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const occupiedTeacher = mysqlTable("occupiedTeacher", {
  id: int("id").autoincrement().primaryKey(),
  cause: varchar("cause", { length: 50 }).notNull(),
  teacherId: int("teacherId")
    .references(() => teacher.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  timeSlotId: int("timeSlotId")
    .references(() => timeSlot.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
});

export const monitoring = mysqlTable("monitoring", {
  id: int("id").autoincrement().primaryKey(),
  examId: int("examId")
    .references(() => exam.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  locationId: int("locationId")
    .references(() => location.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const monitoringLine = mysqlTable("monitoringLine", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId")
    .references(() => teacher.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  monitoringId: int("monitoringId")
    .references(() => monitoring.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const location = mysqlTable("location", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  size: int("size").notNull(),
  type: mysqlEnum("type", RoomType).notNull(),
});

export const occupiedLocation = mysqlTable("occupiedLocation", {
  id: int("id").autoincrement().primaryKey(),
  cause: varchar("cause", { length: 50 }).notNull(),
  locationId: int("locationId")
    .references(() => location.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  timeSlotId: int("timeSlotId")
    .references(() => timeSlot.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type SessionExam = typeof sessionExam.$inferSelect;
export type TimeSlot = typeof timeSlot.$inferSelect;
export type ModuleType = typeof moduleTable.$inferSelect;
export type Exam = typeof exam.$inferSelect;
export type OccupiedTeacher = typeof occupiedTeacher.$inferSelect;
export type Monitoring = typeof monitoring.$inferSelect;
export type MonitoringLine = typeof monitoringLine.$inferSelect;
export type OccupiedLocation = typeof occupiedLocation.$inferSelect;
export type Department = typeof department.$inferSelect;
export type Teacher = typeof teacher.$inferSelect;
export type Location = typeof location.$inferSelect;
export type Option = typeof option.$inferSelect;
export type Student = typeof student.$inferSelect;
