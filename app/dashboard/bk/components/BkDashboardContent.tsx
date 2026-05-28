"use client";

import { useState, useEffect, useRef } from "react";
import { DATA_KELAS, STATUS_STYLE, AVATAR_COLORS, type Kelas, type StatusType } from "../data/kelasSiswa";

interface Props { onMenuClick: () => void; }

const TINGKAT_ORDER = ["X", "XI", "XII"];

const STATUS_FILTERS: StatusType[] = ["Hadir", "Izin", "Sakit", "Terlambat", "Dispen", "Alfa"];

// Warna badge per tingkat
const TINGKAT_COLOR: Record<string, { bg: string; text: string }> = {
  X:   { bg: "#dbeafe", text: "#1d4ed8" },
  XI:  { bg: "#f0fce8", text: "#4a9e2f" },
  XII: { bg: "#fef3c7", text: "#b45309" },
};

export default function BkDashboardContent({ onMenuClick }: Props) {
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusType | "Semua">("Semua");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll ke atas setiap kali berpindah view (buka atau tutup detail kelas)
  useEffect(() => {
    // Reset semua kemungkinan scroll container
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    scrollRef.current?.scrollTo(0, 0);
    // Cari parent yang overflow-y-auto (layout wrapper)
    const scrollable = scrollRef.current?.closest("[class*='overflow-y-auto']");
    if (scrollable) scrollable.scrollTop = 0;
  }, [selectedKelas]);

  // Global stats
  const totalSiswa   = DATA_KELAS.reduce((a, k) => a + k.siswa.length, 0);
  const totalHadir   = DATA_KELAS.reduce((a, k) => a + k.siswa.filter((s) => s.status === "Hadir").length, 0);
  const totalTidakHadir = DATA_KELAS.reduce((a, k) => a + k.siswa.filter((s) => ["Izin","Sakit","Alfa"].includes(s.status)).length, 0);
  const totalTerlambat  = DATA_KELAS.reduce((a, k) => a + k.siswa.filter((s) => s.status === "Terlambat").length, 0);

  // Group kelas by tingkat
  const grouped = TINGKAT_ORDER.map((tingkat) => ({
    tingkat,
    kelasList: DATA_KELAS.filter((k) => k.tingkat === tingkat),
  }));

  // Filtered siswa saat detail kelas terbuka
  const filteredSiswa = selectedKelas
    ? selectedKelas.siswa.filter((s) => {
        const matchSearch =
          s.nama.toLowerCase().includes(search.toLowerCase()) ||
          s.id.includes(search);
        const matchStatus = filterStatus === "Semua" || s.status === filterStatus;
        return matchSearch && matchStatus;
      })
    : [];

  function getKelasStats(kelas: Kelas) {
    const hadir    = kelas.siswa.filter((s) => s.status === "Hadir").length;
    const pct      = Math.round((hadir / kelas.siswa.length) * 100);
    return { hadir, pct };
  }

  return (
    <div ref={scrollRef} className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          {selectedKelas ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setSelectedKelas(null); setSearch(""); setFilterStatus("Semua"); }}
                className="flex items-center gap-1.5 text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[13px] font-semibold hidden sm:block">Semua Kelas</span>
              </button>
              <span className="text-[#d0d0c8]">/</span>
              <h1 className="text-[1rem] sm:text-[1.3rem] font-extrabold text-[#1a1a1a] tracking-tight">
                Kelas {selectedKelas.nama}
              </h1>
            </div>
          ) : (
            <h1 className="text-[1.1rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">
              Dashboard Guru BK
            </h1>
          )}
        </div>
        <button type="button" className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#1a1a1a]">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* ══════════ VIEW: SEMUA KELAS ══════════ */}
        {!selectedKelas && (
          <>
            {/* Global stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Siswa",   value: totalSiswa,      color: "#1a1a1a", bg: "#111410", icon: "👥" },
                { label: "Hadir",         value: totalHadir,      color: "#4a9e2f", bg: "#f0fce8", icon: "✅" },
                { label: "Tidak Hadir",   value: totalTidakHadir, color: "#b91c1c", bg: "#fef2f2", icon: "❌" },
                { label: "Terlambat",     value: totalTerlambat,  color: "#b45309", bg: "#fef3c7", icon: "⏰" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
                    style={{ background: s.bg }}
                  >
                    {s.icon}
                  </div>
                  <p className="text-[11px] font-semibold text-[#9a9a9a] uppercase tracking-wide">{s.label}</p>
                  <p className="text-[2rem] font-black leading-tight tracking-tight mt-0.5" style={{ color: s.color }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Kelas grouped by tingkat */}
            {grouped.map(({ tingkat, kelasList }) => (
              <div key={tingkat}>
                {/* Tingkat header */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-[12px] font-black"
                    style={{ background: TINGKAT_COLOR[tingkat].bg, color: TINGKAT_COLOR[tingkat].text }}
                  >
                    Kelas {tingkat}
                  </span>
                  <div className="flex-1 h-px bg-black/8" />
                  <span className="text-[12px] font-semibold text-[#9a9a9a]">{kelasList.length} kelas</span>
                </div>

                {/* Kelas cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {kelasList.map((kelas) => {
                    const { hadir, pct } = getKelasStats(kelas);
                    const absen = kelas.siswa.filter((s) => ["Izin","Sakit","Alfa"].includes(s.status)).length;
                    const terlambat = kelas.siswa.filter((s) => s.status === "Terlambat").length;
                    const dispen = kelas.siswa.filter((s) => s.status === "Dispen").length;

                    return (
                      <button
                        key={kelas.id}
                        type="button"
                        onClick={() => setSelectedKelas(kelas)}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] text-left hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 group"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-[15px] font-extrabold text-[#1a1a1a]">{kelas.nama}</p>
                            <p className="text-[12px] text-[#9a9a9a] mt-0.5">{kelas.siswa.length} siswa</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-[#f0fce8] rounded-full px-2.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7fe05b]" />
                            <span className="text-[11.5px] font-black text-[#4a9e2f]">{pct}%</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 rounded-full bg-[#f0f0ea] overflow-hidden mb-3">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: pct >= 90 ? "#7fe05b" : pct >= 75 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>

                        {/* Status summary badges */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="flex items-center gap-1 text-[11px] font-semibold bg-[#f0fce8] text-[#4a9e2f] px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7fe05b]" />{hadir} Hadir
                          </span>
                          {absen > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />{absen} Absen
                            </span>
                          )}
                          {terlambat > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold bg-[#111410]/10 text-[#111410] px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#111410]" />{terlambat} Terlambat
                            </span>
                          )}
                          {dispen > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{dispen} Dispen
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-end mt-4 text-[12px] font-bold text-[#9a9a9a] group-hover:text-[#4a9e2f] transition-colors">
                          Lihat detail
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ══════════ VIEW: DETAIL KELAS ══════════ */}
        {selectedKelas && (
          <>
            {/* Stat mini */}
            {(() => {
              const hadir     = selectedKelas.siswa.filter((s) => s.status === "Hadir").length;
              const terlambat = selectedKelas.siswa.filter((s) => s.status === "Terlambat").length;
              const absen     = selectedKelas.siswa.filter((s) => ["Izin","Sakit","Alfa"].includes(s.status)).length;
              const dispen    = selectedKelas.siswa.filter((s) => s.status === "Dispen").length;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Hadir",     value: hadir,     color: "#4a9e2f", bg: "#f0fce8" },
                    { label: "Terlambat", value: terlambat, color: "#b45309", bg: "#fef3c7" },
                    { label: "Tidak Hadir", value: absen,   color: "#b91c1c", bg: "#fef2f2" },
                    { label: "Dispen",    value: dispen,    color: "#1d4ed8", bg: "#dbeafe" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                        <span className="text-[1.1rem] font-black" style={{ color: s.color }}>{s.value}</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[#9a9a9a] leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Table card */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

              {/* Search + filter */}
              <div className="px-4 sm:px-6 py-4 border-b border-black/5 flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari nama atau ID siswa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#f0f0ea] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                  />
                </div>
                {/* Filter status */}
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFilterStatus("Semua")}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all active:opacity-70 ${filterStatus === "Semua" ? "bg-[#111410] text-white" : "bg-[#f0f0ea] text-[#6b6b6b]"}`}
                  >
                    Semua
                  </button>
                  {STATUS_FILTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilterStatus(s)}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                      className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all active:opacity-70 ${filterStatus === s ? "bg-[#111410] text-white" : "bg-[#f0f0ea] text-[#6b6b6b]"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-[1fr_2fr_1.2fr_1fr] px-6 py-3 bg-[#f9f9f5] text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wider border-b border-black/5">
                  <span>Nomor ID</span>
                  <span>Nama Siswa</span>
                  <span>Check-in</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-black/[0.04]">
                  {filteredSiswa.map((s, i) => (
                    <div key={s.id} className="grid grid-cols-[1fr_2fr_1.2fr_1fr] px-6 py-4 items-center hover:bg-[#fafaf7] transition-colors">
                      <span className="text-[12.5px] font-mono font-semibold text-[#6b6b6b]">{s.id}</span>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                        >
                          {s.initials}
                        </div>
                        <span className="text-[13.5px] font-bold text-[#1a1a1a]">{s.nama}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#2d2d2d]">{s.checkin}</span>
                      <span className={`inline-flex px-3.5 py-1.5 rounded-full text-[12px] font-bold w-fit ${STATUS_STYLE[s.status]}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                  {filteredSiswa.length === 0 && (
                    <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">
                      Tidak ada siswa yang cocok.
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-black/[0.04]">
                {filteredSiswa.map((s, i) => (
                  <div key={s.id} className="px-4 py-3.5 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                    >
                      {s.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{s.nama}</p>
                      <p className="text-[11px] text-[#9a9a9a] font-mono mt-0.5">{s.id} · {s.checkin}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${STATUS_STYLE[s.status]}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
                {filteredSiswa.length === 0 && (
                  <div className="px-4 py-10 text-center text-[13px] text-[#9a9a9a]">
                    Tidak ada siswa yang cocok.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3.5 border-t border-black/5">
                <p className="text-[12px] text-[#9a9a9a] font-medium">
                  Menampilkan {filteredSiswa.length} dari {selectedKelas.siswa.length} siswa · {selectedKelas.nama}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
