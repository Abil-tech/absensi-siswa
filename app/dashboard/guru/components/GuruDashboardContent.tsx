"use client";

import { useEffect, useState } from "react";

interface Props {
  onMenuClick: () => void;
}

type StatusAbsensi = "hadir" | "sakit" | "izin" | null;
type StatusDispensasi = "pending" | "disetujui" | "ditolak";

interface SiswaAbsensi {
  id: string;
  nis: string;
  nama: string;
  status: StatusAbsensi;
  waktu: string;
  keterangan: string;
}

interface KelasData {
  id: string;
  nama: string;
}

interface DispensasiItem {
  id: string;
  file: string;
  keterangan: string;
  statusWalas: StatusDispensasi;
  statusBK: StatusDispensasi;
  status: StatusDispensasi;
  catatanWalas: string | null;
  tanggal: string;
  siswa: { id: string; nama: string; nis: string };
}

const STATUS_STYLE: Record<string, string> = {
  hadir: "bg-[#7fe05b] text-[#111410]",
  sakit: "bg-red-100 text-red-700",
  izin:  "border border-gray-300 text-gray-700 bg-white",
  null:  "bg-gray-100 text-gray-400",
};

const STATUS_LABEL: Record<string, string> = {
  hadir: "Hadir",
  sakit: "Sakit",
  izin:  "Izin",
  null:  "Belum Absen",
};

const DISPEN_STATUS_STYLE: Record<StatusDispensasi, string> = {
  pending:   "bg-amber-100 text-amber-700",
  disetujui: "bg-[#7fe05b] text-[#111410]",
  ditolak:   "bg-red-100 text-red-700",
};

const DISPEN_STATUS_LABEL: Record<StatusDispensasi, string> = {
  pending:   "Menunggu",
  disetujui: "Disetujui",
  ditolak:   "Ditolak",
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

export default function GuruDashboardContent({ onMenuClick }: Props) {
  const [search, setSearch]           = useState("");
  const [kelas, setKelas]             = useState<KelasData | null>(null);
  const [siswaList, setSiswaList]     = useState<SiswaAbsensi[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [dispensasiList, setDispensasiList] = useState<DispensasiItem[]>([]);
  const [loadingDispen, setLoadingDispen]   = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/absensi/kelas");
        if (!res.ok) { const j = await res.json(); setError(j.error ?? "Gagal memuat data"); return; }
        const json = await res.json();
        setKelas(json.kelas);
        setSiswaList(json.siswa);
      } catch { setError("Gagal terhubung ke server"); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchDispen() {
      try {
        const res = await fetch("/api/guru/dispensasi");
        if (!res.ok) return;
        const json = await res.json();
        setDispensasiList(json.dispensasi);
      } finally { setLoadingDispen(false); }
    }
    fetchDispen();
  }, []);

  async function handleApprove(dispensasiId: string, keputusan: "disetujui" | "ditolak", catatan?: string) {
    setApprovingId(dispensasiId);
    setApproveError(null);
    try {
      const res = await fetch("/api/dispensasi/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dispensasiId, keputusan, catatan }),
      });
      const json = await res.json();
      if (!res.ok) { setApproveError(json.error ?? "Gagal memproses"); return; }
      setDispensasiList((prev) =>
        prev.map((d) => d.id === dispensasiId
          ? { ...d, statusWalas: keputusan, status: json.status }
          : d
        )
      );
    } catch { setApproveError("Gagal terhubung ke server"); }
    finally { setApprovingId(null); }
  }

  const totalSiswa = siswaList.length;
  const hadirHariIni = siswaList.filter((s) => s.status === "hadir").length;
  const tidakHadir = siswaList.filter((s) => s.status === "sakit" || s.status === "izin").length;
  const tingkatKetidakhadiran = totalSiswa > 0 ? ((tidakHadir / totalSiswa) * 100).toFixed(1) : "0.0";
  const filtered = siswaList.filter((s) => s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search));
  const pendingDispen = dispensasiList.filter((d) => d.statusWalas === "pending");

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1" aria-label="Buka menu">
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
            <div className="relative">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Telusuri siswa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 text-[13px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all duration-200 w-full sm:w-52" />
            </div>
          </div>
          {loading && <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">Memuat data siswa...</div>}
          {!loading && !error && (
            <>
              <div className="hidden sm:block">
                <div className="grid grid-cols-[1fr_2fr_1.2fr_1fr] px-6 py-3 bg-[#f9f9f5] text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wider border-b border-black/5">
                  <span>NIS</span><span>Nama Siswa</span><span>Waktu Absen</span><span>Status</span>
                </div>
                <div className="divide-y divide-black/[0.04]">
                  {filtered.map((siswa, i) => (
                    <div key={siswa.id} className="grid grid-cols-[1fr_2fr_1.2fr_1fr] px-6 py-4 items-center hover:bg-[#fafaf7] transition-colors">
                      <span className="text-[13px] font-mono font-semibold text-[#6b6b6b]">{siswa.nis}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{getInitials(siswa.nama)}</div>
                        <span className="text-[13.5px] font-bold text-[#1a1a1a]">{siswa.nama}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#2d2d2d]">{siswa.waktu}</span>
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-bold w-fit ${STATUS_STYLE[siswa.status ?? "null"]}`}>{STATUS_LABEL[siswa.status ?? "null"]}</span>
                    </div>
                  ))}
                  {filtered.length === 0 && <div className="px-6 py-12 text-center text-[13px] text-[#9a9a9a]">Tidak ada siswa yang cocok.</div>}
                </div>
              </div>
              <div className="sm:hidden divide-y divide-black/[0.04]">
                {filtered.map((siswa, i) => (
                  <div key={siswa.id} className="px-4 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{getInitials(siswa.nama)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{siswa.nama}</p>
                      <p className="text-[11.5px] text-[#9a9a9a] font-mono mt-0.5">{siswa.nis} · {siswa.waktu}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${STATUS_STYLE[siswa.status ?? "null"]}`}>{STATUS_LABEL[siswa.status ?? "null"]}</span>
                  </div>
                ))}
                {filtered.length === 0 && <div className="px-4 py-10 text-center text-[13px] text-[#9a9a9a]">Tidak ada siswa yang cocok.</div>}
              </div>
            </>
          )}
          <div className="px-4 sm:px-6 py-3.5 border-t border-black/5">
            <p className="text-[12px] text-[#9a9a9a] font-medium">{loading ? "Memuat..." : `Menampilkan ${filtered.length} dari ${totalSiswa} siswa`}</p>
          </div>
        </div>

        {/* ── Dispensasi Section ── */}
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

                  {/* Tombol approve/tolak hanya jika masih pending */}
                  {d.statusWalas === "pending" && (
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
    </div>
  );
}