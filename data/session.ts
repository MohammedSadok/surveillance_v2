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
  OccupiedTeacher,
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
  getMonitoringInDate,
  insertMonitoringLines,
  LocationMonitoring,
} from "./monitoring";
import {
  getFreeTeachersForReservist,
  getFreeTeachersInSameDayAndCountMonitoring,
} from "./teacher";
import { DayWithTimeSlotIds, getDaysWithTimeSlots } from "./timeSlot";
const locationsNeededFour = ["NO", "F", "B", "H", "Hall"];
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

export const getUserDetailsByEmail = async (email: string) => {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return result || null;
};

export const getUserById = async (id: number) => {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result || null;
};

export const gestSessions = async () => {
  const result = await db
    .select()
    .from(sessionExam)
    .orderBy(desc(sessionExam.id));
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
  const daysWithTimeSlots = await getDaysWithTimeSlots(sessionId);
  for (const day of daysWithTimeSlots) {
    let monitoringLines: Omit<MonitoringLine, "id">[] = [];
    let idsForMonitoring = await getFreeTeachersInSameDayAndCountMonitoring(
      day
    );

    const { monitoringInAfternoon, monitoringInMorning } =
      await getMonitoringInDate(day);
    const processLocations = async (locations: LocationMonitoring[]) => {
      for (const location of locations) {
        const neededTeacherNumber =
          location.locationType === "AMPHITHEATER"
            ? locationsNeededFour.includes(location.locationName)
              ? 4
              : 3
            : 2;
        const neededTeachers = idsForMonitoring.slice(0, neededTeacherNumber);
        idsForMonitoring = idsForMonitoring.slice(neededTeacherNumber);

        for (const item of location.monitoringSessions) {
          for (const teacherId of neededTeachers) {
            monitoringLines.push({
              monitoringId: item.idMonitoring,
              teacherId,
            });
          }
        }
      }
    };
    if (monitoringInMorning.length > 0)
      await processLocations(monitoringInMorning);
    if (monitoringInAfternoon.length > 0)
      await processLocations(monitoringInAfternoon);
    if (monitoringLines.length > 0)
      await insertMonitoringLines(monitoringLines);
  }
  for (const day of daysWithTimeSlots) {
    const idsForReservist = await getFreeTeachersForReservist(day);
    if (idsForReservist)
      await assignReservistTeachersForDay(idsForReservist, day);
  }
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
      .where(eq(timeSlot.sessionExamId, lastSession.id))
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
async function assignReservistTeachersForDay(
  idsForReservist: number[],
  day: DayWithTimeSlotIds
) {
  try {
    if (idsForReservist.length < 20) {
      throw new Error(
        "Not enough reservists for assigning to this day. Please add more reservists."
      );
    }

    // Diviser les identifiants des enseignants en deux groupes de 10
    const firstHalfIds = idsForReservist.slice(0, 10);
    const secondHalfIds = idsForReservist.slice(10, 20);

    // Créer les lignes de réservistes pour les deux créneaux de la journée
    const reservistLines: Omit<OccupiedTeacher, "id">[] = [];

    // Pour les deux premiers créneaux
    day.timeSlotIds.slice(0, 2).forEach((timeSlotId) => {
      firstHalfIds.forEach((teacherId) => {
        reservistLines.push({
          teacherId,
          timeSlotId: timeSlotId,
          cause: "RR",
        });
      });
    });

    // Pour les deux derniers créneaux
    day.timeSlotIds.slice(2, 4).forEach((timeSlotId) => {
      secondHalfIds.forEach((teacherId) => {
        reservistLines.push({
          teacherId,
          timeSlotId: timeSlotId,
          cause: "RR",
        });
      });
    });
    await db.insert(occupiedTeacher).values(reservistLines);
  } catch (error) {
    console.error("Error assigning reservist teachers for day:", error);
    throw error;
  }
}
