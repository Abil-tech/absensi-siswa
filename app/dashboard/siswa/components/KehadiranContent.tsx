"use client";

import { useState, useRef } from "react";

interface Props {
  onMenuClick: () => void;
}

type StatusType = "Hadir" | "Izin" | "Sakit";

const STATUS_OPTIONS: {
  value: StatusType;
  label: string;
  activeClass: string;
  activeBg: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "Hadir",
    label: "Hadir",
    activeClass: "bg-[#7fe05b] text-[#111410] border-[#7fe05b]",
    activeBg: "bg-[#7fe05b]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.6" opacity=".3" />
        <path d="M8 14l4 4 8-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Izin",
    label: "Izin",
    activeClass: "bg-[#3b82f6] text-white border-[#3b82f6]",
    activeBg: "bg-[#3b82f6]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 11h20" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9 3v4M19 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9 16h6M9 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "Sakit",
    label: "Sakit",
    activeClass: "bg-[#ef4444] text-white border-[#ef4444]",
    activeBg: "bg-[#ef4444]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.7" />
        <path d="M14 10v5M14 18.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function KehadiranContent({ onMenuClick }: Props) {
  const [status, setStatus] = useState<StatusType>("Hadir");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dua ref terpisah: kamera (selfie) dan file biasa
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const waktu =
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB";

  function handleStatusChange(s: StatusType) {
    // Reset file saat ganti status
    if (s !== status) {
      setFile(null);
      setPreview(null);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setStatus(s);
  }

  function handleFileChange(f: File | null) {
    if (!f) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) {
      alert("Format tidak didukung. Gunakan JPG, PNG, atau PDF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB.");
      return;
    }
    setFile(f);
    // Preview hanya untuk gambar
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openInput() {
    if (status === "Hadir") {
      cameraInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  }

  async function handleSubmit() {
    if (!file) {
      alert(
        status === "Hadir"
          ? "Harap ambil selfie terlebih dahulu."
          : "Harap unggah dokumen pendukung terlebih dahulu."
      );
      return;
    }
    setLoading(true);

    // Sambungkan ke API kamu:
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

  const selectedOpt = STATUS_OPTIONS.find((s) => s.value === status)!;

  // Label & hint teks sesuai status
  const uploadLabel =
    status === "Hadir" ? "Foto Selfie" : "Dokumen / Surat Pendukung";
  const uploadHint =
    status === "Hadir"
      ? "Klik untuk membuka kamera — pastikan wajah terlihat jelas"
      : "Klik untuk mengunggah surat izin/sakit · JPG, PNG, PDF (Maks. 10MB)";
  const uploadIcon =
    status === "Hadir" ? (
      // Kamera icon
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#7fe05b]">
        <path
          d="M28 24a2 2 0 01-2 2H6a2 2 0 01-2-2V12a2 2 0 012-2h3.5l2-3h9l2 3H26a2 2 0 012 2v12z"
          stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
        />
        <circle cx="16" cy="17" r="4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ) : (
      // Upload icon
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#7fe05b]">
        <path d="M16 20V10M16 10l-5 5M16 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 24h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.4" opacity=".2" />
      </svg>
    );

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
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* ── Success ── */}
            {submitted ? (
              <div className="p-8 sm:p-12 flex flex-col items-center text-center gap-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${selectedOpt.activeBg}`}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M8 18l7 7 13-13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[1.3rem] font-extrabold text-[#1a1a1a]">Kehadiran Terkirim!</h2>
                  <p className="text-[#9a9a9a] text-sm mt-1.5">
                    Status <span className="font-bold text-[#1a1a1a]">{status}</span> berhasil dicatat
                  </p>
                  <p className="text-[#b0b0a8] text-[12.5px] mt-0.5">{tanggal} · {waktu}</p>
                </div>
                {preview && (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Bukti"
                      className="w-36 h-36 object-cover rounded-2xl border-4 shadow-md"
                      style={{ borderColor: status === "Hadir" ? "#7fe05b" : status === "Izin" ? "#3b82f6" : "#ef4444" }}
                    />
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white text-[10.5px] font-black px-3 py-1 rounded-full whitespace-nowrap"
                      style={{ background: status === "Hadir" ? "#4a9e2f" : status === "Izin" ? "#1d4ed8" : "#b91c1c" }}
                    >
                      ✓ Terverifikasi
                    </span>
                  </div>
                )}
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-3 bg-[#111410] text-white rounded-full text-[13.5px] font-bold hover:bg-[#2a2a1e] transition"
                >
                  Kirim Ulang Absensi
                </button>
              </div>

            ) : (
              <div className="p-5 sm:p-8 flex flex-col gap-6">

                {/* ── Card header ── */}
                <div className="flex items-center justify-between">
                  <h2 className="text-[1.2rem] sm:text-[1.35rem] font-extrabold text-[#1a1a1a]">
                    Kirim Kehadiran
                  </h2>
                  <span className="px-3 py-1.5 bg-[#7fe05b] text-[#111410] text-[12px] font-black rounded-full">
                    XI-1 PPLG
                  </span>
                </div>

                {/* ── 3 Status Buttons ── */}
                <div className="grid grid-cols-3 gap-3">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className={`
                          relative flex flex-col items-center justify-center gap-2
                          py-5 sm:py-6 rounded-2xl border-2 font-bold text-[14px]
                          transition-all duration-200
                          ${active
                            ? opt.activeClass + " shadow-md scale-[1.02]"
                            : "border-[#e8e8e0] bg-[#f9f9f5] text-[#9a9a9a] hover:border-[#d0d0c8] hover:bg-[#f0f0ea]"
                          }
                        `}
                      >
                        <span className={active ? "text-current" : "text-[#c0c0b8]"}>
                          {opt.icon}
                        </span>
                        {opt.label}
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

                {/* Hint per status */}
                <p className="text-[12.5px] text-[#9a9a9a] -mt-2 px-1">
                  {status === "Hadir" && "📸 Wajib selfie sebagai bukti kehadiran."}
                  {status === "Izin" && "📄 Unggah surat izin dari orang tua / wali."}
                  {status === "Sakit" && "🏥 Unggah surat keterangan sakit dari dokter."}
                </p>

                {/* ── Hidden inputs ── */}
                {/* Selfie: buka kamera depan (mobile) */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
                {/* File biasa: foto atau PDF */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />

                {/* ── Tanggal & Waktu ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide">Tanggal</label>
                    <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-4 py-3">
                      <svg width="15" height="15" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 7h14" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M6 2v2M12 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="text-[13px] font-semibold text-[#1a1a1a]">{tanggal}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide">Waktu</label>
                    <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-4 py-3">
                      <svg width="15" height="15" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M9 5.5V9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="text-[13px] font-semibold text-[#1a1a1a]">{waktu}</span>
                    </div>
                  </div>
                </div>

                {/* ── Upload Area ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    {uploadLabel}
                  </label>

                  {file ? (
                    /* Preview */
                    <div className="relative rounded-2xl overflow-hidden border-2"
                      style={{ borderColor: status === "Hadir" ? "#7fe05b" : status === "Izin" ? "#3b82f6" : "#ef4444" }}
                    >
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
                      ) : (
                        /* PDF preview */
                        <div className="flex items-center gap-3 bg-[#f9f9f5] px-5 py-6">
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-500">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                              <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{file.name}</p>
                            <p className="text-[12px] text-[#9a9a9a]">{((file.size) / 1024).toFixed(0)} KB · PDF</p>
                          </div>
                        </div>
                      )}

                      {/* Bottom bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-white text-[12px] font-semibold truncate">{file.name}</span>
                        <button onClick={removeFile} className="text-white/70 hover:text-white transition shrink-0 ml-2" aria-label="Hapus">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="8" fill="rgba(0,0,0,0.4)" />
                            <path d="M6 6l6 6M12 6l-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      {/* Retake / Ganti */}
                      <button
                        onClick={openInput}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#111410] text-[11.5px] font-bold px-3 py-1.5 rounded-full transition"
                      >
                        {status === "Hadir" ? "Ulangi Selfie" : "Ganti File"}
                      </button>
                    </div>
                  ) : (
                    /* Upload trigger */
                    <button
                      onClick={openInput}
                      className="
                        w-full flex flex-col items-center justify-center gap-3
                        rounded-2xl border-2 border-dashed border-[#d0d0c8]
                        bg-[#fafaf7] hover:border-[#7fe05b] hover:bg-[#f0fce8]
                        py-10 sm:py-12 px-6 text-center
                        transition-all duration-200 group
                      "
                    >
                      <div className="w-16 h-16 rounded-full bg-[#f0fce8] group-hover:bg-[#7fe05b]/20 flex items-center justify-center transition-colors">
                        {uploadIcon}
                      </div>
                      <div>
                        <p className="text-[13.5px] font-bold text-[#1a1a1a]">
                          {status === "Hadir" ? "Ambil Selfie" : "Unggah Dokumen"}
                        </p>
                        <p className="text-[12px] text-[#9a9a9a] mt-1">{uploadHint}</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* ── Catatan ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Catatan <span className="normal-case font-normal text-[#c0c0b8]">(opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tambahkan keterangan jika diperlukan..."
                    className="
                      w-full px-4 py-3 text-[13.5px]
                      bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8]
                      rounded-xl border border-transparent outline-none resize-none
                      focus:border-[#7fe05b] focus:bg-white transition-all duration-200
                    "
                  />
                </div>

                {/* ── Submit ── */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className="
                    w-full py-4 rounded-2xl bg-[#111410] hover:bg-[#1e1e16]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2.5
                    transition-all duration-150 active:scale-[0.99]
                  "
                >
                  {loading ? (
                    <span className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-[#7fe05b] text-[14px] font-extrabold tracking-wide">Kirim Kehadiran</span>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3 9h12M11 5l4 4-4 4" stroke="#7fe05b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>

                {!file && (
                  <p className="text-center text-[12px] text-[#b0b0a8]">
                    {status === "Hadir"
                      ? "* Ambil selfie terlebih dahulu sebelum mengirim"
                      : "* Unggah dokumen pendukung terlebih dahulu"}
                  </p>
                )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
