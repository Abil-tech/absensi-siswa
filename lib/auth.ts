import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        userId: { label: "User ID / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) return null;

        try {
          await dbConnect();

          // Cari user berdasarkan email ATAU userId (NIS/NIP)
          const user = await User.findOne({
            $or: [
              { email: credentials.userId },
              { userId: credentials.userId },
            ],
          }).select("+password");

          if (!user) return null;

          // Support bcrypt hash dan plaintext (untuk migrasi / development)
          let isValid = false;
          const isHashed = user.password.startsWith("$2");
          if (isHashed) {
            isValid = await bcrypt.compare(credentials.password, user.password);
          } else {
            isValid = credentials.password === user.password;
          }

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          } as any;
        } catch (err) {
          console.error("[NextAuth authorize]", err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
