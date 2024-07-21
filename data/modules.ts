"use server";
import { db } from "@/lib/config";
import {
  exam,
  moduleOption,
  moduleTable,
  ModuleType,
  student,
  StudentType,
  timeSlot,
} from "@/lib/schema";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { getChildrenOptions } from "./option";
import { getTimeSlotById } from "./timeSlot";
/**
 *
 * @returns Promise<ModuleType[]>
 * Return all modules in the database
 */

export const createModule = async (
  newModule: ModuleType,
  optionId?: string
) => {
  try {
    await db.insert(moduleTable).values(newModule);
    if (optionId) {
      await db.insert(moduleOption).values({
        moduleId: newModule.id,
        optionId,
      });
    }
  } catch (error) {
    console.error("Error creating module:", error);
    throw error;
  }
};
export const updateModule = async (newModule: ModuleType) => {
  try {
    await db
      .update(moduleTable)
      .set({ name: newModule.name })
      .where(eq(moduleTable.id, newModule.id));
  } catch (error) {
    console.error("Error updating module:", error);
    throw error;
  }
};

export const deleteModule = async (moduleId: string) => {
  try {
    await db.delete(moduleTable).where(eq(moduleTable.id, moduleId));
  } catch (error) {
    console.error("Error deleting module:", error);
    throw error;
  }
};

export const getModules = async (): Promise<Omit<ModuleType, "optionId">[]> => {
  const result = await db
    .selectDistinct({ id: moduleTable.id, name: moduleTable.name })
    .from(moduleTable);
  return result;
};

/**
 *
 * @param moduleId
 * @param sessionId
 * @returns Promise<number>
 * Return the number of students in a module
 */
export const getNumberOfStudentsInModule = async (
  moduleId: string,
  optionId: string,
  sessionId: number
): Promise<number> => {
  const options = await getChildrenOptions(optionId);
  const ids = options.map((option) => option.id);
  if (ids.length === 0) {
    const result = await db
      .select({ count: count() })
      .from(student)
      .where(
        and(
          eq(student.moduleId, moduleId),
          eq(student.sessionExamId, sessionId),
          eq(student.optionId, optionId)
        )
      );
    return result[0].count;
  } else {
    const result = await db
      .select({ count: count() })
      .from(student)
      .where(
        and(
          eq(student.moduleId, moduleId),
          eq(student.sessionExamId, sessionId),
          inArray(student.optionId, ids)
        )
      );
    return result[0].count;
  }
};

/**
 *
 * @param moduleId
 * @param sessionExamId
 * @returns Promise<StudentType[]>
 * Return all students in a module
 */
export const getStudentsInModuleAndOption = async (
  moduleId: string,
  optionId: string,
  sessionExamId: number
): Promise<StudentType[]> => {
  const options = await getChildrenOptions(optionId);
  const ids = options.map((option) => option.id);
  if (ids.length === 0) {
    const result = await db
      .select()
      .from(student)
      .where(
        and(
          eq(student.moduleId, moduleId),
          eq(student.optionId, optionId),
          eq(student.sessionExamId, sessionExamId)
        )
      );
    return result;
  } else {
    const result = await db
      .select()
      .from(student)
      .where(
        and(
          eq(student.moduleId, moduleId),
          inArray(student.optionId, ids),
          eq(student.sessionExamId, sessionExamId)
        )
      );
    return result;
  }
};

/**
 *
 * @param timeSlotId
 * @returns Promise<string[]>
 * Return all option ids that have an exam in a specific time slot
 */
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

/**
 *
 * @param sessionExamId
 * @returns Promise<ModuleType[]>
 * Return all modules that have an exam in a specific time slot
 */
export const getModulesAlreadyHaveExam = async (sessionExamId: number) => {
  const result = await db
    .select({
      moduleId: exam.moduleId,
      optionId: exam.optionId,
    })
    .from(exam)
    .innerJoin(timeSlot, eq(timeSlot.id, exam.timeSlotId))
    .where(eq(timeSlot.sessionExamId, sessionExamId));
  return result;
};

export type ModuleOptionType = {
  moduleId: string;
  name: string;
  optionId: string;
};
export const getModulesCommuneInOptions = async (
  id: string
): Promise<ModuleOptionType[]> => {
  const options = await getChildrenOptions(id);
  const ids = options.map((option) => option.id);

  if (ids.length === 0) {
    return []; // Si aucun id n'est trouvé, retournez un tableau vide
  }

  const result = await db
    .select({
      moduleId: moduleTable.id,
      name: moduleTable.name,
      optionId: moduleOption.optionId,
    })
    .from(moduleTable)
    .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId))
    .where(inArray(moduleOption.optionId, ids))
    .groupBy(moduleTable.id)
    .having(sql`COUNT(${moduleOption.optionId}) = ${ids.length}`);

  return result;
};

/**
 *
 * @param timeSlotId
 * @param optionId
 * @returns Promise<ModuleType[]>
 * Returns all modules that don't have an exam in a specific time slot
 */
export const getModulesForExam = async (
  timeSlotId: number,
  optionId: string
): Promise<ModuleType[]> => {
  try {
    // Get the current time slot details
    const selectedTimeSlot = await getTimeSlotById(timeSlotId);
    let distinctModules: ModuleOptionType[] = [];

    if (selectedTimeSlot) {
      // Get module IDs that already have exams in the same session but on different days
      distinctModules = await getModulesCommuneInOptions(optionId);

      if (distinctModules.length === 0) {
        distinctModules = await db
          .selectDistinct({
            moduleId: moduleTable.id,
            name: moduleTable.name,
            optionId: moduleOption.optionId,
          })
          .from(moduleTable)
          .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId))
          .where(eq(moduleOption.optionId, optionId));
      }

      const existingModules = await getModulesAlreadyHaveExam(
        selectedTimeSlot.sessionExamId
      );

      // Filter out modules that already have exams in the same session but on different days
      const result = distinctModules.filter((module) => {
        return !existingModules.some(
          (existingModule) =>
            existingModule.moduleId === module.moduleId &&
            existingModule.optionId === module.optionId
        );
      });

      const data = result.map((module) => ({
        id: module.moduleId,
        name: module.name,
      }));

      return data;
    }
    return [];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des modules pour l'examen:",
      error
    );
    throw error;
  }
};

/**
 * @param sessionExamId
 * @returns Promise<moduleWithStudentCount[]>
 * Return the number of students in each module
 */
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
