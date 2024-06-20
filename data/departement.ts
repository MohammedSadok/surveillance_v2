"use server";

import db from "@/lib/config";
import { department, Department } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const createDepartment = async (name: string) => {
  try {
    await db.insert(department).values({ name });
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const result = await db.select().from(department);
    return result;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const getDepartmentById = async (
  id: number
): Promise<Department | null> => {
  try {
    const result = await db
      .select()
      .from(department)
      .where(eq(department.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching department by ID:", error);
    throw error;
  }
};

export const updateDepartment = async (updateDepartment: Department) => {
  try {
    await db
      .update(department)
      .set(updateDepartment)
      .where(eq(department.id, updateDepartment.id));
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
};

export const deleteDepartment = async (id: number) => {
  try {
    await db.delete(department).where(eq(department.id, id));
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};
