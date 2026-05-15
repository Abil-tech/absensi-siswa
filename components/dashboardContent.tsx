"use client";

import { useState, useEffect } from "react";

interface Props {
  onMenuClick: () => void;
  userId: string;
}

type FilterType = "Semua" | "hadir" | "alpha" | "sakit" | "izin";

const STATUS_STYLE: Record<string, string> = {
  hadir:  "bg-[#7fe05b] text-[#111410]",
  alpha:  "border border-gray-300 text-gray-700 bg-white",
  sakit:  "bg-blue-100 text-blue-800",
  izin:   "bg-yellow-100 text-yellow-800",
};

const STATUS_LABEL: Record<string, string> = {
  hadir: "Hadir", alpha: "Alpha", sakit: "Sakit", izin: "Izin",
};

export default function DashboardContent({ onMenuClick, userId }: Props) {
  const [filter, setFilter] = useState<FilterType>("Semua");
  const [absensi, setAbsensi] = useState<any[]>([]);
  const [ringkasan, setRingkasan] = useState({ total: 0, hadir: 0, izin: 0, sakit: 0, alpha: 0, persentase: 0 });
  const [loading, setLoading] = useState(true);

  const bulanIni = new Date().toISOString().slice(0, 7); // "2024-05"

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/absensi/siswa?bulan=${bulanIni}`)
      .then((r) => r.json())
      .then((res) => {
        setAbsensi(res.data ?? []);
        setRingkasan(res.ringkasan ?? {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = filter === "Semua" ? absensi : absensi.filter((a) => a.status === filter);

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden text-[#1a1a1a]" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.1rem] sm:text-[1.4rem] font-extrabold text-[#1a1a1a] tracking-tight">Kehadiran Saya</h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-4 sm:gap-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Hadir", value: ringkasan.hadir, color: "#7fe05b", bg: "#f0fce8" },
            { label: "Izin",  value: ringkasan.izin,  color: "#f59e0b", bg: "#fef3c7" },
            { label: "Sakit", value: ringkasan.sakit, color: "#3b82f6", bg: "#dbeafe" },
            { label: "Alpha", value: ringkasan.alpha, color: "#ef4444", bg: "#fef2f2" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <div className="w-8 h-1.5 rounded-full mb-3" style={{ background: s.color }} />
              <p className="text-[11.5px] font-semibold text-[#9a9a9a] uppercase tracking-wide">{s.label}</p>
              <p className="text-[2rem] font-black leading-tight" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Persentase kehadiran */}
        <div className="bg-[#111410] rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_20px_rgba(0,0,0,0.15)]">
          <div>
            <p className="text-white/40 text-[12px] font-semibold uppercase tracking-wide">Persentase Kehadiran Bulan Ini</p>
            <p className="text-[2.5rem] font-black text-[#7fe05b] leading-tight">{ringkasan.persentase}%</p>
            <p className="text-white/30 text-[11px] mt-1">dari {ringkasan.total} hari tercatat</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: ringkasan.persentase >= 75 ? "#7fe05b" : "#ef4444" }}>
            <span className="text-white font-black text-[13px]">{ringkasan.persentase}%</span>
          </div>
        </div>

        {/* Tabel Rekap */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-black/5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[1rem] font-extrabold text-[#1a1a1a]">Rekap Absensi</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["Semua", "hadir", "alpha", "sakit", "izin"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    filter === f ? "bg-[#111410] text-white" : "bg-[#f0f0ea] text-[#6b6b6b] hover:bg-[#e4e4dc]"
                  }`}
                >
                  {f === "Semua" ? "Semua" : STATUS_LABEL[f]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[13px] text-[#9a9a9a]">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[#9a9a9a]">
              {absensi.length === 0 ? "Belum ada data absensi bulan ini." : "Tidak ada data untuk filter ini."}
            </div>
          ) : (
            <div className="divide-y divide-black/[0.04]">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_1fr] px-6 py-3 bg-[#f9f9f5] text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wider">
                <span>Tanggal</span>
                <span>Hari</span>
                <span>Status</span>
              </div>
              {filtered.map((a: any, i: number) => {
                const tgl = new Date(a.tanggal);
                return (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr] px-6 py-4 items-center hover:bg-[#fafaf7] transition-colors">
                    <span className="text-[13.5px] font-semibold text-[#1a1a1a]">
                      {tgl.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                    <span className="text-[13px] text-[#6b6b6b]">
                      {tgl.toLocaleDateString("id-ID", { weekday: "long" })}
                    </span>
                    <span className={`inline-flex w-fit px-3.5 py-1.5 rounded-full text-[12px] font-bold ${STATUS_STYLE[a.status] ?? ""}`}>
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-6 py-4 border-t border-black/5">
            <p className="text-[12px] text-[#9a9a9a] font-medium">
              Menampilkan {filtered.length} dari {absensi.length} catatan · Bulan ini
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
