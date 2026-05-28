"use client";

import { useState } from "react";

interface Props {
  onMenuClick: () => void;
}

type StatusType = "Hadir" | "Izin" | "Sakit" | "Terlambat" | "Dispen";

const STUDENTS: {
  id: string;
  nama: string;
  checkin: string;
  status: StatusType;
  initials: string;
}[] = [
  { id: "202401001", nama: "Aaron Montgomery",  checkin: "07:25 AM", status: "Hadir",     initials: "AM" },
  { id: "202401014", nama: "Beatrice Sullivan",  checkin: "07:42 AM", status: "Hadir",     initials: "BS" },
  { id: "202401022", nama: "Curtis Rhodes",      checkin: "—",        status: "Izin",      initials: "CR" },
  { id: "202401045", nama: "Danielle Parker",    checkin: "08:15 AM", status: "Terlambat", initials: "DP" },
  { id: "202401056", nama: "Elias Thorne",       checkin: "07:12 AM", status: "Hadir",     initials: "ET" },
  { id: "202401063", nama: "Fiona Castillo",     checkin: "07:58 AM", status: "Hadir",     initials: "FC" },
  { id: "202401071", nama: "George Lawson",      checkin: "—",        status: "Sakit",     initials: "GL" },
  { id: "202401089", nama: "Hannah Brooks",      checkin: "07:33 AM", status: "Hadir",     initials: "HB" },
  { id: "202401094", nama: "Ivan Mercer",        checkin: "08:02 AM", status: "Terlambat", initials: "IM" },
  { id: "202401102", nama: "Julia Sinclair",     checkin: "07:20 AM", status: "Hadir",     initials: "JS" },
];

const STATUS_STYLE: Record<StatusType, string> = {
  Hadir:     "bg-[#7fe05b] text-[#111410]",
  Izin:      "border border-gray-300 text-gray-700 bg-white",
  Sakit:     "bg-red-100 text-red-700",
  Terlambat: "bg-[#111410] text-[#7fe05b]",
  Dispen:    "bg-blue-100 text-blue-700",
};

const AVATAR_COLORS = [
  "#3b82f6","#8b5cf6","#f59e0b","#ef4444",
  "#06b6d4","#10b981","#f97316","#6366f1",
  "#ec4899","#14b8a6",
];

