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
  timeSlot,
} from "@/lib/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  getFreeLocationsForModule,
  reserveLocationsForModule,
} from "./location";
import { getStudentsInModule } from "./modules";
import { createOccupiedTeacherInPeriod } from "./teacher";
import { getTimeSlotById, getTimeSlotsInSameDayAndPeriod } from "./timeSlot";

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

      // Distribute students across locations
      let studentIndex = 0;
      let studentExamLocationsTable: Array<{
        numberOfStudent: number;
        cne: string;
        examId: number;
        locationId: number;
      }> = [];

      for (const location of locations) {
        for (
          let i = 0;
          i < location.size && studentIndex < students.length;
          i++
        ) {
          studentExamLocationsTable.push({
            numberOfStudent: i + 1,
            cne: students[studentIndex].cne,
            examId: createdExam[0].insertId,
            locationId: location.id,
          });
          studentIndex++;
        }
      }

      await db.insert(studentExamLocation).values(studentExamLocationsTable);
      await reserveLocationsForModule(locations, createdExam[0].insertId);
    }
  } catch (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
};

export const getExams = async (sessionExamId: number): Promise<Exam[]> => {
  try {
    return await db
      .select({
        id: exam.id,
        moduleId: exam.moduleId,
        timeSlotId: exam.timeSlotId,
        responsibleId: exam.responsibleId,
      })
      .from(exam)
      .innerJoin(timeSlot, eq(exam.timeSlotId, timeSlot.id))
      .where(eq(timeSlot.sessionExamId, sessionExamId));
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
    const deleteExam = await getExam(id); // Assuming this is a function to get an exam by id
    if (!deleteExam) throw new Error("Exam not found");

    const timeSlots = await getTimeSlotsInSameDayAndPeriod(
      deleteExam.timeSlotId
    ); // Get the time slots in the same day and period
    const timeSlotIds = timeSlots.map((timeSlot) => timeSlot.id);

    await db.transaction(async (tx) => {
      await tx
        .delete(occupiedTeacher)
        .where(
          and(
            inArray(occupiedTeacher.timeSlotId, timeSlotIds),
            eq(occupiedTeacher.cause, "TT"),
            eq(occupiedTeacher.teacherId, deleteExam.responsibleId)
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
        timeSlotId: exam.timeSlotId,
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
  timeSlotId: number;
  examId: number;
  moduleId: string;
  moduleName: string;
  responsibleName: string;
  studentCount: number;
};
