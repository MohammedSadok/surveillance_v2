import NextAuth from "next-auth";
// import { getUserFromDb } from "@/utils/db";
import { getUserById } from "@/data/session";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import authConfig from "./auth.config";
import db from "./config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async session({ token, session, user }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.isAdmin = token.isAdmin as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(parseInt(token.sub));
      if (!existingUser) return token;
      token.name = existingUser.name;
      token.email = existingUser.email;
      // token.isAdmin = existingUser.isAdmin;
      return token;
    },
  },
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
