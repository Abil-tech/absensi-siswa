"use client";

import { useState } from "react";

interface Props {
  onMenuClick: () => void;
}

const INFO_ITEMS = [
  { label: "Nama Lengkap",      value: "Counselor Smith",                  icon: "👤" },
  { label: "NIP",               value: "197803152005011002",                icon: "🪪" },
  { label: "Email",             value: "counselor.smith@sekolah.sch.id",   icon: "📧" },
  { label: "Spesialisasi",      value: "Bimbingan & Konseling",            icon: "🎯" },
  { label: "Jabatan",           value: "Guru BK Tetap",                    icon: "🏷️" },
  { label: "Ruang BK",          value: "Ruang BK Lt. 1",                   icon: "🏫" },
  { label: "No. HP",            value: "0813-5566-7788",                   icon: "📱" },
  { label: "Alamat",            value: "Jl. Pahlawan No. 8, Bandung",      icon: "📍" },
];

const STATS = [
  { label: "Total Kelas",       value: "6",    sub: "yang dipantau",      color: "#7fe05b" },
  { label: "Total Siswa",       value: "60",   sub: "seluruh kelas",      color: "#3b82f6" },
  { label: "Pengaduan Masuk",   value: "12",   sub: "bulan ini",          color: "#f59e0b" },
  { label: "Kasus Selesai",     value: "9",    sub: "bulan ini",          color: "#8b5cf6" },
];

const PENGADUAN_TERBARU = [] as any[];
const PRIORITAS_STYLE = {} as any;
const STATUS_STYLE = {} as any;

export default function BkProfilContent({ onMenuClick }: Props) {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden text-[#1a1a1a] p-1"
            aria-label="Buka menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">
            Profil Saya
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* ── Hero Card ── */}
        <div className="bg-[#111410] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#7fe05b]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-[#8b5cf6]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7fe05b] to-[#4a9e2f] flex items-center justify-center text-[#111410] font-black text-2xl shadow-lg">
              BK
            </div>
            {editMode && (
              <button
                type="button"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md text-[#1a1a1a]"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-white font-extrabold text-xl tracking-tight">Counselor Smith</h2>
              <span className="inline-block self-center px-3 py-1 bg-[#7fe05b] text-[#111410] text-[11.5px] font-black rounded-full">
                GURU BK TETAP
              </span>
            </div>
            <p className="text-white/50 text-[13px] mt-1">NIP 197803152005011002 · Bimbingan & Konseling</p>
            <p className="text-white/30 text-[12px] mt-0.5">Ruang BK Lt. 1 · Tahun Ajaran 2024/2025</p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
            {[
              { val: "6",   sub: "Kelas"    },
              { val: "60",  sub: "Siswa"    },
              { val: "12",  sub: "Pengaduan"},
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center bg-white/8 rounded-xl px-4 py-2">
                <span className="text-[#7fe05b] font-black text-lg leading-none">{s.val}</span>
                <span className="text-white/40 text-[10.5px] font-semibold mt-0.5">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>


        {/* ── Informasi Pribadi ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <div className="px-4 sm:px-6 py-4 border-b border-black/5">
            <h2 className="text-[14px] font-extrabold text-[#1a1a1a]">Informasi Pribadi</h2>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INFO_ITEMS.map((item, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide flex items-center gap-1.5">
                  <span>{item.icon}</span> {item.label}
                </label>
                {editMode ? (
                  <input
                    defaultValue={item.value}
                    className="
                      w-full px-3.5 py-2.5 text-[13.5px] font-semibold
                      bg-[#f0f0ea] text-[#1a1a1a] rounded-[10px]
                      border border-transparent outline-none
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
        </div>

        {/* ── Ganti Password (edit mode) ── */}
        {editMode && (
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-4 sm:p-6">
            <h3 className="text-[14px] font-extrabold text-[#1a1a1a] mb-4">Ganti Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["Password Lama", "Password Baru", "Konfirmasi Password"].map((lbl, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">{lbl}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="
                      w-full px-3.5 py-2.5 text-[13.5px]
                      bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8]
                      rounded-[10px] border border-transparent outline-none
                      focus:border-[#7fe05b] focus:bg-white transition-all duration-200
                    "
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 px-6 py-2.5 bg-[#111410] text-white rounded-full text-[13px] font-bold hover:bg-[#1e1e16] transition active:opacity-70"
            >
              Update Password
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
