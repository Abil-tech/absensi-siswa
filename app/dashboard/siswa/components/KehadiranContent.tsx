"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onMenuClick: () => void;
}

type StatusType = "Hadir" | "Izin" | "Sakit";

const STATUS_OPTIONS: {
  value: StatusType;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
  activeBg: string;
}[] = [
  {
    value: "Hadir",
    label: "Hadir",
    activeClass: "bg-[#7fe05b] text-[#111410] border-[#7fe05b]",
    activeBg: "bg-[#7fe05b]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="currentColor" opacity="0.15" />
        <path
          d="M8 14l4 4 8-8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    value: "Izin",
    label: "Izin",
    activeClass: "bg-[#3b82f6] text-white border-[#3b82f6]",
    activeBg: "bg-[#3b82f6]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 11h20" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 3v4M19 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 16h6M9 20h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "Sakit",
    label: "Sakit",
    activeClass: "bg-[#ef4444] text-white border-[#ef4444]",
    activeBg: "bg-[#ef4444]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10S19.523 4 14 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M14 10v4.5M14 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function KehadiranContent({ onMenuClick }: Props) {
  const [status, setStatus] = useState<StatusType>("Hadir");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tanggal & waktu live
  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "/");
  const waktu = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " WIB";

  function handleFileChange(f: File | null) {
    if (!f) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(f.type)) {
      alert("Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFileChange(dropped);
  }, []);

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    setLoading(true);
    // Simulasi kirim ke API
    // Implementasi nyata:
    // const formData = new FormData();
    // formData.append("status", status);
    // formData.append("file", file);
    // await fetch("/api/kehadiran", { method: "POST", body: formData });
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setFile(null);
    setPreview(null);
    setStatus("Hadir");
  }

  const selectedOption = STATUS_OPTIONS.find((s) => s.value === status)!;

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden text-[#1a1a1a]" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">
            Absensi Kehadiran
          </h1>
        </div>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#1a1a1a] hover:bg-black/5 transition">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5 5 0 00-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 00-5-5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7fe05b] rounded-full ring-1 ring-[#f5f5ef]" />
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* ── Success State ── */}
            {submitted ? (
              <div className="p-8 sm:p-12 flex flex-col items-center text-center gap-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${selectedOption.activeBg}`}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M8 18l7 7 13-13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[1.3rem] font-extrabold text-[#1a1a1a]">Kehadiran Terkirim!</h2>
                  <p className="text-[#9a9a9a] text-sm mt-1">
                    Status <span className="font-bold text-[#1a1a1a]">{status}</span> berhasil dicatat pada {tanggal} · {waktu}
                  </p>
                </div>
                {preview && (
                  <img
                    src={preview}
                    alt="Bukti"
                    className="w-40 h-40 object-cover rounded-xl border border-black/10 mt-2"
                  />
                )}
                <button
                  onClick={handleReset}
                  className="mt-2 px-6 py-3 bg-[#111410] text-white rounded-full text-[13.5px] font-bold hover:bg-[#2a2a1e] transition"
                >
                  Kirim Absensi Lagi
                </button>
              </div>
            ) : (
              <div className="p-5 sm:p-8 flex flex-col gap-6">

                {/* ── Header card ── */}
                <div className="flex items-center justify-between">
                  <h2 className="text-[1.2rem] sm:text-[1.35rem] font-extrabold text-[#1a1a1a]">
                    Kirim Kehadiran
                  </h2>
                  <span className="px-3 py-1.5 bg-[#7fe05b] text-[#111410] text-[12px] font-black rounded-full">
                    XI-1 PPLG
                  </span>
                </div>

                {/* ── Status buttons ── */}
                <div className="grid grid-cols-3 gap-3">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        className={`
                          relative flex flex-col items-center justify-center gap-2
                          py-5 sm:py-6 rounded-2xl border-2 font-bold text-[14px]
                          transition-all duration-200
                          ${active
                            ? opt.activeClass + " shadow-lg scale-[1.02]"
                            : "border-[#e8e8e0] bg-[#f9f9f5] text-[#9a9a9a] hover:border-[#d0d0c8] hover:bg-[#f0f0ea]"
                          }
                        `}
                      >
                        <span className={active ? "text-current" : "text-[#c0c0b8]"}>
                          {opt.icon}
                        </span>
                        {opt.label}

                        {/* Active check indicator */}
                        {active && (
                          <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Hidden file input — dipicu oleh tombol status maupun dropzone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />

                {/* ── Tanggal & Waktu ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                      Tanggal Pelaporan
                    </label>
                    <div className="flex items-center gap-2.5 bg-[#f0f0ea] rounded-xl px-4 py-3">
                      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 7h14" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M6 2v2M12 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="text-[13.5px] font-semibold text-[#1a1a1a]">{tanggal}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                      Waktu Saat Ini
                    </label>
                    <div className="flex items-center gap-2.5 bg-[#f0f0ea] rounded-xl px-4 py-3">
                      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M9 5.5V9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="text-[13.5px] font-semibold text-[#1a1a1a]">{waktu}</span>
                    </div>
                  </div>
                </div>

                {/* ── Dropzone / Preview ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Dokumen / File Pendukung
                  </label>

                  {preview ? (
                    /* Preview file terpilih */
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#7fe05b]">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-h-56 object-cover"
                      />
                      {/* Overlay info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeWidth="1.4" />
                            <path d="M2 10l4-3 3 3 2-2 3 3" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
                          </svg>
                          <span className="text-white text-[12px] font-semibold truncate">{file?.name}</span>
                          <span className="text-white/60 text-[11px] shrink-0">
                            ({((file?.size ?? 0) / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          onClick={removeFile}
                          className="text-white/70 hover:text-white transition shrink-0 ml-2"
                          aria-label="Hapus file"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="8" fill="rgba(0,0,0,0.4)" />
                            <path d="M6 6l6 6M12 6l-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      {/* Ganti file */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-2.5 right-2.5 bg-white/90 hover:bg-white text-[#111410] text-[11.5px] font-bold px-3 py-1.5 rounded-full transition"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  ) : (
                    /* Dropzone */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`
                        flex flex-col items-center justify-center gap-3
                        rounded-2xl border-2 border-dashed cursor-pointer
                        py-10 sm:py-12 px-6 text-center
                        transition-all duration-200
                        ${dragOver
                          ? "border-[#7fe05b] bg-[#f0fce8]"
                          : "border-[#d0d0c8] bg-[#fafaf7] hover:border-[#7fe05b] hover:bg-[#f0fce8]"
                        }
                      `}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${dragOver ? "bg-[#7fe05b]/20" : "bg-[#f0fce8]"}`}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[#7fe05b]">
                          <path d="M14 18V8M14 8l-4 4M14 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M4 14a10 10 0 1020 0 10 10 0 00-20 0z" stroke="currentColor" strokeWidth="1.4" opacity=".2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13.5px] font-bold text-[#1a1a1a]">
                          {dragOver ? "Lepaskan file di sini" : "Seret file ke sini atau klik untuk mengunggah"}
                        </p>
                        <p className="text-[12px] text-[#9a9a9a] mt-1">JPG, JPEG, PNG (Maks. 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Catatan opsional ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Catatan <span className="normal-case text-[#c0c0b8] font-normal">(opsional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tambahkan keterangan jika diperlukan..."
                    className="
                      w-full px-4 py-3 text-[13.5px]
                      bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8]
                      rounded-xl border border-transparent outline-none resize-none
                      focus:border-[#7fe05b] focus:bg-white
                      transition-all duration-200
                    "
                  />
                </div>

                {/* ── Submit button ── */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="
                    w-full py-4 rounded-2xl
                    bg-[#111410] hover:bg-[#1e1e16]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2.5
                    transition-all duration-150 active:scale-[0.99]
                  "
                >
                  {loading ? (
                    <span className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-[#7fe05b] text-[14px] font-extrabold tracking-wide">
                        Kirim Kehadiran
                      </span>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M3 9h12M11 5l4 4-4 4"
                          stroke="#7fe05b"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
