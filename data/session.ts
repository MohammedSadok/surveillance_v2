"use server";
import { and, count, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/config";
import {
  department,
  exam,
  moduleOption,
  moduleTable,
  monitoring,
  monitoringLine,
  MonitoringLine,
  occupiedTeacher,
  SessionExam,
  sessionExam,
  teacher,
  timeSlot,
  users,
} from "@/lib/schema";
import { DayWithTimeSlots, DayWithTimeSlotsOption } from "@/lib/utils";
import { format } from "date-fns";
import {
  getMonitoringIdsInSession,
  groupByDateAndPeriod,
  insertMonitoringLines,
} from "./monitoring";
import {
  getAvailableTeacherIdsForReservists,
  getFreeTeachersForMonitoring,
} from "./teacher";

export const LoginUser = async (email: string, password: string) => {
  const result = await db.query.users.findFirst({
    where: and(eq(users.email, email), eq(users.password, password)),
  });
  return result || null;
};

export const getUserByEmail = async (email: string) => {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return { email: result?.email, password: result?.password } || null;
};

export const getUserById = async (id: number) => {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result || null;
};

export const gestSessions = async () => {
  const result = await db.select().from(sessionExam);
  return result;
};
export const gestSessionById = async (sessionId: number) => {
  const result = await db.query.sessionExam.findFirst({
    where: eq(sessionExam.id, sessionId),
  });
  return result;
};

export const deleteSession = async (sessionId: number) => {
  try {
    await db.delete(sessionExam).where(eq(sessionExam.id, sessionId));
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};
export const createSession = async (session: CreateSessionType) => {
  try {
    const result = await db.insert(sessionExam).values(session);
    const sessionExamId = result[0].insertId;

    const days = Math.floor(
      (session.endDate.getTime() - session.startDate.getTime()) /
        (1000 * 3600 * 24)
    );

    const timeSlots = [];

    for (let index = 0; index <= days; index++) {
      const currentDate = new Date(
        session.startDate.getTime() + index * 24 * 3600 * 1000
      );
      timeSlots.push(
        {
          date: currentDate,
          period: "Morning",
          timePeriod: `${session.morningSession1.start} - ${session.morningSession1.end}`,
          sessionExamId: sessionExamId,
        },
        {
          date: currentDate,
          period: "Morning",
          timePeriod: `${session.morningSession2.start} - ${session.morningSession2.end}`,
          sessionExamId: sessionExamId,
        },
        {
          date: currentDate,
          period: "Afternoon",
          timePeriod: `${session.afternoonSession1.start} - ${session.afternoonSession1.end}`,
          sessionExamId: sessionExamId,
        },
        {
          date: currentDate,
          period: "Afternoon",
          timePeriod: `${session.afternoonSession2.start} - ${session.afternoonSession2.end}`,
          sessionExamId: sessionExamId,
        }
      );
    }
    await db.insert(timeSlot).values(timeSlots);
    return sessionExamId;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

export const getDaysWithExams = async (
  sessionId: number
): Promise<DayWithTimeSlots[]> => {
  try {
    const result = await db
      .select()
      .from(timeSlot)
      .leftJoin(exam, eq(exam.timeSlotId, timeSlot.id))
      .leftJoin(moduleTable, eq(moduleTable.id, exam.moduleId))
      .where(eq(timeSlot.sessionExamId, sessionId))
      .orderBy(timeSlot.date);

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
          exams: [],
        });
      }

      const currentTimeSlot = acc[dateKey].timeSlots.find(
        (slot) => slot.id === row.timeSlot.id
      );

      if (row.exam && currentTimeSlot && row.module) {
        currentTimeSlot.exams.push({
          id: row.exam.id,
          moduleName: row.module.name,
        });
      }

      return acc;
    }, {} as Record<string, DayWithTimeSlots>);

    const daysArray: DayWithTimeSlots[] = Object.values(days);
    return daysArray;
  } catch (error) {
    console.error("Error fetching days and time slots:", error);
    throw error;
  }
};

