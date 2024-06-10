"use server";
import { db } from "@/lib/config";
import {
  exam,
  monitoring,
  monitoringLine,
  OccupiedTeacher,
  occupiedTeacher,
  teacher,
  Teacher,
} from "@/lib/schema";
import { and, eq, notInArray } from "drizzle-orm";
import { getTimeSlotById, getTimeSlotsInSameDayAndPeriod } from "./timeSlot";

export const createTeacher = async (newTeacher: Omit<Teacher, "id">) => {
  try {
    await db.insert(teacher).values(newTeacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
    throw error;
  }
};

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const result = await db.select().from(teacher);
    return result;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

export const getTeachersInDepartment = async (
  departmentId: number
): Promise<Teacher[]> => {
  try {
    const result = await db
      .select()
      .from(teacher)
      .where(eq(teacher.departmentId, departmentId));
    return result;
  } catch (error) {
    console.error("Error fetching teachers in department:", error);
    throw error;
  }
};

export const getTeacherById = async (id: number): Promise<Teacher | null> => {
  try {
    const result = await db.query.teacher.findFirst({
      where: eq(teacher.id, id),
    });
    return result || null;
  } catch (error) {
    console.error("Error fetching teacher by ID:", error);
    throw error;
  }
};

export const updateTeacher = async (newTeacher: Teacher) => {
  try {
    await db
      .update(teacher)
      .set(newTeacher)
      .where(eq(teacher.id, newTeacher.id));
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
};

export const deleteTeacher = async (id: number): Promise<void> => {
  try {
    await db.delete(teacher).where(eq(teacher.id, id));
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
};

export const getFreeTeachers = async (
  timeSlotId: number
): Promise<Teacher[]> => {
  try {
    const occupiedTeachers = await db
      .select({ teacherId: occupiedTeacher.id })
      .from(occupiedTeacher)
      .where(eq(occupiedTeacher.timeSlotId, timeSlotId));

    const occupiedTeacherIds = occupiedTeachers.map(
      (occupiedTeacher) => occupiedTeacher.teacherId
    );

    const monitoringTeachers = await db
      .select({ monitoringId: monitoring.id })
      .from(monitoringLine)
      .innerJoin(monitoring, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(eq(exam.timeSlotId, timeSlotId));

    const monitoringTeacherIds = monitoringTeachers.map(
      (monitoringTeacher) => monitoringTeacher.monitoringId
    );

    let freeTeachers: Teacher[] = [];
    if (occupiedTeacherIds.length === 0 && monitoringTeacherIds.length === 0) {
      freeTeachers = await db
        .select()
        .from(teacher)
        .where(
          notInArray(teacher.id, [
            ...occupiedTeacherIds,
            ...monitoringTeacherIds,
          ])
        );
    } else {
      freeTeachers = await db.select().from(teacher);
    }
    return freeTeachers;
  } catch (error) {
    console.error("Error fetching free teachers:", error);
    throw error;
  }
};

export const getFreeTeachersByDepartment = async (
  timeSlotId: number,
  departmentId: number
) => {
  try {
    const occupiedTeachers = await db
      .select({ teacherId: occupiedTeacher.teacherId })
      .from(occupiedTeacher)
      .where(eq(occupiedTeacher.timeSlotId, timeSlotId));

    const occupiedTeacherIds = occupiedTeachers.map(
      (occupiedTeacher) => occupiedTeacher.teacherId
    );

    const monitoringTeachers = await db
      .select({ monitoringId: monitoring.id })
      .from(monitoringLine)
      .innerJoin(monitoring, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(eq(exam.timeSlotId, timeSlotId));

    const monitoringTeacherIds = monitoringTeachers.map(
      (monitoringTeacher) => monitoringTeacher.monitoringId
    );
    let freeTeachers: Teacher[] = [];
    if ([...occupiedTeacherIds, ...monitoringTeacherIds].length > 0) {
      freeTeachers = await db
        .select()
        .from(teacher)
        .where(
          and(
            eq(teacher.departmentId, departmentId),
            notInArray(teacher.id, [
              ...occupiedTeacherIds,
              ...monitoringTeacherIds,
            ])
          )
        );
    } else {
      freeTeachers = await db
        .select()
        .from(teacher)
        .where(eq(teacher.departmentId, departmentId));
    }
    return freeTeachers;
  } catch (error) {
    console.error("Error fetching free teachers:", error);
    throw error;
  }
};

export const createOccupiedTeacherInPeriod = async (
  newOccupiedTeacher: Omit<OccupiedTeacher, "id">
) => {
  try {
    const selectedTimeSlot = await getTimeSlotById(
      newOccupiedTeacher.timeSlotId
    );
    const timeSlotInSameDay = await getTimeSlotsInSameDayAndPeriod(
      newOccupiedTeacher.timeSlotId
    );
    if (selectedTimeSlot && timeSlotInSameDay) {
      const occupiedTeacherInPeriod: Omit<OccupiedTeacher, "id">[] =
        timeSlotInSameDay.map((timeSlot) => {
          return {
            cause: newOccupiedTeacher.cause,
            teacherId: newOccupiedTeacher.teacherId,
            timeSlotId: timeSlot.id,
          };
        });
      await db.insert(occupiedTeacher).values(occupiedTeacherInPeriod);
    }
  } catch (error) {
    console.error("Error creating occupied teacher:", error);
    throw error;
  }
};
