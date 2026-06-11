"use client";

import { useEffect, useState, useRef } from "react";

interface Props { onMenuClick: () => void; }

type StatusAbsensi = "hadir" | "terlambat" | "sakit" | "izin" | null;
type StatusDispensasi = "pending" | "disetujui" | "ditolak";

interface SiswaData {
  id: string;
  nis: string;
  nama: string;
  status: StatusAbsensi;
  waktu: string;
}

interface KelasData {
  id: string;
  nama: string;
  waliKelas: string | null;
  total: number;
  hadir: number;
  terlambat: number;
  sakit: number;
  izin: number;
  belumAbsen: number;
  siswa: SiswaData[];
}

interface DetailAbsensi {
  id: string;
  status: string;
  waktu: string;
  tanggal: Date;
  keterangan: string;
  file: string | null;
}

interface DetailSiswa {
  siswa: {
    id: string;
    nama: string;
    nis: string;
    kelas: string;
  };
  absensi: DetailAbsensi | null;
}

interface DispensasiItem {
  id: string;
  file: string;
  keterangan: string;
  statusWalas: StatusDispensasi;
  statusBK: StatusDispensasi;
  status: StatusDispensasi;
  catatanBK: string | null;
  tanggal: string;
  siswa: { id: string; nama: string; nis: string; kelas: string };
}

const STATUS_STYLE: Record<string, string> = {
  hadir:      "bg-[#7fe05b] text-[#111410]",
  terlambat:  "bg-amber-100 text-amber-700",
  sakit:      "bg-red-100 text-red-700",
  izin:       "border border-gray-300 text-gray-700 bg-white",
  null:       "bg-gray-100 text-gray-400",
};

const STATUS_LABEL: Record<string, string> = {
  hadir:     "Hadir",
  terlambat: "Terlambat",
  sakit:     "Sakit",
  izin:      "Izin",
  null:      "Belum Absen",
};

const DISPEN_STATUS_STYLE: Record<StatusDispensasi, string> = {
  pending:   "bg-amber-100 text-amber-700",
  disetujui: "bg-[#7fe05b] text-[#111410]",
  ditolak:   "bg-red-100 text-red-700",
};

const DISPEN_STATUS_LABEL: Record<StatusDispensasi, string> = {
  pending: "Menunggu", disetujui: "Disetujui", ditolak: "Ditolak",
};

