import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/next-auth";

const ROLE_ROUTES: Record<string, UserRole[]> = {
  "/dashboard/admin/guru": ["admin"],
  "/dashboard/admin":      ["admin"],
  "/dashboard/guru":       ["walas"],
  "/dashboard/bk":         ["bk"],
  "/dashboard/siswa":      ["siswa"],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as UserRole | undefined;

    // 1. CARI RUTE YANG COCOK
    const matchedRoute = Object.keys(ROLE_ROUTES).find((route) =>
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const allowedRoles = ROLE_ROUTES[matchedRoute];

      // 2. JIKA ROLE USER TIDAK KUALIFIKASI ATAU TOKEN TIDAK ADA
      if (!role || !allowedRoles.includes(role)) {
        
        // Jika tidak ada role (belum login/token gagal baca), lempar ke login
        if (!role) {
          return NextResponse.redirect(new URL("/login", req.url));
        }

        // Tentukan peta tujuan redirect jika salah masuk rute
        const redirectMap: Record<UserRole, string> = {
          admin:  "/dashboard/admin",
          walas:  "/dashboard/guru",
          bk:     "/dashboard/bk",
          siswa:  "/dashboard/siswa",
        };

        const redirectTo = redirectMap[role];

        // ANTI-LOOP GUARD: Jika rute saat ini SUDAH SAMA dengan rute tujuan redirect, 
        // jangan lakukan redirect lagi! Biarkan lolos agar tidak terjadi infinite loop.
        if (pathname === redirectTo) {
          return NextResponse.next();
        }

        return NextResponse.redirect(new URL(redirectTo, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Callback authorized hanya memastikan token ada secara dasar
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Hanya jalankan middleware untuk sub-route dashboard, abaikan file statis / logo / api
  matcher: ["/dashboard/:path*"],
};