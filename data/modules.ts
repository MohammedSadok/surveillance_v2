"use server";
import { db } from "@/lib/config";
import {
  exam,
  moduleTable,
  ModuleType,
  sessionExam,
  Student,
  student,
} from "@/lib/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getTimeSlotById } from "./timeSlot";
export const getModules = async (): Promise<Omit<ModuleType, "optionId">[]> => {
  const result = await db
    .selectDistinct({ id: moduleTable.id, name: moduleTable.name })
    .from(moduleTable);
  return result;
};
export const getNumberOfStudentsInModule = async (
  moduleId: string,
  sessionId: number
): Promise<number> => {
  const result = await db
    .select()
    .from(student)
    .where(
      and(eq(student.moduleId, moduleId), eq(student.sessionExamId, sessionId))
    );
  return result.length;
};

export const getStudentsInModule = async (
  moduleId: string,
  sessionExamId: number
): Promise<Student[]> => {
  const result = await db
    .select()
    .from(student)
    .where(
      and(
        eq(student.moduleId, moduleId),
        eq(student.sessionExamId, sessionExamId)
      )
    );
  return result;
};

export const getModulesForExam = async (
  timeSlotId: number
): Promise<ModuleType[]> => {
  try {
    const selectedTimeSlot = await getTimeSlotById(timeSlotId);
    if (selectedTimeSlot) {
      const result: ModuleType[] = await db
        .select({
          id: moduleTable.id,
          name: moduleTable.name,
          optionId: moduleTable.optionId,
        })
        .from(moduleTable)
        .leftJoin(exam, eq(exam.moduleId, moduleTable.id))
        .leftJoin(
          sessionExam,
          eq(sessionExam.id, selectedTimeSlot.sessionExamId)
        )
        .where(isNull(exam.id));
      return result;
    }
    return [];
  } catch (error) {
    console.error("Error fetching modules for exam:", error);
    throw error;
  }
};

export const getModulesWithStudentCount = async (
  sessionExamId: number
): Promise<moduleWithStudentCount[]> => {
  const result = await db
    .select({
      moduleId: moduleTable.id,
      moduleName: moduleTable.name,
      studentCount: sql<number>`count(${student.id})`.mapWith(Number),
    })
    .from(moduleTable)
    .innerJoin(student, eq(moduleTable.id, student.moduleId))
    .where(eq(student.sessionExamId, sessionExamId))
    .groupBy(moduleTable.id);

  return result;
};

export type moduleWithStudentCount = {
  moduleId: string;
  moduleName: string;
  studentCount: number;
};
