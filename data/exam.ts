"use server";
import { db } from "@/lib/config";
import { Exam, exam } from "@/lib/schema";
import { eq } from "drizzle-orm";
import {
  getFreeLocationsForModule,
  reserveLocationsForModule,
} from "./location";
import { createOccupiedTeacherInPeriod } from "./teacher";
import { getTimeSlotsInSameDayAndPeriod } from "./timeSlot";

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
    const createdExam = await db.insert(exam).values(newExam);
    await createOccupiedTeacherInPeriod({
      teacherId: newExam.responsibleId,
      cause: "TT",
      timeSlotId: newExam.timeSlotId,
    });
    await reserveLocationsForModule(locations, createdExam[0].insertId);
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
    await db.delete(exam).where(eq(exam.id, id));
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
