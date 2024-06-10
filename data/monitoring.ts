"use server";

import { db } from "@/lib/config";
import type { Location } from "@/lib/schema";
import { monitoring, Monitoring } from "@/lib/schema";
import { eq } from "drizzle-orm";
export const createMonitoring = async (
  newMonitoring: Omit<Monitoring, "id">
) => {
  try {
    await db.insert(monitoring).values(newMonitoring);
  } catch (error) {
    console.error("Error creating monitoring:", error);
    throw error;
  }
};

export const getMonitorings = async (): Promise<Monitoring[]> => {
  try {
    const result = await db.select().from(monitoring);
    return result;
  } catch (error) {
    console.error("Error fetching monitorings:", error);
    throw error;
  }
};

export const getMonitoringById = async (
  id: number
): Promise<Monitoring | null> => {
  try {
    const result = await db.query.monitoring.findFirst({
      where: eq(monitoring.id, id),
    });
    return result || null;
  } catch (error) {
    console.error("Error fetching monitoring:", error);
    throw error;
  }
};

export const updateMonitoring = async (newMonitoring: Monitoring) => {
  try {
    await db
      .update(monitoring)
      .set(newMonitoring)
      .where(eq(monitoring.id, newMonitoring.id));
  } catch (error) {
    console.error("Error updating monitoring:", error);
    throw error;
  }
};

export const deleteMonitoring = async (id: number) => {
  try {
    await db.delete(monitoring).where(eq(monitoring.id, id));
  } catch (error) {
    console.error("Error deleting monitoring:", error);
    throw error;
  }
};


