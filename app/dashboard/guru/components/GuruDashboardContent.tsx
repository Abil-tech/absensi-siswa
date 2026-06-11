"use client";

import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";

interface Props {
  onMenuClick: () => void;
}

type StatusAbsensi    = "hadir" | "terlambat" | "sakit" | "izin" | null;
type StatusDispensasi = "pending" | "disetujui" | "ditolak";

interface SiswaAbsensi {
  id: string; nis: string; nama: string;
  status: StatusAbsensi; waktu: string; keterangan: string;
}

interface KelasData { id: string; nama: string; }

interface DetailAbsensi {
  id: string; status: string; waktu: string;
  tanggal: Date; keterangan: string; file: string | null;
}

interface DetailSiswa {
  siswa: { id: string; nama: string; nis: string; kelas: string };
  absensi: DetailAbsensi | null;
}

interface DispensasiItem {
  id: string; file: string; keterangan: string;
  statusWalas: StatusDispensasi; statusBK: StatusDispensasi;
  status: StatusDispensasi; catatanWalas: string | null;
  tanggal: string; siswa: { id: string; nama: string; nis: string };
}

const STATUS_STYLE: Record<string, string> = {
  hadir:     "bg-[#7fe05b] text-[#111410]",
  terlambat: "bg-amber-100 text-amber-700",
  sakit:     "bg-red-100 text-red-700",
  izin:      "border border-gray-300 text-gray-700 bg-white",
  null:      "bg-gray-100 text-gray-400",
};
const STATUS_LABEL: Record<string, string> = {
  hadir: "Hadir", terlambat: "Terlambat",
  sakit: "Sakit", izin: "Izin", null: "Belum Absen",
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

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function formatTanggal(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}
function todayId() {
  return new Date().toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// ── Download helpers ──────────────────────────────────────────

function downloadExcel(siswaList: SiswaAbsensi[], kelasNama: string) {
  const tanggal = todayId();

  const rows = siswaList.map((s, i) => ({
    "No":           i + 1,
    "NIS":          s.nis,
    "Nama Siswa":   s.nama,
    "Status":       STATUS_LABEL[s.status ?? "null"],
    "Waktu Absen":  s.waktu || "-",
    "Keterangan":   s.keterangan || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Lebar kolom
  ws["!cols"] = [
    { wch: 5 },   // No
    { wch: 14 },  // NIS
    { wch: 30 },  // Nama
    { wch: 14 },  // Status
    { wch: 14 },  // Waktu
    { wch: 36 },  // Keterangan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Absensi ${kelasNama}`);
  XLSX.writeFile(wb, `Absensi_${kelasNama}_${tanggal}.xlsx`);
}

function downloadSiswaExcel(detail: DetailSiswa) {
  const { siswa, absensi } = detail;
  const tanggal = todayId();

  const rows = [
    { "Field": "Nama",        "Nilai": siswa.nama },
    { "Field": "NIS",         "Nilai": siswa.nis },
    { "Field": "Kelas",       "Nilai": siswa.kelas },
    { "Field": "Tanggal",     "Nilai": absensi ? formatTanggal(absensi.tanggal.toString()) : tanggal },
    { "Field": "Status",      "Nilai": absensi ? STATUS_LABEL[absensi.status ?? "null"] : "Belum Absen" },
    { "Field": "Waktu",       "Nilai": absensi?.waktu || "-" },
    { "Field": "Keterangan",  "Nilai": absensi?.keterangan || "-" },
    { "Field": "File Bukti",  "Nilai": absensi?.file || "-" },
  ];

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 16 }, { wch: 50 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Detail Absensi");
  XLSX.writeFile(wb, `Absensi_${siswa.nama.replace(/ /g, "_")}_${tanggal}.xlsx`);
}

// ── Component ────────────────────────────────────────────────
export default function GuruDashboardContent({ onMenuClick }: Props) {
  const [search,          setSearch]          = useState("");
  const [kelas,           setKelas]           = useState<KelasData | null>(null);
  const [siswaList,       setSiswaList]       = useState<SiswaAbsensi[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [dispensasiList,  setDispensasiList]  = useState<DispensasiItem[]>([]);
  const [loadingDispen,   setLoadingDispen]   = useState(true);
  const [approvingId,     setApprovingId]     = useState<string | null>(null);
  const [approveError,    setApproveError]    = useState<string | null>(null);

  // Modal
  const [modalOpen,      setModalOpen]      = useState(false);
  const [selectedSiswa,  setSelectedSiswa]  = useState<SiswaAbsensi | null>(null);
  const [detailAbsensi,  setDetailAbsensi]  = useState<DetailSiswa | null>(null);
  const [loadingDetail,  setLoadingDetail]  = useState(false);
  const [detailError,    setDetailError]    = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/absensi/kelas");
        if (!res.ok) { const j = await res.json(); setError(j.error ?? "Gagal memuat data"); return; }
        const json = await res.json();
        setKelas(json.kelas);
        setSiswaList(Array.isArray(json.siswa) ? json.siswa : []);
      } catch { setError("Gagal terhubung ke server"); }
      finally  { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/guru/dispensasi");
        if (!res.ok) return;
        const json = await res.json();
        setDispensasiList(Array.isArray(json.dispensasi) ? json.dispensasi : []);
      } finally { setLoadingDispen(false); }
    })();
  }, []);

  const handleOpenDetail = useCallback(async (siswa: SiswaAbsensi) => {
    setSelectedSiswa(siswa);
    setModalOpen(true);
    setLoadingDetail(true);
    setDetailError(null);
    setDetailAbsensi(null);
    try {
      const res  = await fetch(`/api/absensi/siswa/${siswa.id}`);
      const json = await res.json();
      if (!res.ok) { setDetailError(json.error ?? "Gagal memuat detail"); return; }
      setDetailAbsensi(json);
    } catch { setDetailError("Gagal terhubung ke server"); }
    finally  { setLoadingDetail(false); }
  }, []);

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
      const res  = await fetch("/api/dispensasi/approve", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dispensasiId, keputusan }),
      });
      const json = await res.json();
      if (!res.ok) { setApproveError(json.error ?? "Gagal memproses"); return; }
      setDispensasiList((prev) =>
        prev.map((d) => d.id === dispensasiId
          ? { ...d, statusWalas: keputusan, status: json.status } : d)
      );
    } catch { setApproveError("Gagal terhubung ke server"); }
    finally  { setApprovingId(null); }
  }

  const totalSiswa            = siswaList.length;
  const hadirHariIni          = siswaList.filter((s) => s.status === "hadir").length;
  const tidakHadir            = siswaList.filter((s) => s.status === "sakit" || s.status === "izin").length;
  const tingkatKetidakhadiran = totalSiswa > 0 ? ((tidakHadir / totalSiswa) * 100).toFixed(1) : "0.0";
  const filtered              = siswaList.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search)
  );
  const pendingDispen = dispensasiList.filter((d) => d.statusWalas === "pending");

  // ── Row component ─────────────────────────────────────────
  const RowDesktop = ({ siswa, i }: { siswa: SiswaAbsensi; i: number }) => (
    <button type="button" onClick={() => handleOpenDetail(siswa)}
      className="w-full grid grid-cols-[1fr_2fr_1.2fr_1fr] px-6 py-4 items-center hover:bg-[#fafaf7] transition-colors text-left">
      <span className="text-[13px] font-mono font-semibold text-[#6b6b6b]">{siswa.nis}</span>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{getInitials(siswa.nama)}</div>
        <span className="text-[13.5px] font-bold text-[#1a1a1a]">{siswa.nama}</span>
      </div>
      <span className="text-[13px] font-semibold text-[#2d2d2d]">{siswa.waktu || "—"}</span>
      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-bold w-fit ${STATUS_STYLE[siswa.status ?? "null"]}`}>
        {STATUS_LABEL[siswa.status ?? "null"]}
      </span>
    </button>
  );

  const RowMobile = ({ siswa, i }: { siswa: SiswaAbsensi; i: number }) => (
    <button type="button" onClick={() => handleOpenDetail(siswa)}
      className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#fafaf7] transition-colors text-left">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{getInitials(siswa.nama)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{siswa.nama}</p>
        <p className="text-[11.5px] text-[#9a9a9a] font-mono mt-0.5">{siswa.nis} · {siswa.waktu || "—"}</p>
      </div>
      <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${STATUS_STYLE[siswa.status ?? "null"]}`}>
        {STATUS_LABEL[siswa.status ?? "null"]}
      </span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">Laporan Kehadiran</h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">
        <h2 className="text-[1.1rem] sm:text-[1.25rem] font-extrabold text-[#1a1a1a] tracking-tight">
          {loading ? "Memuat..." : error ? "—" : `Kelas ${kelas?.nama ?? "—"}`}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">{error}</div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
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
              <p className="text-[2rem] sm:text-[2.4rem] font-black text-[#1a1a1a] leading-tight tracking-tight mt-0.5">{loading ? "—" : totalSiswa}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f0fce8] flex items-center justify-center mb-3 sm:mb-4">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#7fe05b" strokeWidth="1.5" />
                <path d="M7 11l3 3 5-5" stroke="#7fe05b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-[12px] font-semibold text-[#9a9a9a] uppercase tracking-wide leading-tight">Hadir Hari Ini</p>
            <p className="text-[2rem] sm:text-[2.4rem] font-black text-[#7fe05b] leading-tight tracking-tight mt-0.5">{loading ? "—" : hadirHariIni}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3 sm:mb-4">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M8 8l6 6M14 8l-6 6" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-[12px] font-semibold text-[#9a9a9a] uppercase tracking-wide leading-tight">Tingkat Absen</p>
            <p className="text-[2rem] sm:text-[2.4rem] font-black text-[#ef4444] leading-tight tracking-tight mt-0.5">{loading ? "—" : `${tingkatKetidakhadiran}%`}</p>
          </div>
        </div>

        {/* Daftar Siswa */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5">
            <h3 className="text-[1rem] font-extrabold text-[#1a1a1a]">Daftar Siswa</h3>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input type="text" placeholder="Telusuri siswa..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-[13px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all w-full sm:w-48" />
              </div>
              {/* Tombol unduh semua (CSV) */}
              {!loading && siswaList.length > 0 && (
                <button type="button"
                  onClick={() => downloadExcel(siswaList, kelas?.nama ?? "Kelas")}
                  title="Unduh rekap absensi (.xlsx)"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111410] hover:bg-[#1e1e16] text-[#7fe05b] rounded-xl text-[12.5px] font-bold transition active:opacity-70 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <span className="hidden sm:inline">Unduh Excel</span>
                </button>
              )}
            </div>
          </div>

          {loading && <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">Memuat data siswa...</div>}

          {!loading && !error && (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-[1fr_2fr_1.2fr_1fr] px-6 py-3 bg-[#f9f9f5] text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wider border-b border-black/5">
                  <span>NIS</span><span>Nama Siswa</span><span>Waktu Absen</span><span>Status</span>
                </div>
                <div className="divide-y divide-black/[0.04]">
                  {filtered.map((siswa, i) => <RowDesktop key={siswa.id} siswa={siswa} i={i} />)}
                  {filtered.length === 0 && <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">Tidak ada siswa yang cocok.</div>}
                </div>
              </div>
              {/* Mobile list */}
              <div className="sm:hidden divide-y divide-black/[0.04]">
                {filtered.map((siswa, i) => <RowMobile key={siswa.id} siswa={siswa} i={i} />)}
                {filtered.length === 0 && <div className="px-4 py-10 text-center text-[13px] text-[#9a9a9a]">Tidak ada siswa yang cocok.</div>}
              </div>
            </>
          )}
          <div className="px-4 sm:px-6 py-3.5 border-t border-black/5">
            <p className="text-[12px] text-[#9a9a9a] font-medium">
              {loading ? "Memuat..." : `Menampilkan ${filtered.length} dari ${totalSiswa} siswa`}
            </p>
          </div>
        </div>

        {/* Dispensasi */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-black/5 flex items-center justify-between">
            <h3 className="text-[1rem] font-extrabold text-[#1a1a1a]">Pengajuan Dispensasi</h3>
            {pendingDispen.length > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11.5px] font-black rounded-full">{pendingDispen.length} pending</span>
            )}
          </div>
          {approveError && (
            <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">{approveError}</div>
          )}
          {loadingDispen && <div className="px-6 py-10 text-center text-[13px] text-[#9a9a9a]">Memuat dispensasi...</div>}
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
                      <p className="text-[11.5px] text-[#9a9a9a] font-mono">{d.siswa.nis} · {formatTanggal(d.tanggal)}</p>
                      <p className="text-[12.5px] text-[#6b6b6b] mt-1">{d.keterangan}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${DISPEN_STATUS_STYLE[d.statusWalas]}`}>
                      {DISPEN_STATUS_LABEL[d.statusWalas]}
                    </span>
                  </div>
                  {d.statusWalas === "pending" && (
                    <div className="flex gap-2">
                      <button type="button" disabled={approvingId === d.id} onClick={() => handleApprove(d.id, "disetujui")}
                        className="flex-1 py-2.5 rounded-xl bg-[#7fe05b] text-[#111410] text-[13px] font-extrabold hover:bg-[#6bcf49] disabled:opacity-50 transition">
                        {approvingId === d.id ? "Memproses..." : "Setujui"}
                      </button>
                      <button type="button" disabled={approvingId === d.id} onClick={() => handleApprove(d.id, "ditolak")}
                        className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-700 text-[13px] font-extrabold hover:bg-red-100 disabled:opacity-50 transition border border-red-200">
                        Tolak
                      </button>
                    </div>
                  )}
                  {d.catatanWalas && (
                    <p className="text-[12px] text-[#6b6b6b] bg-[#f9f9f5] rounded-xl px-4 py-2.5">
                      <span className="font-bold">Catatan:</span> {d.catatanWalas}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Modal Detail Absensi ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">

            {/* Header modal */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/5 shrink-0">
              <h2 className="text-[1rem] font-extrabold text-[#1a1a1a]">Detail Absensi</h2>
              <button type="button" onClick={handleCloseModal} className="text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4l-10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body modal — scrollable */}
            <div className="px-5 sm:px-6 py-5 flex flex-col gap-4 overflow-y-auto">

              {/* Info siswa */}
              {selectedSiswa && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                    style={{ background: AVATAR_COLORS[siswaList.indexOf(selectedSiswa) % AVATAR_COLORS.length] }}>
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
                <div className="flex flex-col items-center gap-2 py-8">
                  <span className="w-5 h-5 border-[2px] border-[#e8e8e0] border-t-[#7fe05b] rounded-full animate-spin" />
                  <p className="text-[13px] text-[#9a9a9a]">Memuat detail...</p>
                </div>
              )}

              {/* Error */}
              {detailError && !loadingDetail && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">{detailError}</div>
              )}

              {/* Konten detail */}
              {!loadingDetail && detailAbsensi && (
                detailAbsensi.absensi ? (
                  <div className="flex flex-col gap-4">
                    {/* Status */}
                    <div>
                      <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1.5">Status</p>
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-bold ${STATUS_STYLE[detailAbsensi.absensi.status ?? "null"]}`}>
                        {STATUS_LABEL[detailAbsensi.absensi.status ?? "null"]}
                      </span>
                    </div>

                    {/* Waktu & Tanggal */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1">Waktu</p>
                        <p className="text-[13.5px] font-semibold text-[#1a1a1a]">{detailAbsensi.absensi.waktu || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1">Tanggal</p>
                        <p className="text-[13.5px] font-semibold text-[#1a1a1a]">{formatTanggal(detailAbsensi.absensi.tanggal.toString())}</p>
                      </div>
                    </div>

                    {/* Keterangan */}
                    <div>
                      <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1">Keterangan</p>
                      <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{detailAbsensi.absensi.keterangan || "—"}</p>
                    </div>

                    {/* File lampiran dari Cloudinary */}
                    {detailAbsensi.absensi.file && (
                      <div>
                        <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-2">Lampiran</p>
                        {/\.(jpg|jpeg|png|webp|gif)$/i.test(detailAbsensi.absensi.file) ||
                         detailAbsensi.absensi.file.includes("/image/upload/") ? (
                          <div className="flex flex-col gap-2">
                            <a href={detailAbsensi.absensi.file} target="_blank" rel="noopener noreferrer">
                              <img src={detailAbsensi.absensi.file} alt="Bukti absensi"
                                className="w-full h-auto rounded-xl border border-black/10 object-cover max-h-56" />
                            </a>
                            {/* Tombol unduh file lampiran */}
                            <a href={detailAbsensi.absensi.file} download target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f0f0ea] hover:bg-[#e8e8e0] rounded-xl transition-colors">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                              </svg>
                              <span className="text-[13px] font-semibold text-[#6b6b6b]">Unduh Gambar</span>
                            </a>
                          </div>
                        ) : (
                          <a href={detailAbsensi.absensi.file} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 bg-[#f0f0ea] rounded-xl hover:bg-[#e8e8e0] transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <polyline points="13 2 13 9 20 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-[13px] font-semibold text-[#6b6b6b]">Buka / Unduh Dokumen</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-6 text-center">
                    <p className="text-[13px] text-[#9a9a9a] font-medium">Siswa belum melakukan absensi hari ini</p>
                  </div>
                )
              )}
            </div>

            {/* Footer modal */}
            <div className="px-5 sm:px-6 py-4 border-t border-black/5 shrink-0 flex gap-2">
              {/* Tombol unduh data siswa (Excel) */}
              {!loadingDetail && detailAbsensi && (
                <button type="button" onClick={() => downloadSiswaExcel(detailAbsensi)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111410] hover:bg-[#1e1e16] text-[#7fe05b] rounded-xl text-[13px] font-bold transition active:opacity-70">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Unduh Excel
                </button>
              )}
              <button type="button" onClick={handleCloseModal}
                className="flex-1 py-2.5 rounded-xl bg-[#f0f0ea] hover:bg-[#e8e8e0] text-[#6b6b6b] text-[13px] font-bold transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}