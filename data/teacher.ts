"use server";
import { db } from "@/lib/config";
import { teacher, Teacher } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const createTeacher = async (newTeacher: Omit<Teacher, "id">) => {
  try {
    await db.insert(teacher).values(newTeacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
    throw error;
  }
};

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const result = await db.select().from(teacher);
    return result;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

export const getTeachersInDepartment = async (
  departmentId: number
): Promise<Teacher[]> => {
  try {
    const result = await db
      .select()
      .from(teacher)
      .where(eq(teacher.departmentId, departmentId));
    return result;
  } catch (error) {
    console.error("Error fetching teachers in department:", error);
    throw error;
  }
};

export const getTeacherById = async (id: number): Promise<Teacher | null> => {
  try {
    const result = await db.query.teacher.findFirst({
      where: eq(teacher.id, id),
    });
    return result || null;
  } catch (error) {
    console.error("Error fetching teacher by ID:", error);
    throw error;
  }
};

export const updateTeacher = async (newTeacher: Teacher) => {
  try {
    await db
      .update(teacher)
      .set(newTeacher)
      .where(eq(teacher.id, newTeacher.id));
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
};

export const deleteTeacher = async (id: number): Promise<void> => {
  try {
    await db.delete(teacher).where(eq(teacher.id, id));
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
};
