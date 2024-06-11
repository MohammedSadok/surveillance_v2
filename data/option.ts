import { db } from "@/lib/config";
import { option, Option } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const createOption = async (newOption: Option) => {
  try {
    await db.insert(option).values(newOption);
  } catch (error) {
    console.error("Error creating option:", error);
    throw error;
  }
};

export const getOptions = async (): Promise<Option[]> => {
  try {
    const result = await db.select().from(option);
    return result;
  } catch (error) {
    console.error("Error fetching options:", error);
    throw error;
  }
};

export const getOptionById = async (id: string): Promise<Option | null> => {
  try {
    const result = await db.query.option.findFirst({
      where: eq(option.id, id),
    });
    return result || null;
  } catch (error) {
    console.error("Error fetching option by ID:", error);
    throw error;
  }
};

export const updateOption = async (updateOption: Option) => {
  try {
    await db
      .update(option)
      .set(updateOption)
      .where(eq(option.id, updateOption.id));
  } catch (error) {
    console.error("Error updating option:", error);
    throw error;
  }
};

export const deleteOption = async (id: string) => {
  try {
    await db.delete(option).where(eq(option.id, id));
  } catch (error) {
    console.error("Error deleting option:", error);
    throw error;
  }
};

export const generateStudentsExamSchedule = async (
  optionId: string,
  sessionExamId: number
) => {
  try {
  } catch (error) {
    console.error("Error generating students exam schedule:", error);
    throw error;
  }
};
