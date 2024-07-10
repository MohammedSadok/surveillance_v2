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
  timeSlot,
  TimeSlot,
  users,
} from "@/lib/schema";
import { and, asc, count, eq, inArray, isNull, notInArray } from "drizzle-orm";
import {
  DayWithTimeSlotIds,
  getTimeSlotById,
  getTimeSlotsInSameDayAndPeriod,
} from "./timeSlot";

export const createTeacher = async (newTeacher: Omit<Teacher, "id">) => {
  try {
    await db.insert(teacher).values(newTeacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
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
      .where(eq(teacher.departmentId, departmentId))
      .orderBy(asc(teacher.lastName));
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
export const getTeachers = async () => {
  try {
    const result = await db.select().from(teacher);
    return result;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const result = await db.select().from(users);
    return result;
  } catch (error) {
    console.error("Error fetching users:", error);
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

export const createOccupiedTeacher = async (
  newOccupiedTeacher: Omit<OccupiedTeacher, "id">
) => {
  try {
    await db.insert(occupiedTeacher).values(newOccupiedTeacher);
  } catch (error) {
    console.error("Error creating occupied teacher:", error);
    throw error;
  }
};

export const updateOccupiedTeacher = async (
  newOccupiedTeacher: Omit<OccupiedTeacher, "id">
) => {
  try {
    await db
      .update(occupiedTeacher)
      .set(newOccupiedTeacher)
      .where(
        and(
          eq(occupiedTeacher.teacherId, newOccupiedTeacher.teacherId),
          eq(occupiedTeacher.timeSlotId, newOccupiedTeacher.timeSlotId)
        )
      );
  } catch (error) {
    console.error("Error updating occupied teacher:", error);
    throw error;
  }
};

export const deleteOccupiedTeacher = async (
  newOccupiedTeacher: Omit<OccupiedTeacher, "id">
) => {
  try {
    await db
      .delete(occupiedTeacher)
      .where(
        and(
          eq(occupiedTeacher.teacherId, newOccupiedTeacher.teacherId),
          eq(occupiedTeacher.timeSlotId, newOccupiedTeacher.timeSlotId)
        )
      );
  } catch (error) {
    console.error("Error deleting occupied teacher:", error);
    throw error;
  }
};

export const getFreeTeachersInSameDayAndCountMonitoring = async (
  day: DayWithTimeSlotIds
) => {
  try {
    // Fetch occupied teachers for the given time slots
    const occupiedTeachers = await db
      .select({ teacherId: occupiedTeacher.teacherId })
      .from(occupiedTeacher)
      .where(inArray(occupiedTeacher.timeSlotId, day.timeSlotIds));

    // Fetch teachers who are monitoring exams in the given time slots
    const monitoringTeachers = await db
      .select({ teacherId: monitoringLine.teacherId })
      .from(monitoringLine)
      .innerJoin(monitoring, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(inArray(exam.timeSlotId, day.timeSlotIds));

    const occupiedTeacherIds = occupiedTeachers.map(
      (occupiedTeacher) => occupiedTeacher.teacherId
    );

    const monitoringTeacherIds = monitoringTeachers.map(
      (monitoringTeacher) => monitoringTeacher.teacherId
    );

    // Combine occupied and monitoring teacher IDs to get unavailable teachers
    //-1 is used to prevent error when no teachers are found
    const unavailableTeacherIds = [
      ...new Set([...occupiedTeacherIds, ...monitoringTeacherIds, -1]),
    ];

    // Fetch all teachers who are not unavailable (i.e., who are free)
    const freeTeachers = await db
      .select()
      .from(teacher)
      .where(
        and(
          notInArray(teacher.id, unavailableTeacherIds),
          eq(teacher.isDispense, false)
        )
      );

    const monitoringCounts = await db
      .select({
        teacherId: monitoringLine.teacherId,
        count: count(monitoringLine.id).as("count"),
      })
      .from(monitoringLine)
      .where(notInArray(monitoringLine.teacherId, [...unavailableTeacherIds]))
      .groupBy(monitoringLine.teacherId);

    const occupationCounts = await db
      .select({
        teacherId: occupiedTeacher.teacherId,
        count: count(occupiedTeacher.id).as("count"),
      })
      .from(occupiedTeacher)
      .where(
        and(
          eq(occupiedTeacher.cause, "TT"),
          notInArray(occupiedTeacher.teacherId, unavailableTeacherIds)
        )
      )
      .groupBy(occupiedTeacher.teacherId);

    // Create a map of teacher ID to monitoring count
    const monitoringCountMap = monitoringCounts.reduce((acc, row) => {
      acc[row.teacherId] = row.count;
      return acc;
    }, {} as Record<number, number>);

    // Create a map of teacher ID to occupation count
    const occupationCountMap = occupationCounts.reduce((acc, row) => {
      acc[row.teacherId] = row.count;
      return acc;
    }, {} as Record<number, number>);

    // Combine monitoring and occupation counts
    const combinedCountMap = freeTeachers.map((teacher) => {
      const monitorCount = monitoringCountMap[teacher.id] || 0;
      const occupationCount = occupationCountMap[teacher.id] || 0;
      return {
        id: teacher.id,
        totalCount: monitorCount + occupationCount,
      };
    });

    // Sort free teachers by the total count (monitoring + occupation)
    combinedCountMap.sort((a, b) => a.totalCount - b.totalCount);

    const idsForMonitoring = combinedCountMap.map((entry) => entry.id);

    // Return sorted teacher IDs
    return idsForMonitoring;
  } catch (error) {
    console.error(
      "Error fetching available teacher IDs for reservists:",
      error
    );
    throw error;
  }
};

export const getFreeTeachersForReservist = async (day: DayWithTimeSlotIds) => {
  try {
    // Fetch occupied teachers for the given time slots
    const occupiedTeachers = await db
      .select({ teacherId: occupiedTeacher.teacherId })
      .from(occupiedTeacher)
      .where(inArray(occupiedTeacher.timeSlotId, day.timeSlotIds));

    // Fetch teachers who are monitoring exams in the given time slots
    const monitoringTeachers = await db
      .select({ teacherId: monitoringLine.teacherId })
      .from(monitoringLine)
      .innerJoin(monitoring, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(inArray(exam.timeSlotId, day.timeSlotIds));

    const occupiedTeacherIds = occupiedTeachers.map(
      (occupiedTeacher) => occupiedTeacher.teacherId
    );

    const monitoringTeacherIds = monitoringTeachers.map(
      (monitoringTeacher) => monitoringTeacher.teacherId
    );

    // Combine occupied and monitoring teacher IDs to get unavailable teachers
    //-1 is used to prevent error when no teachers are found
    const unavailableTeacherIds = [
      ...new Set([...occupiedTeacherIds, ...monitoringTeacherIds, -1]),
    ];

    // Fetch all teachers who are not unavailable (i.e., who are free)
    const freeTeachers = await db
      .select()
      .from(teacher)
      .where(
        and(
          notInArray(teacher.id, unavailableTeacherIds),
          eq(teacher.isDispense, false)
        )
      );

    const occupationCountsReservist = await db
      .select({
        teacherId: occupiedTeacher.teacherId,
        count: count(occupiedTeacher.id).as("count"),
      })
      .from(occupiedTeacher)
      .where(
        and(
          eq(occupiedTeacher.cause, "RR"),
          notInArray(occupiedTeacher.teacherId, unavailableTeacherIds)
        )
      )
      .groupBy(occupiedTeacher.teacherId);

    // Create a map of teacher ID to occupation count
    const occupationCountMapReservist = occupationCountsReservist.reduce(
      (acc, row) => {
        acc[row.teacherId] = row.count;
        return acc;
      },
      {} as Record<number, number>
    );
    const combinedCountMapReservist = freeTeachers.map((teacher) => {
      const reservistCount = occupationCountMapReservist[teacher.id] || 0;
      return {
        id: teacher.id,
        totalCount: reservistCount,
      };
    });

    const reservistTeacherIds = combinedCountMapReservist
      .sort((a, b) => a.totalCount - b.totalCount)
      .map((entry) => entry.id);

    return reservistTeacherIds;
  } catch (error) {
    console.error(
      "Error fetching available teacher IDs for reservists:",
      error
    );
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
export interface OccupationCalendar {
  date: string;
  timeSlots: CalendarTimeSlots[];
}

export type CalendarTimeSlots = Omit<TimeSlot, "date" | "sessionExamId"> & {
  cause: string | null;
};
/**
 *
 * @param sessionId
 * @param teacherId
 * @returns Promise<OccupationCalendar[]>
 * Get the teacher's occupation calendar
 */
export const getTeacherCalendar = async (
  sessionId: number,
  teacherId: number
): Promise<OccupationCalendar[]> => {
  try {
    const calendar = await db
      .select({
        id: timeSlot.id,
        date: timeSlot.date,
        period: timeSlot.period,
        timePeriod: timeSlot.timePeriod,
      })
      .from(timeSlot)
      .where(eq(timeSlot.sessionExamId, sessionId));

    const timeSlots = db
      .select({
        id: timeSlot.id,
        date: timeSlot.date,
        period: timeSlot.period,
        timePeriod: timeSlot.timePeriod,
      })
      .from(timeSlot)
      .where(eq(timeSlot.sessionExamId, sessionId))
      .as("timeSlots");

    const teachers = await db
      .select({
        id: timeSlots.id,
        cause: occupiedTeacher.cause,
      })
      .from(timeSlots)
      .leftJoin(occupiedTeacher, eq(timeSlots.id, occupiedTeacher.timeSlotId))
      .where(eq(occupiedTeacher.teacherId, teacherId));

    const teacherCalendar = calendar.map((row) => {
      const timeSlot = teachers.find((timeSlot) => timeSlot.id === row.id);
      if (timeSlot) {
        return {
          date: row.date.toISOString().split("T")[0],
          id: row.id,
          period: row.period,
          timePeriod: row.timePeriod,
          cause: timeSlot.cause,
        };
      } else {
        return {
          date: row.date.toISOString().split("T")[0],
          id: row.id,
          period: row.period,
          timePeriod: row.timePeriod,
          cause: null,
        };
      }
    });

    const days = teacherCalendar.reduce((acc, row) => {
      const dateKey = row.date;
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, timeSlots: [] };
      }

      const currentSlots = acc[dateKey].timeSlots;
      currentSlots.push({
        id: row.id,
        period: row.period,
        timePeriod: row.timePeriod,
        cause: row.cause,
      });
      return acc;
    }, {} as Record<string, OccupationCalendar>);
    return Object.values(days);
  } catch (error) {
    console.error("Error fetching days with time slots:", error);
    throw error;
  }
};

export const getTeacherMonitoringOut = async (teacherId: number) => {
  try {
    const monitoringOut = await db
      .select({ count: count(occupiedTeacher.id) })
      .from(monitoringLine)
      .where(
        and(
          eq(monitoringLine.teacherId, teacherId),
          isNull(monitoringLine.monitoringId)
        )
      );
    return monitoringOut[0].count || 0;
  } catch (error) {
    console.error("Error fetching teacher monitoring out:", error);
    throw error;
  }
};

export const addTeacherMonitoringOut = async (teacherId: number) => {
  try {
    await db.insert(monitoringLine).values({ teacherId, monitoringId: null });
  } catch (error) {
    console.error("Error adding teacher monitoring out:", error);
    throw error;
  }
};

export const removeTeacherMonitoringOut = async (teacherId: number) => {
  try {
    const deletedLine = await db.query.monitoringLine.findFirst({
      where: and(
        eq(monitoringLine.teacherId, teacherId),
        isNull(monitoringLine.monitoringId)
      ),
    });
    if (deletedLine)
      await db
        .delete(monitoringLine)
        .where(eq(monitoringLine.id, deletedLine.id));
  } catch (error) {
    console.error("Error removing teacher monitoring out:", error);
    throw error;
  }
};
