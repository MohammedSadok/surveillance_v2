"use server";
import db from "@/lib/config";
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
  getTimeSlotById,
  getTimeSlotsInSameDay,
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
    const result = await db.select().from(teacher).where(eq(teacher.id, id));
    return result[0] || null;
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

// export const getFreeTeachersForMonitoring = async (timeSlotId: number) => {
//   try {
//     // Fetch occupied teachers for the given time slot
//     const occupiedTeachers = await db
//       .select({ teacherId: occupiedTeacher.teacherId })
//       .from(occupiedTeacher)
//       .where(eq(occupiedTeacher.timeSlotId, timeSlotId));

//     const occupiedTeacherIds = occupiedTeachers.map(
//       (occupiedTeacher) => occupiedTeacher.teacherId
//     );

//     // Fetch teachers already monitoring exams in the given time slot
//     const monitoringTeachers = await db
//       .select({ teacherId: monitoringLine.teacherId })
//       .from(monitoringLine)
//       .innerJoin(monitoring, eq(monitoringLine.monitoringId, monitoring.id))
//       .innerJoin(exam, eq(monitoring.examId, exam.id))
//       .where(eq(exam.timeSlotId, timeSlotId));

//     const monitoringTeacherIds = monitoringTeachers.map(
//       (monitoringTeacher) => monitoringTeacher.teacherId
//     );

//     // Combine the occupied and monitoring teacher IDs to get the unavailable teachers
//     const unavailableTeacherIds = [
//       ...new Set([...occupiedTeacherIds, ...monitoringTeacherIds]),
//     ];

//     // Count the number of monitorings each teacher has conducted
//     const monitoringCounts = await db
//       .select({
//         teacherId: monitoringLine.teacherId,
//         monitoringCount: count(monitoringLine.monitoringId).as(
//           "monitoringCount"
//         ),
//       })
//       .from(monitoringLine)
//       .groupBy(monitoringLine.teacherId);

//     // Create a map of teacherId to monitoringCount
//     const monitoringCountMap = new Map(
//       monitoringCounts.map(({ teacherId, monitoringCount }) => [
//         teacherId,
//         monitoringCount,
//       ])
//     );

//     // Fetch all teachers who are not unavailable (i.e., who are free for monitoring)
//     let freeTeachers = await db
//       .select()
//       .from(teacher)
//       .where(notInArray(teacher.id, unavailableTeacherIds));

//     // Sort free teachers by their monitoring counts (ascending order)
//     freeTeachers = freeTeachers.sort((a, b) => {
//       const countA = monitoringCountMap.get(a.id) || 0;
//       const countB = monitoringCountMap.get(b.id) || 0;
//       return countA - countB;
//     });

//     const timeSlots = await getTimeSlotsInSameDayAndPeriod(timeSlotId);
//     const OtherTimeSlotId = timeSlots?.filter(
//       (timeSlot) => timeSlot.id !== timeSlotId
//     );
//     let locationTeacherMap = new Map<number, number[]>();
//     if (OtherTimeSlotId) {
//       const teachersInSamePeriod = await db
//         .select({
//           teacherId: monitoringLine.teacherId,
//           locationId: monitoring.locationId,
//         })
//         .from(monitoring)
//         .innerJoin(exam, eq(monitoring.examId, exam.id))
//         .innerJoin(timeSlot, eq(exam.timeSlotId, timeSlot.id))
//         .innerJoin(
//           monitoringLine,
//           eq(monitoring.id, monitoringLine.monitoringId)
//         )
//         .where(
//           and(
//             eq(timeSlot.id, OtherTimeSlotId[0].id),
//             notInArray(monitoringLine.teacherId, unavailableTeacherIds)
//           )
//         );
//       teachersInSamePeriod.forEach((teacher) => {
//         if (locationTeacherMap.has(teacher.locationId)) {
//           locationTeacherMap.get(teacher.locationId)!.push(teacher.teacherId);
//         } else {
//           locationTeacherMap.set(teacher.locationId, [teacher.teacherId]);
//         }
//       });
//     }

