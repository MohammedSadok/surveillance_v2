"use server";
import { db } from "@/lib/config";
import {
  exam,
  moduleOption,
  moduleTable,
  ModuleType,
  student,
  StudentType,
} from "@/lib/schema";
import { and, eq, notInArray, sql } from "drizzle-orm";
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
): Promise<StudentType[]> => {
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
export const getOptionIdsWithExamsInTimeSlot = async (
  timeSlotId: number
): Promise<string[]> => {
  try {
    // Sélectionner les identifiants des options avec des examens dans des modules pour ce créneau
    const optionIdsWithExams = await db
      .select()
      .from(moduleOption)
      .innerJoin(
        exam,
        and(
          eq(exam.moduleId, moduleOption.moduleId),
          eq(exam.timeSlotId, timeSlotId)
        )
      );
    const result = optionIdsWithExams.map(
      (option) => option.moduleOption.optionId
    );
    return result;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des identifiants des options avec des examens pour le créneau:",
      error
    );
    throw error;
  }
};
export const getModulesForExam = async (
  timeSlotId: number
): Promise<ModuleType[]> => {
  try {
    const options = await getOptionIdsWithExamsInTimeSlot(timeSlotId);
    if (options.length > 0) {
      const result = await db
        .selectDistinct({
          id: moduleTable.id,
          name: moduleTable.name,
        })
        .from(moduleTable)
        .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId))
        .where(notInArray(moduleOption.optionId, options));
      return result;
    } else {
      const result = await db.select().from(moduleTable);
      return result;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des modules pour l'examen:",
      error
    );
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
