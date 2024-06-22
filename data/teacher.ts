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
} from "@/lib/schema";
import { and, count, eq, inArray, notInArray } from "drizzle-orm";
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
export const getFreeTeachersForMonitoring = async (timeSlotId: number) => {
  try {
    // Fetch occupied teachers for the given time slot
    const occupiedTeachers = await db
      .select({
        teacherId: occupiedTeacher.teacherId,
        cause: occupiedTeacher.cause,
      })
      .from(occupiedTeacher)
      .where(eq(occupiedTeacher.timeSlotId, timeSlotId));

    const occupiedTeacherIds = occupiedTeachers.map(
      (occupiedTeacher) => occupiedTeacher.teacherId
    );

    // Fetch teachers already monitoring exams in the given time slot
    const monitoringTeachers = await db
      .select({ teacherId: monitoringLine.teacherId })
      .from(monitoringLine)
      .innerJoin(monitoring, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(eq(exam.timeSlotId, timeSlotId));

    const monitoringTeacherIds = monitoringTeachers.map(
      (monitoringTeacher) => monitoringTeacher.teacherId
    );

    // Combine the occupied and monitoring teacher IDs to get the unavailable teachers
    const unavailableTeacherIds = [
      ...new Set([...occupiedTeacherIds, ...monitoringTeacherIds]),
    ];

    // Fetch all teachers who are not unavailable (i.e., who are free for monitoring)
    let freeTeachers = await db
      .select()
      .from(teacher)
      .where(notInArray(teacher.id, unavailableTeacherIds));

    // Count the number of monitorings each teacher has conducted
    const monitoringCounts = await db
      .select({
        teacherId: monitoringLine.teacherId,
        monitoringCount: count(monitoringLine.monitoringId).as(
          "monitoringCount"
        ),
        occupiedCount: count(occupiedTeacher.id).as("occupiedCount"),
      })
      .from(monitoringLine)
      .innerJoin(
        occupiedTeacher,
        eq(monitoringLine.teacherId, occupiedTeacher.id)
      )
      .groupBy(monitoringLine.teacherId);

    // Merge the monitoringCounts and occupiedCounts
    const monitoringCountMap = new Map<number, number>();
    monitoringCounts.forEach(
      ({ teacherId, monitoringCount, occupiedCount }) => {
        monitoringCountMap.set(teacherId, monitoringCount + occupiedCount);
      }
    );

    // Sort free teachers by their total counts (monitoring + occupied)
    freeTeachers = freeTeachers.sort((a, b) => {
      const countA = monitoringCountMap.get(a.id) || 0;
      const countB = monitoringCountMap.get(b.id) || 0;
      return countA - countB;
    });

    const timeSlots = await getTimeSlotsInSameDayAndPeriod(timeSlotId);
    const OtherTimeSlotId = timeSlots?.filter(
      (timeSlot) => timeSlot.id !== timeSlotId
    );

    let locationTeacherMap = new Map<number, number[]>();
    if (OtherTimeSlotId) {
      const teachersInSamePeriod = await db
        .select({
          teacherId: monitoringLine.teacherId,
          locationId: monitoring.locationId,
        })
        .from(monitoring)
        .innerJoin(exam, eq(monitoring.examId, exam.id))
        .innerJoin(timeSlot, eq(exam.timeSlotId, timeSlot.id))
        .innerJoin(
          monitoringLine,
          eq(monitoring.id, monitoringLine.monitoringId)
        )
        .where(
          and(
            eq(timeSlot.id, OtherTimeSlotId[0].id),
            notInArray(monitoringLine.teacherId, unavailableTeacherIds)
          )
        );
      teachersInSamePeriod.forEach((teacher) => {
        if (locationTeacherMap.has(teacher.locationId)) {
          locationTeacherMap.get(teacher.locationId)!.push(teacher.teacherId);
        } else {
          locationTeacherMap.set(teacher.locationId, [teacher.teacherId]);
        }
      });
    }

    return { freeTeachers, locationTeacherMap };
  } catch (error) {
    console.error("Error fetching free teachers:", error);
    throw error;
  }
};

export const getTeachersInTheSamePeriod = async (
  timeSlotId: number
): Promise<Map<number, number[]>> => {
  try {
    const timeSlots = await getTimeSlotsInSameDayAndPeriod(timeSlotId);
    const OtherTimeSlotId = timeSlots?.filter(
      (timeSlot) => timeSlot.id !== timeSlotId
    );
    let locationTeacherMap = new Map<number, number[]>();
    if (OtherTimeSlotId) {
      const teachersInSamePeriod = await db
        .select({
          teacherId: monitoringLine.teacherId,
          locationId: monitoring.locationId,
        })
        .from(monitoring)
        .innerJoin(exam, eq(monitoring.examId, exam.id))
        .innerJoin(timeSlot, eq(exam.timeSlotId, timeSlot.id))
        .innerJoin(
          monitoringLine,
          eq(monitoring.id, monitoringLine.monitoringId)
        )
        .where(eq(timeSlot.id, OtherTimeSlotId[0].id));
      teachersInSamePeriod.forEach((teacher) => {
        if (locationTeacherMap.has(teacher.locationId)) {
          locationTeacherMap.get(teacher.locationId)!.push(teacher.teacherId);
        } else {
          locationTeacherMap.set(teacher.locationId, [teacher.teacherId]);
        }
      });
    }
    return locationTeacherMap;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

export const getFreeTeachersInSameDayAndCountMonitoring = async (
  day: DayWithTimeSlotIds
) => {
  try {
    // Fetch occupied teachers for the given time slots
    const occupiedTeachersPromise = db
      .select({ teacherId: occupiedTeacher.teacherId })
      .from(occupiedTeacher)
      .where(inArray(occupiedTeacher.timeSlotId, day.timeSlotIds));

    // Fetch teachers who are monitoring exams in the given time slots
    const monitoringTeachersPromise = db
      .select({ teacherId: monitoringLine.teacherId })
      .from(monitoringLine)
      .innerJoin(monitoring, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(inArray(exam.timeSlotId, day.timeSlotIds));

    const [occupiedTeachers, monitoringTeachers] = await Promise.all([
      occupiedTeachersPromise,
      monitoringTeachersPromise,
    ]);

    const occupiedTeacherIds = occupiedTeachers.map(
      (occupiedTeacher) => occupiedTeacher.teacherId
    );

    const monitoringTeacherIds = monitoringTeachers.map(
      (monitoringTeacher) => monitoringTeacher.teacherId
    );

    // Combine occupied and monitoring teacher IDs to get unavailable teachers
    const unavailableTeacherIds = [
      ...new Set([...occupiedTeacherIds, ...monitoringTeacherIds]),
    ];

    // Fetch all teachers who are not unavailable (i.e., who are free)
    const freeTeachersPromise = db
      .select()
      .from(teacher)
      .where(
        and(
          notInArray(teacher.id, unavailableTeacherIds),
          eq(teacher.isDispense, false)
        )
      );

    const occupationCountsReservistPromise = db
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

    const [freeTeachers, occupationCountsReservist] = await Promise.all([
      freeTeachersPromise,
      occupationCountsReservistPromise,
    ]);

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
      .slice(0, 20)
      .map((entry) => entry.id);

    const monitoringCountsPromise = db
      .select({
        teacherId: monitoringLine.teacherId,
        count: count(monitoringLine.id).as("count"),
      })
      .from(monitoringLine)
      .where(notInArray(monitoringLine.teacherId, unavailableTeacherIds))
      .groupBy(monitoringLine.teacherId);

    const occupationCountsPromise = db
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

    const [monitoringCounts, occupationCounts] = await Promise.all([
      monitoringCountsPromise,
      occupationCountsPromise,
    ]);

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

    const idsForMonitoring = combinedCountMap
      .map((entry) => entry.id)
      .filter((id) => !reservistTeacherIds.includes(id));
    const idsForReservist = reservistTeacherIds;

    // Return sorted teacher IDs
    return {
      idsForMonitoring,
      idsForReservist,
    };
  } catch (error) {
    console.error(
      "Error fetching available teacher IDs for reservists:",
      error
    );
    throw error;
  }
};