//     return { freeTeachers, locationTeacherMap };
//   } catch (error) {
//     console.error("Error fetching free teachers:", error);
//     throw error;
//   }
// };

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
      })
      .from(monitoringLine)
      .groupBy(monitoringLine.teacherId);

    // Count the number of occupied times each teacher has, filtering by cause "TT" or "RR"
    const occupiedCounts = await db
      .select({
        teacherId: occupiedTeacher.teacherId,
        occupiedCount: count(occupiedTeacher.id).as("occupiedCount"),
      })
      .from(occupiedTeacher)
      .where(inArray(occupiedTeacher.cause, ["TT", "RR"]))
      .groupBy(occupiedTeacher.teacherId);

    // Merge the monitoringCounts and occupiedCounts
    const monitoringCountMap = new Map<number, number>();
    monitoringCounts.forEach(({ teacherId, monitoringCount }) => {
      monitoringCountMap.set(teacherId, monitoringCount);
    });

    occupiedCounts.forEach(({ teacherId, occupiedCount }) => {
      const currentCount = monitoringCountMap.get(teacherId) || 0;
      monitoringCountMap.set(teacherId, currentCount + occupiedCount);
    });

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

export const getAvailableTeacherIdsForReservists = async (
  timeSlotId: number
): Promise<number[]> => {
  try {
    // Fetch all time slots in the same day
    const timeSlotsInSameDay = await getTimeSlotsInSameDay(timeSlotId);

    if (!timeSlotsInSameDay || timeSlotsInSameDay.length === 0) {
      return [];
    }

    const timeSlotIds = timeSlotsInSameDay.map((slot) => slot.id);

    // Fetch occupied teachers for the given time slots
    const occupiedTeachers = await db
      .select({ teacherId: occupiedTeacher.teacherId })
      .from(occupiedTeacher)
      .where(inArray(occupiedTeacher.timeSlotId, timeSlotIds));

    const occupiedTeacherIds = occupiedTeachers.map(
      (occupiedTeacher) => occupiedTeacher.teacherId
    );

    // Fetch teachers already monitoring exams in the given time slots
    const monitoringTeachers = await db
      .select({ teacherId: monitoringLine.teacherId })
      .from(monitoringLine)
      .innerJoin(monitoring, eq(monitoringLine.monitoringId, monitoring.id))
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(inArray(exam.timeSlotId, timeSlotIds));

    const monitoringTeacherIds = monitoringTeachers.map(
      (monitoringTeacher) => monitoringTeacher.teacherId
    );

    // Combine the occupied and monitoring teacher IDs to get the unavailable teachers
    const unavailableTeacherIds = [
      ...new Set([...occupiedTeacherIds, ...monitoringTeacherIds]),
    ];

    // Fetch all teachers who are not unavailable (i.e., who are free)
    let freeTeachers = await db
      .select()
      .from(teacher)
      .where(notInArray(teacher.id, unavailableTeacherIds));

    // Count the number of times each teacher has been a reservist
    const reservistCounts = await db
      .select({
        teacherId: occupiedTeacher.teacherId,
        reservistCount: count(occupiedTeacher.id).as("reservistCount"),
      })
      .from(occupiedTeacher)
      .where(eq(occupiedTeacher.cause, "RR"))
      .groupBy(occupiedTeacher.teacherId);

    // Create a map of teacherId to reservistCount
    const reservistCountMap = new Map(
      reservistCounts.map(({ teacherId, reservistCount }) => [
        teacherId,
        reservistCount,
      ])
    );

    // Sort free teachers by their reservist counts (ascending order)
    freeTeachers = freeTeachers.sort((a, b) => {
      const countA = reservistCountMap.get(a.id) || 0;
      const countB = reservistCountMap.get(b.id) || 0;
      return countA - countB;
    });

    // Return the IDs of the sorted free teachers
    return freeTeachers.map((teacher) => teacher.id);
  } catch (error) {
    console.error(
      "Error fetching available teacher IDs for reservists:",
      error
    );
    throw error;
  }
};
