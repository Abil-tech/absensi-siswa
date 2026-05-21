"use client";

import { useState, useRef } from "react";

interface Props {
  onMenuClick: () => void;
}

type KategoriType =
  | "Pelanggaran Disiplin"
  | "Masalah Akademik"
  | "Perundungan (Bullying)"
  | "Masalah Kehadiran"
  | "Lainnya";

type PrioritasType = "Rendah" | "Sedang" | "Tinggi" | "Mendesak";

const KATEGORI_OPTIONS: { value: KategoriType; icon: string; desc: string }[] = [
  { value: "Pelanggaran Disiplin", icon: "⚠️", desc: "Pelanggaran tata tertib sekolah" },
  { value: "Masalah Akademik",     icon: "📚", desc: "Kesulitan belajar atau nilai menurun" },
  { value: "Perundungan (Bullying)", icon: "🛡️", desc: "Intimidasi fisik maupun verbal" },
  { value: "Masalah Kehadiran",    icon: "📅", desc: "Sering absen tanpa keterangan" },
  { value: "Lainnya",              icon: "📝", desc: "Masalah lain yang perlu ditangani" },
];

const PRIORITAS_OPTIONS: {
  value: PrioritasType;
  color: string;
  bg: string;
  border: string;
  dot: string;
}[] = [
  { value: "Rendah",   color: "#4a9e2f", bg: "#f0fce8", border: "#7fe05b", dot: "#7fe05b" },
  { value: "Sedang",   color: "#b45309", bg: "#fef3c7", border: "#f59e0b", dot: "#f59e0b" },
  { value: "Tinggi",   color: "#b91c1c", bg: "#fef2f2", border: "#ef4444", dot: "#ef4444" },
  { value: "Mendesak", color: "#ffffff", bg: "#111410", border: "#111410", dot: "#7fe05b" },
];

const SISWA_LIST = [
  { id: "202401001", nama: "Aaron Montgomery",  kelas: "XI-1 PPLG" },
  { id: "202401014", nama: "Beatrice Sullivan",  kelas: "XI-1 PPLG" },
  { id: "202401022", nama: "Curtis Rhodes",      kelas: "XI-1 PPLG" },
  { id: "202401045", nama: "Danielle Parker",    kelas: "XI-1 PPLG" },
  { id: "202401056", nama: "Elias Thorne",       kelas: "XI-1 PPLG" },
  { id: "202401063", nama: "Fiona Castillo",     kelas: "XI-1 PPLG" },
  { id: "202401071", nama: "George Lawson",      kelas: "XI-1 PPLG" },
  { id: "202401089", nama: "Hannah Brooks",      kelas: "XI-1 PPLG" },
  { id: "202401094", nama: "Ivan Mercer",        kelas: "XI-1 PPLG" },
  { id: "202401102", nama: "Julia Sinclair",     kelas: "XI-1 PPLG" },
];

