"use client";

import { useState } from "react";

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
  Absen: "border border-gray-300 text-gray-700 bg-transparent",
  Terlambat: "bg-[#111410] text-[#7fe05b]",
};

export default function DashboardContent({ onMenuClick }: Props) {
  const [filter, setFilter] = useState<FilterType>("Semua");

  const filtered =
    filter === "Semua" ? SUBJECTS : SUBJECTS.filter((s) => s.status === filter);

  const avgAttendance = Math.round(
    SUBJECTS.reduce((a, s) => a + s.monthlyAvg, 0) / SUBJECTS.length
  );

  const totalHadir = SUBJECTS.filter((s) => s.status === "Hadir").length;

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-4">
          {/* Hamburger (mobile) */}
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
            Kehadiran Saya
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Class badge */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-black/10 rounded-full px-4 py-2 text-[13px] font-semibold text-[#1a1a1a] shadow-sm">
            Kelas X-A
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          {/* Bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#1a1a1a] hover:bg-black/5 transition">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 lg:px-8 py-7 flex flex-col gap-6">
        {/* ── Stat Cards Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Pelajaran */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#f0fce8] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4h12v12H4z" stroke="#7fe05b" strokeWidth="1.5" rx="2" />
                  <path d="M7 8h6M7 11h4" stroke="#7fe05b" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[11.5px] font-semibold text-[#7fe05b]">+0 bulan ini</span>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#9a9a9a] uppercase tracking-wide">Mata Pelajaran</p>
              <p className="text-[2.2rem] font-black text-[#1a1a1a] leading-tight tracking-tight">8</p>
            </div>
          </div>

          {/* Average Attendance — dark card */}
          <div className="bg-[#111410] rounded-2xl p-5 shadow-[0_2px_20px_rgba(0,0,0,0.15)] flex flex-col justify-between col-span-1 sm:col-span-1">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 15l4-4 3 3 5-6" stroke="#7fe05b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" opacity=".3">
                <path d="M4 22l6-7 5 5 8-10" stroke="#7fe05b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mt-4">
              <p className="text-[11.5px] font-semibold text-white/40 uppercase tracking-wide">Rata-rata Kehadiran</p>
              <p className="text-[2.6rem] font-black text-[#7fe05b] leading-tight tracking-tight">
                {avgAttendance}%
              </p>
            </div>
          </div>

          {/* Recent Issues */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L1.5 13.5h13L8 2Z" stroke="#f59e0b" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8 7v3M8 11.5h.01" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <p className="text-[13px] font-bold text-[#1a1a1a]">Catatan Terbaru</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {RECENT_ISSUES.map((issue, i) => (
                <li key={i} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{ background: issue.dot }}
                    />
                    <p className="text-[12.5px] font-medium text-[#2d2d2d] leading-snug">{issue.label}</p>
                  </div>
                  <p className="text-[11px] text-[#9a9a9a] whitespace-nowrap font-semibold shrink-0">
                    {issue.time}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Attendance Table ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Table header */}
          <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5">
            <h2 className="text-[1.05rem] font-extrabold text-[#1a1a1a]">Rekap Kehadiran</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {(["Semua", "Hadir", "Absen", "Terlambat"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold transition-all duration-150 ${
                    filter === f
                      ? "bg-[#111410] text-white"
                      : "bg-[#f0f0ea] text-[#6b6b6b] hover:bg-[#e4e4dc]"
                  }`}
                >
                  {f}
                </button>
              ))}
              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#111410] text-white rounded-full text-[12.5px] font-semibold hover:bg-[#1e1e16] transition-all">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Unduh
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1.8fr_1fr_1fr_1.2fr_1fr] px-6 py-3 bg-[#f9f9f5] text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wider border-b border-black/5">
            <span>Mata Pelajaran</span>
            <span>Check-in</span>
            <span className="hidden sm:block">Avg Bulanan</span>
            <span className="hidden sm:block">Rata-rata</span>
            <span>Status Hari Ini</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-black/[0.04]">
            {filtered.map((subj, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.8fr_1fr_1fr_1.2fr_1fr] px-6 py-4 items-center hover:bg-[#fafaf7] transition-colors"
              >
                {/* Subject + teacher */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                    style={{ background: subj.color }}
                  >
                    {subj.initials}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold text-[#1a1a1a]">{subj.name}</p>
                    <p className="text-[11.5px] text-[#9a9a9a]">{subj.teacher}</p>
                  </div>
                </div>

                {/* Last check-in */}
                <span className="text-[13px] font-semibold text-[#2d2d2d]">
                  {subj.lastCheckin !== "-" ? subj.lastCheckin + " WIB" : "-"}
                </span>

                {/* Progress bar */}
                <div className="hidden sm:flex flex-col gap-1.5">
                  <div className="h-1.5 w-28 rounded-full bg-[#e8e8e0] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${subj.monthlyAvg}%`,
                        background:
                          subj.monthlyAvg >= 90
                            ? "#7fe05b"
                            : subj.monthlyAvg >= 75
                            ? "#111410"
                            : "#ef4444",
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold" style={{
                    color:
                      subj.monthlyAvg >= 90
                        ? "#4a9e2f"
                        : subj.monthlyAvg >= 75
                        ? "#555"
                        : "#ef4444",
                  }}>
                    {subj.monthlyAvg}%{" "}
                    {subj.monthlyAvg >= 90
                      ? "excellent"
                      : subj.monthlyAvg >= 75
                      ? "steady"
                      : "critical"}
                  </p>
                </div>

                {/* Avg number */}
                <span className="hidden sm:block text-[13px] font-bold text-[#1a1a1a]">
                  {subj.monthlyAvg}%
                </span>

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold ${STATUS_STYLE[subj.status]}`}
                  >
                    {subj.status}
                  </span>
                  <button className="text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="3" r="1" fill="currentColor" />
                      <circle cx="8" cy="8" r="1" fill="currentColor" />
                      <circle cx="8" cy="13" r="1" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-6 py-10 text-center text-[13px] text-[#9a9a9a]">
                Tidak ada data untuk filter ini.
              </div>
            )}
          </div>

          {/* Pagination footer */}
          <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between">
            <p className="text-[12.5px] text-[#9a9a9a] font-medium">
              Menampilkan {filtered.length} dari {SUBJECTS.length} mata pelajaran · Kelas X-A
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/10 text-[#6b6b6b] hover:bg-[#f0f0ea] transition">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/10 text-[#6b6b6b] hover:bg-[#f0f0ea] transition">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 11l4-4-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
