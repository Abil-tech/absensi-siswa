"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      userId,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("User ID atau password salah. Silakan coba lagi.");
      return;
    }

    // Pakai getSession() — tunggu sampai session benar-benar tersedia
    const session = await getSession();
    const role = (session?.user as any)?.role;

    if (role === "admin") {
      router.push("/dashboard/admin");
    } else if (role === "walas") {
      router.push("/dashboard/walas");
    } else if (role === "bk") {
      router.push("/dashboard/bk");
    } else if (role === "siswa") {
      router.push("/dashboard/siswa");
    } else {
      // fallback kalau role tidak dikenali
      router.push("/dashboard/siswa");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="7" stroke="#c0392b" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 11h.01" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-semibold text-[#2d2d2d]">User ID / Email</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. 20241002"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            autoComplete="username"
            className="w-full pl-4 pr-11 py-3.5 bg-[#f0f0ea] text-[#1a1a1a] text-sm placeholder:text-[#b0b0a8] rounded-[10px] border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all duration-200"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <circle cx="9" cy="6" r="3.5" stroke="#aaa" strokeWidth="1.4" />
              <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[13.5px] font-semibold text-[#2d2d2d]">Password</label>
          <button type="button" className="text-[13px] font-semibold text-[#4a9e2f] hover:opacity-75 transition-opacity">
            Lupa Kata Sandi?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full pl-4 pr-11 py-3.5 bg-[#f0f0ea] text-[#1a1a1a] text-sm rounded-[10px] border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666] transition-colors"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full py-3.5 bg-[#7fe05b] hover:bg-[#6bcf49] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-[#1a1a1a] text-[13.5px] font-extrabold tracking-[1.5px] rounded-full flex items-center justify-center transition-all duration-150"
      >
        {loading ? (
          <span className="w-5 h-5 border-[2.5px] border-black/20 border-t-black rounded-full animate-spin" />
        ) : (
          "MASUK"
        )}
      </button>
    </form>
  );
}
