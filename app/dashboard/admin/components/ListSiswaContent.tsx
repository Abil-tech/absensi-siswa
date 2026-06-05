"use client";

import { useState, useEffect } from "react";
import BulkImportModal from "./BulkImportModal";

interface Props {
  onMenuClick: () => void;
}

type JenisKelamin = "L" | "P";

interface KelasOption {
  id: string;
  nama: string;
}

interface SiswaItem {
  id: string;
  userId: string;
  name: string;
  loginId: string;
  nisn: string;
  nis: string;
  kelas: { id: string; nama: string };
  jurusan: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  alamat: string;
  noTelp: string;
}

interface FormData {
  name: string;
  loginId: string;
  password: string;
  nisn: string;
  nis: string;
  kelasId: string;
  jurusan: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  alamat: string;
  noTelp: string;
}

const EMPTY_FORM: FormData = {
  name: "", loginId: "", password: "",
  nisn: "", nis: "", kelasId: "", jurusan: "",
  jenisKelamin: "L", tanggalLahir: "", alamat: "", noTelp: "",
};

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#10b981","#f97316","#6366f1"];

function getInitials(name: string): string {
  if (!name?.trim()) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTanggal(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

type View = "list" | "form";

export default function ListSiswaContent({ onMenuClick }: Props) {
  const [view, setView]               = useState<View>("list");
  const [siswaList, setSiswaList]     = useState<SiswaItem[]>([]);
  const [kelasList, setKelasList]     = useState<KelasOption[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [kelasFilter, setKelasFilter] = useState<string>("Semua");
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState<FormData>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast]             = useState("");
  const [formError, setFormError]     = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [siswaRes, kelasRes] = await Promise.all([
        fetch("/api/admin/siswa"),
        fetch("/api/admin/kelas"),
      ]);
      if (siswaRes.ok) {
        const json = await siswaRes.json();
        setSiswaList(json.siswa);
      } else {
        showToast("❌ Gagal load data siswa");
      }
      if (kelasRes.ok) {
        const json = await kelasRes.json();
        setKelasList(json.kelas);
      } else {
        showToast("❌ Gagal load data kelas");
      }
    } catch (err) {
      showToast("❌ Error: Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  function handleKelasChange(kelasId: string) {
    const kelas = kelasList.find((k) => k.id === kelasId);
    if (!kelas) return;
    const nama = kelas.nama;
    const jurusan = nama.includes("PPLG") ? "PPLG"
      : nama.includes("DKV")  ? "DKV"
      : nama.includes("TJKT") ? "TJKT"
      : nama.includes("MPLB") ? "MPLB"
      : nama.includes("PM")   ? "PM"
      : "";
    setForm((f) => ({ ...f, kelasId, jurusan }));
  }

  function handleEdit(siswa: SiswaItem) {
    setEditId(siswa.id);
    setForm({
      name:         siswa.name,
      loginId:      siswa.loginId,
      password:     "",
      nisn:         siswa.nisn,
      nis:          siswa.nis,
      kelasId:      siswa.kelas.id,
      jurusan:      siswa.jurusan,
      jenisKelamin: siswa.jenisKelamin,
      tanggalLahir: siswa.tanggalLahir ? siswa.tanggalLahir.split("T")[0] : "",
      alamat:       siswa.alamat,
      noTelp:       siswa.noTelp,
    });
    setFormError(null);
    setView("form");
  }

  function handleTambah() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setView("form");
  }

  async function handleSubmit() {
    setFormError(null);
    if (!form.name.trim())           { setFormError("Nama wajib diisi."); return; }
    if (!form.loginId.trim())        { setFormError("User ID wajib diisi."); return; }
    if (!editId && !form.password)   { setFormError("Password wajib diisi."); return; }
    if (!/^\d{10}$/.test(form.nisn)) { setFormError("NISN harus tepat 10 digit angka."); return; }
    if (!form.nis.trim())            { setFormError("NIS wajib diisi."); return; }
    if (!form.kelasId)               { setFormError("Pilih kelas terlebih dahulu."); return; }
    if (!form.jurusan.trim())        { setFormError("Jurusan wajib diisi."); return; }
    if (!form.tanggalLahir)          { setFormError("Tanggal lahir wajib diisi."); return; }
    if (!form.alamat.trim())         { setFormError("Alamat wajib diisi."); return; }
    if (!form.noTelp.trim())         { setFormError("No. telepon wajib diisi."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/siswa", {
        method:  editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...form }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal menyimpan data."); return; }

      await fetchData();
      showToast(editId ? "Data siswa berhasil diperbarui ✓" : "Siswa berhasil ditambahkan ✓");
      setView("list");
      setEditId(null);
    } catch { setFormError("Gagal terhubung ke server."); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch("/api/admin/siswa", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const json = await res.json();
        showToast(`❌ Gagal: ${json.error ?? "Hapus data gagal"}`);
        return;
      }
      await fetchData();
      setDeleteConfirmId(null);
      showToast("Data siswa berhasil dihapus ✓");
    } catch (err) {
      showToast("❌ Error: Gagal terhubung ke server");
    }
  }

  const filtered = siswaList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.loginId.includes(search) ||
      s.nisn.includes(search) ||
      s.nis.includes(search);
    const matchKelas = kelasFilter === "Semua" || s.kelas.nama === kelasFilter;
    return matchSearch && matchKelas;
  });

  // ── FORM VIEW ──
  if (view === "form") {
    return (
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
            <button type="button" onClick={() => setView("list")} className="flex items-center gap-1.5 text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-[13px] font-semibold hidden sm:block">List Siswa</span>
            </button>
            <span className="text-[#d0d0c8]">/</span>
            <h1 className="text-[1rem] sm:text-[1.3rem] font-extrabold text-[#1a1a1a] tracking-tight">{editId ? "Edit Siswa" : "Tambah Siswa"}</h1>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-5">

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#c0392b" strokeWidth="1.5" /><path d="M8 5v3.5M8 11h.01" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  {formError}
                </div>
              )}

              {/* Data Akun */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#111410] flex items-center justify-center text-[#7fe05b] text-[11px] font-black shrink-0">1</div>
                  <h3 className="text-[13.5px] font-extrabold text-[#1a1a1a]">Data Akun</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Nama Lengkap *</label>
                    <input type="text" placeholder="Contoh: Budi Santoso" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">User ID (untuk login) *</label>
                    <input type="text" placeholder="Contoh: 20241001" value={form.loginId} onChange={(e) => setForm((f) => ({ ...f, loginId: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all font-mono" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                      Password {editId ? <span className="font-normal text-[#b0b0a8] normal-case">(kosongkan jika tidak diubah)</span> : <span className="text-red-400">*</span>}
                    </label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full pl-4 pr-11 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all" />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#666] transition-colors">
                        <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                          {showPassword ? (<><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></>) : (<><rect x="4" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M6 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></>)}
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-black/5" />

              {/* Data Siswa */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#111410] flex items-center justify-center text-[#7fe05b] text-[11px] font-black shrink-0">2</div>
                  <h3 className="text-[13.5px] font-extrabold text-[#1a1a1a]">Data Siswa</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">NISN * <span className="font-normal normal-case text-[#b0b0a8]">(10 digit)</span></label>
                      <input type="text" placeholder="0012345678" maxLength={10} value={form.nisn} onChange={(e) => setForm((f) => ({ ...f, nisn: e.target.value.replace(/\D/g, "") }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all font-mono" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">NIS *</label>
                      <input type="text" placeholder="240001" value={form.nis} onChange={(e) => setForm((f) => ({ ...f, nis: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all font-mono" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Kelas *</label>
                    <div className="relative">
                      <select value={form.kelasId} onChange={(e) => handleKelasChange(e.target.value)} className="w-full px-4 py-3 text-[13.5px] appearance-none bg-[#f0f0ea] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all cursor-pointer" style={{ color: form.kelasId ? "#1a1a1a" : "#b0b0a8" }}>
                        <option value="" disabled>Pilih Kelas</option>
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                      </select>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a] pointer-events-none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Jurusan *</label>
                    <input type="text" placeholder="Otomatis terisi saat memilih kelas" value={form.jurusan} onChange={(e) => setForm((f) => ({ ...f, jurusan: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Jenis Kelamin *</label>
                    <div className="flex gap-3">
                      {([["L","Laki-laki"],["P","Perempuan"]] as [JenisKelamin, string][]).map(([val, label]) => (
                        <button key={val} type="button" onClick={() => setForm((f) => ({ ...f, jenisKelamin: val }))} className={`flex-1 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${form.jenisKelamin === val ? "border-[#7fe05b] bg-[#f0fce8] text-[#111410]" : "border-[#e8e8e0] bg-[#f9f9f5] text-[#6b6b6b]"}`}>
                          {form.jenisKelamin === val ? "✓ " : ""}{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Tanggal Lahir *</label>
                    <input type="date" value={form.tanggalLahir} onChange={(e) => setForm((f) => ({ ...f, tanggalLahir: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">No. Telepon *</label>
                    <input type="tel" placeholder="Contoh: 0812-3456-7890" value={form.noTelp} onChange={(e) => setForm((f) => ({ ...f, noTelp: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Alamat Lengkap *</label>
                    <textarea rows={3} placeholder="Jl. Merdeka No. 12, RT 01/RW 02, Bandung" value={form.alamat} onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all resize-none" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setView("list")} className="flex-1 py-3 rounded-xl border-2 border-[#e8e8e0] bg-white text-[#6b6b6b] text-[13.5px] font-bold hover:bg-[#f0f0ea] transition">Batal</button>
                <button type="button" onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl bg-[#111410] hover:bg-[#1e1e16] text-[#7fe05b] text-[13.5px] font-extrabold transition disabled:opacity-50">
                  {submitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambahkan"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">List Siswa</h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* Search + Buttons */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Cari nama, User ID, NISN, atau NIS..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 text-[13px] bg-white rounded-xl border border-black/10 outline-none focus:border-[#7fe05b] transition-all shadow-sm" />
          </div>
          <button type="button" onClick={handleTambah} className="flex items-center gap-2.5 px-4 sm:px-5 py-3 bg-[#111410] hover:bg-[#1e1e16] text-white rounded-xl font-bold text-[13px] transition shrink-0 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="8" r="4" stroke="#7fe05b" strokeWidth="1.5" />
              <path d="M2 16c0-3.314 3.134-5 7-5s7 1.686 7 5" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 3h4M15 1v4" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[#7fe05b] hidden sm:block font-extrabold">Tambah</span>
          </button>
          <button type="button" onClick={() => setShowBulkImport(true)} className="flex items-center gap-2.5 px-4 sm:px-5 py-3 bg-[#7fe05b] hover:bg-[#6dd54d] text-[#111410] rounded-xl font-bold text-[13px] transition shrink-0 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M19 20H5c-1 0-2 1-2 2v1h18v-1c0-1-1-2-2-2Z" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="hidden sm:block font-extrabold">Excel</span>
          </button>
        </div>

        {/* Filter Kelas */}
        <div className="flex gap-2 flex-wrap items-center">
          <button type="button" onClick={() => setKelasFilter("Semua")} className={`px-4 py-2 rounded-full text-[12.5px] font-bold transition-all ${kelasFilter === "Semua" ? "bg-[#111410] text-white" : "bg-white border border-black/10 text-[#6b6b6b]"}`}>
            Semua Kelas
          </button>
          {kelasList.map((k) => (
            <button key={k.id} type="button" onClick={() => setKelasFilter(k.nama)} className={`px-4 py-2 rounded-full text-[12.5px] font-bold transition-all whitespace-nowrap ${kelasFilter === k.nama ? "bg-[#111410] text-white" : "bg-white border border-black/10 text-[#6b6b6b]"}`}>
              {k.nama}
            </button>
          ))}
          <span className="ml-auto text-[12.5px] text-[#9a9a9a] font-semibold">{filtered.length} siswa</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center text-[13px] text-[#9a9a9a] py-10">Memuat data siswa...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <p className="text-3xl mb-3">🎓</p>
            <p className="text-[14px] font-bold text-[#1a1a1a]">Tidak ada siswa ditemukan</p>
            <p className="text-[13px] text-[#9a9a9a] mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((siswa) => (
              <div key={siswa.id} className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] transition-shadow">
                <div className="p-5 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0" style={{ background: AVATAR_COLORS[Math.abs(siswa.id.charCodeAt(0)) % AVATAR_COLORS.length] }}>
                    {getInitials(siswa.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14.5px] font-extrabold text-[#1a1a1a] truncate">{siswa.name}</p>
                    <p className="text-[12px] text-[#9a9a9a] font-mono mt-0.5">NIS: {siswa.nis} · NISN: {siswa.nisn}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2.5 py-0.5 bg-[#f0fce8] text-[#4a9e2f] text-[11.5px] font-black rounded-full">{siswa.kelas.nama}</span>
                      <span className="text-[11.5px] text-[#9a9a9a]">{siswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
                    </div>
                    <p className="text-[11.5px] text-[#9a9a9a] mt-0.5">{formatTanggal(siswa.tanggalLahir)}</p>
                  </div>
                </div>
                <div className="border-t border-black/5 px-5 py-3 flex items-center justify-between">
                  <button type="button" onClick={() => handleEdit(siswa)} className="flex items-center gap-2 text-[13px] font-semibold text-[#2d2d2d] hover:text-[#111410] transition-colors py-1">
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleteConfirmId(siswa.id)} className="flex items-center gap-2 text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors py-1">
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M2 4h11M5 4V2.5h5V4M6 7v4M9 7v4M3 4l1 8.5h7L12 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-red-500"><path d="M3 6h16M8 6V4h6v2M5 6l1 12h10l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3 className="text-[15px] font-extrabold text-[#1a1a1a] text-center">Hapus Data Siswa?</h3>
            <p className="text-[13px] text-[#9a9a9a] text-center mt-2 leading-relaxed">
              Data <span className="font-bold text-[#1a1a1a]">{siswaList.find((s) => s.id === deleteConfirmId)?.name}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl border-2 border-[#e8e8e0] text-[#6b6b6b] text-[13px] font-bold hover:bg-[#f0f0ea] transition">Batal</button>
              <button type="button" onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#111410] text-white px-5 py-3 rounded-full shadow-xl text-[13px] font-semibold">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#7fe05b" /><path d="M5 8l2.5 2.5L11 6" stroke="#111410" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {toast}
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={fetchData}
        kelasList={kelasList}
      />
    </div>
  );
}