export const getDaysWithExamsForOption = async (
  sessionId: number,
  optionsId: string
): Promise<DayWithTimeSlotsOption[]> => {
  try {
    const modulesInOption = db
      .select({
        id: moduleTable.id,
        name: moduleTable.name,
      })
      .from(moduleTable)
      .innerJoin(moduleOption, eq(moduleTable.id, moduleOption.moduleId))
      .where(eq(moduleOption.optionId, optionsId))
      .as("modulesInOption");

    const result = await db
      .select()
      .from(timeSlot)
      .leftJoin(exam, eq(exam.timeSlotId, timeSlot.id))
      .leftJoin(modulesInOption, eq(modulesInOption.id, exam.moduleId))
      .where(eq(timeSlot.sessionExamId, sessionId))
      .orderBy(timeSlot.date);

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
          exams: [],
        });
      }

      const currentTimeSlot = acc[dateKey].timeSlots.find(
        (slot) => slot.id === row.timeSlot.id
      );

      if (row.exam && currentTimeSlot && row.modulesInOption) {
        currentTimeSlot.exams.push({
          id: row.exam.id,
          moduleName: row.modulesInOption.name,
        });
      }

      return acc;
    }, {} as Record<string, DayWithTimeSlots>);

    const daysArray: DayWithTimeSlots[] = Object.values(days);
    return daysArray;
  } catch (error) {
    console.error("Error fetching days and time slots:", error);
    throw error;
  }
};

export type CreateSessionType = {
  morningSession1: {
    start: string;
    end: string;
  };
  morningSession2: {
    start: string;
    end: string;
  };
  afternoonSession1: {
    start: string;
    end: string;
  };
  afternoonSession2: {
    start: string;
    end: string;
  };
} & Pick<SessionExam, "startDate" | "endDate" | "type">;

export const validateSession = async (sessionId: number) => {
  const timeSlots = await getMonitoringIdsInSession(sessionId);
  let monitoringLines: Omit<MonitoringLine, "id">[] = [];
  let assignedTeachers: number[] = [];

  // First phase: Collect all necessary data
  for (const timeSlot of timeSlots) {
    const { locationTeacherMap, freeTeachers } =
      await getFreeTeachersForMonitoring(timeSlot.timeSlotId);

    for (const location of timeSlot.locations) {
      let neededTeachers: number[] = [];
      const teacherForLocation = locationTeacherMap.get(location.locationId);

      if (teacherForLocation !== undefined) {
        neededTeachers = teacherForLocation;
      } else {
        const neededTeacherNumber =
          location.locationType === "AMPHITHEATER"
            ? location.locationName === "NO"
              ? 4
              : 3
            : 2;

        const availableTeachers = freeTeachers.filter(
          (teacher) => !assignedTeachers.includes(teacher.id)
        );

        neededTeachers = availableTeachers
          .slice(0, neededTeacherNumber)
          .map((teacher) => teacher.id);

        assignedTeachers.push(...neededTeachers);
      }

      for (const teacherId of neededTeachers) {
        monitoringLines.push({
          monitoringId: location.idMonitoring,
          teacherId,
        });
      }
      await insertMonitoringLines(monitoringLines);
    }
  }
  const timeSlotIds = await groupByDateAndPeriod(timeSlots);
  await assignReservistTeachers(timeSlotIds);

  await db
    .update(sessionExam)
    .set({ isValidated: true })
    .where(eq(sessionExam.id, sessionId));
};
export const cancelSession = async (sessionId: number) => {
  try {
    // Fetch monitoring IDs related to the given session ID
    const monitoringLines = await db
      .select({
        id: monitoring.id,
      })
      .from(monitoring)
      .innerJoin(exam, eq(exam.id, monitoring.examId))
      .innerJoin(timeSlot, eq(timeSlot.id, exam.timeSlotId))
      .where(eq(timeSlot.sessionExamId, sessionId));

    // Extract the monitoring IDs to delete
    const monitoringToDeleteIds = monitoringLines.map(
      (monitoringLine) => monitoringLine.id
    );

    if (monitoringToDeleteIds.length > 0) {
      // Delete corresponding monitoring lines
      await db
        .delete(monitoringLine)
        .where(inArray(monitoringLine.monitoringId, monitoringToDeleteIds));
    }

    // Fetch reservist monitoring IDs related to the given session ID
    const reservistMonitoringLines = await db
      .select({
        id: occupiedTeacher.id,
      })
      .from(occupiedTeacher)
      .innerJoin(timeSlot, eq(timeSlot.id, occupiedTeacher.timeSlotId))
      .where(
        and(
          eq(timeSlot.sessionExamId, sessionId),
          eq(occupiedTeacher.cause, "RR")
        )
      );

    // Extract the reservist monitoring IDs to delete
    const reservistMonitoringToDeleteIds = reservistMonitoringLines.map(
      (reservistMonitoringLine) => reservistMonitoringLine.id
    );

    if (reservistMonitoringToDeleteIds.length > 0) {
      // Delete corresponding reservist monitoring lines
      await db
        .delete(occupiedTeacher)
        .where(inArray(occupiedTeacher.id, reservistMonitoringToDeleteIds));
    }

    // Update session exam to set isValidated to false
    await db
      .update(sessionExam)
      .set({ isValidated: false })
      .where(eq(sessionExam.id, sessionId));
  } catch (error) {
    console.error("Error cancelling session:", error);
    throw error;
  }
};

