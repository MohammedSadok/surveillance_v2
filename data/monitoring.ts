"use server";

import { db } from "@/lib/config";
import {
  monitoring,
  Monitoring,
  occupiedTeacher,
  teacher,
  timeSlot,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
export const createMonitoring = async (
  newMonitoring: Omit<Monitoring, "id">
) => {
  try {
    await db.insert(monitoring).values(newMonitoring);
  } catch (error) {
    console.error("Error creating monitoring:", error);
    throw error;
  }
};

export const getMonitorings = async (): Promise<Monitoring[]> => {
  try {
    const result = await db.select().from(monitoring);
    return result;
  } catch (error) {
    console.error("Error fetching monitorings:", error);
    throw error;
  }
};

export const getMonitoringById = async (
  id: number
): Promise<Monitoring | null> => {
  try {
    const result = await db.query.monitoring.findFirst({
      where: eq(monitoring.id, id),
    });
    return result || null;
  } catch (error) {
    console.error("Error fetching monitoring:", error);
    throw error;
  }
};

export const updateMonitoring = async (newMonitoring: Monitoring) => {
  try {
    await db
      .update(monitoring)
      .set(newMonitoring)
      .where(eq(monitoring.id, newMonitoring.id));
  } catch (error) {
    console.error("Error updating monitoring:", error);
    throw error;
  }
};

export const deleteMonitoring = async (id: number) => {
  try {
    await db.delete(monitoring).where(eq(monitoring.id, id));
  } catch (error) {
    console.error("Error deleting monitoring:", error);
    throw error;
  }
};

export type Surveillance = {
  id: number | null;
  teacherFirstName: string;
  teacherLastName: string;
  cause: string | null;
  timeSlotId: number;
  departmentId: number;
};

export type TimeSlotWithMonitoring = {
  id: number;
  period: string;
  timePeriod: string;
  monitoring: Surveillance[];
};

export type DayWithTimeSlotsAndMonitoring = {
  date: string;
  timeSlots: TimeSlotWithMonitoring[];
};

export const getDaysWithMonitoring = async (
  sessionId: number
): Promise<DayWithTimeSlotsAndMonitoring[]> => {
  try {
    const result = await db
      .select()
      .from(timeSlot)
      .leftJoin(occupiedTeacher, eq(occupiedTeacher.timeSlotId, timeSlot.id))
      .leftJoin(teacher, eq(teacher.id, occupiedTeacher.teacherId))
      .where(eq(timeSlot.sessionExamId, sessionId))
      .orderBy(timeSlot.date);

    const allTeachers = await db
      .select()
      .from(teacher)
      .orderBy(teacher.lastName, teacher.firstName);

    const days = result.reduce((acc, row) => {
      const dateKey = row.timeSlot.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, timeSlots: [] };
      }

      const timeSlotIndex = acc[dateKey].timeSlots.findIndex(
        (slot) => slot.id === row.timeSlot.id
      );

      if (timeSlotIndex === -1) {
        acc[dateKey].timeSlots.push({
          id: row.timeSlot.id,
          period: row.timeSlot.period,
          timePeriod: row.timeSlot.timePeriod,
          monitoring: [],
        });
      }

      const currentTimeSlot = acc[dateKey].timeSlots.find(
        (slot) => slot.id === row.timeSlot.id
      );

      if (currentTimeSlot) {
        allTeachers.forEach((teacher) => {
          const monitoringLine = result.find(
            (r) =>
              r.timeSlot.id === currentTimeSlot.id &&
              r.occupiedTeacher?.teacherId === teacher.id
          );
          if (monitoringLine && monitoringLine.occupiedTeacher) {
            currentTimeSlot.monitoring.push({
              id: monitoringLine.occupiedTeacher.id,
              teacherFirstName: teacher.firstName,
              teacherLastName: teacher.lastName,
              cause: monitoringLine.occupiedTeacher.cause,
              timeSlotId: monitoringLine.occupiedTeacher.timeSlotId,
              departmentId: teacher.departmentId,
            });
          } else {
            currentTimeSlot.monitoring.push({
              id: null,
              teacherFirstName: teacher.firstName,
              teacherLastName: teacher.lastName,
              cause: null,
              timeSlotId: currentTimeSlot.id,
              departmentId: teacher.departmentId,
            });
          }
        });
      }

      return acc;
    }, {} as Record<string, DayWithTimeSlotsAndMonitoring>);

    const daysArray: DayWithTimeSlotsAndMonitoring[] = Object.values(days);
    return daysArray;
  } catch (error) {
    console.error("Error fetching days and time slots:", error);
    throw error;
  }
};
