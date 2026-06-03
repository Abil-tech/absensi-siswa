import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@/types/next-auth";

/**
 * Ambil session di server component atau API route.
 * Throw error jika tidak ada session (belum login).
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Pastikan user punya role tertentu.
 * Gunakan di API route untuk proteksi endpoint.
 *
 * Contoh:
 *   await requireRole(["admin", "walas"]);
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireSession();
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}