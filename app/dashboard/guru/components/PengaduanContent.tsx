"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Props {
  onMenuClick: () => void;
}

type KategoriType =
  | "Pelanggaran Disiplin"
  | "Masalah Akademik"
  | "Perundungan (Bullying)"
  | "Masalah Kehadiran"
  | "Lainnya";

type StatusPengaduan = "open" | "selesai" | "ditutup";

interface Pesan {
  role: "walas" | "bk";
  pesan: string;
  createdAt: string;
}

interface PengaduanData {
  id: string;
  judul: string;
  kategori: string;
  file: string;
  status: StatusPengaduan;
  tidakSelesaiCount: number;
  messages: Pesan[];
  createdAt: string;
  siswa: { id: string; nama: string; nis: string };
}

interface SiswaOption {
  id: string;
  nis: string;
  nama: string;
}

const KATEGORI_OPTIONS: { value: KategoriType; icon: string; desc: string }[] = [
  { value: "Pelanggaran Disiplin", icon: "⚠️", desc: "Pelanggaran tata tertib sekolah" },
  { value: "Masalah Akademik", icon: "📚", desc: "Kesulitan belajar atau nilai menurun" },
  { value: "Perundungan (Bullying)", icon: "🛡️", desc: "Intimidasi fisik maupun verbal" },
  { value: "Masalah Kehadiran", icon: "📅", desc: "Sering absen tanpa keterangan" },
  { value: "Lainnya", icon: "📝", desc: "Masalah lain yang perlu ditangani" },
];

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#10b981", "#f97316", "#6366f1", "#ec4899", "#14b8a6"];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatWaktu(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

const STATUS_LABEL: Record<StatusPengaduan, string> = {
  open: "Berlangsung",
  selesai: "Selesai",
  ditutup: "Ditutup",
};

const STATUS_STYLE: Record<StatusPengaduan, string> = {
  open: "bg-amber-100 text-amber-700",
  selesai: "bg-[#7fe05b] text-[#111410]",
  ditutup: "bg-gray-100 text-gray-500",
};

