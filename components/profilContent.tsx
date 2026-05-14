"use client";

import { useState } from "react";

interface Props {
  onMenuClick: () => void;
}

const INFO_ITEMS = [
  { label: "Nama Lengkap", value: "Budi Santoso", icon: "👤" },
  { label: "Student ID", value: "20241001", icon: "🪪" },
  { label: "Email", value: "budi.santoso@sekolah.sch.id", icon: "📧" },
  { label: "Kelas", value: "X-A (IPA)", icon: "🏫" },
  { label: "Tahun Ajaran", value: "2024 / 2025", icon: "📅" },
  { label: "Wali Kelas", value: "Ibu Sari Maulida, S.Pd.", icon: "👩‍🏫" },
  { label: "No. HP / Ortu", value: "0812-3456-7890", icon: "📱" },
  { label: "Alamat", value: "Jl. Raya Depok No. 12, Jawa Barat", icon: "📍" },
];

const STATS = [
  { label: "Total Kehadiran", value: "94%", sub: "semester ini", color: "#7fe05b" },
  { label: "Mata Pelajaran", value: "8", sub: "semester ini", color: "#3b82f6" },
  { label: "Rata-rata Nilai", value: "87.5", sub: "semester ganjil", color: "#f59e0b" },
  { label: "Peringkat Kelas", value: "#5", sub: "dari 32 siswa", color: "#8b5cf6" },
];

