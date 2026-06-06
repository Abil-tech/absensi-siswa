import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/next-auth";

// Definisi akses per role
// Urutan penting: route yang lebih spesifik harus lebih dulu
const ROLE_ROUTES: Record<string, UserRole[]> = {
  "/dashboard/admin/guru": ["admin"],   // ← tambahan: halaman list guru
  "/dashboard/admin":      ["admin"],
  "/dashboard/guru":       ["walas"],
  "/dashboard/bk":         ["bk"],
  "/dashboard/siswa":      ["siswa"],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as UserRole | undefined;

    // Cari aturan paling spesifik yang cocok dengan pathname
    // (Object.keys urut insertion order, jadi spesifik → umum sudah benar)
    const matchedRoute = Object.keys(ROLE_ROUTES).find((route) =>
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const allowedRoles = ROLE_ROUTES[matchedRoute];

      if (!role || !allowedRoles.includes(role)) {
        const redirectMap: Record<UserRole, string> = {
          admin:  "/dashboard/admin",
          walas:  "/dashboard/guru",
          bk:     "/dashboard/bk",
          siswa:  "/dashboard/siswa",
        };

        const redirectTo = role ? redirectMap[role] : "/login";
        return NextResponse.redirect(new URL(redirectTo, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Token harus ada (sudah login) untuk semua /dashboard/*
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};