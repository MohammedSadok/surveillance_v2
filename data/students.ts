"use server";
import { db } from "@/lib/config";
import {
  moduleOption,
  moduleTable,
  ModuleType,
  Option,
  option,
  student,
  StudentType,
} from "@/lib/schema";
import { GroupedData } from "@/lib/utils";
import { and, eq } from "drizzle-orm";

export const insertStudents = async (students: Omit<StudentType, "id">[]) => {
  await db.insert(student).values(students);
};

export const insertOption = async (newOption: Option) => {
  await db.insert(option).values(newOption);
};

export const insertModule = async (newModule: ModuleType) => {
  await db.insert(moduleTable).values(newModule);
};

export const getStudents = async (
  sessionExamId: number
): Promise<StudentType[]> => {
  const result = await db
    .select()
    .from(student)
    .where(eq(student.sessionExamId, sessionExamId));
  return result;
};

export const getStudentsInOptionAndModule = async (
  optionId: string,
  moduleId: string,
  sessionExamId: number
) => {
  const result = await db
    .select()
    .from(student)
    .where(
      and(
        eq(student.optionId, optionId),
        eq(student.moduleId, moduleId),
        eq(student.sessionExamId, sessionExamId)
      )
    );
  return result;
};

export const getModuleById = async (id: string) => {
  const result = await db.query.moduleTable.findFirst({
    where: and(eq(moduleTable.id, id)),
  });
  return result || null;
};

export const getModuleInOption = async (moduleId: string, optionId: string) => {
  const result = await db.query.moduleOption.findFirst({
    where: and(
      eq(moduleOption.moduleId, moduleId),
      eq(moduleOption.optionId, optionId)
    ),
  });
  return result || null;
};

export const getOptionById = async (id: string) => {
  const result = await db.query.option.findFirst({
    where: eq(option.id, id),
  });
  return result || null;
};
export const insertOptionsAndModules = async (
  optionsAndModules: GroupedData
) => {
  for (const optionId in optionsAndModules) {
    if (optionsAndModules.hasOwnProperty(optionId)) {
      const existOption = await getOptionById(optionId);
      if (!existOption) {
        await insertOption({
          id: optionId,
          name: optionsAndModules[optionId].name,
        });
      }
      for (const moduleId in optionsAndModules[optionId].modules) {
        if (optionsAndModules[optionId].modules.hasOwnProperty(moduleId)) {
          const existModule = await getModuleById(moduleId);
          if (!existModule) {
            await insertModule({
              id: moduleId,
              name: optionsAndModules[optionId].modules[moduleId].name,
            });
          }
          const existModuleInOption = await getModuleInOption(
            moduleId,
            optionId
          );
          if (!existModuleInOption) {
            await db.insert(moduleOption).values({ moduleId, optionId });
          }
        }
      }
    }
  }
};

export const insertStudentsChunk = async (
  students: Omit<StudentType, "id">[],
  sessionExamId: number
) => {
  await insertStudents(
    students.map((student) => ({ ...student, sessionExamId }))
  );
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