const AVATAR_COLORS = [
  "#3b82f6","#8b5cf6","#f59e0b","#ef4444",
  "#06b6d4","#10b981","#f97316","#6366f1","#ec4899","#14b8a6",
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function toInputDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function BkDashboardContent({ onMenuClick }: Props) {
  const [kelasList, setKelasList]           = useState<KelasData[]>([]);
  const [loading, setLoading]               = useState(true);
  const [selectedKelas, setSelectedKelas]   = useState<KelasData | null>(null);
  const [search, setSearch]                 = useState("");
  const [tanggal, setTanggal]               = useState(toInputDate(new Date()));
  const [dispensasiList, setDispensasiList] = useState<DispensasiItem[]>([]);
  const [loadingDispen, setLoadingDispen]   = useState(true);
  const [approvingId, setApprovingId]       = useState<string | null>(null);
  const [approveError, setApproveError]     = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [modalOpen, setModalOpen]           = useState(false);
  const [selectedSiswa, setSelectedSiswa]   = useState<SiswaData | null>(null);
  const [detailAbsensi, setDetailAbsensi]   = useState<DetailSiswa | null>(null);
  const [loadingDetail, setLoadingDetail]   = useState(false);
  const [detailError, setDetailError]       = useState<string | null>(null);

  // Fetch kelas saat tanggal berubah
  useEffect(() => {
    async function fetchKelas() {
      setLoading(true);
      try {
        const res = await fetch(`/api/bk/kelas?tanggal=${tanggal}`);
        if (!res.ok) return;
        const json = await res.json();
        setKelasList(json.kelas ?? []);
        setSelectedKelas((prev) =>
          prev ? (json.kelas ?? []).find((k: KelasData) => k.id === prev.id) ?? null : null
        );
      } finally {
        setLoading(false);
      }
    }
    fetchKelas();
  }, [tanggal]);

  // Fetch dispensasi sekali
  useEffect(() => {
    async function fetchDispen() {
      try {
        const res = await fetch("/api/bk/dispensasi");
        if (!res.ok) return;
        const json = await res.json();
        setDispensasiList(json.dispensasi ?? []);
      } finally {
        setLoadingDispen(false);
      }
    }
    fetchDispen();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [selectedKelas]);

  async function handleOpenDetail(siswa: SiswaData) {
    setSelectedSiswa(siswa);
    setModalOpen(true);
    setLoadingDetail(true);
    setDetailError(null);
    setDetailAbsensi(null);

    try {
      const res = await fetch(`/api/absensi/siswa/${siswa.id}`);
      if (!res.ok) {
        const json = await res.json();
        setDetailError(json.error ?? "Gagal memuat detail");
        return;
      }
      const json = await res.json();
      setDetailAbsensi(json);
    } catch {
      setDetailError("Gagal terhubung ke server");
    } finally {
      setLoadingDetail(false);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedSiswa(null);
    setDetailAbsensi(null);
    setDetailError(null);
  }

  async function handleApprove(dispensasiId: string, keputusan: "disetujui" | "ditolak") {
    setApprovingId(dispensasiId);
    setApproveError(null);
    try {
      const res = await fetch("/api/dispensasi/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dispensasiId, keputusan }),
      });
      const json = await res.json();
      if (!res.ok) { setApproveError(json.error ?? "Gagal memproses"); return; }
      setDispensasiList((prev) =>
        prev.map((d) =>
          d.id === dispensasiId ? { ...d, statusBK: keputusan, status: json.status } : d
        )
      );
    } catch {
      setApproveError("Gagal terhubung ke server");
    } finally {
      setApprovingId(null);
    }
  }

  const totalSiswa      = kelasList.reduce((a, k) => a + k.total, 0);
  const totalHadir      = kelasList.reduce((a, k) => a + k.hadir, 0);
  const totalTerlambat  = kelasList.reduce((a, k) => a + k.terlambat, 0);
  const totalTidakHadir = kelasList.reduce((a, k) => a + k.sakit + k.izin, 0);
  const pendingDispen   = dispensasiList.filter((d) => d.statusBK === "pending");

  const filteredSiswa = selectedKelas
    ? selectedKelas.siswa.filter((s) =>
        s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search)
      )
    : [];

  return (
    <div ref={scrollRef} className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          {selectedKelas ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setSelectedKelas(null); setSearch(""); }}
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

        {/* Filter tanggal */}
        <input
          type="date"
          value={tanggal}
          max={toInputDate(new Date())}
          onChange={(e) => setTanggal(e.target.value)}
          className="border border-black/10 rounded-xl px-3 py-1.5 text-[13px] text-[#374151] bg-white outline-none focus:border-[#7fe05b] transition cursor-pointer"
        />
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* ══ VIEW: SEMUA KELAS ══ */}
        {!selectedKelas && (
          <>
            {/* Global stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Siswa",  value: loading ? "—" : totalSiswa,      color: "#1a1a1a", bg: "#f0f0ea" },
                { label: "Hadir",        value: loading ? "—" : totalHadir,      color: "#4a9e2f", bg: "#f0fce8" },
                { label: "Tidak Hadir",  value: loading ? "—" : totalTidakHadir, color: "#b91c1c", bg: "#fef2f2" },
                { label: "Terlambat",    value: loading ? "—" : totalTerlambat,  color: "#b45309", bg: "#fef3c7" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                  <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ background: s.bg }}>
                    <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  </div>
                  <p className="text-[11px] font-semibold text-[#9a9a9a] uppercase tracking-wide">{s.label}</p>
                  <p className="text-[2rem] font-black leading-tight tracking-tight mt-0.5" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Kelas grid — dikelompokkan per tingkat */}
            {loading ? (
              <div className="text-center text-[13px] text-[#9a9a9a] py-10">Memuat data kelas...</div>
            ) : kelasList.length === 0 ? (
              <div className="text-center text-[13px] text-[#9a9a9a] py-10">Tidak ada data kelas.</div>
            ) : (
              <>
                {[
                  { angka: "10", label: "X",   color: { bg: "#dbeafe", text: "#1d4ed8" } },
                  { angka: "11", label: "XI",  color: { bg: "#f0fce8", text: "#4a9e2f" } },
                  { angka: "12", label: "XII", color: { bg: "#fef3c7", text: "#b45309" } },
                ]
                  .map(({ angka, label, color }) => ({
                    angka,
                    label,
                    color,
                    kelas: kelasList.filter((k) => k.nama.split(" ")[0] === angka),
                  }))
                  .filter((g) => g.kelas.length > 0)
                  .map(({ label, color, kelas: kelasGroup }) => (
                    <div key={label}>
                      {/* Header tingkat */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-[12px] font-black"
                          style={{ background: color.bg, color: color.text }}
                        >
                          Kelas {label}
                        </span>
                        <div className="flex-1 h-px bg-black/8" />
                        <span className="text-[12px] font-semibold text-[#9a9a9a]">{kelasGroup.length} kelas</span>
                      </div>

                      {/* Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {kelasGroup.map((kelas) => {
                          const pct = kelas.total > 0
                            ? Math.round(((kelas.hadir + kelas.terlambat) / kelas.total) * 100)
                            : 0;
                          return (
                            <button
                              key={kelas.id}
                              type="button"
                              onClick={() => setSelectedKelas(kelas)}
                              className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] text-left hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 group"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <p className="text-[15px] font-extrabold text-[#1a1a1a]">{kelas.nama}</p>
                                  <p className="text-[12px] text-[#9a9a9a] mt-0.5">
                                    {kelas.total} siswa{kelas.waliKelas ? ` · ${kelas.waliKelas}` : ""}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#f0fce8] rounded-full px-2.5 py-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#7fe05b]" />
                                  <span className="text-[11.5px] font-black text-[#4a9e2f]">{pct}%</span>
                                </div>
                              </div>
                              <div className="h-2 rounded-full bg-[#f0f0ea] overflow-hidden mb-3">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    background: pct >= 90 ? "#7fe05b" : pct >= 75 ? "#f59e0b" : "#ef4444",
                                  }}
                                />
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {kelas.hadir > 0 && (
                                  <span className="text-[11px] font-semibold bg-[#f0fce8] text-[#4a9e2f] px-2 py-0.5 rounded-full">{kelas.hadir} Hadir</span>
                                )}
                                {kelas.terlambat > 0 && (
                                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{kelas.terlambat} Terlambat</span>
                                )}
                                {kelas.sakit > 0 && (
                                  <span className="text-[11px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{kelas.sakit} Sakit</span>
                                )}
                                {kelas.izin > 0 && (
                                  <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{kelas.izin} Izin</span>
                                )}
                                {kelas.belumAbsen > 0 && (
                                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{kelas.belumAbsen} Belum Absen</span>
                                )}
                              </div>
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

            {/* Dispensasi section */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-[1rem] font-extrabold text-[#1a1a1a]">Pengajuan Dispensasi</h3>
                {pendingDispen.length > 0 && (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11.5px] font-black rounded-full">
                    {pendingDispen.length} pending
                  </span>
                )}
              </div>

              {approveError && (
                <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">
                  {approveError}
                </div>
              )}

              {loadingDispen && (
                <div className="px-6 py-10 text-center text-[13px] text-[#9a9a9a]">Memuat dispensasi...</div>
              )}

              {!loadingDispen && dispensasiList.length === 0 && (
                <div className="px-6 py-10 text-center text-[13px] text-[#9a9a9a]">Tidak ada pengajuan dispensasi.</div>
              )}

              {!loadingDispen && dispensasiList.length > 0 && (
                <div className="divide-y divide-black/[0.04]">
                  {dispensasiList.map((d) => (
                    <div key={d.id} className="px-4 sm:px-6 py-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-bold text-[#1a1a1a]">{d.siswa.nama}</p>
                          <p className="text-[11.5px] text-[#9a9a9a] font-mono">
                            {d.siswa.nis} · {d.siswa.kelas} · {formatTanggal(d.tanggal)}
                          </p>
                          <p className="text-[12.5px] text-[#6b6b6b] mt-1">{d.keterangan}</p>
                          <div className="flex gap-2 mt-1.5">
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${DISPEN_STATUS_STYLE[d.statusWalas]}`}>
                              Walas: {DISPEN_STATUS_LABEL[d.statusWalas]}
                            </span>
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${DISPEN_STATUS_STYLE[d.statusBK]}`}>
                              BK: {DISPEN_STATUS_LABEL[d.statusBK]}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${DISPEN_STATUS_STYLE[d.status]}`}>
                          {DISPEN_STATUS_LABEL[d.status]}
                        </span>
                      </div>
                      {d.statusBK === "pending" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={approvingId === d.id}
                            onClick={() => handleApprove(d.id, "disetujui")}
                            className="flex-1 py-2.5 rounded-xl bg-[#7fe05b] text-[#111410] text-[13px] font-extrabold hover:bg-[#6bcf49] disabled:opacity-50 transition"
                          >
                            {approvingId === d.id ? "Memproses..." : "Setujui"}
                          </button>
                          <button
                            type="button"
                            disabled={approvingId === d.id}
                            onClick={() => handleApprove(d.id, "ditolak")}
                            className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-700 text-[13px] font-extrabold hover:bg-red-100 disabled:opacity-50 transition border border-red-200"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ VIEW: DETAIL KELAS ══ */}
        {selectedKelas && (
          <>
            {/* Mini stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Hadir",       value: selectedKelas.hadir,      color: "#4a9e2f", bg: "#f0fce8" },
                { label: "Terlambat",   value: selectedKelas.terlambat,  color: "#b45309", bg: "#fef3c7" },
                { label: "Sakit",       value: selectedKelas.sakit,      color: "#b91c1c", bg: "#fef2f2" },
                { label: "Izin",        value: selectedKelas.izin,       color: "#6b7280", bg: "#f9fafb" },
                { label: "Belum Absen", value: selectedKelas.belumAbsen, color: "#b45309", bg: "#fef3c7" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ background: s.bg }}>
                    <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  </div>
                  <p className="text-[11px] font-semibold text-[#9a9a9a]">{s.label}</p>
                  <p className="text-[1.6rem] font-black leading-tight" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tabel siswa */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-black/5">
                <div className="relative">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari nama atau NIS..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#f0f0ea] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-[1fr_2fr_1.2fr_1fr] px-6 py-3 bg-[#f9f9f5] text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wider border-b border-black/5">
                  <span>NIS</span><span>Nama Siswa</span><span>Waktu Absen</span><span>Status</span>
                </div>
                <div className="divide-y divide-black/[0.04]">
                  {filteredSiswa.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleOpenDetail(s)}
                      className="w-full grid grid-cols-[1fr_2fr_1.2fr_1fr] px-6 py-4 items-center hover:bg-[#fafaf7] transition-colors text-left"
                    >
                      <span className="text-[12.5px] font-mono font-semibold text-[#6b6b6b]">{s.nis}</span>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                        >
                          {getInitials(s.nama)}
                        </div>
                        <span className="text-[13.5px] font-bold text-[#1a1a1a]">{s.nama}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#2d2d2d]">{s.waktu}</span>
                      <span className={`inline-flex px-3.5 py-1.5 rounded-full text-[12px] font-bold w-fit ${STATUS_STYLE[s.status ?? "null"]}`}>
                        {STATUS_LABEL[s.status ?? "null"]}
                      </span>
                    </button>
                  ))}
                  {filteredSiswa.length === 0 && (
                    <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">Tidak ada siswa yang cocok.</div>
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div className="sm:hidden divide-y divide-black/[0.04]">
                {filteredSiswa.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleOpenDetail(s)}
                    className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-[#fafaf7] transition-colors text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                    >
                      {getInitials(s.nama)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{s.nama}</p>
                      <p className="text-[11px] text-[#9a9a9a] font-mono mt-0.5">{s.nis} · {s.waktu}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${STATUS_STYLE[s.status ?? "null"]}`}>
                      {STATUS_LABEL[s.status ?? "null"]}
                    </span>
                  </button>
                ))}
                {filteredSiswa.length === 0 && (
                  <div className="px-4 py-10 text-center text-[13px] text-[#9a9a9a]">Tidak ada siswa yang cocok.</div>
                )}
              </div>

              <div className="px-4 sm:px-6 py-3.5 border-t border-black/5">
                <p className="text-[12px] text-[#9a9a9a] font-medium">
                  Menampilkan {filteredSiswa.length} dari {selectedKelas.total} siswa · {selectedKelas.nama} · {formatTanggal(tanggal)}
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Modal Detail Absensi Siswa ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/5">
              <h2 className="text-[1rem] font-extrabold text-[#1a1a1a]">Detail Absensi</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4l-10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
              {/* Info Siswa */}
              {selectedSiswa && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                    style={{ background: AVATAR_COLORS[filteredSiswa.indexOf(selectedSiswa) % AVATAR_COLORS.length] }}
                  >
                    {getInitials(selectedSiswa.nama)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13.5px] font-bold text-[#1a1a1a]">{selectedSiswa.nama}</p>
                    <p className="text-[11.5px] text-[#9a9a9a] font-mono">{selectedSiswa.nis}</p>
                  </div>
                </div>
              )}

              <div className="h-px bg-black/5" />

              {/* Loading */}
              {loadingDetail && (
                <div className="flex flex-col items-center gap-2 py-6">
                  <span className="w-5 h-5 border-[2px] border-[#e8e8e0] border-t-[#7fe05b] rounded-full animate-spin" />
                  <p className="text-[13px] text-[#9a9a9a]">Memuat detail...</p>
                </div>
              )}

              {/* Error */}
              {detailError && !loadingDetail && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">
                  {detailError}
                </div>
              )}

              {/* Detail Absensi */}
              {!loadingDetail && detailAbsensi && (
                <>
                  {detailAbsensi.absensi ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1">Status</p>
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-bold ${STATUS_STYLE[detailAbsensi.absensi.status ?? "null"]}`}>
                          {STATUS_LABEL[detailAbsensi.absensi.status ?? "null"]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1">Waktu</p>
                          <p className="text-[13.5px] font-semibold text-[#1a1a1a]">{detailAbsensi.absensi.waktu}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1">Tanggal</p>
                          <p className="text-[13.5px] font-semibold text-[#1a1a1a]">{formatTanggal(detailAbsensi.absensi.tanggal.toString())}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1">Keterangan</p>
                        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{detailAbsensi.absensi.keterangan || "—"}</p>
                      </div>

                      {/* File Preview */}
                      {detailAbsensi.absensi.file && (
                        <div>
                          <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-2">Lampiran</p>
                          {detailAbsensi.absensi.file.includes("image") || detailAbsensi.absensi.file.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                            <a
                              href={detailAbsensi.absensi.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <img
                                src={detailAbsensi.absensi.file}
                                alt="Bukti absensi"
                                className="max-w-full h-auto rounded-xl border border-black/10"
                              />
                            </a>
                          ) : (
                            <a
                              href={detailAbsensi.absensi.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-3 bg-[#f0f0ea] rounded-xl hover:bg-[#e8e8e0] transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="13 2 13 9 20 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span className="text-[13px] font-semibold text-[#6b6b6b]">Buka Dokumen</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-6 text-center">
                      <p className="text-[13px] text-[#9a9a9a] font-medium">Siswa belum melakukan absensi hari ini</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-black/5">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-2.5 rounded-xl bg-[#f0f0ea] hover:bg-[#e8e8e0] text-[#6b6b6b] text-[13px] font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}