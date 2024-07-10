"use server";

import { db } from "@/lib/config";
import {
  exam,
  locationTable,
  moduleTable,
  monitoring,
  Monitoring,
  monitoringLine,
  MonitoringLine,
  occupiedTeacher,
  teacher,
  timeSlot,
} from "@/lib/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getLocations } from "./location";
import { DayWithTimeSlotIds } from "./timeSlot";
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

export const getDaysWithMonitoringDep = async (
  sessionId: number,
  departmentId: number
): Promise<DayWithTimeSlotsAndMonitoring[]> => {
  try {
    const allTeachers = await db
      .select()
      .from(teacher)
      .where(eq(teacher.departmentId, departmentId))
      .orderBy(teacher.lastName, teacher.firstName);

    const teachersIds = allTeachers.map((teacher) => teacher.id);

    const timeSlots = db
      .select()
      .from(timeSlot)
      .where(and(eq(timeSlot.sessionExamId, sessionId)))
      .as("timeSlots");

    const SessionTimeSlots = await db
      .select()
      .from(timeSlot)
      .where(and(eq(timeSlot.sessionExamId, sessionId)));

    // Fetching the teachers who are monitoring
    const monitoringTeachers = await db
      .select({
        timeSlotId: timeSlots.id,
        teacherId: monitoringLine.teacherId,
        locationName: locationTable.name,
      })
      .from(exam)
      .innerJoin(timeSlots, eq(exam.timeSlotId, timeSlots.id))
      .innerJoin(monitoring, eq(monitoring.examId, exam.id))
      .innerJoin(monitoringLine, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(locationTable, eq(locationTable.id, monitoring.locationId))
      .where(inArray(monitoringLine.teacherId, teachersIds));
    // Fetching the main result set
    const result = await db
      .select()
      .from(occupiedTeacher)
      .innerJoin(timeSlots, eq(occupiedTeacher.timeSlotId, timeSlots.id))
      .orderBy(timeSlots.date, desc(timeSlots.period));

    const days = SessionTimeSlots.reduce((acc, row) => {
      const dateKey = row.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, timeSlots: [] };
      }

      const timeSlotIndex = acc[dateKey].timeSlots.findIndex(
        (slot) => slot.id === row.id
      );

      if (timeSlotIndex === -1) {
        acc[dateKey].timeSlots.push({
          id: row.id,
          period: row.period,
          timePeriod: row.timePeriod,
          monitoring: [],
        });
      }

      const currentTimeSlot = acc[dateKey].timeSlots.find(
        (slot) => slot.id === row.id
      );

      if (currentTimeSlot) {
        allTeachers.forEach((teacher) => {
          const occupied = result.find(
            (r) =>
              r.timeSlots.id === currentTimeSlot.id &&
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

type Teacher = {
  firstName: string;
  lastName: string;
};

type Location = {
  locationName: string;
  teachers: Teacher[];
};

export type MonitoringDay = {
  moduleId: string;
  moduleTableName: string;
  timeSlot: string;
  responsibleName: string;
  locations: Location[];
};

export const getMonitoringInDay = async (
  day: DayWithTimeSlotsAndMonitoring
): Promise<MonitoringDay[]> => {
  const teachers = db
    .select({
      teacherId: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
    })
    .from(exam)
    .innerJoin(teacher, eq(teacher.id, exam.responsibleId))
    .as("teachers");
  const examsInDay = await db
    .select({
      examId: exam.id,
      timeSlotId: exam.timeSlotId,
      monitoringId: monitoring.id,
      teacherFirstName: teacher.firstName,
      teacherLastName: teacher.lastName,
      locationName: locationTable.name,
      locationId: locationTable.id,
      moduleId: exam.moduleId,
      moduleTableName: moduleTable.name,
      moduleResponsible: exam.responsibleId,
      responsibleFirstName: teachers.firstName,
      responsibleLastName: teachers.lastName,
    })
    .from(exam)
    .where(
      inArray(
        exam.timeSlotId,
        day.timeSlots.map((ts) => ts.id)
      )
    )
    .innerJoin(moduleTable, eq(moduleTable.id, exam.moduleId))
    .innerJoin(monitoring, eq(monitoring.examId, exam.id))
    .innerJoin(locationTable, eq(locationTable.id, monitoring.locationId))
    .innerJoin(monitoringLine, eq(monitoringLine.monitoringId, monitoring.id))
    .innerJoin(teacher, eq(teacher.id, monitoringLine.teacherId))
    .innerJoin(teachers, eq(teachers.teacherId, exam.responsibleId));

  const moduleMap: { [key: string]: MonitoringDay } = {};

  examsInDay.forEach((exam) => {
    const moduleKey = exam.moduleId;
    if (!moduleMap[moduleKey]) {
      const timeSlotIndex = day.timeSlots.findIndex(
        (ts) => ts.id === exam.timeSlotId
      );
      moduleMap[moduleKey] = {
        moduleId: exam.moduleId,
        moduleTableName: exam.moduleTableName,
        timeSlot: `S ${timeSlotIndex + 1}`,
        responsibleName: `${exam.responsibleFirstName} ${exam.responsibleLastName}`,
        locations: [],
      };
    }

    const moduleExam = moduleMap[moduleKey];
    let location = moduleExam.locations.find(
      (loc) => loc.locationName === exam.locationName
    );
    if (!location) {
      location = {
        locationName: exam.locationName,
        teachers: [],
      };
      moduleExam.locations.push(location);
    }

    location.teachers.push({
      firstName: exam.teacherFirstName,
      lastName: exam.teacherLastName,
    });
  });
  return Object.values(moduleMap);
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

interface MonitoringSession {
  idMonitoring: number;
  timeSlotId: number;
}

export interface LocationMonitoring {
  locationId: number;
  locationName: string;
  locationType: string;
  monitoringSessions: MonitoringSession[];
}

interface MonitoringDataAndLocation {
  monitoringInMorning: LocationMonitoring[];
  monitoringInAfternoon: LocationMonitoring[];
}

export const getMonitoringInDate = async (
  day: DayWithTimeSlotIds
): Promise<MonitoringDataAndLocation> => {
  try {
    const examsInMorning = db
      .select()
      .from(exam)
      .where(inArray(exam.timeSlotId, day.timeSlotIds.slice(0, 2)))
      .as("examsInMorning");

    const examsInAfternoon = db
      .select()
      .from(exam)
      .where(inArray(exam.timeSlotId, day.timeSlotIds.slice(2, 4)))
      .as("examsInAfternoon");

    const monitoringInMorning = await db
      .select({
        idMonitoring: monitoring.id,
        timeSlotId: examsInMorning.timeSlotId,
        locationId: monitoring.locationId,
        locationName: locationTable.name,
        locationType: locationTable.type,
      })
      .from(monitoring)
      .innerJoin(examsInMorning, eq(examsInMorning.id, monitoring.examId))
      .innerJoin(locationTable, eq(monitoring.locationId, locationTable.id));

    const monitoringInAfternoon = await db
      .select({
        idMonitoring: monitoring.id,
        timeSlotId: examsInAfternoon.timeSlotId,
        locationId: monitoring.locationId,
        locationName: locationTable.name,
        locationType: locationTable.type,
      })
      .from(monitoring)
      .innerJoin(examsInAfternoon, eq(examsInAfternoon.id, monitoring.examId))
      .innerJoin(locationTable, eq(monitoring.locationId, locationTable.id));

    const groupByLocation = (
      monitoringData: any[]
    ): Record<string, LocationMonitoring> => {
      return monitoringData.reduce((acc, row) => {
        const key = `${row.locationId}_${row.locationName}_${row.locationType}`;
        if (!acc[key]) {
          acc[key] = {
            locationId: row.locationId,
            locationName: row.locationName,
            locationType: row.locationType,
            monitoringSessions: [],
          };
        }
        acc[key].monitoringSessions.push({
          idMonitoring: row.idMonitoring,
          timeSlotId: row.timeSlotId,
        });
        return acc;
      }, {} as Record<string, LocationMonitoring>);
    };

    const groupedMonitoringInMorning = groupByLocation(monitoringInMorning);
    const groupedMonitoringInAfternoon = groupByLocation(monitoringInAfternoon);

    return {
      monitoringInMorning: Object.values(groupedMonitoringInMorning),
      monitoringInAfternoon: Object.values(groupedMonitoringInAfternoon),
    };
  } catch (error) {
    console.error("Error fetching monitoring in date:", error);
    throw error;
  }
};
