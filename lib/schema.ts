import {
  boolean,
  date,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
// Enums
export const TimePeriod = ["MORNING", "AFTERNOON"] as const;
export const RoomType = pgEnum("RoomType", ["CLASSROOM", "AMPHITHEATER"]);
export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  isAdmin: boolean("isAdmin").notNull().default(false),
});

export const sessionExam = pgTable("sessionExam", {
  id: serial("id").primaryKey(),
  isValidated: boolean("isValidated").notNull().default(false),
  type: varchar("type", { length: 50 }).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
});

export const timeSlot = pgTable("timeSlot", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  timePeriod: varchar("timePeriod", { length: 20 }).notNull(),
  sessionExamId: serial("sessionExamId")
    .references(() => sessionExam.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const option = pgTable("option", {
  id: varchar("id", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
});

export const moduleTable = pgTable("module", {
  id: varchar("id", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const moduleOption = pgTable("moduleOption", {
  id: serial("id").primaryKey(),
  moduleId: varchar("moduleId", { length: 20 })
    .references(() => moduleTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  optionId: varchar("optionId", { length: 20 })
    .references(() => option.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const exam = pgTable("exam", {
  id: serial("id").primaryKey(),
  moduleId: varchar("module", { length: 20 })
    .references(() => moduleTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  timeSlotId: serial("timeSlotId")
    .references(() => timeSlot.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  responsibleId: serial("responsibleId")
    .references(() => teacher.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const student = pgTable("student", {
  id: serial("id").primaryKey(),
  cne: varchar("cne", { length: 20 }).notNull(),
  firstName: varchar("firstName", { length: 50 }).notNull(),
  lastName: varchar("lastName", { length: 50 }).notNull(),
  sessionExamId: serial("sessionExamId")
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
  optionId: varchar("optionId", { length: 20 })
    .references(() => option.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});
export const studentExamLocation = pgTable("studentExamLocation", {
  id: serial("id").primaryKey(),
  cne: varchar("cne", { length: 20 }).notNull(),
  numberOfStudent: serial("numberOfStudent").notNull(),
  locationId: serial("locationId")
    .references(() => locationTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  examId: serial("examId")
    .references(() => exam.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});
export const department = pgTable("department", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const teacher = pgTable("teacher", {
  id: serial("id").primaryKey(),
  lastName: varchar("lastName", { length: 50 }).notNull(),
  firstName: varchar("firstName", { length: 50 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 15 }).notNull(),
  email: varchar("email", { length: 50 }).notNull(),
  isDispense: boolean("isDispense").notNull().default(false),
  departmentId: serial("departmentId")
    .references(() => department.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const occupiedTeacher = pgTable("occupiedTeacher", {
  id: serial("id").primaryKey(),
  cause: varchar("cause", { length: 50 }).notNull(),
  teacherId: serial("teacherId")
    .references(() => teacher.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  timeSlotId: serial("timeSlotId")
    .references(() => timeSlot.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
});

export const monitoring = pgTable("monitoring", {
  id: serial("id").primaryKey(),
  examId: serial("examId")
    .references(() => exam.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  locationId: serial("locationId")
    .references(() => locationTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const monitoringLine = pgTable("monitoringLine", {
  id: serial("id").primaryKey(),
  teacherId: serial("teacherId")
    .references(() => teacher.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  monitoringId: serial("monitoringId")
    .references(() => monitoring.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
});

export const locationTable = pgTable("location", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  size: serial("size").notNull(),
  type: RoomType("type").notNull(),
});

export const occupiedLocation = pgTable("occupiedLocation", {
  id: serial("id").primaryKey(),
  cause: varchar("cause", { length: 50 }).notNull(),
  locationId: serial("locationId")
    .references(() => locationTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  timeSlotId: serial("timeSlotId")
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
export type LocationType = typeof locationTable.$inferSelect;
export type Option = typeof option.$inferSelect;
export type StudentType = typeof student.$inferSelect;
export type StudentExamLocation = typeof studentExamLocation.$inferSelect;
export type ModuleOptionType = typeof moduleOption.$inferSelect;
