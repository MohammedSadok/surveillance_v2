"use server";

import { db } from "@/lib/config";
import {
  exam,
  locationTable,
  monitoring,
  Monitoring,
  monitoringLine,
  MonitoringLine,
  occupiedTeacher,
  teacher,
  timeSlot,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getLocations } from "./location";
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
    // Fetching the teachers who are monitoring
    const monitoringTeachers = await db
      .select({
        timeSlotId: timeSlot.id,
        teacherId: monitoringLine.teacherId,
        locationName: locationTable.name,
      })
      .from(timeSlot)
      .innerJoin(exam, eq(exam.timeSlotId, timeSlot.id))
      .innerJoin(monitoring, eq(monitoring.examId, exam.id))
      .innerJoin(monitoringLine, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(locationTable, eq(locationTable.id, monitoring.locationId))
      .where(eq(timeSlot.sessionExamId, sessionId));

    // Fetching the main result set
    const result = await db
      .select()
      .from(timeSlot)
      .leftJoin(occupiedTeacher, eq(occupiedTeacher.timeSlotId, timeSlot.id))
      .leftJoin(teacher, eq(teacher.id, occupiedTeacher.teacherId))
      .where(eq(timeSlot.sessionExamId, sessionId))
      .orderBy(timeSlot.date);

    // Fetching all teachers
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
          const occupied = result.find(
            (r) =>
              r.timeSlot.id === currentTimeSlot.id &&
              r.occupiedTeacher?.teacherId === teacher.id
          );

          const monitoring = monitoringTeachers.find(
            (m) =>
              m.timeSlotId === currentTimeSlot.id && m.teacherId === teacher.id
          );

          if (monitoring) {
            currentTimeSlot.monitoring.push({
              teacherFirstName: teacher.firstName,
              teacherLastName: teacher.lastName,
              cause: monitoring.locationName,
              timeSlotId: monitoring.timeSlotId,
              departmentId: teacher.departmentId,
            });
          } else if (occupied && occupied.occupiedTeacher) {
            currentTimeSlot.monitoring.push({
              teacherFirstName: teacher.firstName,
              teacherLastName: teacher.lastName,
              cause: occupied.occupiedTeacher.cause,
              timeSlotId: occupied.occupiedTeacher.timeSlotId,
              departmentId: teacher.departmentId,
            });
          } else {
            currentTimeSlot.monitoring.push({
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

export const getMonitoringIdsInSession = async (sessionId: number) => {
  try {
    // Fetch exams in the session
    const examsInSession = db
      .select({
        id: exam.id,
        timeSlotId: exam.timeSlotId,
        date: timeSlot.date,
        period: timeSlot.period,
      })
      .from(timeSlot)
      .innerJoin(exam, eq(exam.timeSlotId, timeSlot.id))
      .where(eq(timeSlot.sessionExamId, sessionId))
      .orderBy(timeSlot.date)
      .as("examsInSession");

    // Fetch monitoring information for the exams in the session
    const monitoringInSession = await db
      .select({
        idMonitoring: monitoring.id,
        date: examsInSession.date,
        period: examsInSession.period,
        timeSlotId: examsInSession.timeSlotId,
        locationId: monitoring.locationId,
      })
      .from(monitoring)
      .innerJoin(examsInSession, eq(examsInSession.id, monitoring.examId));

    // Fetch locations
    const monitoringLocations = await getLocations();

    // Add locationName and locationType properties to the monitoring information
    const monitoringInSessionWithLocation = monitoringInSession.map(
      (monitoring) => {
        const location = monitoringLocations.find(
          (location) => location.id === monitoring.locationId
        );
        return {
          ...monitoring,
          locationName: location ? location.name : null,
          locationType: location ? location.type : null,
        };
      }
    );

    const grouped: {
      [key: number]: {
        timeSlotId: number;
        date: Date;
        period: string;
        locations: Omit<MonitoringData, "timeSlotId">[];
      };
    } = {};

    monitoringInSessionWithLocation.forEach((item) => {
      const { timeSlotId, date, period, ...rest } = item;
      if (!grouped[timeSlotId]) {
        grouped[timeSlotId] = { timeSlotId, date, period, locations: [] };
      }

      // Ensure locationName and locationType are non-null strings
      const locationName = rest.locationName ?? "Unknown";
      const locationType = rest.locationType ?? "Unknown";

      // Push only if locationName and locationType are non-null strings
      if (
        typeof locationName === "string" &&
        typeof locationType === "string"
      ) {
        grouped[timeSlotId].locations.push({
          ...rest,
          locationName,
          locationType,
        });
      }
    });

    return Object.values(grouped);
  } catch (error) {
    console.error("Error fetching monitoring in session:", error);
    throw error;
  }
};

export const insertMonitoringLines = async (
  monitoringLines: Omit<MonitoringLine, "id">[]
) => {
  try {
    await db.insert(monitoringLine).values(monitoringLines);
  } catch (error) {
    console.error("Error inserting monitoring lines:", error);
    throw error;
  }
};
interface Slot {
  timeSlotId: number;
  date: Date;
  period: string;
  locations: any[]; // You should replace 'any[]' with the actual type of your locations objects
}

export const groupByDateAndPeriod = async (
  slots: Slot[]
): Promise<number[][]> => {
  const groupedSlots = new Map<string, number[]>();

  slots.forEach((slot) => {
    const key = `${slot.date.toISOString()}|${slot.period}`;

    if (!groupedSlots.has(key)) {
      groupedSlots.set(key, []);
    }

    groupedSlots.get(key)?.push(slot.timeSlotId);
  });

  return Array.from(groupedSlots.values());
};

interface MonitoringData {
  idMonitoring: number;
  timeSlotId: number;
  locationId: number;
  locationName: string;
  locationType: string;
}
