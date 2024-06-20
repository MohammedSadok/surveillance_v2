"use server";

import db from "@/lib/config";
import {
  exam,
  locationTable,
  LocationType,
  monitoring,
  occupiedLocation,
  OccupiedLocation,
} from "@/lib/schema";
import { desc, eq, notInArray } from "drizzle-orm";
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
    const result = await db
      .select()
      .from(locationTable)
      .where(eq(locationTable.id, id));
    return result[0];
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
    // Fetch occupied locations for the given time slot
    const occupiedLocations = await db
      .select()
      .from(occupiedLocation)
      .where(eq(occupiedLocation.timeSlotId, timeSlotId));

    // Extract occupied location IDs
    const occupiedLocationIds = occupiedLocations.map(
      (location) => location.id
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
  locations: LocationType[],
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
