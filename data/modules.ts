"use server";

import {
  exam,
  moduleOption,
  moduleTable,
  ModuleType,
  student,
  StudentType,
  timeSlot,
} from "@/lib/schema";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { getTimeSlotById } from "./timeSlot";
import db from "@/lib/config";
/**
 *
 * @returns Promise<ModuleType[]>
 * Return all modules in the database
 */
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

/**
 *
 * @param moduleId
 * @param sessionExamId
 * @returns Promise<StudentType[]>
 * Return all students in a module
 */
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
export const getModulesAlreadyHaveExam = async (
  sessionExamId: number
): Promise<ModuleType[]> => {
  const result = await db
    .select({
      id: moduleTable.id,
      name: moduleTable.name,
    })
    .from(moduleTable)
    .innerJoin(exam, eq(exam.moduleId, moduleTable.id))
    .innerJoin(timeSlot, eq(timeSlot.id, exam.timeSlotId))
    .where(eq(timeSlot.sessionExamId, sessionExamId));
  return result;
};

/**
 *
 * @param timeSlotId
 * @returns Promise<ModuleType[]>
 * Return all modules that don't have an exam in a specific time slot
 */
export const getModulesForExam = async (
  timeSlotId: number
): Promise<ModuleType[]> => {
  try {
    // Get option IDs associated with exams in the specified time slot
    const options = await getOptionIdsWithExamsInTimeSlot(timeSlotId);

    // Get the current time slot details
    const selectedTimeSlot = await getTimeSlotById(timeSlotId);

    // Initialize an array for module IDs that already have exams
    let existingModuleIds: string[] = [];

    if (selectedTimeSlot) {
      // Get module IDs that already have exams in the same session but on different days
      existingModuleIds = await getModulesAlreadyHaveExam(
        selectedTimeSlot.sessionExamId
      ).then((modules) => modules.map((module) => module.id));
    }

    // Prepare the base query to fetch distinct modules
    let query = db
      .selectDistinct({
        id: moduleTable.id,
        name: moduleTable.name,
      })
      .from(moduleTable)
      .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId));

    let distinctModules: ModuleType[] = [];
    // Apply the option filter only if there are options
    if (options.length > 0) {
      distinctModules = await db
        .selectDistinct({
          id: moduleTable.id,
          name: moduleTable.name,
        })
        .from(moduleTable)
        .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId))
        .where(notInArray(moduleOption.optionId, options));
    } else {
      distinctModules = await db
        .selectDistinct({
          id: moduleTable.id,
          name: moduleTable.name,
        })
        .from(moduleTable)
        .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId));
    }

    // Filter out modules that already have exams in the same session but on different days
    const result = distinctModules.filter(
      (module) => !existingModuleIds.includes(module.id)
    );

    return result;
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
