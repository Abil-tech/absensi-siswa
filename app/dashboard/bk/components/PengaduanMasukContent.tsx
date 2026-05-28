"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  onMenuClick: () => void;
}

type StatusType = "Belum Ditangani" | "Sedang Ditangani" | "Sudah Ditangani";
type PrioritasType = "Rendah" | "Sedang" | "Tinggi" | "Mendesak";
type FilterType = "Semua" | "Belum Ditangani" | "Sedang Ditangani" | "Sudah Ditangani";

interface Pengaduan {
  id: string;
  siswaNama: string;
  siswaId: string;
  siswaKelas: string;
  siswaInitials: string;
  siswaAvatarColor: string;
  guruNama: string;
  guruMatpel: string;
  kategori: string;
  kategoriIcon: string;
  judul: string;
  deskripsi: string;
  prioritas: PrioritasType;
  status: StatusType;
  tanggal: string;
  waktu: string;
  lampiran: boolean;
}

const DATA_PENGADUAN: Pengaduan[] = [
  {
    id: "PGD-001",
    siswaNama: "Aaron Montgomery",
    siswaId: "202401001",
    siswaKelas: "XI PPLG 1",
    siswaInitials: "AM",
    siswaAvatarColor: "#3b82f6",
    guruNama: "Dr. Sarah Jenkins",
    guruMatpel: "Informatika",
    kategori: "Masalah Kehadiran",
    kategoriIcon: "📅",
    judul: "Siswa sering tidak hadir tanpa keterangan",
    deskripsi: "Aaron Montgomery sudah 3 minggu berturut-turut tidak masuk tanpa memberikan keterangan apapun. Orang tua sudah dihubungi namun tidak ada respons. Perlu penanganan lebih lanjut dari BK untuk menindaklanjuti kasus ini sebelum berdampak pada nilai semester.",
    prioritas: "Tinggi",
    status: "Sedang Ditangani",
    tanggal: "Hari Ini",
    waktu: "10:45 AM",
    lampiran: true,
  },
  {
    id: "PGD-002",
    siswaNama: "Danielle Parker",
    siswaId: "202401045",
    siswaKelas: "XI PPLG 1",
    siswaInitials: "DP",
    siswaAvatarColor: "#ef4444",
    guruNama: "Dr. Sarah Jenkins",
    guruMatpel: "Informatika",
    kategori: "Pelanggaran Disiplin",
    kategoriIcon: "⚠️",
    judul: "Pelanggaran tata tertib berulang di kelas",
    deskripsi: "Danielle Parker sering membuat keributan di kelas dan mengganggu teman-teman yang sedang belajar. Sudah diperingatkan sebanyak 3 kali namun tidak ada perubahan perilaku. Mohon BK dapat memberikan konseling untuk siswa ini.",
    prioritas: "Sedang",
    status: "Belum Ditangani",
    tanggal: "Kemarin",
    waktu: "02:30 PM",
    lampiran: false,
  },
  {
    id: "PGD-003",
    siswaNama: "Lina Octavia",
    siswaId: "202502002",
    siswaKelas: "X PPLG 2",
    siswaInitials: "LO",
    siswaAvatarColor: "#8b5cf6",
    guruNama: "Bpk. Hendra Kusuma",
    guruMatpel: "Matematika",
    kategori: "Masalah Akademik",
    kategoriIcon: "📚",
    judul: "Nilai menurun drastis sejak bulan lalu",
    deskripsi: "Lina Octavia mengalami penurunan nilai yang sangat signifikan. Dari rata-rata 85 menjadi 60 dalam waktu sebulan. Siswa terlihat murung dan kurang berkonsentrasi saat pelajaran. Kemungkinan ada masalah pribadi yang mempengaruhi performa akademisnya.",
    prioritas: "Rendah",
    status: "Sudah Ditangani",
    tanggal: "22 Nov",
    waktu: "09:00 AM",
    lampiran: false,
  },
  {
    id: "PGD-004",
    siswaNama: "Dika Pratama",
    siswaId: "202403004",
    siswaKelas: "XI PPLG 2",
    siswaInitials: "DP",
    siswaAvatarColor: "#f59e0b",
    guruNama: "Ibu Sari Maulida",
    guruMatpel: "Bahasa Indonesia",
    kategori: "Perundungan (Bullying)",
    kategoriIcon: "🛡️",
    judul: "Diduga melakukan intimidasi terhadap teman sekelas",
    deskripsi: "Beberapa siswa melaporkan bahwa Dika Pratama sering melakukan intimidasi verbal kepada teman-teman yang lebih pendiam. Ada laporan bahwa ia memaksa teman untuk mengerjakan tugasnya. Perlu penanganan segera sebelum situasi semakin memburuk.",
    prioritas: "Mendesak",
    status: "Belum Ditangani",
    tanggal: "Kemarin",
    waktu: "11:15 AM",
    lampiran: true,
  },
  {
    id: "PGD-005",
    siswaNama: "Vino Prasetya",
    siswaId: "202302002",
    siswaKelas: "XII PPLG 2",
    siswaInitials: "VP",
    siswaAvatarColor: "#10b981",
    guruNama: "Bpk. Danu Wirawan",
    guruMatpel: "IPA Fisika",
    kategori: "Masalah Kehadiran",
    kategoriIcon: "📅",
    judul: "Alfa tanpa keterangan selama 5 hari",
    deskripsi: "Vino Prasetya tidak masuk sekolah selama 5 hari berturut-turut tanpa keterangan. Sudah dihubungi via telepon dan WhatsApp tetapi tidak ada respons. Alamat rumah sudah dicatat untuk kunjungan rumah jika diperlukan.",
    prioritas: "Tinggi",
    status: "Sudah Ditangani",
    tanggal: "21 Nov",
    waktu: "08:00 AM",
    lampiran: false,
  },
  {
    id: "PGD-006",
    siswaNama: "Curtis Rhodes",
    siswaId: "202401022",
    siswaKelas: "XI PPLG 1",
    siswaInitials: "CR",
    siswaAvatarColor: "#06b6d4",
    guruNama: "Dr. Sarah Jenkins",
    guruMatpel: "Informatika",
    kategori: "Lainnya",
    kategoriIcon: "📝",
    judul: "Siswa terlihat mengalami tekanan emosional",
    deskripsi: "Curtis terlihat murung dan menangis beberapa kali saat di kelas. Ketika ditanya ia tidak mau berbicara. Teman-temannya mengatakan ia sering menyendiri saat istirahat. Saya khawatir ada masalah di luar sekolah yang mempengaruhinya.",
    prioritas: "Sedang",
    status: "Belum Ditangani",
    tanggal: "Hari Ini",
    waktu: "08:20 AM",
    lampiran: false,
  },
];