export default function PengaduanContent({ onMenuClick }: Props) {
  const [kategori, setKategori]       = useState<KategoriType | null>(null);
  const [prioritas, setPrioritas]     = useState<PrioritasType>("Sedang");
  const [siswaId, setSiswaId]         = useState("");
  const [siswaSearch, setSiswaSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [judul, setJudul]             = useState("");
  const [deskripsi, setDeskripsi]     = useState("");
  const [file, setFile]               = useState<File | null>(null);
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }) + " WIB";

  const filteredSiswa = SISWA_LIST.filter(
    (s) =>
      s.nama.toLowerCase().includes(siswaSearch.toLowerCase()) ||
      s.id.includes(siswaSearch)
  );

  const selectedSiswa = SISWA_LIST.find((s) => s.id === siswaId);

  function handleFileChange(f: File | null) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { alert("Ukuran file maksimal 10MB."); return; }
    setFile(f);
  }

  async function handleSubmit() {
    if (!kategori)  { alert("Pilih kategori pengaduan."); return; }
    if (!siswaId)   { alert("Pilih siswa yang dilaporkan."); return; }
    if (!judul.trim()) { alert("Isi judul pengaduan."); return; }
    if (!deskripsi.trim()) { alert("Isi deskripsi pengaduan."); return; }

    setLoading(true);
    // Sambungkan ke API:
    // const formData = new FormData();
    // formData.append("kategori", kategori);
    // formData.append("prioritas", prioritas);
    // formData.append("siswaId", siswaId);
    // formData.append("judul", judul);
    // formData.append("deskripsi", deskripsi);
    // if (file) formData.append("file", file);
    // await fetch("/api/pengaduan", { method: "POST", body: formData });
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setKategori(null);
    setPrioritas("Sedang");
    setSiswaId("");
    setSiswaSearch("");
    setJudul("");
    setDeskripsi("");
    setFile(null);
  }

  const selectedPrioritas = PRIORITAS_OPTIONS.find((p) => p.value === prioritas)!;

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.1rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">
            Pengaduan ke Guru BK
          </h1>
        </div>
        <button type="button" className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#1a1a1a]">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)]">

            {/* ── Success State ── */}
            {submitted ? (
              <div className="p-8 sm:p-12 flex flex-col items-center text-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-[#7fe05b] flex items-center justify-center shadow-lg">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M8 18l7 7 13-13" stroke="#111410" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[1.3rem] font-extrabold text-[#1a1a1a]">Pengaduan Terkirim!</h2>
                  <p className="text-[#9a9a9a] text-sm mt-1.5">
                    Pengaduan kamu telah diteruskan ke <span className="font-bold text-[#1a1a1a]">Guru BK</span>
                  </p>
                  <p className="text-[#b0b0a8] text-[12.5px] mt-0.5">{tanggal} · {waktu}</p>
                </div>

                {/* Summary */}
                <div className="w-full bg-[#f9f9f5] rounded-2xl p-5 text-left flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Kategori</p>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">{kategori}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Prioritas</p>
                    <span
                      className="text-[12px] font-black px-3 py-1 rounded-full"
                      style={{ background: selectedPrioritas.bg, color: selectedPrioritas.color, border: `1px solid ${selectedPrioritas.border}` }}
                    >
                      {prioritas}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Siswa</p>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">{selectedSiswa?.nama}</p>
                  </div>
                  <div className="border-t border-black/5 pt-3">
                    <p className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide mb-1.5">Judul</p>
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">{judul}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-2 px-6 py-3 bg-[#111410] text-white rounded-full text-[13.5px] font-bold hover:bg-[#2a2a1e] transition active:opacity-70"
                >
                  Buat Pengaduan Baru
                </button>
              </div>

            ) : (
              <div className="p-5 sm:p-8 flex flex-col gap-6">

                {/* ── Card header ── */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[1.15rem] sm:text-[1.3rem] font-extrabold text-[#1a1a1a]">
                      Form Pengaduan
                    </h2>
                    <p className="text-[12.5px] text-[#9a9a9a] mt-1">
                      Laporkan masalah siswa kepada Guru BK untuk ditindaklanjuti.
                    </p>
                  </div>
                  {/* Pengirim info */}
                  <div className="flex items-center gap-2 bg-[#f0fce8] rounded-xl px-3 py-2 shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#7fe05b] flex items-center justify-center text-[#111410] font-black text-[10px]">DS</div>
                    <div className="hidden sm:block">
                      <p className="text-[11px] font-bold text-[#1a1a1a] leading-none">Dr. Sarah Jenkins</p>
                      <p className="text-[10px] text-[#4a9e2f] mt-0.5">XI-1 PPLG</p>
                    </div>
                  </div>
                </div>

                {/* ── Tanggal & Waktu ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Tanggal</label>
                    <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-3.5 py-3">
                      <svg width="14" height="14" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 7h14" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M6 2v2M12 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="text-[12.5px] font-semibold text-[#1a1a1a] truncate">{tanggal}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Waktu</label>
                    <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-3.5 py-3">
                      <svg width="14" height="14" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M9 5.5V9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="text-[12.5px] font-semibold text-[#1a1a1a]">{waktu}</span>
                    </div>
                  </div>
                </div>

                {/* ── Pilih Siswa ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Siswa yang Dilaporkan <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => setShowDropdown((v) => !v)}
                      className={`
                        flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl
                        border transition-all duration-200
                        ${showDropdown
                          ? "border-[#7fe05b] bg-white"
                          : "border-transparent bg-[#f0f0ea] hover:bg-[#e8e8e0]"
                        }
                      `}
                    >
                      {selectedSiswa ? (
                        <>
                          <div className="w-7 h-7 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                            {selectedSiswa.nama.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{selectedSiswa.nama}</p>
                            <p className="text-[11px] text-[#9a9a9a] font-mono">{selectedSiswa.id} · {selectedSiswa.kelas}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a]">
                            <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          <span className="text-[13.5px] text-[#b0b0a8]">Pilih siswa...</span>
                        </>
                      )}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`text-[#9a9a9a] shrink-0 transition-transform ${showDropdown ? "rotate-180" : ""}`}>
                        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>

                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-black/10 shadow-xl z-20 overflow-hidden">
                        {/* Search dalam dropdown */}
                        <div className="p-2 border-b border-black/5">
                          <div className="relative">
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            <input
                              type="text"
                              placeholder="Cari nama atau ID..."
                              value={siswaSearch}
                              onChange={(e) => setSiswaSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-[13px] bg-[#f0f0ea] rounded-lg outline-none focus:bg-white border border-transparent focus:border-[#7fe05b] transition-all"
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredSiswa.length === 0 ? (
                            <p className="text-center text-[13px] text-[#9a9a9a] py-4">Siswa tidak ditemukan</p>
                          ) : (
                            filteredSiswa.map((s, i) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => { setSiswaId(s.id); setSiswaSearch(""); setShowDropdown(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f0fce8] transition-colors ${siswaId === s.id ? "bg-[#f0fce8]" : ""}`}
                              >
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                                  style={{ background: ["#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#10b981","#f97316","#6366f1","#ec4899","#14b8a6"][i % 10] }}
                                >
                                  {s.nama.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold text-[#1a1a1a]">{s.nama}</p>
                                  <p className="text-[11px] text-[#9a9a9a] font-mono">{s.id}</p>
                                </div>
                                {siswaId === s.id && (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto text-[#4a9e2f]">
                                    <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Kategori Pengaduan ── */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Kategori Pengaduan <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {KATEGORI_OPTIONS.map((opt) => {
                      const active = kategori === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setKategori(opt.value)}
                          style={{ WebkitTapHighlightColor: "transparent" }}
                          className={`
                            flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left
                            transition-all duration-150 active:opacity-70
                            ${active
                              ? "border-[#7fe05b] bg-[#f0fce8]"
                              : "border-[#e8e8e0] bg-[#f9f9f5] hover:border-[#d0d0c8]"
                            }
                          `}
                        >
                          <span className="text-xl shrink-0">{opt.icon}</span>
                          <div className="min-w-0">
                            <p className={`text-[13px] font-bold truncate ${active ? "text-[#111410]" : "text-[#1a1a1a]"}`}>
                              {opt.value}
                            </p>
                            <p className="text-[11px] text-[#9a9a9a] truncate">{opt.desc}</p>
                          </div>
                          {active && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto shrink-0 text-[#4a9e2f]">
                              <circle cx="8" cy="8" r="7" fill="#7fe05b" />
                              <path d="M5 8l2.5 2.5L11 6" stroke="#111410" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Tingkat Prioritas ── */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Tingkat Prioritas
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PRIORITAS_OPTIONS.map((opt) => {
                      const active = prioritas === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPrioritas(opt.value)}
                          style={{
                            WebkitTapHighlightColor: "transparent",
                            background: active ? opt.bg : "#f0f0ea",
                            borderColor: active ? opt.border : "transparent",
                            color: active ? opt.color : "#6b6b6b",
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 text-[12.5px] font-bold transition-all duration-150 active:opacity-70"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: active ? opt.dot : "#9a9a9a" }}
                          />
                          {opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Judul Pengaduan ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Judul Pengaduan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Siswa sering bolos jam pelajaran"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    maxLength={100}
                    className="
                      w-full px-4 py-3 text-[13.5px]
                      bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8]
                      rounded-xl border border-transparent outline-none
                      focus:border-[#7fe05b] focus:bg-white
                      transition-all duration-200
                    "
                  />
                  <p className="text-[11px] text-[#b0b0a8] text-right">{judul.length}/100</p>
                </div>

                {/* ── Deskripsi ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Deskripsi Lengkap <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Jelaskan secara detail kejadian, waktu, tempat, dan saksi jika ada..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="
                      w-full px-4 py-3 text-[13.5px]
                      bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8]
                      rounded-xl border border-transparent outline-none resize-none
                      focus:border-[#7fe05b] focus:bg-white
                      transition-all duration-200
                    "
                  />
                </div>

                {/* ── Lampiran (opsional) ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Lampiran <span className="text-[#b0b0a8] font-normal normal-case">(opsional)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  />

                  {file ? (
                    <div className="flex items-center gap-3 bg-[#f0fce8] border-2 border-[#7fe05b] rounded-xl px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-[#7fe05b]/20 flex items-center justify-center shrink-0">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-[#4a9e2f]">
                          <path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6l-4-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                          <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#1a1a1a] truncate">{file.name}</p>
                        <p className="text-[11px] text-[#9a9a9a]">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="text-[#9a9a9a] hover:text-red-500 transition-colors shrink-0 p-1"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed border-[#d0d0c8] bg-[#fafaf7] hover:border-[#7fe05b] hover:bg-[#f0fce8] transition-all duration-200 active:opacity-70"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#f0fce8] flex items-center justify-center shrink-0">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-[#7fe05b]">
                          <path d="M9 12V4M9 4L6 7M9 4l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 14h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-[13px] font-bold text-[#1a1a1a]">Tambah Lampiran</p>
                        <p className="text-[11.5px] text-[#9a9a9a]">JPG, PNG, PDF · Maks. 10MB</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* ── Disclaimer ── */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-500 shrink-0 mt-0.5">
                    <path d="M8 2L1.5 13.5h13L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M8 7v3M8 12h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                    Pengaduan ini bersifat rahasia dan hanya dapat diakses oleh Guru BK. Pastikan informasi yang disampaikan akurat dan dapat dipertanggungjawabkan.
                  </p>
                </div>

                {/* ── Submit ── */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="
                    w-full py-4 rounded-2xl
                    bg-[#111410] hover:bg-[#1e1e16]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2.5
                    transition-all duration-150 active:scale-[0.99] active:opacity-80
                  "
                >
                  {loading ? (
                    <span className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-[#7fe05b] text-[14px] font-extrabold tracking-wide">Kirim Pengaduan</span>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3 9h12M11 5l4 4-4 4" stroke="#7fe05b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
