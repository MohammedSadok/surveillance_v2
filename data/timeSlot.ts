"use server";
import { db } from "@/lib/config";
import { TimeSlot, timeSlot } from "@/lib/schema";
import { format } from "date-fns";
import { eq, sql } from "drizzle-orm";

export const getTimeSlotById = async (id: number): Promise<TimeSlot | null> => {
  try {
    const result = await db.query.timeSlot.findFirst({
      where: eq(timeSlot.id, id),
    });

    return result || null;
  } catch (error) {
    console.error("Error fetching time slot:", error);
    throw error;
  }
};

export const getTimeSlotsInSameDayAndPeriod = async (
  timeSlotId: number
): Promise<TimeSlot[]> => {
  try {
    const selectedTimeSlot = await getTimeSlotById(timeSlotId);
    if (selectedTimeSlot) {
      const timeSlotInSameDay = await db.execute<TimeSlot[]>(
        sql`
        SELECT * FROM ${timeSlot}
        WHERE ${timeSlot.date} = ${format(
          selectedTimeSlot.date,
          "yyyy-MM-dd"
        )} and ${timeSlot.period} = ${selectedTimeSlot.period}
      `
      );
      // @ts-ignore: Property 'map' does not exist on type 'ResultSetHeader'
      const timeSlotInSamePeriod: TimeSlot[] = timeSlotInSameDay[0].map(
        (timeSlot: any) => {
          return {
            id: timeSlot.id,
            date: timeSlot.date,
            period: timeSlot.period,
            timePeriod: `${timeSlot.startTime}-${timeSlot.endTime}`,
          };
        }
      );
      return timeSlotInSamePeriod;
    }
    return []; // Add this line to return an empty array when selectedTimeSlot is falsy
  } catch (error) {
    console.error("Error fetching time slots:", error);
    throw error;
  }
};

export const getTimeSlotsInSession = async (sessionId: number) => {
  try {
    const result = await db
      .select()
      .from(timeSlot)
      .where(eq(timeSlot.sessionExamId, sessionId));
    return result;
  } catch (error) {
    console.error("Error fetching time slots in session:", error);
    throw error;
  }
};

export const getTimeSlotsInSameDay = async (timeSlotId: number) => {
  try {
    const selectedTimeSlot = await getTimeSlotById(timeSlotId);
    if (selectedTimeSlot) {
      const timeSlotsInSameDay = await db.execute<TimeSlot[]>(
        sql`
        SELECT * FROM ${timeSlot}
        WHERE ${timeSlot.date} = ${format(selectedTimeSlot.date, "yyyy-MM-dd")}
      `
      );
      // @ts-ignore: Property 'map' does not exist on type 'ResultSetHeader'
      const timeSlotInSamePeriod: TimeSlot[] = timeSlotsInSameDay[0].map(
        (timeSlot: any) => {
          return {
            id: timeSlot.id,
            date: timeSlot.date,
            period: timeSlot.period,
            timePeriod: `${timeSlot.startTime}-${timeSlot.endTime}`,
          };
        }
      );
      return timeSlotInSamePeriod;
    }
  } catch (error) {
    console.error("Error fetching time slots in the same day:", error);
    throw error;
  }
  return [];
};
export const getDaysWithTimeSlots = async (
  sessionId: number
): Promise<DayWithTimeSlotIds[]> => {
  try {
    const result = await db
      .select()
      .from(timeSlot)
      .where(eq(timeSlot.sessionExamId, sessionId));

    const days = result.reduce((acc, row) => {
      const dateKey = row.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, timeSlotIds: [] };
      }

      const currentSlots = acc[dateKey].timeSlotIds;
      currentSlots.push(row.id);
      return acc;
    }, {} as Record<string, DayWithTimeSlotIds>);

    return Object.values(days);
  } catch (error) {
    console.error("Error fetching days with time slots:", error);
    throw error;
  }
};

export interface DayWithTimeSlotIds {
  date: string;
  timeSlotIds: number[];
}
