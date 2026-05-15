import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    // Proteksi berdasarkan role
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }
    if (pathname.startsWith("/dashboard/walas") && role !== "walas" && role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }
    if (pathname.startsWith("/dashboard/bk") && role !== "bk" && role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }
    if (pathname.startsWith("/dashboard/siswa") && role !== "siswa" && role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Hanya lanjut ke middleware() jika sudah ada JWT token
      authorized: ({ token }) => !!token,
    },
  }
);

// Semua route yang dilindungi (login & api bebas)
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
