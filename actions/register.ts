"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { getUserByEmail, getUserDetailsByEmail } from "@/data/session";
import { db } from "@/lib/config";
import { users } from "@/lib/schema";
import { RegisterSchema } from "@/lib/validator";
import { eq } from "drizzle-orm";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await db.insert(users).values({
    email: email,
    password: hashedPassword,
    name: name,
  });

  return { success: "Account created successfully!" };
};

export const updateUser = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "User not found!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({
      name: name,
      password: hashedPassword,
    })
    .where(eq(users.email, email));

  return { success: "User updated successfully!" };
};
export const updateUserPassword = async (email: string, password: string) => {
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "User not found!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({
      password: hashedPassword,
    })
    .where(eq(users.email, email));

  return { success: "Password updated successfully!" };
};

// Function to update user email
export const updateUserEmail = async (email: string, newMail: string) => {
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "User not found!" };
  }

  const emailConflict = await getUserDetailsByEmail(newMail);

  if (emailConflict) {
    return { error: "New email already in use!" };
  }

  await db
    .update(users)
    .set({
      email: newMail,
    })
    .where(eq(users.email, email));

  return { success: "Email updated successfully!" };
};

// Function to update user name
export const updateUserName = async (email: string, newName: string) => {
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "User not found!" };
  }

  await db
    .update(users)
    .set({
      name: newName,
    })
    .where(eq(users.email, email));

  return { success: "Name updated successfully!" };
};