const PRIORITAS_STYLE: Record<PrioritasType, { bg: string; color: string; dot: string }> = {
  Rendah:   { bg: "#f0fce8", color: "#4a9e2f", dot: "#7fe05b"  },
  Sedang:   { bg: "#fef3c7", color: "#b45309", dot: "#f59e0b"  },
  Tinggi:   { bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444"  },
  Mendesak: { bg: "#111410", color: "#7fe05b", dot: "#7fe05b"  },
};

const STATUS_STYLE: Record<StatusType, { bg: string; color: string; border: string }> = {
  "Belum Ditangani":  { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  "Sedang Ditangani": { bg: "#111410", color: "#7fe05b", border: "#111410" },
  "Sudah Ditangani":  { bg: "#f0fce8", color: "#4a9e2f", border: "#7fe05b" },
};

export default function PengaduanMasukContent({ onMenuClick }: Props) {
  const [filter, setFilter]           = useState<FilterType>("Semua");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<Pengaduan | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<Record<string, StatusType>>({});
  const [catatan, setCatatan]         = useState("");
  const [toast, setToast]             = useState(false);
  const scrollRef                     = useRef<HTMLDivElement>(null);

  // ── Scroll ke atas setiap buka/tutup detail ──
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    scrollRef.current?.scrollTo(0, 0);
    const scrollable = scrollRef.current?.closest("[class*='overflow-y-auto']");
    if (scrollable) (scrollable as HTMLElement).scrollTop = 0;
  }, [selected]);

  const getStatus = (p: Pengaduan): StatusType => statusUpdate[p.id] ?? p.status;

  const filtered = DATA_PENGADUAN.filter((p) => {
    const status = getStatus(p);
    const matchFilter = filter === "Semua" || status === filter;
    const matchSearch =
      p.siswaNama.toLowerCase().includes(search.toLowerCase()) ||
      p.siswaId.includes(search) ||
      p.kategori.toLowerCase().includes(search.toLowerCase()) ||
      p.judul.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    semua:  DATA_PENGADUAN.length,
    belum:  DATA_PENGADUAN.filter((p) => getStatus(p) === "Belum Ditangani").length,
    sedang: DATA_PENGADUAN.filter((p) => getStatus(p) === "Sedang Ditangani").length,
    sudah:  DATA_PENGADUAN.filter((p) => getStatus(p) === "Sudah Ditangani").length,
  };

  function handleStatusChange(id: string, newStatus: StatusType) {
    setStatusUpdate((prev) => ({ ...prev, [id]: newStatus }));
  }

  function handleSimpanCatatan() {
    if (!catatan.trim()) return;
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  // ══════════════════════════════════════════════
  // DETAIL VIEW
  // ══════════════════════════════════════════════
  if (selected) {
    const currentStatus   = getStatus(selected);
    const statusStyle     = STATUS_STYLE[currentStatus];
    const prioritasStyle  = PRIORITAS_STYLE[selected.prioritas];

    return (
      <div ref={scrollRef} className="flex-1 flex flex-col min-h-screen overflow-y-auto">

        {/* Toast */}
        <div className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-2.5 px-5 py-3.5
          bg-[#111410] text-white rounded-full shadow-xl
          transition-all duration-300 whitespace-nowrap
          ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
        `}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="#7fe05b" />
            <path d="M5 8l2.5 2.5L11 6" stroke="#111410" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[13.5px] font-bold">Catatan berhasil disimpan</span>
        </div>

        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] font-semibold hidden sm:block">Pengaduan Masuk</span>
            </button>
            <span className="text-[#d0d0c8]">/</span>
            <span className="text-[13px] font-bold text-[#1a1a1a] truncate max-w-[140px] sm:max-w-xs">{selected.id}</span>
          </div>
          <button type="button" className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto flex flex-col gap-5">

            {/* ID + Prioritas + Waktu */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-black text-[#9a9a9a] font-mono">{selected.id}</span>
                <span className="text-[#d0d0c8]">·</span>
                <span className="text-[12px] font-semibold text-[#9a9a9a]">{selected.tanggal} {selected.waktu}</span>
              </div>
              <span
                className="flex items-center gap-1.5 text-[11.5px] font-black px-3 py-1.5 rounded-full"
                style={{ background: prioritasStyle.bg, color: prioritasStyle.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: prioritasStyle.dot }} />
                {selected.prioritas}
              </span>
            </div>

            {/* Kategori + Judul */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-lg">{selected.kategoriIcon}</span>
                <span className="text-[12.5px] font-bold text-[#7fe05b]">{selected.kategori}</span>
              </div>
              <h1 className="text-[1.25rem] sm:text-[1.45rem] font-extrabold text-[#111410] leading-tight">
                {selected.judul}
              </h1>
            </div>

            {/* Siswa & Guru */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <p className="text-[10.5px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-3">Siswa Dilaporkan</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[12px] font-black shrink-0"
                    style={{ background: selected.siswaAvatarColor }}
                  >
                    {selected.siswaInitials}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#111410]">{selected.siswaNama}</p>
                    <p className="text-[11.5px] text-[#9a9a9a] font-mono">{selected.siswaId}</p>
                    <p className="text-[11.5px] text-[#9a9a9a]">{selected.siswaKelas}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <p className="text-[10.5px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-3">Dilaporkan Oleh</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#111410] flex items-center justify-center text-[#7fe05b] text-[11px] font-black shrink-0">
                    {selected.guruNama.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#111410]">{selected.guruNama}</p>
                    <p className="text-[12px] text-[#9a9a9a]">{selected.guruMatpel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <p className="text-[10.5px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-3">Deskripsi Lengkap</p>
              <p className="text-[13.5px] text-[#2d2d2d] leading-relaxed">{selected.deskripsi}</p>
              {selected.lampiran && (
                <div className="mt-4 flex items-center gap-2 bg-[#f0fce8] rounded-xl px-4 py-3">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#4a9e2f] shrink-0">
                    <path d="M13 9l-4 4-4-4M9 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[12.5px] font-semibold text-[#4a9e2f]">Ada lampiran dokumen pendukung</span>
                </div>
              )}
            </div>

            {/* Update status */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <p className="text-[10.5px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-3">Status Penanganan</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {(["Belum Ditangani", "Sedang Ditangani", "Sudah Ditangani"] as StatusType[]).map((s) => {
                  const active = currentStatus === s;
                  const st = STATUS_STYLE[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusChange(selected.id, s)}
                      style={{
                        WebkitTapHighlightColor: "transparent",
                        background: active ? st.bg : "#f0f0ea",
                        color: active ? st.color : "#6b6b6b",
                        borderColor: active ? st.border : "transparent",
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl text-[12.5px] font-bold border-2 transition-all duration-150 active:opacity-70"
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catatan BK */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <p className="text-[10.5px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-3">
                Catatan BK <span className="normal-case font-normal text-[#c0c0b8]">(opsional)</span>
              </p>
              <textarea
                rows={4}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tulis catatan penanganan, hasil konseling, atau tindak lanjut..."
                className="
                  w-full px-4 py-3 text-[13.5px]
                  bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8]
                  rounded-xl border border-transparent outline-none resize-none
                  focus:border-[#7fe05b] focus:bg-white transition-all duration-200
                "
              />
              <button
                type="button"
                onClick={handleSimpanCatatan}
                disabled={!catatan.trim()}
                style={{ WebkitTapHighlightColor: "transparent" }}
                className="mt-3 px-5 py-2.5 bg-[#111410] text-white rounded-full text-[13px] font-bold hover:bg-[#1e1e16] disabled:opacity-40 disabled:cursor-not-allowed transition active:opacity-70"
              >
                Simpan Catatan
              </button>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════
  return (
    <div ref={scrollRef} className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.1rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">
            Pengaduan Masuk
          </h1>
        </div>
        <button type="button" className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* Stat mini */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",           value: counts.semua,  color: "#1a1a1a" },
            { label: "Belum Ditangani", value: counts.belum,  color: "#b91c1c" },
            { label: "Sedang Proses",   value: counts.sedang, color: "#4a9e2f" },
            { label: "Selesai",         value: counts.sudah,  color: "#1d4ed8" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex items-center gap-3">
              <p className="text-[1.5rem] font-black leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11.5px] font-semibold text-[#9a9a9a] leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama siswa, ID, atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-white rounded-xl border border-black/10 outline-none focus:border-[#7fe05b] transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["Semua", "Belum Ditangani", "Sedang Ditangani", "Sudah Ditangani"] as FilterType[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{ WebkitTapHighlightColor: "transparent" }}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all duration-150 active:opacity-70 whitespace-nowrap ${
                  filter === f
                    ? "bg-[#111410] text-white shadow-sm"
                    : "bg-white text-[#6b6b6b] border border-black/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid kartu */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[14px] font-bold text-[#1a1a1a]">Tidak ada pengaduan</p>
            <p className="text-[13px] text-[#9a9a9a] mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const currentStatus  = getStatus(p);
              const statusStyle    = STATUS_STYLE[currentStatus];
              const prioritasStyle = PRIORITAS_STYLE[p.prioritas];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p)}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] text-left hover:shadow-[0_6px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 group flex flex-col gap-4"
                >
                  {/* Siswa */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[12px] font-black shrink-0"
                      style={{ background: p.siswaAvatarColor }}
                    >
                      {p.siswaInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#111410] truncate">{p.siswaNama}</p>
                      <p className="text-[11.5px] text-[#9a9a9a] font-mono">{p.siswaId} · {p.siswaKelas}</p>
                    </div>
                  </div>

                  {/* Kategori + Judul + Deskripsi */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-base">{p.kategoriIcon}</span>
                      <span className="text-[12px] font-bold text-[#7fe05b]">{p.kategori}</span>
                    </div>
                    <p className="text-[13px] font-bold text-[#111410] leading-snug line-clamp-2">{p.judul}</p>
                    <p className="text-[12px] text-[#9a9a9a] mt-1.5 leading-relaxed line-clamp-2">{p.deskripsi}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between mt-auto pt-3 border-t border-black/5">
                    <div>
                      <p className="text-[10px] font-bold text-[#b0b0a8] uppercase tracking-wide">Dilaporkan</p>
                      <p className="text-[12.5px] font-bold text-[#1a1a1a] mt-0.5">{p.tanggal}</p>
                      <p className="text-[11.5px] text-[#9a9a9a]">{p.waktu}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className="flex items-center gap-1 text-[10.5px] font-black px-2.5 py-1 rounded-full"
                        style={{ background: prioritasStyle.bg, color: prioritasStyle.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: prioritasStyle.dot }} />
                        {p.prioritas}
                      </span>
                      <span
                        className="text-[11.5px] font-black px-3.5 py-1.5 rounded-full border-2"
                        style={{ background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}
                      >
                        {currentStatus}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
