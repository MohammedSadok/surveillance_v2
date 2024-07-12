"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { getUserByEmail } from "@/data/session";
import { db } from "@/lib/config";
import { users } from "@/lib/schema";
import { RegisterSchema } from "@/lib/validator";

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
