import { and, eq } from "drizzle-orm";

import { db } from "./config";
import { users } from "./schema";

export const LoginUser = async (email: string, password: string) => {
  const result = await db.query.users.findFirst({
    where: and(eq(users.email, email), eq(users.password, password)),
  });
  return result || null;
};

export const getUserByEmail = async (email: string) => {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return { email: result?.email, password: result?.password } || null;
};
export const getUserById = async (id: number) => {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result || null;
};
