"use server";
import { db } from "@/lib/config";
import {
  Exam,
  exam,
  moduleTable,
  occupiedTeacher,
  student,
  studentExamLocation,
  teacher,
} from "@/lib/schema";
import { and, eq, sql } from "drizzle-orm";
import {
  getFreeLocationsForModule,
  reserveLocationsForModule,
} from "./location";
import { getStudentsInModule } from "./modules";
import { createOccupiedTeacherInPeriod } from "./teacher";
import { getTimeSlotById } from "./timeSlot";

export type ExamType = {
  locations: number[];
  manual: boolean;
} & Omit<Exam, "id">;
export const createExam = async (newExam: ExamType) => {
  try {
    const locations = await getFreeLocationsForModule(
      newExam.moduleId,
      newExam.timeSlotId
    );
    const selectedTimeSlot = await getTimeSlotById(newExam.timeSlotId);
    if (selectedTimeSlot) {
      const createdExam = await db.insert(exam).values(newExam);
      await createOccupiedTeacherInPeriod({
        teacherId: newExam.responsibleId,
        cause: "TT",
        timeSlotId: newExam.timeSlotId,
      });
      const students = await getStudentsInModule(
        newExam.moduleId,
        selectedTimeSlot.sessionExamId
      );

      const studentExamLocationsTable = students.flatMap((student, index) =>
        locations.map((location) => ({
          numberOfStudent: index + 1,
          cne: student.cne,
          examId: createdExam[0].insertId,
          locationId: location.id,
        }))
      );
      await db.insert(studentExamLocation).values(studentExamLocationsTable);
      await reserveLocationsForModule(locations, createdExam[0].insertId);
    }
  } catch (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
};

export const getExams = async (): Promise<Exam[]> => {
  try {
    return await db.select().from(exam);
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw error;
  }
};

export const getExam = async (id: number): Promise<Exam | null> => {
  try {
    const result = await db.query.exam.findFirst({ where: eq(exam.id, id) });
    return result || null;
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw error;
  }
};
export const getExamsByTimeSlot = async (
  timeSlotId: number
): Promise<Exam[]> => {
  try {
    const result = await db
      .select()
      .from(exam)
      .where(eq(exam.timeSlotId, timeSlotId));
    return result;
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw error;
  }
};

export const deleteExam = async (id: number) => {
  try {
    const deleteExam = await getExam(id);
    if (deleteExam)
      await db.transaction(async (tx) => {
        await tx
          .delete(occupiedTeacher)
          .where(
            and(
              eq(occupiedTeacher.timeSlotId, deleteExam.timeSlotId),
              eq(occupiedTeacher.cause, "TT")
            )
          );
        await tx.delete(exam).where(eq(exam.id, id));
      });
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw error;
  }
};

export const updateExam = async (newExam: Exam) => {
  try {
    await db.update(exam).set(newExam).where(eq(exam.id, newExam.id));
  } catch (error) {
    console.error("Error updating exam:", error);
    throw error;
  }
};
export const getExamsWithDetailsAndCounts = async (
  timeSlotId: number
): Promise<ExamWithDetails[]> => {
  // Assuming you have a function getTimeSlotById to get details of a time slot
  const selectedTimeSlot = await getTimeSlotById(timeSlotId);

  if (selectedTimeSlot) {
    const result = await db
      .select({
        examId: exam.id,
        moduleId: exam.moduleId,
        moduleName: moduleTable.name,
        responsibleName: teacher.lastName,
        studentCount: sql<number>`count(${student.id})`.mapWith(Number),
      })
      .from(exam)
      .innerJoin(moduleTable, eq(exam.moduleId, moduleTable.id))
      .innerJoin(teacher, eq(exam.responsibleId, teacher.id))
      .leftJoin(
        student,
        and(
          eq(student.sessionExamId, selectedTimeSlot.sessionExamId),
          eq(student.moduleId, exam.moduleId)
        )
      )
      .where(eq(exam.timeSlotId, timeSlotId))
      .groupBy(exam.id, moduleTable.id, teacher.id);

    return result;
  }

  return [];
};

export type ExamWithDetails = {
  examId: number;
  moduleId: string;
  moduleName: string;
  responsibleName: string;
  studentCount: number;
};
