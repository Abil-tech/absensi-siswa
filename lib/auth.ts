import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "@/models/user";
import { UserRole } from "@/types/next-auth";

const VALID_ROLES: UserRole[] = ["admin", "walas", "bk", "siswa"];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                userId: { label: "User ID / Email", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.userId || !credentials?.password) {
                    console.log("[Auth] credentials kosong");
                    return null;
                }

                try {
                    await dbConnect();
                    console.log("[Auth] DB terhubung");

                    const user = await User.findOne({
                        $or: [
                            { email: credentials.userId },
                            { userId: credentials.userId },
                        ],
                    }).select("+password");

                    console.log("[Auth] User ditemukan:", user ? user.userId : "TIDAK ADA");

                    if (!user) return null;

                    // Hanya support bcrypt hash — plaintext dihapus
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    console.log("[Auth] Password valid:", isValid);


                    if (!isValid) {
                        console.log("[Auth] Role invalid:", user.role);
                        return null
                    };

                    // Validasi role sebelum lanjut
                    if (!VALID_ROLES.includes(user.role)) {
                        console.error(`[NextAuth] Invalid role detected: ${user.role}`);
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role as UserRole,
                    };
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
                token.role = user.role;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },
};