export default function ProfilContent({ onMenuClick }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "akademik">("info");

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-[#1a1a1a] hover:text-black"
            aria-label="Buka menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.3rem] lg:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">
            Profil Saya
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold
              transition-all duration-150
              ${editMode
                ? "bg-[#7fe05b] text-[#111410] hover:bg-[#6bcf49]"
                : "bg-white border border-black/10 text-[#1a1a1a] hover:bg-[#f0f0ea]"
              }
            `}
          >
            {editMode ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Simpan
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                Edit Profil
              </>
            )}
          </button>

          {/* Bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#1a1a1a] hover:bg-[#f0f0ea] transition">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 lg:px-8 py-7 flex flex-col gap-6">
        {/* ── Profile Hero Card ── */}
        <div className="bg-[#111410] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-end gap-5 relative overflow-hidden">
          {/* decorative glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#7fe05b]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-[#7fe05b] flex items-center justify-center text-[#111410] font-black text-3xl shadow-lg">
              B
            </div>
            {editMode && (
              <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md text-[#1a1a1a] hover:bg-[#f0f0ea] transition">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Name & meta */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-white font-extrabold text-xl tracking-tight">Budi Santoso</h2>
              <span className="inline-block self-center px-3 py-1 bg-[#7fe05b] text-[#111410] text-[11.5px] font-black rounded-full">
                SISWA AKTIF
              </span>
            </div>
            <p className="text-white/50 text-[13px] mt-1">20241001 · Kelas X-A · IPA</p>
            <p className="text-white/30 text-[12px] mt-0.5">Tahun Ajaran 2024/2025</p>
          </div>

          {/* Quick stats pills */}
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
            <div className="flex flex-col items-center bg-white/8 rounded-xl px-4 py-2">
              <span className="text-[#7fe05b] font-black text-lg leading-none">94%</span>
              <span className="text-white/40 text-[10.5px] font-semibold mt-0.5">Kehadiran</span>
            </div>
            <div className="flex flex-col items-center bg-white/8 rounded-xl px-4 py-2">
              <span className="text-white font-black text-lg leading-none">87.5</span>
              <span className="text-white/40 text-[10.5px] font-semibold mt-0.5">Avg Nilai</span>
            </div>
            <div className="flex flex-col items-center bg-white/8 rounded-xl px-4 py-2">
              <span className="text-white font-black text-lg leading-none">#5</span>
              <span className="text-white/40 text-[10.5px] font-semibold mt-0.5">Peringkat</span>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <div className="w-8 h-1.5 rounded-full mb-3" style={{ background: s.color }} />
              <p className="text-[11.5px] font-semibold text-[#9a9a9a] uppercase tracking-wide leading-none">
                {s.label}
              </p>
              <p className="text-[1.8rem] font-black text-[#1a1a1a] leading-tight mt-1 tracking-tight"
                 style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[11px] text-[#b0b0a8] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-black/5">
            {(["info", "akademik"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 py-4 text-[13.5px] font-bold tracking-wide transition-all duration-150
                  ${activeTab === tab
                    ? "text-[#111410] border-b-2 border-[#7fe05b]"
                    : "text-[#9a9a9a] hover:text-[#1a1a1a]"
                  }
                `}
              >
                {tab === "info" ? "Informasi Pribadi" : "Data Akademik"}
              </button>
            ))}
          </div>

          {/* ── Tab: Info ── */}
          {activeTab === "info" && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INFO_ITEMS.map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide flex items-center gap-1.5">
                    <span>{item.icon}</span> {item.label}
                  </label>
                  {editMode ? (
                    <input
                      defaultValue={item.value}
                      className="
                        w-full px-3.5 py-2.5 text-[13.5px] font-semibold
                        bg-[#f0f0ea] text-[#1a1a1a]
                        rounded-[10px] border border-transparent outline-none
                        focus:border-[#7fe05b] focus:bg-white
                        transition-all duration-200
                      "
                    />
                  ) : (
                    <p className="text-[13.5px] font-semibold text-[#1a1a1a] bg-[#f9f9f5] rounded-[10px] px-3.5 py-2.5">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Akademik ── */}
          {activeTab === "akademik" && (
            <div className="p-6 flex flex-col gap-4">
              {/* Mata pelajaran & nilai */}
              <div>
                <h3 className="text-[13px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-3">
                  Nilai Semester Ini
                </h3>
                <div className="flex flex-col divide-y divide-black/[0.04] rounded-xl overflow-hidden border border-black/5">
                  {[
                    { mapel: "Matematika", nilai: 92, grade: "A" },
                    { mapel: "Bahasa Indonesia", nilai: 88, grade: "B+" },
                    { mapel: "IPA Fisika", nilai: 78, grade: "B" },
                    { mapel: "Bahasa Inggris", nilai: 85, grade: "B+" },
                    { mapel: "Sejarah", nilai: 90, grade: "A-" },
                    { mapel: "Seni Budaya", nilai: 95, grade: "A" },
                    { mapel: "Penjaskes", nilai: 88, grade: "B+" },
                    { mapel: "Informatika", nilai: 93, grade: "A" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-[#fafaf7] transition-colors">
                      <p className="text-[13.5px] font-semibold text-[#1a1a1a]">{s.mapel}</p>
                      <div className="flex items-center gap-3">
                        {/* Mini bar */}
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-[#f0f0ea] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.nilai}%`,
                                background: s.nilai >= 90 ? "#7fe05b" : s.nilai >= 80 ? "#3b82f6" : "#f59e0b",
                              }}
                            />
                          </div>
                          <span className="text-[12px] font-semibold text-[#9a9a9a] w-6 text-right">{s.nilai}</span>
                        </div>
                        <span
                          className="text-[12px] font-black px-2.5 py-1 rounded-lg"
                          style={{
                            background: s.nilai >= 90 ? "#f0fce8" : s.nilai >= 80 ? "#dbeafe" : "#fef3c7",
                            color: s.nilai >= 90 ? "#4a9e2f" : s.nilai >= 80 ? "#1d4ed8" : "#b45309",
                          }}
                        >
                          {s.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kehadiran summary */}
              <div>
                <h3 className="text-[13px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-3">
                  Ringkasan Kehadiran
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Hadir", value: "108", color: "#7fe05b", bg: "#f0fce8" },
                    { label: "Terlambat", value: "5", color: "#f59e0b", bg: "#fef3c7" },
                    { label: "Absen", value: "2", color: "#ef4444", bg: "#fef2f2" },
                  ].map((k, i) => (
                    <div key={i} className="rounded-xl p-4 text-center" style={{ background: k.bg }}>
                      <p className="text-[1.6rem] font-black leading-none" style={{ color: k.color }}>{k.value}</p>
                      <p className="text-[11.5px] font-semibold mt-1" style={{ color: k.color }}>{k.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Change Password section ── */}
        {editMode && (
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-6">
            <h3 className="text-[14px] font-extrabold text-[#1a1a1a] mb-4">Ganti Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["Password Lama", "Password Baru", "Konfirmasi Password"].map((lbl, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide">{lbl}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="
                      w-full px-3.5 py-2.5 text-[13.5px]
                      bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8]
                      rounded-[10px] border border-transparent outline-none
                      focus:border-[#7fe05b] focus:bg-white
                      transition-all duration-200
                    "
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
