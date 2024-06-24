"use server";
import { db } from "@/lib/config";
import {
  exam,
  locationTable,
  LocationType,
  monitoring,
  occupiedLocation,
  OccupiedLocation,
  TimeSlot,
  timeSlot,
} from "@/lib/schema";
import { and, desc, eq, isNull, notInArray, or } from "drizzle-orm";
import { ExamLocation } from "./exam";
import { getNumberOfStudentsInModule } from "./modules";
import { getTimeSlotById } from "./timeSlot";

export const createLocation = async (
  newLocation: Omit<LocationType, "id">
): Promise<void> => {
  try {
    await db.insert(locationTable).values(newLocation);
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
};
export const getLocations = async () => {
  try {
    const result = await db.select().from(locationTable);
    return result;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

export const getLocationById = async (id: number) => {
  try {
    const result = await db.query.locationTable.findFirst({
      where: eq(locationTable.id, id),
    });
    return result;
  } catch (error) {
    console.error("Error fetching location by ID:", error);
    throw error;
  }
};
export const updateLocation = async (newLocation: LocationType) => {
  try {
    await db
      .update(locationTable)
      .set(newLocation)
      .where(eq(locationTable.id, newLocation.id));
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};
export const deleteLocation = async (id: number) => {
  try {
    await db.delete(locationTable).where(eq(locationTable.id, id));
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
};

export const createOccupiedLocation = async (
  newOccupiedLocation: Omit<OccupiedLocation, "id">
): Promise<void> => {
  try {
    await db.insert(occupiedLocation).values(newOccupiedLocation);
  } catch (error) {
    console.error("Error creating occupied location:", error);
    throw error;
  }
};

export const updateOccupiedLocation = async (
  newOccupiedLocation: Omit<OccupiedLocation, "id">
) => {
  try {
    await db
      .update(occupiedLocation)
      .set(newOccupiedLocation)
      .where(
        and(
          eq(occupiedLocation.timeSlotId, newOccupiedLocation.timeSlotId),
          eq(occupiedLocation.locationId, newOccupiedLocation.locationId)
        )
      );
  } catch (error) {}
};

export const getOccupiedLocations = async () => {
  try {
    const result = await db.select().from(occupiedLocation);
    return result;
  } catch (error) {
    console.error("Error fetching occupied locations:", error);
    throw error;
  }
};

export const deleteOccupiedLocation = async (
  newOccupiedLocation: Omit<OccupiedLocation, "id">
) => {
  try {
    await db
      .delete(occupiedLocation)
      .where(
        and(
          eq(occupiedLocation.timeSlotId, newOccupiedLocation.timeSlotId),
          eq(occupiedLocation.locationId, newOccupiedLocation.locationId)
        )
      );
  } catch (error) {
    console.error("Error deleting occupied location:", error);
    throw error;
  }
};

export const getFreeLocations = async (timeSlotId: number) => {
  try {
    // Fetch occupied locations for the given time slot
    const occupiedLocations = await db
      .select()
      .from(occupiedLocation)
      .where(eq(occupiedLocation.timeSlotId, timeSlotId));

    // Extract occupied location IDs
    const occupiedLocationIds = occupiedLocations.map(
      (location) => location.locationId
    );

    // Fetch locations being used in exams for the given time slot
    const examLocations = await db
      .select()
      .from(monitoring)
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(eq(exam.timeSlotId, timeSlotId));

    // Extract exam location IDs
    const examLocationIds = examLocations.map(
      (location) => location.monitoring.locationId
    );

    // Combine all occupied location IDs and create a set to ensure uniqueness
    const allOccupiedLocationIds = Array.from(
      new Set([...occupiedLocationIds, ...examLocationIds])
    );

    let freeLocations: LocationType[] = [];

    if (allOccupiedLocationIds.length > 0) {
      // Fetch free locations excluding the occupied ones
      freeLocations = await db
        .select()
        .from(locationTable)
        .where(notInArray(locationTable.id, allOccupiedLocationIds))
        .orderBy(desc(locationTable.size));
    } else {
      // Fetch all locations if there are no occupied locations
      freeLocations = await db
        .select()
        .from(locationTable)
        .orderBy(desc(locationTable.size));
    }

    return freeLocations;
  } catch (error) {
    console.error("Error fetching free locations:", error);
    throw error;
  }
};

export const getFreeLocationsForModule = async (
  moduleId: string,
  timeSlotId: number
) => {
  try {
    const timeSlot = await getTimeSlotById(timeSlotId);
    const freeLocations = await getFreeLocations(timeSlotId);
    let studentsRemaining = 0;
    if (timeSlot !== null) {
      studentsRemaining = await getNumberOfStudentsInModule(
        moduleId,
        timeSlot.sessionExamId
      );
    }

    let locations: LocationType[] = [];

    for (let i = 0; i < freeLocations.length; i++) {
      const currentLocation = freeLocations[i];
      const nextLocation = freeLocations[i + 1];
      if (studentsRemaining <= 0) break;

      if (studentsRemaining >= currentLocation.size) {
        locations.push(currentLocation);
        studentsRemaining -= currentLocation.size;
      } else if (nextLocation && studentsRemaining <= nextLocation.size) {
        continue;
      } else {
        locations.push(currentLocation);
        studentsRemaining -= currentLocation.size;
      }
    }

    if (studentsRemaining > 0) {
      throw new Error(`Il reste ${studentsRemaining} étudiants sans local.`);
    }

    return locations;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du local pour le module :",
      error
    );
    throw error;
  }
};

export const reserveLocationsForModule = async (
  locations: LocationType[] | ExamLocation[],
  examId: number
) => {
  try {
    const monitorings = locations.map((location) => ({
      examId,
      locationId: location.id,
    }));
    await db.insert(monitoring).values(monitorings);
  } catch (error) {
    console.error("Error creating monitorings:", error);
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
 * @param locationId
 * @returns Promise<OccupationCalendar[]>
 * Get the location's occupation calendar
 */
export const getLocationCalendar = async (
  sessionId: number,
  locationId: number
): Promise<OccupationCalendar[]> => {
  try {
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

    const locationCalendar = await db
      .select({
        id: timeSlots.id,
        date: timeSlots.date,
        period: timeSlots.period,
        timePeriod: timeSlots.timePeriod,
        cause: occupiedLocation.cause,
      })
      .from(timeSlots)
      .leftJoin(occupiedLocation, eq(timeSlots.id, occupiedLocation.timeSlotId))

      .where(
        or(
          eq(occupiedLocation.locationId, locationId),
          isNull(occupiedLocation.locationId)
        )
      );

    const monitoringLocations = await db
      .select({
        locationId: monitoring.locationId,
        timeSlotId: exam.timeSlotId,
      })
      .from(monitoring)
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .leftJoin(timeSlots, eq(exam.timeSlotId, timeSlots.id))
      .where(eq(monitoring.locationId, locationId));

    const days = locationCalendar.reduce((acc, row) => {
      const dateKey = row.date.toISOString().split("T")[0];
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
    const result = Object.values(days).map((day) => ({
      date: day.date,
      timeSlots: day.timeSlots.map((timeSlot) => {
        const monitoringExist = monitoringLocations.some(
          (monitoring) => monitoring.timeSlotId === timeSlot.id
        );
        return {
          id: timeSlot.id,
          period: timeSlot.period,
          timePeriod: timeSlot.timePeriod,
          cause: monitoringExist ? "Exam" : timeSlot.cause,
        };
      }),
    }));
    return result;
  } catch (error) {
    console.error("Error fetching days with time slots:", error);
    throw error;
  }
};
