"use server";
import { db } from "@/lib/config";
import {
  moduleTable,
  ModuleType,
  Option,
  option,
  Student,
  student,
} from "@/lib/schema";
import { GroupedData } from "@/lib/utils";
import { and, eq } from "drizzle-orm";

export const insertStudents = async (students: Omit<Student, "id">[]) => {
  await db.insert(student).values(students);
};

export const insertOption = async (newOption: Option) => {
  await db.insert(option).values(newOption);
};

export const insertModule = async (newModule: ModuleType) => {
  await db.insert(moduleTable).values(newModule);
};

export const getModule = async (newModule: ModuleType) => {
  const result = await db.query.moduleTable.findFirst({
    where: and(
      eq(moduleTable.id, newModule.id),
      eq(moduleTable.optionId, newModule.optionId)
    ),
  });
  return result || null;
};

export const getOption = async (newOption: Option) => {
  const result = await db.query.option.findFirst({
    where: and(eq(option.id, newOption.id), eq(option.name, newOption.name)),
  });
  return result || null;
};
export const insertOptionsAndModules = async (
  optionsAndModules: GroupedData
) => {
  for (const optionId in optionsAndModules) {
    if (optionsAndModules.hasOwnProperty(optionId)) {
      const existOption = await getOption({
        id: optionId,
        name: optionsAndModules[optionId].name,
      });

      if (!existOption) {
        await insertOption({
          id: optionId,
          name: optionsAndModules[optionId].name,
        });
      }

      for (const moduleId in optionsAndModules[optionId].modules) {
        if (optionsAndModules[optionId].modules.hasOwnProperty(moduleId)) {
          const existModule = await getModule({
            id: moduleId,
            name: optionsAndModules[optionId].modules[moduleId].name,
            optionId: optionId,
          });
          if (!existModule) {
            await insertModule({
              id: moduleId,
              name: optionsAndModules[optionId].modules[moduleId].name,
              optionId: optionId,
            });
          }
        }
      }
    }
  }
};

export const insertStudentsChunk = async (
  students: Omit<Student, "id">[],
  sessionExamId: number
) => {
  await insertStudents(
    students.map((student) => ({ ...student, sessionExamId }))
  );
};
