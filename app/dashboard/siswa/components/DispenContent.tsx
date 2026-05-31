"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  onMenuClick: () => void;
}

type StatusDispensasi = "pending" | "disetujui" | "ditolak";

interface DispensasiItem {
  id: string;
  file: string;
  keterangan: string;
  statusWalas: StatusDispensasi;
  statusBK: StatusDispensasi;
  status: StatusDispensasi;
  catatanWalas: string | null;
  catatanBK: string | null;
  tanggal: string;
}

const STATUS_STYLE: Record<StatusDispensasi, string> = {
  pending:   "bg-amber-100 text-amber-700",
  disetujui: "bg-[#7fe05b] text-[#111410]",
  ditolak:   "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<StatusDispensasi, string> = {
  pending:   "Menunggu",
  disetujui: "Disetujui",
  ditolak:   "Ditolak",
};

function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DispenContent({ onMenuClick }: Props) {
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [riwayat, setRiwayat]       = useState<DispensasiItem[]>([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
  const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }) + " WIB";

  // Fetch riwayat dispensasi
  useEffect(() => {
    async function fetchRiwayat() {
      try {
        const res = await fetch("/api/siswa/dispensasi");
        if (!res.ok) return;
        const json = await res.json();
        setRiwayat(json.dispensasi);
      } finally {
        setLoadingRiwayat(false);
      }
    }
    fetchRiwayat();
  }, [submitted]);

  function handleFileChange(f: File | null) {
    if (!f) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setError("Format tidak didukung. Gunakan JPG, PNG, atau PDF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB.");
      return;
    }
    setFile(f);
    setError(null);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0] ?? null);
  }, []);

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    setError(null);
    if (!file)            { setError("Harap unggah dokumen dispensasi terlebih dahulu."); return; }
    if (!keterangan.trim()) { setError("Keterangan wajib diisi."); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("keterangan", keterangan);
      formData.append("file", file);

      const res = await fetch("/api/siswa/dispensasi", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal mengirim dispensasi.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setFile(null);
    setPreview(null);
    setKeterangan("");
    setError(null);
  }

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
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">Dispensasi</h1>
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

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

          {/* ── Form Card ── */}
          <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)]">

            {/* Success State */}
            {submitted ? (
              <div className="p-8 sm:p-12 flex flex-col items-center text-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-[#7fe05b] flex items-center justify-center shadow-lg">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M8 18l7 7 13-13" stroke="#111410" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[1.3rem] font-extrabold text-[#1a1a1a]">Dispensasi Terkirim!</h2>
                  <p className="text-[#9a9a9a] text-sm mt-1.5">Pengajuan dispensasi sedang menunggu persetujuan</p>
                  <p className="text-[#b0b0a8] text-[12.5px] mt-0.5">{tanggal} · {waktu}</p>
                </div>
                <div className="flex items-center gap-3 bg-[#f9f9f5] rounded-xl px-5 py-3.5 w-full">
                  <div className="w-10 h-10 rounded-xl bg-[#f0fce8] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[#4a9e2f]">
                      <path d="M12 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V8l-5-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M12 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[13px] font-bold text-[#1a1a1a] truncate">{file?.name}</p>
                    <p className="text-[11.5px] text-[#9a9a9a]">{((file?.size ?? 0) / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button type="button" onClick={handleReset} className="mt-2 px-6 py-3 bg-[#111410] text-white rounded-full text-[13.5px] font-bold hover:bg-[#2a2a1e] transition">
                  Ajukan Dispensasi Lagi
                </button>
              </div>

            ) : (
              <div className="p-5 sm:p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[1.2rem] sm:text-[1.35rem] font-extrabold text-[#1a1a1a]">Ajukan Dispensasi</h2>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#c0392b" strokeWidth="1.5" />
                      <path d="M8 5v3.5M8 11h.01" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Tanggal & Waktu */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Tanggal</label>
                    <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-4 py-3">
                      <svg width="15" height="15" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 7h14M6 2v2M12 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="text-[13px] font-semibold text-[#1a1a1a]">{tanggal}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Waktu</label>
                    <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-4 py-3">
                      <svg width="15" height="15" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M9 5.5V9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="text-[13px] font-semibold text-[#1a1a1a]">{waktu}</span>
                    </div>
                  </div>
                </div>

                {/* Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Dokumen Dispensasi <span className="text-red-400">*</span>
                  </label>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />

                  {file ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#7fe05b]">
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full max-h-56 object-cover" />
                      ) : (
                        <div className="flex items-center gap-4 bg-[#f9f9f5] px-5 py-6">
                          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-500">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                              <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-bold text-[#1a1a1a] truncate">{file.name}</p>
                            <p className="text-[12px] text-[#9a9a9a]">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-white text-[12px] font-semibold truncate">{file.name}</span>
                        <button type="button" onClick={removeFile} className="text-white/70 hover:text-white shrink-0 ml-2">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="8" fill="rgba(0,0,0,0.4)" />
                            <path d="M6 6l6 6M12 6l-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#111410] text-[11.5px] font-bold px-3 py-1.5 rounded-full transition">
                        Ganti File
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`w-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer py-10 sm:py-12 px-6 text-center transition-all duration-200 ${dragOver ? "border-[#7fe05b] bg-[#f0fce8]" : "border-[#d0d0c8] bg-[#fafaf7] hover:border-[#7fe05b] hover:bg-[#f0fce8]"}`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${dragOver ? "bg-[#7fe05b]/20" : "bg-[#f0fce8]"}`}>
                        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" className="text-[#7fe05b]">
                          <path d="M16 20V10M16 10l-5 5M16 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 24h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13.5px] font-bold text-[#1a1a1a]">{dragOver ? "Lepaskan file di sini" : "Unggah Dokumen Dispensasi"}</p>
                        <p className="text-[12px] text-[#9a9a9a] mt-1">JPG, PNG, PDF · Maks. 10MB</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Keterangan — wajib */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Keterangan <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Mengikuti lomba olimpiade sains tingkat provinsi..."
                    className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none resize-none focus:border-[#7fe05b] focus:bg-white transition-all duration-200"
                  />
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className="w-full py-4 rounded-2xl bg-[#111410] hover:bg-[#1e1e16] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-[#7fe05b] text-[14px] font-extrabold tracking-wide">Kirim Dispensasi</span>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3 9h12M11 5l4 4-4 4" stroke="#7fe05b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Riwayat Dispensasi ── */}
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-black/5">
              <h3 className="text-[1rem] font-extrabold text-[#1a1a1a]">Riwayat Dispensasi</h3>
            </div>

            {loadingRiwayat && (
              <div className="px-6 py-10 text-center text-[13px] text-[#9a9a9a]">Memuat riwayat...</div>
            )}

            {!loadingRiwayat && riwayat.length === 0 && (
              <div className="px-6 py-10 text-center text-[13px] text-[#9a9a9a]">Belum ada pengajuan dispensasi.</div>
            )}

            {!loadingRiwayat && riwayat.length > 0 && (
              <div className="divide-y divide-black/[0.04]">
                {riwayat.map((d) => (
                  <div key={d.id} className="px-4 sm:px-6 py-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#1a1a1a]">{formatTanggal(d.tanggal)}</p>
                        <p className="text-[12px] text-[#6b6b6b] mt-0.5 line-clamp-2">{d.keterangan}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${STATUS_STYLE[d.status]}`}>
                        {STATUS_LABEL[d.status]}
                      </span>
                    </div>
                    {/* Status detail */}
                    <div className="flex gap-3 mt-1">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[d.statusWalas]}`}>
                        Walas: {STATUS_LABEL[d.statusWalas]}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[d.statusBK]}`}>
                        BK: {STATUS_LABEL[d.statusBK]}
                      </span>
                    </div>
                    {(d.catatanWalas || d.catatanBK) && (
                      <div className="bg-[#f9f9f5] rounded-xl px-4 py-3 flex flex-col gap-1.5 mt-1">
                        {d.catatanWalas && (
                          <p className="text-[12px] text-[#6b6b6b]"><span className="font-bold">Walas:</span> {d.catatanWalas}</p>
                        )}
                        {d.catatanBK && (
                          <p className="text-[12px] text-[#6b6b6b]"><span className="font-bold">BK:</span> {d.catatanBK}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}