"use server";
import { db } from "@/lib/config";
import { moduleTable, ModuleType, Student, student } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
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
