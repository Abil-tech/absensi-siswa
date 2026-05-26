import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { UserRole } from "@/types/next-auth";

const ROLE_REDIRECT: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  walas: "/dashboard/guru",
  bk:    "/dashboard/bk",
  siswa: "/dashboard/siswa",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // Jika sudah login, redirect ke dashboard sesuai role
  if (session?.user?.role) {
    const role = session.user.role;
    const destination = ROLE_REDIRECT[role] ?? "/dashboard/siswa";
    redirect(destination);
  }

  return (
    <main className="min-h-screen bg-[#f5f5ef] flex flex-col items-center px-4 pt-14 pb-10 font-[family-name:var(--font-plus-jakarta)]">
      {/* ── Header ── */}
      <header className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-2.5 text-[1.65rem] font-extrabold text-[#1a1a1a] tracking-tight">
          <svg width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path
              d="M14 4L2 10L14 16L26 10L14 4Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M6 13V19C6 19 9 22 14 22C19 22 22 19 22 19V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M26 10V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Academic Portal
        </div>
        <p className="mt-2 text-sm text-[#9a9a9a]">Enter your credentials to continue</p>
      </header>

      {/* ── Card ── */}
      <div className="w-full max-w-[460px] bg-white rounded-[24px] px-10 py-12 shadow-[0_4px_40px_rgba(0,0,0,0.06)]">
        <h1 className="text-center text-[1.35rem] font-extrabold tracking-[2px] text-[#1a1a1a] mb-9">
          LOGIN
        </h1>
        <LoginForm />
      </div>

      {/* ── Footer ── */}
      <footer className="mt-10 text-sm text-[#1a1a1a]">
        Belum punya akun?{" "}
        <a
          href="mailto:admin@sekolah.sch.id"
          className="font-semibold text-[#4a9e2f] hover:opacity-75 transition-opacity"
        >
          Hubungi Admin Sekolah
        </a>
      </footer>
    </main>
  );
}   