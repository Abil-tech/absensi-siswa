import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/next-auth";

// Definisi akses per role (Gunakan pencocokan yang ketat/strict atau terisolasi)
const ROLE_ROUTES: Record<string, UserRole[]> = {
  "/dashboard/admin": ["admin"],
  "/dashboard/guru": ["walas"],
  "/dashboard/bk": ["bk"],
  "/dashboard/siswa": ["siswa"],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as UserRole | undefined;

    // 1. Cari rule yang BENAR-BENAR cocok (Gunakan regex atau pengecekan slash agar lebih aman)
    const matchedRoute = Object.keys(ROLE_ROUTES).find((route) =>
      pathname === route || pathname.startsWith(route + "/")
    );

    if (matchedRoute) {
      const allowedRoles = ROLE_ROUTES[matchedRoute];

      // Jika user tidak punya role atau rolenya tidak diizinkan di rute ini
      if (!role || !allowedRoles.includes(role)) {
        
        const redirectMap: Record<UserRole, string> = {
          admin: "/dashboard/admin",
          walas: "/dashboard/guru",
          bk: "/dashboard/bk",
          siswa: "/dashboard/siswa",
        };

        const redirectTo = role ? redirectMap[role] : "/login";

        // ⚠️ SAFETY CHECK: Jika halaman tujuan redirect SAMA dengan halaman saat ini, 
        // jangan lakukan redirect lagi supaya tidak INFINITE LOOP!
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
      // Hanya jalankan middleware jika token JWT ada (user sudah login)
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Lindungi semua rute di dalam dashboard
  matcher: ["/dashboard/:path*"],
};