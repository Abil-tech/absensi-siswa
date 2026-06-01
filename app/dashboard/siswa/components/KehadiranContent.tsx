"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onMenuClick: () => void;
}

type StatusType = "hadir" | "izin" | "sakit";

const STATUS_OPTIONS: {
  value: StatusType;
  label: string;
  activeClass: string;
  activeBg: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "hadir",
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
    value: "izin",
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
    value: "sakit",
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
  const [status, setStatus]       = useState<StatusType>("hadir");
  const [keterangan, setKeterangan] = useState("");
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [kelasNama, setKelasNama] = useState<string>("—");
  const [sudahAbsen, setSudahAbsen] = useState(false);
  const [bisaAbsen, setBisaAbsen] = useState(true);
  const [loadingCek, setLoadingCek] = useState(true);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
  const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }) + " WIB";

  // Cek status absensi hari ini
  useEffect(() => {
    async function cekAbsensi() {
      try {
        const res = await fetch("/api/siswa/absensi");
        if (!res.ok) return;
        const json = await res.json();
        setKelasNama(json.siswa?.kelas ?? "—");
        setSudahAbsen(json.sudahAbsenHariIni);
        setBisaAbsen(json.bisaAbsen);
      } finally {
        setLoadingCek(false);
      }
    }
    cekAbsensi();
  }, []);

  function handleStatusChange(s: StatusType) {
    if (s !== status) {
      setFile(null);
      setPreview(null);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setStatus(s);
    setError(null);
  }

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

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openInput() {
    if (status === "hadir") {
      cameraInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  }

  async function handleSubmit() {
    setError(null);

    if (!file)            { setError(status === "hadir" ? "Harap ambil selfie terlebih dahulu." : "Harap unggah dokumen pendukung."); return; }
    if (!keterangan.trim()) { setError("Keterangan wajib diisi."); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("status",     status);
      formData.append("keterangan", keterangan);
      formData.append("file",       file);

      const res = await fetch("/api/siswa/absensi", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal mengirim absensi.");
        return;
      }

      setSubmitted(true);
      setSudahAbsen(true);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  const selectedOpt = STATUS_OPTIONS.find((s) => s.value === status)!;

  // Jika sudah absen atau waktu habis — tampilkan info
  if (!loadingCek && (sudahAbsen || !bisaAbsen) && !submitted) {
    return (
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
          <button onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">Absensi Kehadiran</h1>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-10 flex flex-col items-center text-center gap-4 max-w-sm w-full">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${sudahAbsen ? "bg-[#7fe05b]" : "bg-gray-200"}`}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                {sudahAbsen
                  ? <path d="M6 14l5 5 11-11" stroke="#111410" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M14 8v7M14 18.5h.01" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" />
                }
              </svg>
            </div>
            <div>
              <h2 className="text-[1.2rem] font-extrabold text-[#1a1a1a]">
                {sudahAbsen ? "Sudah Absen Hari Ini" : "Waktu Absen Habis"}
              </h2>
              <p className="text-[13px] text-[#9a9a9a] mt-1.5">
                {sudahAbsen
                  ? "Kehadiranmu sudah tercatat untuk hari ini."
                  : "Batas waktu absensi adalah jam 06.40. Silakan absen besok."}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">Absensi Kehadiran</h1>
        </div>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#1a1a1a]">
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
                    Status <span className="font-bold text-[#1a1a1a] capitalize">{status}</span> berhasil dicatat
                  </p>
                  <p className="text-[#b0b0a8] text-[12.5px] mt-0.5">{tanggal} · {waktu}</p>
                </div>
                {preview && (
                  <img src={preview} alt="Bukti" className="w-36 h-36 object-cover rounded-2xl border-4 shadow-md" style={{ borderColor: status === "hadir" ? "#7fe05b" : status === "izin" ? "#3b82f6" : "#ef4444" }} />
                )}
              </div>

            ) : (
              <div className="p-5 sm:p-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-[1.2rem] sm:text-[1.35rem] font-extrabold text-[#1a1a1a]">Kirim Kehadiran</h2>
                  <span className="px-3 py-1.5 bg-[#7fe05b] text-[#111410] text-[12px] font-black rounded-full">{kelasNama}</span>
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

                {/* Status buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className={`relative flex flex-col items-center justify-center gap-2 py-5 sm:py-6 rounded-2xl border-2 font-bold text-[14px] transition-all duration-200 ${active ? opt.activeClass + " shadow-md scale-[1.02]" : "border-[#e8e8e0] bg-[#f9f9f5] text-[#9a9a9a] hover:border-[#d0d0c8]"}`}
                      >
                        <span className={active ? "text-current" : "text-[#c0c0b8]"}>{opt.icon}</span>
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

                <p className="text-[12.5px] text-[#9a9a9a] -mt-2 px-1">
                  {status === "hadir" && "📸 Wajib selfie sebagai bukti kehadiran."}
                  {status === "izin"  && "📄 Unggah surat izin dari orang tua / wali."}
                  {status === "sakit" && "🏥 Unggah surat keterangan sakit dari dokter."}
                </p>

                {/* Hidden inputs */}
                <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />

                {/* Tanggal & Waktu */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide">Tanggal</label>
                    <div className="flex items-center gap-2 bg-[#f0f0ea] rounded-xl px-4 py-3">
                      <svg width="15" height="15" viewBox="0 0 18 18" fill="none" className="text-[#9a9a9a] shrink-0">
                        <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 7h14M6 2v2M12 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

                {/* Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    {status === "hadir" ? "Foto Selfie" : "Dokumen / Surat Pendukung"} <span className="text-red-400">*</span>
                  </label>
                  {file ? (
                    <div className="relative rounded-2xl overflow-hidden border-2" style={{ borderColor: status === "hadir" ? "#7fe05b" : status === "izin" ? "#3b82f6" : "#ef4444" }}>
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
                      ) : (
                        <div className="flex items-center gap-3 bg-[#f9f9f5] px-5 py-6">
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-500">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                              <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-bold text-[#1a1a1a] truncate">{file.name}</p>
                            <p className="text-[12px] text-[#9a9a9a]">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-white text-[12px] font-semibold truncate">{file.name}</span>
                        <button onClick={removeFile} className="text-white/70 hover:text-white transition shrink-0 ml-2">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="8" fill="rgba(0,0,0,0.4)" />
                            <path d="M6 6l6 6M12 6l-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      <button onClick={openInput} className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#111410] text-[11.5px] font-bold px-3 py-1.5 rounded-full transition">
                        {status === "hadir" ? "Ulangi Selfie" : "Ganti File"}
                      </button>
                    </div>
                  ) : (
                    <button onClick={openInput} className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d0d0c8] bg-[#fafaf7] hover:border-[#7fe05b] hover:bg-[#f0fce8] py-10 sm:py-12 px-6 text-center transition-all duration-200 group">
                      <div className="w-16 h-16 rounded-full bg-[#f0fce8] group-hover:bg-[#7fe05b]/20 flex items-center justify-center transition-colors">
                        {status === "hadir" ? (
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#7fe05b]">
                            <path d="M28 24a2 2 0 01-2 2H6a2 2 0 01-2-2V12a2 2 0 012-2h3.5l2-3h9l2 3H26a2 2 0 012 2v12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                            <circle cx="16" cy="17" r="4" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                        ) : (
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#7fe05b]">
                            <path d="M16 20V10M16 10l-5 5M16 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 24h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[13.5px] font-bold text-[#1a1a1a]">{status === "hadir" ? "Ambil Selfie" : "Unggah Dokumen"}</p>
                        <p className="text-[12px] text-[#9a9a9a] mt-1">
                          {status === "hadir" ? "Klik untuk membuka kamera — pastikan wajah terlihat jelas" : "Klik untuk mengunggah surat · JPG, PNG, PDF (Maks. 10MB)"}
                        </p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Keterangan — wajib */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Keterangan <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder={
                      status === "hadir" ? "Contoh: Hadir tepat waktu" :
                      status === "izin"  ? "Contoh: Izin keperluan keluarga" :
                      "Contoh: Demam sejak kemarin malam"
                    }
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none resize-none focus:border-[#7fe05b] focus:bg-white transition-all duration-200"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className="w-full py-4 rounded-2xl bg-[#111410] hover:bg-[#1e1e16] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.99]"
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
                    {status === "hadir" ? "* Ambil selfie terlebih dahulu sebelum mengirim" : "* Unggah dokumen pendukung terlebih dahulu"}
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