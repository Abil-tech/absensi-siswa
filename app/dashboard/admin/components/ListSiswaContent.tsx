"use client";

import { useState } from "react";

interface Props {
  onMenuClick: () => void;
}

type JenisKelamin = "L" | "P";
type StatusKehadiran = "Hadir" | "Terlambat" | "Izin" | "Sakit" | "Alfa";
type Grade = "10" | "11" | "12";

interface Siswa {
  id: string;
  // dari User model
  name: string;
  userId: string;
  password?: string;
  // dari Siswa model
  nisn: string;
  nis: string;
  kelas: string;
  grade: Grade;
  jurusan: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  alamat: string;
  noTelp: string;
  // UI only
  statusKehadiran: StatusKehadiran;
}

const KELAS_LIST: { label: string; grade: Grade }[] = [
  { label: "10 PPLG 1",  grade: "10" }, { label: "10 PPLG 2",  grade: "10" },
  { label: "10 DKV 1",   grade: "10" }, { label: "10 DKV 2",   grade: "10" },
  { label: "10 TJKT 1",  grade: "10" }, { label: "10 MPLB 1",  grade: "10" },
  { label: "11 PPLG 1",  grade: "11" }, { label: "11 PPLG 2",  grade: "11" },
  { label: "11 MPLB 4",  grade: "11" }, { label: "11 TJKT 2",  grade: "11" },
  { label: "12 PPLG 1",  grade: "12" }, { label: "12 TJKT 4",  grade: "12" },
  { label: "12 DKV 2",   grade: "12" }, { label: "12 MPLB 2",  grade: "12" },
];

const INITIAL_SISWA: Siswa[] = [
  {
    id: "1", name: "Alexander",  userId: "20241001", nisn: "0056123478", nis: "240001",
    kelas: "11 PPLG 1", grade: "11", jurusan: "PPLG", jenisKelamin: "L",
    tanggalLahir: "2007-03-15", alamat: "Jl. Merdeka No. 12, Bandung", noTelp: "0812-3456-7890",
    statusKehadiran: "Hadir",
  },
  {
    id: "2", name: "Ica",        userId: "20241002", nisn: "0067234589", nis: "240002",
    kelas: "11 MPLB 4", grade: "11", jurusan: "MPLB", jenisKelamin: "P",
    tanggalLahir: "2007-06-22", alamat: "Jl. Pahlawan No. 8, Bekasi", noTelp: "0813-4567-8901",
    statusKehadiran: "Terlambat",
  },
  {
    id: "3", name: "Nanno",      userId: "20241003", nisn: "0078345690", nis: "240003",
    kelas: "12 TJKT 4", grade: "12", jurusan: "TJKT", jenisKelamin: "L",
    tanggalLahir: "2006-11-08", alamat: "Jl. Sudirman No. 5, Jakarta", noTelp: "0814-5678-9012",
    statusKehadiran: "Izin",
  },
  {
    id: "4", name: "Bima",       userId: "20241004", nisn: "0089456701", nis: "240004",
    kelas: "10 DKV 1",  grade: "10", jurusan: "DKV",  jenisKelamin: "L",
    tanggalLahir: "2008-01-30", alamat: "Jl. Gatot Subroto No. 3, Depok", noTelp: "0815-6789-0123",
    statusKehadiran: "Hadir",
  },
];

const STATUS_STYLE: Record<StatusKehadiran, string> = {
  Hadir:     "bg-[#7fe05b] text-[#111410]",
  Terlambat: "bg-[#ef4444] text-[#ffff]",
  Izin:      "bg-[#e8e8e0] text-[#6b6b6b]",
  Sakit:     "bg-red-100 text-red-600",
  Alfa:      "bg-orange-100 text-orange-700",
};

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#10b981","#f97316","#6366f1"];

type View = "list" | "form";

interface FormData {
  // User fields
  name: string;
  userId: string;
  password: string;
  // Siswa fields
  nisn: string;
  nis: string;
  kelas: string;
  jurusan: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  alamat: string;
  noTelp: string;
}

const EMPTY_FORM: FormData = {
  name: "", userId: "", password: "",
  nisn: "", nis: "", kelas: "", jurusan: "",
  jenisKelamin: "L", tanggalLahir: "", alamat: "", noTelp: "",
};

