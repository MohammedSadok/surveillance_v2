"use server";
import { db } from "@/lib/config";
import {
  Location,
  location,
  OccupiedLocation,
  occupiedLocation,
} from "@/lib/schema";
import { previousDay } from "date-fns";
import { eq } from "drizzle-orm";

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
export const getOccupiedLocationById = async (id: number) => {
  try {
    const result = await db.query.occupiedLocation.findFirst({
      where: eq(occupiedLocation.id, id),
    });
    return result || null;
  } catch (error) {
    console.error("Error fetching occupied location by ID:", error);
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
