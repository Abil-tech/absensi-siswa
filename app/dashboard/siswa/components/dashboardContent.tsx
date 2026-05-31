"use client";

import { useEffect, useState } from "react";

interface Props {
  onMenuClick: () => void;
}

type FilterType = "Semua" | "Hadir" | "Absen" | "Terlambat";

const SUBJECTS = [
  {
    name: "Matematika",
    teacher: "Bpk. Hendra K.",
    lastCheckin: "07:58",
    monthlyAvg: 96,
    status: "Hadir" as const,
    initials: "MT",
    color: "#3b82f6",
  },
  {
    name: "Bahasa Indonesia",
    teacher: "Ibu Sari M.",
    lastCheckin: "09:15",
    monthlyAvg: 88,
    status: "Hadir" as const,
    initials: "BI",
    color: "#8b5cf6",
  },
  {
    name: "IPA Fisika",
    teacher: "Bpk. Danu W.",
    lastCheckin: "11:02",
    monthlyAvg: 72,
    status: "Terlambat" as const,
    initials: "FS",
    color: "#f59e0b",
  },
  {
    name: "Bahasa Inggris",
    teacher: "Ibu Reni A.",
    lastCheckin: "-",
    monthlyAvg: 60,
    status: "Absen" as const,
    initials: "EN",
    color: "#ef4444",
  },
];

const RECENT_ISSUES = [
  { label: "Terlambat 10 menit (Fisika)", dot: "#f59e0b", time: "2H lalu" },
  { label: "Alfa tidak keterangan (B.Inggris)", dot: "#ef4444", time: "Kemarin" },
  { label: "Hadir tepat waktu (Matematika)", dot: "#7fe05b", time: "Hari ini" },
];

const STATUS_STYLE: Record<string, string> = {
  Hadir: "bg-[#7fe05b] text-[#111410]",
  Absen: "border border-gray-300 text-gray-700 bg-white",
  Terlambat: "bg-[#111410] text-[#7fe05b]",
};

const AVG_COLOR = (avg: number) =>
  avg >= 90 ? "#4a9e2f" : avg >= 75 ? "#555" : "#ef4444";

const AVG_BAR = (avg: number) =>
  avg >= 90 ? "#7fe05b" : avg >= 75 ? "#111410" : "#ef4444";

const AVG_LABEL = (avg: number) =>
  avg >= 90 ? "excellent" : avg >= 75 ? "steady" : "critical";

export default function DashboardContent({ onMenuClick }: Props) {
  const [filter, setFilter] = useState<FilterType>("Semua");

  const filtered =
    filter === "Semua" ? SUBJECTS : SUBJECTS.filter((s) => s.status === filter);

  const persentaseHadir = stats && stats.total > 0
    ? ((stats.hadir / stats.total) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.1rem] sm:text-[1.4rem] font-extrabold text-[#1a1a1a] tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-black/10 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[#1a1a1a] shadow-sm">
            Kelas X-A
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#1a1a1a] hover:bg-black/5 transition">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* ── Status Absen Hari Ini ── */}
        {!loading && !error && (
          <div className={`rounded-2xl px-5 py-4 flex items-center justify-between gap-3 ${
            sudahAbsen
              ? "bg-[#f0fce8] border border-[#7fe05b]/40"
              : bisaAbsen
              ? "bg-amber-50 border border-amber-200"
              : "bg-gray-50 border border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                sudahAbsen ? "bg-[#7fe05b]" : bisaAbsen ? "bg-amber-400" : "bg-gray-300"
              }`}>
                {sudahAbsen ? (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke="#111410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
                    <path d="M10 6v4.5M10 13h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[13.5px] font-extrabold text-[#1a1a1a]">
                  {sudahAbsen
                    ? "Sudah absen hari ini"
                    : bisaAbsen
                    ? "Belum absen hari ini"
                    : "Waktu absen sudah habis"}
                </p>
                <p className="text-[12px] text-[#6b6b6b] mt-0.5">
                  {sudahAbsen
                    ? "Kehadiranmu sudah tercatat"
                    : bisaAbsen
                    ? "Segera isi absensi sebelum 06.40"
                    : "Tidak bisa absen setelah jam 06.40"}
                </p>
              </div>
            </div>
            {!sudahAbsen && bisaAbsen && (
              <a
                href="/dashboard/siswa/kehadiran"
                className="px-4 py-2 bg-[#111410] text-white text-[12.5px] font-bold rounded-full hover:bg-[#2a2a1e] transition shrink-0"
              >
                Absen Sekarang
              </a>
            )}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Hadir",       value: stats?.hadir ?? "—", color: "#7fe05b", bg: "#f0fce8" },
            { label: "Sakit",       value: stats?.sakit ?? "—", color: "#ef4444", bg: "#fef2f2" },
            { label: "Izin",        value: stats?.izin  ?? "—", color: "#6b7280", bg: "#f9fafb" },
            { label: "% Kehadiran", value: loading ? "—" : `${persentaseHadir}%`, color: "#111410", bg: "#f5f5ef" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ background: card.bg }}>
                <span className="w-3 h-3 rounded-full" style={{ background: card.color }} />
              </div>
              <p className="text-[11px] font-semibold text-[#9a9a9a] uppercase tracking-wide">{card.label}</p>
              <p className="text-[1.8rem] font-black leading-tight tracking-tight mt-0.5" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-[10.5px] text-[#b0b0a8] mt-1">Bulan ini</p>
            </div>
          ))}
        </div>

        {/* ── Riwayat Absensi ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-black/5">
            <h2 className="text-[1rem] font-extrabold text-[#1a1a1a]">Riwayat Absensi</h2>
          </div>

          {loading && (
            <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">Memuat data...</div>
          )}

          {!loading && absensiList.length === 0 && (
            <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">Belum ada data absensi.</div>
          )}

          {!loading && absensiList.length > 0 && (
            <>
              {/* Desktop */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_2fr] px-6 py-3 bg-[#f9f9f5] text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wider border-b border-black/5">
                  <span>Tanggal</span>
                  <span>Waktu</span>
                  <span>Status</span>
                  <span>Keterangan</span>
                </div>
                <div className="divide-y divide-black/[0.04]">
                  {absensiList.map((a) => (
                    <div key={a.id} className="grid grid-cols-[1.5fr_1fr_1fr_2fr] px-6 py-4 items-center hover:bg-[#fafaf7] transition-colors">
                      <span className="text-[13px] font-semibold text-[#2d2d2d]">{formatTanggal(a.tanggal)}</span>
                      <span className="text-[13px] font-semibold text-[#2d2d2d]">{a.waktu}</span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold w-fit ${STATUS_STYLE[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                      <span className="text-[12.5px] text-[#6b6b6b] truncate">{a.keterangan}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile */}
              <div className="sm:hidden divide-y divide-black/[0.04]">
                {absensiList.map((a) => (
                  <div key={a.id} className="px-4 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#1a1a1a]">{formatTanggal(a.tanggal)}</p>
                      <p className="text-[11.5px] text-[#9a9a9a] mt-0.5">{a.waktu} · {a.keterangan}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${STATUS_STYLE[a.status]}`}>
                      {STATUS_LABEL[a.status]}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="px-4 sm:px-6 py-3.5 border-t border-black/5">
            <p className="text-[12px] text-[#9a9a9a] font-medium">
              {loading ? "Memuat..." : `Total ${absensiList.length} catatan absensi`}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}