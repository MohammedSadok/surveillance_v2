import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "./query";
import { LoginSchema } from "./validator";

export default {
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);
          if (user && user.password) {
            const passwordsMatch = await bcrypt.compare(
              password,
              user.password
            );
            if (passwordsMatch) {
              const userResult = { ...user };
              return userResult;
            }
          }
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