export const assignReservistTeachers = async (monitoringSlots: number[][]) => {
  try {
    let assignedTeachers: { timeSlotId: number; teacherIds: number[] }[] = [];
    for (const timeSlotIds of monitoringSlots) {
      let occupiedLines: {
        teacherId: number;
        timeSlotId: number;
        cause: string;
      }[] = [];
      const availableTeacherIds = await getAvailableTeacherIdsForReservists(
        timeSlotIds[0]
      );

      // Fetch the number of teachers needed for this timeSlot
      const neededReservistNumber = 10; // or another logic to determine the needed number of reservists
      const selectedTeachers = availableTeacherIds.slice(
        0,
        neededReservistNumber
      );
      for (const timeSlotId of timeSlotIds) {
        assignedTeachers.push({ timeSlotId, teacherIds: selectedTeachers });
        // Update the database to mark these teachers as occupied for this time slot
        for (const teacherId of selectedTeachers) {
          occupiedLines.push({
            teacherId,
            timeSlotId,
            cause: "RR",
          });
        }
      }
      await db.insert(occupiedTeacher).values(occupiedLines);
    }
    return assignedTeachers;
  } catch (error) {
    console.error("Error assigning reservist teachers:", error);
    throw error;
  }
};
interface Statistics {
  numberOfExams: number;
  numberOfTeachers: number;
  numberOfDepartments: number;
  totalMonitoring: number;
  lastFiveExams: {
    id: number;
    module: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  examsPerDay: {
    day: string;
    total: number;
  }[];
}

export const getStatisticsOfLastSession = async (): Promise<Statistics> => {
  try {
    const lastSession = await db.query.sessionExam.findFirst({
      orderBy: [desc(sessionExam.id)],
    });

    if (!lastSession) {
      throw new Error("No sessions found.");
    }

    const totalMonitoring = await db
      .select({
        total: count(monitoring.id).as("total"),
      })
      .from(monitoringLine)
      .innerJoin(monitoring, eq(monitoring.id, monitoringLine.monitoringId))
      .innerJoin(exam, eq(exam.id, monitoring.examId))
      .innerJoin(timeSlot, eq(timeSlot.id, exam.timeSlotId))
      .where(eq(timeSlot.sessionExamId, lastSession.id));

    const numberOfExams = await db
      .select({
        total: count(exam.id).as("total"),
      })
      .from(exam)
      .innerJoin(timeSlot, eq(timeSlot.id, exam.timeSlotId))
      .where(eq(timeSlot.sessionExamId, lastSession.id));

    const numberOfTeachers = await db
      .select({
        total: count(teacher.id).as("total"),
      })
      .from(teacher);

    const numberOfDepartments = await db
      .select({
        total: count(department.id).as("total"),
      })
      .from(department);
    const numberOfExamsPerDay = await db
      .select({
        day: timeSlot.date,
        total: count(exam.id),
      })
      .from(exam)
      .innerJoin(timeSlot, eq(timeSlot.id, exam.timeSlotId))
      .groupBy(timeSlot.date);

    const examsPerDay = numberOfExamsPerDay.map((exam) => ({
      day: format(new Date(exam.day), "MMMM do, yyyy"), // Formatting date
      total: exam.total,
    }));

    const lastFiveExams = await db
      .select({
        id: exam.id,
        module: moduleTable.name,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
      })
      .from(exam)
      .orderBy(desc(exam.id))
      .limit(5)
      .innerJoin(moduleTable, eq(moduleTable.id, exam.moduleId))
      .innerJoin(teacher, eq(teacher.id, exam.responsibleId));

    return {
      lastFiveExams: lastFiveExams,
      examsPerDay: examsPerDay,
      totalMonitoring: totalMonitoring[0].total,
      numberOfExams: numberOfExams[0].total,
      numberOfTeachers: numberOfTeachers[0].total,
      numberOfDepartments: numberOfDepartments[0].total,
    };
  } catch (error) {
    console.error("Error getting statistics of last session:", error);
    throw error;
  }
};