export default function GuruDashboardContent({ onMenuClick }: Props) {
  const [search, setSearch] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const totalSiswa = STUDENTS.length;
  const hadirHariIni = STUDENTS.filter((s) => s.status === "Hadir").length;
  const tidakHadir = STUDENTS.filter((s) => s.status !== "Hadir" && s.status !== "Terlambat").length;
  const tingkatKetidakhadiran = ((tidakHadir / totalSiswa) * 100).toFixed(1);

  const filtered = STUDENTS.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search)
  );

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
            Laporan Kehadiran
          </h1>
        </div>
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#1a1a1a]"
        >
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* ── Class label ── */}
        <h2 className="text-[1.1rem] sm:text-[1.25rem] font-extrabold text-[#1a1a1a] tracking-tight">
          Kelas XI - 1 PPLG
        </h2>

        {/* ── Stat Cards ── */}
        {/* Mobile: 2-col grid (card 1 full width, card 2&3 side by side) */}
        {/* Desktop: 3-col grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">

          {/* Jumlah Siswa — full width di mobile */}
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#111410] flex items-center justify-center sm:mb-4 shrink-0">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <circle cx="8" cy="7" r="3.5" stroke="#7fe05b" strokeWidth="1.5" />
                <circle cx="15" cy="7" r="3.5" stroke="#7fe05b" strokeWidth="1.5" />
                <path d="M1 19c0-3.314 3.134-5 7-5s7 1.686 7 5" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M15 14c2.5 0 5 1.2 5 4" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] sm:text-[12px] font-semibold text-[#9a9a9a] uppercase tracking-wide">Jumlah Siswa</p>
              <p className="text-[2rem] sm:text-[2.4rem] font-black text-[#1a1a1a] leading-tight tracking-tight mt-0.5">{totalSiswa}</p>
            </div>
          </div>

          {/* Hadir Hari Ini */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f0fce8] flex items-center justify-center mb-3 sm:mb-4">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#7fe05b" strokeWidth="1.5" />
                <path d="M7 11l3 3 5-5" stroke="#7fe05b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-[12px] font-semibold text-[#9a9a9a] uppercase tracking-wide leading-tight">Hadir Hari Ini</p>
            <p className="text-[2rem] sm:text-[2.4rem] font-black text-[#7fe05b] leading-tight tracking-tight mt-0.5">{hadirHariIni}</p>
          </div>

          {/* Tingkat Ketidakhadiran */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3 sm:mb-4">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M8 8l6 6M14 8l-6 6" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-[12px] font-semibold text-[#9a9a9a] uppercase tracking-wide leading-tight">Tingkat Absen</p>
            <p className="text-[2rem] sm:text-[2.4rem] font-black text-[#ef4444] leading-tight tracking-tight mt-0.5">{tingkatKetidakhadiran}%</p>
          </div>

        </div>

        {/* ── Daftar Siswa ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

          {/* Table header + search */}
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5">
            <h3 className="text-[1rem] font-extrabold text-[#1a1a1a]">Daftar Siswa</h3>
            <div className="relative">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Telusuri siswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  pl-9 pr-4 py-2 text-[13px]
                  bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8]
                  rounded-xl border border-transparent outline-none
                  focus:border-[#7fe05b] focus:bg-white
                  transition-all duration-200 w-full sm:w-52
                "
              />
            </div>
          </div>

          {/* ── DESKTOP table ── */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-[1fr_2fr_1.2fr_1fr_auto] px-6 py-3 bg-[#f9f9f5] text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wider border-b border-black/5">
              <span>Nomor ID</span>
              <span>Nama Siswa</span>
              <span>Check-in Terakhir</span>
              <span>Keterangan</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-black/[0.04]">
              {filtered.map((student, i) => (
                <div
                  key={student.id}
                  className="grid grid-cols-[1fr_2fr_1.2fr_1fr_auto] px-6 py-4 items-center hover:bg-[#fafaf7] transition-colors"
                >
                  <span className="text-[13px] font-mono font-semibold text-[#6b6b6b]">{student.id}</span>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                    >
                      {student.initials}
                    </div>
                    <span className="text-[13.5px] font-bold text-[#1a1a1a]">{student.nama}</span>
                  </div>

                  <span className="text-[13px] font-semibold text-[#2d2d2d]">{student.checkin}</span>

                  <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-bold w-fit ${STATUS_STYLE[student.status]}`}>
                    {student.status}
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(menuOpenId === student.id ? null : student.id)}
                      className="p-1.5 text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors rounded-lg hover:bg-[#f0f0ea]"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                        <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                        <circle cx="8" cy="13" r="1.2" fill="currentColor" />
                      </svg>
                    </button>
                    {menuOpenId === student.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-black/8 z-20 min-w-[150px] overflow-hidden">
                        {["Lihat Detail", "Edit Status", "Kirim Notifikasi"].map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => setMenuOpenId(null)}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#1a1a1a] hover:bg-[#f0f0ea] transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">
                  Tidak ada siswa yang cocok dengan pencarian.
                </div>
              )}
            </div>
          </div>

          {/* ── MOBILE card list ── */}
          <div className="sm:hidden divide-y divide-black/[0.04]">
            {filtered.map((student, i) => (
              <div key={student.id} className="px-4 py-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {student.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{student.nama}</p>
                  <p className="text-[11.5px] text-[#9a9a9a] font-mono mt-0.5">{student.id} · {student.checkin}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${STATUS_STYLE[student.status]}`}>
                  {student.status}
                </span>
                <button
                  type="button"
                  className="p-1 text-[#9a9a9a] shrink-0"
                  onClick={() => setMenuOpenId(menuOpenId === student.id ? null : student.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="13" r="1.2" fill="currentColor" />
                  </svg>
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-[13px] text-[#9a9a9a]">
                Tidak ada siswa yang cocok.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-black/5 flex items-center justify-between">
            <p className="text-[12px] text-[#9a9a9a] font-medium">
              Menampilkan {filtered.length} dari {totalSiswa} siswa · Class XI-1 PPLG
            </p>
            <div className="flex gap-1">
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/10 text-[#6b6b6b] hover:bg-[#f0f0ea] transition">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/10 text-[#6b6b6b] hover:bg-[#f0f0ea] transition">
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
