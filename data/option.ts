"use server";
import { db } from "@/lib/config";
import {
  exam,
  locationTable,
  moduleOption,
  moduleTable,
  ModuleType,
  option,
  Option,
  student,
  studentExamLocation,
  StudentType,
  timeSlot,
} from "@/lib/schema";
import { and, asc, eq } from "drizzle-orm";

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
export const getOptionsForExam = async (
  timeSlotId: number
): Promise<Option[]> => {
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
      .set({ name: updateOption.name })
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
): Promise<Omit<StudentType, "id" | "optionId">[]> => {
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
    const students = db
      .select()
      .from(student)
      .where(
        and(
          eq(student.sessionExamId, sessionExamId),
          eq(student.optionId, optionId)
        )
      )
      .as("students");

    const exams = db
      .select({
        id: exam.id,
        moduleId: exam.moduleId,
        timeSlotId: exam.timeSlotId,
        responsibleId: exam.responsibleId,
      })
      .from(exam)
      .innerJoin(timeSlot, eq(exam.timeSlotId, timeSlot.id))
      .where(eq(timeSlot.sessionExamId, sessionExamId))
      .as("exams");

    const schedule = await db
      .select({
        cne: students.cne,
        firstName: students.firstName,
        lastName: students.lastName,
        examModuleId: exams.moduleId,
        examLocation: locationTable.name,
        numberOfStudent: studentExamLocation.numberOfStudent,
      })
      .from(studentExamLocation)
      .innerJoin(students, eq(studentExamLocation.cne, students.cne))
      .innerJoin(exams, eq(studentExamLocation.examId, exams.id))
      .innerJoin(
        locationTable,
        eq(studentExamLocation.locationId, locationTable.id)
      )
      .where(eq(students.moduleId, exams.moduleId))
      .orderBy(
        asc(students.firstName)
        // asc(studentExamLocation.locationId),
        // asc(studentExamLocation.numberOfStudent)
      );
    const groupedStudents = schedule.reduce((acc, curr) => {
      const existingStudent = acc.find((stu) => stu.cne === curr.cne);
      const examDetails = {
        numberOfStudent: curr.numberOfStudent,
        moduleId: curr.examModuleId,
        locationName: curr.examLocation,
      };

      if (existingStudent) {
        existingStudent.exams.push(examDetails);
      } else {
        acc.push({
          cne: curr.cne,
          firstName: curr.firstName,
          lastName: curr.lastName,
          exams: [examDetails],
        });
      }

      return acc;
    }, [] as StudentWithExams[]);

    return groupedStudents;
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
  }[];
};