export default function PengaduanContent({ onMenuClick }: Props) {
  const { data: session } = useSession();
  const [view, setView] = useState<"form" | "chat">("form");
  const [activePengaduan, setActivePengaduan] = useState<PengaduanData | null>(null);

  // Form state
  const [siswaList, setSiswaList] = useState<SiswaOption[]>([]);
  const [loadingSiswa, setLoadingSiswa] = useState(true);
  const [siswaId, setSiswaId] = useState("");
  const [siswaSearch, setSiswaSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [kategori, setKategori] = useState<KategoriType | null>(null);
  const [judul, setJudul] = useState("");
  const [pesanAwal, setPesanAwal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [pesanBaru, setPesanBaru] = useState("");
  const [sendingPesan, setSendingPesan] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name ?? "Walas";

  // Fetch siswa
  useEffect(() => {
    async function fetchSiswa() {
      try {
        const res = await fetch("/api/absensi/kelas");
        if (!res.ok) return;
        const json = await res.json();
        setSiswaList(json.siswa.map((s: any) => ({ id: s.id, nis: s.nis, nama: s.nama })));
      } finally { setLoadingSiswa(false); }
    }
    fetchSiswa();
  }, []);

  // Scroll ke bawah saat pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activePengaduan?.messages]);

  // Polling setiap 5 detik saat di chat view
  useEffect(() => {
    if (view !== "chat" || !activePengaduan) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/pengaduan");
        if (!res.ok) return;
        const json = await res.json();
        const updated = json.pengaduan.find((p: PengaduanData) => p.id === activePengaduan.id);
        if (updated) setActivePengaduan(updated);
      } catch { }
    }, 5000);
    return () => clearInterval(interval);
  }, [view, activePengaduan]);

  const filteredSiswa = siswaList.filter(
    (s) => s.nama.toLowerCase().includes(siswaSearch.toLowerCase()) || s.nis.includes(siswaSearch)
  );
  const selectedSiswa = siswaList.find((s) => s.id === siswaId);

  function handleFileChange(f: File | null) {
    if (!f) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) { setFormError("Format tidak didukung."); return; }
    if (f.size > 10 * 1024 * 1024) { setFormError("Ukuran file maksimal 10MB."); return; }
    setFile(f);
    setFormError(null);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  async function handleSubmitForm() {
    setFormError(null);
    if (!siswaId) { setFormError("Pilih siswa yang dilaporkan."); return; }
    if (!kategori) { setFormError("Pilih kategori pengaduan."); return; }
    if (!judul.trim()) { setFormError("Isi judul pengaduan."); return; }
    if (!pesanAwal.trim()) { setFormError("Isi deskripsi/pesan awal."); return; }
    if (!file) { setFormError("Lampiran wajib diunggah."); return; }

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("siswaId", siswaId);
      formData.append("kategori", kategori!);
      formData.append("judul", judul);
      formData.append("pesan", pesanAwal);
      formData.append("file", file);

      const res = await fetch("/api/pengaduan", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal mengirim pengaduan."); return; }

      // Fetch pengaduan yang baru dibuat
      const listRes = await fetch("/api/pengaduan");
      const listJson = await listRes.json();
      const newPengaduan = listJson.pengaduan.find((p: PengaduanData) => p.id === json.id);
      if (newPengaduan) setActivePengaduan(newPengaduan);

      setView("chat");
    } catch { setFormError("Gagal terhubung ke server."); }
    finally { setFormLoading(false); }
  }

  async function handleKirimPesan() {
    if (!pesanBaru.trim() || !activePengaduan) return;
    setSendingPesan(true);
    setChatError(null);
    try {
      const res = await fetch("/api/pengaduan/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pengaduanId: activePengaduan.id, pesan: pesanBaru }),
      });
      const json = await res.json();
      if (!res.ok) { setChatError(json.error ?? "Gagal mengirim pesan."); return; }

      // Update local state
      setActivePengaduan((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, { role: "walas", pesan: pesanBaru, createdAt: new Date().toISOString() }],
      } : prev);
      setPesanBaru("");
    } catch { setChatError("Gagal terhubung ke server."); }
    finally { setSendingPesan(false); }
  }

  async function handleUpdateStatus(keputusan: "selesai" | "tidak_selesai") {
    if (!activePengaduan) return;
    setUpdatingStatus(true);
    setChatError(null);
    try {
      const res = await fetch("/api/pengaduan/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pengaduanId: activePengaduan.id, keputusan }),
      });
      const json = await res.json();
      if (!res.ok) { setChatError(json.error ?? "Gagal memperbarui status."); return; }
      setActivePengaduan((prev) => prev ? {
        ...prev,
        status: json.status,
        tidakSelesaiCount: json.tidakSelesaiCount,
      } : prev);

      if (keputusan === "selesai" || json.status === "ditutup") {
        setTimeout(() => {
          setView("form");
          setActivePengaduan(null);
        }, 1500); // delay sebentar agar user lihat status berubah
      }
      }
      catch { setChatError("Gagal terhubung ke server."); }
      finally { setUpdatingStatus(false); }
    }

    const now = new Date();
    const tanggal = now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
    const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }) + " WIB";

    // ── CHAT VIEW ──
    if (view === "chat" && activePengaduan) {
      const isClosed = activePengaduan.status !== "open";
      return (
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              <button type="button" onClick={() => {
                if (isClosed || activePengaduan.status !== "open") {
                  setView("form");
                  setActivePengaduan(null);
                }
              }} className={`flex items-center gap-1.5 transition-colors ${isClosed ? "text-[#9a9a9a] hover:text-[#1a1a1a]" : "text-[#d0d0c8] cursor-not-allowed"}`}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[13px] font-semibold hidden sm:block">Pengaduan Baru</span>
              </button>
              <span className="text-[#d0d0c8]">/</span>
              <span className="text-[13px] font-bold text-[#1a1a1a] truncate max-w-[140px]">{activePengaduan.judul}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-[11.5px] font-bold ${STATUS_STYLE[activePengaduan.status]}`}>
              {STATUS_LABEL[activePengaduan.status]}
            </span>
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
            {/* Info pengaduan */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{KATEGORI_OPTIONS.find((k) => k.value === activePengaduan.kategori)?.icon}</span>
                <span className="text-[12px] font-bold text-[#7fe05b]">{activePengaduan.kategori}</span>
              </div>
              <p className="text-[14px] font-extrabold text-[#111410]">{activePengaduan.judul}</p>
              <p className="text-[12px] text-[#9a9a9a] mt-1">{activePengaduan.siswa.nama} · {activePengaduan.siswa.nis} · {formatTanggal(activePengaduan.createdAt)}</p>
              {activePengaduan.tidakSelesaiCount > 0 && (
                <p className="text-[11.5px] text-amber-600 mt-1.5 font-semibold">
                  Tidak selesai: {activePengaduan.tidakSelesaiCount}/3
                  {activePengaduan.tidakSelesaiCount >= 3 && " — Kasus ditutup otomatis"}
                </p>
              )}
            </div>

            {/* Thread chat */}
            <div className="flex flex-col gap-3 flex-1">
              {activePengaduan.messages.map((msg, i) => {
                const isWalas = msg.role === "walas";
                return (
                  <div key={i} className={`flex ${isWalas ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] flex flex-col gap-1 ${isWalas ? "items-end" : "items-start"}`}>
                      <span className="text-[11px] font-semibold text-[#9a9a9a] px-1">
                        {isWalas ? userName : "Guru BK"} · {formatWaktu(msg.createdAt)}
                      </span>
                      <div className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed ${isWalas
                        ? "bg-[#111410] text-white rounded-tr-sm"
                        : "bg-white text-[#1a1a1a] rounded-tl-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                        }`}>
                        {msg.pesan}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {chatError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">{chatError}</div>
            )}

            {/* Tombol Selesai / Tidak Selesai — hanya muncul jika BK sudah balas */}
            {!isClosed && activePengaduan.messages.some((m: Pesan) => m.role === "bk") && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus("selesai")}
                  className="flex-1 py-2.5 rounded-xl bg-[#7fe05b] text-[#111410] text-[13px] font-extrabold hover:bg-[#6bcf49] disabled:opacity-50 transition"
                >
                  ✅ Selesai
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus("tidak_selesai")}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-700 text-[13px] font-extrabold hover:bg-red-100 disabled:opacity-50 transition border border-red-200"
                >
                  ❌ Tidak Selesai
                </button>
              </div>
            )}

            {/* Input pesan */}
            {!isClosed && (
              <div className="flex gap-2 items-end">
                <textarea
                  rows={2}
                  value={pesanBaru}
                  onChange={(e) => setPesanBaru(e.target.value)}
                  placeholder="Tulis pesan..."
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleKirimPesan(); } }}
                  className="flex-1 px-4 py-3 text-[13.5px] bg-white text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-black/10 outline-none resize-none focus:border-[#7fe05b] transition-all"
                />
                <button
                  type="button"
                  onClick={handleKirimPesan}
                  disabled={sendingPesan || !pesanBaru.trim()}
                  className="w-11 h-11 rounded-xl bg-[#111410] flex items-center justify-center text-white disabled:opacity-40 transition hover:bg-[#1e1e16] shrink-0"
                >
                  {sendingPesan ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {isClosed && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-[13px] text-[#9a9a9a] font-medium">
                {activePengaduan.status === "selesai" ? "Pengaduan telah diselesaikan." : "Pengaduan ditutup setelah 3x tidak selesai."}
              </div>
            )}
          </main>
        </div>
      );
    }

    // ── FORM VIEW ──
    return (
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-[1.1rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">Pengaduan ke Guru BK</h1>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-5 sm:p-8 flex flex-col gap-6">

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[1.15rem] font-extrabold text-[#1a1a1a]">Form Pengaduan</h2>
                  <p className="text-[12.5px] text-[#9a9a9a] mt-1">Laporkan masalah siswa kepada Guru BK.</p>
                </div>
                <div className="flex items-center gap-2 bg-[#f0fce8] rounded-xl px-3 py-2 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#7fe05b] flex items-center justify-center text-[#111410] font-black text-[10px]">
                    {getInitials(userName)}
                  </div>
                  <p className="text-[11px] font-bold text-[#1a1a1a] hidden sm:block">{userName}</p>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#c0392b" strokeWidth="1.5" />
                    <path d="M8 5v3.5M8 11h.01" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {formError}
                </div>
              )}

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Tanggal</label>
                  <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-3.5 py-3">
                    <span className="text-[12.5px] font-semibold text-[#1a1a1a]">{tanggal}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Waktu</label>
                  <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-3.5 py-3">
                    <span className="text-[12.5px] font-semibold text-[#1a1a1a]">{waktu}</span>
                  </div>
                </div>
              </div>

              {/* Pilih Siswa */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Siswa yang Dilaporkan <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div onClick={() => !loadingSiswa && setShowDropdown((v) => !v)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl border transition-all duration-200 ${showDropdown ? "border-[#7fe05b] bg-white" : "border-transparent bg-[#f0f0ea]"}`}>
                    {loadingSiswa ? (
                      <span className="text-[13.5px] text-[#b0b0a8]">Memuat data siswa...</span>
                    ) : selectedSiswa ? (
                      <>
                        <div className="w-7 h-7 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-[10px] font-black shrink-0">{getInitials(selectedSiswa.nama)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{selectedSiswa.nama}</p>
                          <p className="text-[11px] text-[#9a9a9a] font-mono">{selectedSiswa.nis}</p>
                        </div>
                      </>
                    ) : (
                      <span className="text-[13.5px] text-[#b0b0a8]">Pilih siswa...</span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`text-[#9a9a9a] shrink-0 ml-auto transition-transform ${showDropdown ? "rotate-180" : ""}`}>
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-black/10 shadow-xl z-20 overflow-hidden">
                      <div className="p-2 border-b border-black/5">
                        <input type="text" placeholder="Cari nama atau NIS..." value={siswaSearch} onChange={(e) => setSiswaSearch(e.target.value)} className="w-full pl-3 pr-3 py-2 text-[13px] bg-[#f0f0ea] rounded-lg outline-none focus:bg-white border border-transparent focus:border-[#7fe05b] transition-all" />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredSiswa.length === 0 ? (
                          <p className="text-center text-[13px] text-[#9a9a9a] py-4">Siswa tidak ditemukan</p>
                        ) : filteredSiswa.map((s, i) => (
                          <button key={s.id} type="button" onClick={() => { setSiswaId(s.id); setSiswaSearch(""); setShowDropdown(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f0fce8] transition-colors ${siswaId === s.id ? "bg-[#f0fce8]" : ""}`}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{getInitials(s.nama)}</div>
                            <div>
                              <p className="text-[13px] font-bold text-[#1a1a1a]">{s.nama}</p>
                              <p className="text-[11px] text-[#9a9a9a] font-mono">{s.nis}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Kategori */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Kategori <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {KATEGORI_OPTIONS.map((opt) => {
                    const active = kategori === opt.value;
                    return (
                      <button key={opt.value} type="button" onClick={() => setKategori(opt.value)} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${active ? "border-[#7fe05b] bg-[#f0fce8]" : "border-[#e8e8e0] bg-[#f9f9f5]"}`}>
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-[13px] font-bold truncate ${active ? "text-[#111410]" : "text-[#1a1a1a]"}`}>{opt.value}</p>
                          <p className="text-[11px] text-[#9a9a9a] truncate">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Judul */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Judul <span className="text-red-400">*</span></label>
                <input type="text" placeholder="Contoh: Siswa sering bolos jam pelajaran" value={judul} onChange={(e) => setJudul(e.target.value)} maxLength={100} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all duration-200" />
              </div>

              {/* Pesan awal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Deskripsi / Pesan Awal <span className="text-red-400">*</span></label>
                <textarea rows={4} placeholder="Jelaskan secara detail kejadian..." value={pesanAwal} onChange={(e) => setPesanAwal(e.target.value)} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none resize-none focus:border-[#7fe05b] focus:bg-white transition-all duration-200" />
              </div>

              {/* Lampiran */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Lampiran <span className="text-red-400">*</span></label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
                {file ? (
                  <div className="flex items-center gap-3 bg-[#f0fce8] border-2 border-[#7fe05b] rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#1a1a1a] truncate">{file.name}</p>
                      <p className="text-[11px] text-[#9a9a9a]">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-[#9a9a9a] hover:text-red-500 transition-colors shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed border-[#d0d0c8] bg-[#fafaf7] hover:border-[#7fe05b] hover:bg-[#f0fce8] transition-all duration-200">
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

              {/* Submit */}
              <button type="button" onClick={handleSubmitForm} disabled={formLoading} className="w-full py-4 rounded-2xl bg-[#111410] hover:bg-[#1e1e16] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all duration-150">
                {formLoading ? (
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
          </div>
        </main>
      </div>
    );
  }