export default function ListSiswaContent({ onMenuClick }: Props) {
  const [view, setView]               = useState<View>("list");
  const [siswaList, setSiswaList]     = useState<Siswa[]>(INITIAL_SISWA);
  const [search, setSearch]           = useState("");
  const [gradeFilter, setGradeFilter] = useState<Grade | "Semua">("Semua");
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState<FormData>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast]             = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  // Auto-set jurusan saat kelas dipilih
  function handleKelasChange(k: string) {
    const jurusan = k.includes("PPLG") ? "PPLG"
      : k.includes("DKV")  ? "DKV"
      : k.includes("TJKT") ? "TJKT"
      : k.includes("MPLB") ? "MPLB"
      : k.includes("PM")   ? "PM"
      : k.includes("PH")   ? "Perhotelan"
      : "";
    setForm((f) => ({ ...f, kelas: k, jurusan }));
  }

  function handleEdit(siswa: Siswa) {
    setEditId(siswa.id);
    setForm({
      name: siswa.name, userId: siswa.userId, password: "",
      nisn: siswa.nisn, nis: siswa.nis, kelas: siswa.kelas,
      jurusan: siswa.jurusan, jenisKelamin: siswa.jenisKelamin,
      tanggalLahir: siswa.tanggalLahir, alamat: siswa.alamat, noTelp: siswa.noTelp,
    });
    setView("form");
  }

  function handleTambah() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setView("form");
  }

  function handleSubmit() {
    if (!form.name.trim())          { alert("Nama wajib diisi."); return; }
    if (!form.userId.trim())        { alert("User ID wajib diisi."); return; }
    if (!editId && !form.password)  { alert("Password wajib diisi."); return; }
    if (!/^\d{10}$/.test(form.nisn)) { alert("NISN harus tepat 10 digit angka."); return; }
    if (!form.nis.trim())           { alert("NIS wajib diisi."); return; }
    if (!form.kelas)                { alert("Pilih kelas terlebih dahulu."); return; }
    if (!form.tanggalLahir)         { alert("Tanggal lahir wajib diisi."); return; }
    if (!form.alamat.trim())        { alert("Alamat wajib diisi."); return; }
    if (!form.noTelp.trim())        { alert("No. telepon wajib diisi."); return; }

    const grade = form.kelas.split(" ")[0] as Grade;

    if (editId) {
      setSiswaList((prev) => prev.map((s) =>
        s.id === editId ? { ...s, ...form, grade } : s
      ));
      showToast("Data siswa berhasil diperbarui ✓");
    } else {
      const newSiswa: Siswa = {
        id: Date.now().toString(),
        ...form,
        grade,
        statusKehadiran: "Hadir",
      };
      setSiswaList((prev) => [newSiswa, ...prev]);
      showToast("Siswa berhasil ditambahkan ✓");
    }
    setView("list");
    setEditId(null);
  }

  function handleDelete(id: string) {
    setSiswaList((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
    showToast("Data siswa berhasil dihapus ✓");
  }

  const filtered = siswaList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.includes(search) ||
      s.nisn.includes(search) ||
      s.nis.includes(search);
    const matchGrade = gradeFilter === "Semua" || s.grade === gradeFilter;
    return matchSearch && matchGrade;
  });

  // ─────────────────────────────────────────
  // FORM VIEW
  // ─────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" onClick={() => setView("list")} className="flex items-center gap-1.5 text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] font-semibold hidden sm:block">List Siswa</span>
            </button>
            <span className="text-[#d0d0c8]">/</span>
            <h1 className="text-[1rem] sm:text-[1.3rem] font-extrabold text-[#1a1a1a] tracking-tight">
              {editId ? "Edit Siswa" : "Tambah Siswa"}
            </h1>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-5">

              {/* ── BAGIAN: Data Akun (User) ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#111410] flex items-center justify-center text-[#7fe05b] text-[11px] font-black shrink-0">1</div>
                  <h3 className="text-[13.5px] font-extrabold text-[#1a1a1a]">Data Akun</h3>
                </div>
                <div className="flex flex-col gap-4">

                  {/* Nama */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Nama Lengkap *</label>
                    <input type="text" placeholder="Contoh: Budi Santoso"
                      value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                    />
                  </div>

                  {/* User ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">User ID (untuk login) *</label>
                    <input type="text" placeholder="Contoh: 20241001"
                      value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                      className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all font-mono"
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                      Password {editId
                        ? <span className="font-normal text-[#b0b0a8] normal-case">(kosongkan jika tidak diubah)</span>
                        : <span className="text-red-400">*</span>
                      }
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        className="w-full pl-4 pr-11 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#666] transition-colors">
                        <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                          {showPassword ? (
                            <><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.4"/><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>
                          ) : (
                            <><rect x="4" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-black/5" />

              {/* ── BAGIAN: Data Siswa ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#111410] flex items-center justify-center text-[#7fe05b] text-[11px] font-black shrink-0">2</div>
                  <h3 className="text-[13.5px] font-extrabold text-[#1a1a1a]">Data Siswa</h3>
                </div>
                <div className="flex flex-col gap-4">

                  {/* NISN + NIS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">NISN * <span className="font-normal normal-case text-[#b0b0a8]">(10 digit)</span></label>
                      <input type="text" placeholder="0012345678" maxLength={10}
                        value={form.nisn} onChange={(e) => setForm((f) => ({ ...f, nisn: e.target.value.replace(/\D/g,"") }))}
                        className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">NIS *</label>
                      <input type="text" placeholder="240001"
                        value={form.nis} onChange={(e) => setForm((f) => ({ ...f, nis: e.target.value }))}
                        className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Kelas */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Kelas *</label>
                    <div className="relative">
                      <select value={form.kelas} onChange={(e) => handleKelasChange(e.target.value)}
                        className="w-full px-4 py-3 text-[13.5px] appearance-none bg-[#f0f0ea] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all cursor-pointer"
                        style={{ color: form.kelas ? "#1a1a1a" : "#b0b0a8" }}
                      >
                        <option value="" disabled>Pilih Kelas</option>
                        {["10","11","12"].map((g) => (
                          <optgroup key={g} label={`Grade ${g}`}>
                            {KELAS_LIST.filter((k) => k.grade === g).map((k) => (
                              <option key={k.label} value={k.label}>{k.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a] pointer-events-none">
                        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Jurusan (auto) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Jurusan *</label>
                    <input type="text" placeholder="Otomatis terisi saat memilih kelas"
                      value={form.jurusan} onChange={(e) => setForm((f) => ({ ...f, jurusan: e.target.value }))}
                      className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Jenis Kelamin *</label>
                    <div className="flex gap-3">
                      {([["L","Laki-laki"],["P","Perempuan"]] as [JenisKelamin,string][]).map(([val, label]) => (
                        <button key={val} type="button"
                          onClick={() => setForm((f) => ({ ...f, jenisKelamin: val }))}
                          style={{ WebkitTapHighlightColor: "transparent" }}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all active:opacity-70 ${
                            form.jenisKelamin === val
                              ? "border-[#7fe05b] bg-[#f0fce8] text-[#111410]"
                              : "border-[#e8e8e0] bg-[#f9f9f5] text-[#6b6b6b]"
                          }`}
                        >
                          {form.jenisKelamin === val ? "✓ " : ""}{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Tanggal Lahir *</label>
                    <input type="date"
                      value={form.tanggalLahir} onChange={(e) => setForm((f) => ({ ...f, tanggalLahir: e.target.value }))}
                      className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                    />
                  </div>

                  {/* No. Telepon */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">No. Telepon / HP *</label>
                    <input type="tel" placeholder="Contoh: 0812-3456-7890"
                      value={form.noTelp} onChange={(e) => setForm((f) => ({ ...f, noTelp: e.target.value }))}
                      className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Alamat */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Alamat Lengkap *</label>
                    <textarea rows={3} placeholder="Jl. Merdeka No. 12, RT 01/RW 02, Bandung"
                      value={form.alamat} onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                      className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setView("list")}
                  className="flex-1 py-3 rounded-xl border-2 border-[#e8e8e0] bg-white text-[#6b6b6b] text-[13.5px] font-bold hover:bg-[#f0f0ea] transition active:opacity-70">
                  Batal
                </button>
                <button type="button" onClick={handleSubmit}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="flex-1 py-3 rounded-xl bg-[#111410] hover:bg-[#1e1e16] text-[#7fe05b] text-[13.5px] font-extrabold transition active:opacity-70">
                  {editId ? "Simpan Perubahan" : "Tambahkan"}
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">Siswa</h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* Search + Tambah */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Cari berdasarkan Nama atau ID..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-[13px] bg-white rounded-xl border border-black/10 outline-none focus:border-[#7fe05b] transition-all shadow-sm"
            />
          </div>
          <button type="button" onClick={handleTambah}
            style={{ WebkitTapHighlightColor: "transparent" }}
            className="flex items-center gap-2.5 px-4 sm:px-5 py-3 bg-[#111410] hover:bg-[#1e1e16] text-white rounded-xl font-bold text-[13px] transition active:opacity-70 shrink-0 shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="8" r="4" stroke="#7fe05b" strokeWidth="1.5" />
              <path d="M2 16c0-3.314 3.134-5 7-5s7 1.686 7 5" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 3h4M15 1v4" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[#7fe05b] hidden sm:block font-extrabold">Tambahkan Siswa</span>
          </button>
        </div>

        {/* Filter Grade */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            type="button"
            onClick={() => setGradeFilter("Semua")}
            style={{ WebkitTapHighlightColor: "transparent" }}
            className={`px-4 py-2 rounded-full text-[12.5px] font-bold transition-all active:opacity-70 ${gradeFilter === "Semua" ? "bg-[#111410] text-white" : "bg-white border border-black/10 text-[#6b6b6b]"}`}
          >
            Seluruh Kelas
          </button>
          {(["10","11","12"] as Grade[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGradeFilter(g)}
              style={{ WebkitTapHighlightColor: "transparent" }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-bold transition-all active:opacity-70 ${gradeFilter === g ? "bg-[#111410] text-white" : "bg-white border border-black/10 text-[#6b6b6b]"}`}
            >
              Grade {g}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          ))}
          <span className="ml-auto text-[12.5px] text-[#9a9a9a] font-semibold">
            {filtered.length} siswa
          </span>
        </div>

        {/* Grid kartu */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <p className="text-3xl mb-3">🎓</p>
            <p className="text-[14px] font-bold text-[#1a1a1a]">Tidak ada siswa ditemukan</p>
            <p className="text-[13px] text-[#9a9a9a] mt-1">Coba ubah kata kunci atau filter grade</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((siswa, i) => (
              <div key={siswa.id} className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] transition-shadow">
                <div className="p-5 flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {siswa.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14.5px] font-extrabold text-[#1a1a1a] truncate">{siswa.name}</p>
                        <p className="text-[12px] text-[#9a9a9a] font-mono mt-0.5">ID : STDNT-{siswa.userId}</p>
                        <p className="text-[12px] text-[#9a9a9a] mt-0.5">Class: {siswa.kelas}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-black shrink-0 ${STATUS_STYLE[siswa.statusKehadiran]}`}>
                        {siswa.statusKehadiran}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider + Actions */}
                <div className="border-t border-black/5 px-5 py-3 flex items-center justify-between">
                  <button type="button" onClick={() => handleEdit(siswa)}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className="flex items-center gap-2 text-[13px] font-semibold text-[#2d2d2d] hover:text-[#111410] transition-colors active:opacity-70 py-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                      <path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    </svg>
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleteConfirmId(siswa.id)}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className="flex items-center gap-2 text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors active:opacity-70 py-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                      <path d="M2 4h11M5 4V2.5h5V4M6 7v4M9 7v4M3 4l1 8.5h7L12 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-red-500">
                <path d="M3 6h16M8 6V4h6v2M5 6l1 12h10l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-[15px] font-extrabold text-[#1a1a1a] text-center">Hapus Data Siswa?</h3>
            <p className="text-[13px] text-[#9a9a9a] text-center mt-2 leading-relaxed">
              Data siswa{" "}
              <span className="font-bold text-[#1a1a1a]">
                {siswaList.find((s) => s.id === deleteConfirmId)?.name}
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-[#e8e8e0] text-[#6b6b6b] text-[13px] font-bold hover:bg-[#f0f0ea] transition">
                Batal
              </button>
              <button type="button" onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition active:opacity-70">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#111410] text-white px-5 py-3 rounded-full shadow-xl text-[13px] font-semibold">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="#7fe05b" />
            <path d="M5 8l2.5 2.5L11 6" stroke="#111410" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
