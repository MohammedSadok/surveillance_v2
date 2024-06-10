"use server";
import { db } from "@/lib/config";
import type { Location, OccupiedLocation } from "@/lib/schema";
import { exam, location, monitoring, occupiedLocation } from "@/lib/schema";
import { desc, eq, notInArray } from "drizzle-orm";
import { getNumberOfStudentsInModule } from "./modules";
import { getTimeSlotById } from "./timeSlot";

export const createLocation = async (
  newLocation: Omit<Location, "id">
): Promise<void> => {
  try {
    await db.insert(location).values(newLocation);
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
};
export const getLocations = async () => {
  try {
    const result = await db.select().from(location);
    return result;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

export const getLocationById = async (id: number) => {
  try {
    const result = await db.query.location.findFirst({
      where: eq(location.id, id),
    });
    return result;
  } catch (error) {
    console.error("Error fetching location by ID:", error);
    throw error;
  }
};
export const updateLocation = async (newLocation: Location) => {
  try {
    await db
      .update(location)
      .set(newLocation)
      .where(eq(location.id, newLocation.id));
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};
export const deleteLocation = async (id: number) => {
  try {
    await db.delete(location).where(eq(location.id, id));
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

export const getOccupiedLocations = async () => {
  try {
    const result = await db.select().from(occupiedLocation);
    return result;
  } catch (error) {
    console.error("Error fetching occupied locations:", error);
    throw error;
  }
};

export const deleteOccupiedLocation = async (id: number) => {
  try {
    await db.delete(occupiedLocation).where(eq(occupiedLocation.id, id));
  } catch (error) {
    console.error("Error deleting occupied location:", error);
    throw error;
  }
};

export const getFreeLocations = async (timeSlotId: number) => {
  try {
    const occupiedLocations = await db
      .select()
      .from(occupiedLocation)
      .where(eq(occupiedLocation.timeSlotId, timeSlotId));

    const occupiedLocationIds = occupiedLocations.map(
      (location) => location.id
    );

    const examLocations = await db
      .select()
      .from(monitoring)
      .innerJoin(exam, eq(monitoring.examId, exam.id))
      .where(eq(exam.timeSlotId, timeSlotId));

    const examLocationIds = examLocations.map(
      (location) => location.monitoring.locationId
    );

    const allOccupiedLocationIds = [...occupiedLocationIds, ...examLocationIds];
    let freeLocations: Location[] = [];
    if (allOccupiedLocationIds.length > 0) {
      freeLocations = await db
        .select()
        .from(location)
        .where(notInArray(location.id, allOccupiedLocationIds))
        .orderBy(desc(location.size));
    } else {
      freeLocations = await db
        .select()
        .from(location)
        .orderBy(desc(location.size));
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

    let locations: Location[] = [];

    for (let i = 0; i < freeLocations.length; i++) {
      const currentLocation = freeLocations[i];
      const nextLocation = freeLocations[i + 1];
      if (studentsRemaining <= 0) break;
      else if (studentsRemaining >= currentLocation.size) {
        locations.push(currentLocation);
        studentsRemaining -= currentLocation.size;
      } else if (nextLocation && studentsRemaining <= nextLocation.size)
        continue;
      if (studentsRemaining > 0) {
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
  locations: Location[],
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
