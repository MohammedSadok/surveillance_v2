"use server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/config";
import {
  exam,
  moduleTable,
  SessionExam,
  sessionExam,
  timeSlot,
  users,
} from "@/lib/schema";
import { DayWithTimeSlots } from "@/lib/utils";

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
