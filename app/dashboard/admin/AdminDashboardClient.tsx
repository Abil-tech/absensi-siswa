"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

interface Props {
  user: { name: string; email: string };
}

const NAV = [
  { label: "Dashboard",  icon: "▦", href: "#" },
  { label: "Siswa",      icon: "👤", href: "#" },
  { label: "Absensi",   icon: "📋", href: "#" },
  { label: "Laporan",   icon: "📊", href: "#" },
  { label: "Pengaturan",icon: "⚙️", href: "#" },
];

const STAT_CARDS = [
  { label: "Total Siswa",      value: "—", color: "#7fe05b", bg: "#f0fce8", icon: "👥" },
  { label: "Hadir Hari Ini",   value: "—", color: "#3b82f6", bg: "#dbeafe", icon: "✅" },
  { label: "Tidak Hadir",      value: "—", color: "#ef4444", bg: "#fef2f2", icon: "❌" },
  { label: "Persentase",       value: "—", color: "#f59e0b", bg: "#fef3c7", icon: "📈" },
];

export default function AdminDashboardClient({ user }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const initial = user.name?.charAt(0)?.toUpperCase() ?? "A";
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex min-h-screen bg-[#f5f5ef] font-sans">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-[240px] z-30
        bg-[#111410] flex flex-col shrink-0
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7fe05b] flex items-center justify-center text-[#111410] font-black text-sm">A</div>
            <div>
              <p className="text-white font-extrabold text-[14px] leading-tight">Academic Portal</p>
              <p className="text-white/40 text-[10.5px] mt-0.5">Panel Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => { setActiveNav(item.label); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-semibold transition-all text-left ${
                  active ? "bg-[#7fe05b] text-[#111410]" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-4 pb-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-[#7fe05b] flex items-center justify-center text-[#111410] font-black text-sm shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[12.5px] font-bold truncate">{user.name}</p>
              <p className="text-white/35 text-[10.5px] truncate">Administrator</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Keluar"
              className="text-white/30 hover:text-red-400 transition-colors shrink-0"
            >
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                <path d="M7 2H4a1 1 0 00-1 1v12a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#1a1a1a]">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <h1 className="text-[1rem] sm:text-[1.2rem] font-extrabold text-[#1a1a1a] leading-tight">{activeNav}</h1>
              <p className="text-[11px] text-[#9a9a9a] hidden sm:block">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[#6b6b6b] tabular-nums">{time}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[12.5px] font-bold rounded-full transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M7 2H4a1 1 0 00-1 1v12a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-6 flex flex-col gap-6">
          {/* Welcome */}
          <div className="bg-[#111410] rounded-2xl px-6 py-5 flex items-center justify-between overflow-hidden relative">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#7fe05b]/10 rounded-full blur-3xl pointer-events-none" />
            <div>
              <p className="text-white/40 text-[12px] font-semibold uppercase tracking-wider">Selamat datang</p>
              <h2 className="text-white font-extrabold text-[1.3rem] mt-0.5">{user.name} 👋</h2>
              <p className="text-white/40 text-[12.5px] mt-1">{user.email}</p>
            </div>
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-[#7fe05b] items-center justify-center text-[#111410] font-black text-2xl">
              {initial}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{s.icon}</span>
                  <div className="w-6 h-1 rounded-full" style={{ background: s.color }} />
                </div>
                <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">{s.label}</p>
                <p className="text-[1.8rem] font-black leading-tight mt-0.5" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabel placeholder */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
              <h3 className="font-extrabold text-[1rem] text-[#1a1a1a]">Rekap Absensi Terkini</h3>
              <span className="text-[11.5px] font-semibold text-[#9a9a9a]">Hari ini</span>
            </div>
            <div className="px-6 py-14 text-center text-[13px] text-[#b0b0a8]">
              <p className="text-3xl mb-3">📋</p>
              <p className="font-semibold">Data absensi akan tampil di sini</p>
              <p className="text-[11.5px] mt-1">Hubungkan dengan endpoint <code className="bg-[#f0f0ea] px-1.5 py-0.5 rounded text-[11px]">/api/absensi</code></p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Tambah Siswa",   desc: "Daftarkan siswa baru",          icon: "➕", color: "#7fe05b" },
              { label: "Export Laporan", desc: "Unduh rekap absensi",            icon: "📥", color: "#3b82f6" },
              { label: "Kelola Kelas",   desc: "Atur wali kelas & rombel",       icon: "🏫", color: "#f59e0b" },
            ].map((a) => (
              <button key={a.label} className="bg-white hover:shadow-md active:scale-[0.98] transition-all rounded-2xl px-5 py-4 text-left flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: a.color + "22" }}>
                  {a.icon}
                </div>
                <div>
                  <p className="font-bold text-[13.5px] text-[#1a1a1a]">{a.label}</p>
                  <p className="text-[11.5px] text-[#9a9a9a]">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
