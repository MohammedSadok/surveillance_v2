"use server";
import { db } from "@/lib/config";
import {
  exam,
  location,
  moduleOption,
  moduleTable,
  ModuleType,
  option,
  Option,
  student,
  studentExamLocation,
  StudentType,
} from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export const createOption = async (newOption: Option) => {
  try {
    await db.insert(option).values(newOption);
  } catch (error) {
    console.error("Error creating option:", error);
    throw error;
  }
};

export const getOptions = async (): Promise<Option[]> => {
  try {
    const result = await db.select().from(option);
    return result;
  } catch (error) {
    console.error("Error fetching options:", error);
    throw error;
  }
};

export const getOptionById = async (id: string) => {
  const result = await db.query.option.findFirst({
    where: eq(option.id, id),
  });
  return result || null;
};
export const updateOption = async (updateOption: Option) => {
  try {
    await db
      .update(option)
      .set(updateOption)
      .where(eq(option.id, updateOption.id));
  } catch (error) {
    console.error("Error updating option:", error);
    throw error;
  }
};

export const deleteOption = async (id: string) => {
  try {
    await db.delete(option).where(eq(option.id, id));
  } catch (error) {
    console.error("Error deleting option:", error);
    throw error;
  }
};

export const getStudentsInOption = async (
  optionId: string,
  sessionExamId: number
): Promise<Omit<StudentType, "id">[]> => {
  try {
    const result = await db
      .select({
        cne: student.cne,
        firstName: student.firstName,
        lastName: student.lastName,
        moduleId: student.moduleId,
        sessionExamId: student.sessionExamId,
      })
      .from(student)
      .innerJoin(moduleTable, eq(student.moduleId, moduleTable.id))
      .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId))
      .innerJoin(option, eq(option.id, moduleOption.optionId))
      .groupBy(student.cne)
      .where(
        and(
          eq(student.sessionExamId, sessionExamId),
          eq(moduleOption.optionId, optionId)
        )
      );

    return result;
  } catch (error) {
    console.error("Error fetching students in option:", error);
    throw error;
  }
};

export const getModulesInOption = async (
  optionId: string
): Promise<ModuleType[]> => {
  try {
    const result = await db
      .select({
        id: moduleTable.id,
        name: moduleTable.name,
      })
      .from(moduleTable)
      .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId))
      .where(eq(moduleOption.optionId, optionId));
    return result;
  } catch (error) {
    console.error("Error fetching modules in option:", error);
    throw error;
  }
};

export const generateStudentsExamOptionSchedule = async (
  sessionExamId: number,
  optionId: string
): Promise<StudentWithExams[]> => {
  try {
    // Fetch students based on sessionExamId
    const students = await getStudentsInOption(optionId, sessionExamId);
    const exams = await db
      .select({
        studentId: student.cne,
        moduleId: moduleTable.id,
        locationName: location.name,
        timeSlot: exam.timeSlotId,
        numberOfStudent: studentExamLocation.numberOfStudent,
      })
      .from(studentExamLocation)
      .innerJoin(student, eq(studentExamLocation.cne, student.cne))
      .innerJoin(exam, eq(studentExamLocation.examId, exam.id))
      .innerJoin(location, eq(studentExamLocation.locationId, location.id))
      .innerJoin(moduleTable, eq(exam.moduleId, moduleTable.id))
      .where(eq(student.sessionExamId, sessionExamId));

    const studentExamSchedule: StudentWithExams[] = students.map((stu) => ({
      ...stu,
      exams: exams
        .filter((ex) => ex.studentId === stu.cne)
        .map((ex) => ({
          numberOfStudent: ex.numberOfStudent,
          moduleId: ex.moduleId,
          locationName: ex.locationName,
          timeSlot: ex.timeSlot,
        })),
    }));

    return studentExamSchedule;
  } catch (error) {
    console.error("Error generating students exam schedule:", error);
    throw error;
  }
};

type Student = {
  cne: string;
  firstName: string;
  lastName: string;
};

export type StudentWithExams = Student & {
  exams: {
    numberOfStudent: number;
    moduleId: string;
    locationName: string;
    timeSlot: number; // or string, depending on your timeSlot type
  }[];
};
