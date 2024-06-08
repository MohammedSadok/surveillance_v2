"use server";
import { and, eq } from "drizzle-orm";

import { db } from "./config";
import { SessionExam, sessionExam, timeSlot, users } from "./schema";
import { DayWithTimeSlots } from "./utils";

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
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

export const getDays = async (
  sessionId: number
): Promise<DayWithTimeSlots[]> => {
  try {
    const result = await db
      .select()
      .from(timeSlot)
      .where(eq(timeSlot.sessionExamId, sessionId))
      .orderBy(timeSlot.date, timeSlot.period);
    const days = result.reduce((acc, slot) => {
      const dateKey = slot.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, timeSlots: [] };
      }
      acc[dateKey].timeSlots.push({
        period: slot.period,
        timePeriod: slot.timePeriod,
      });
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
