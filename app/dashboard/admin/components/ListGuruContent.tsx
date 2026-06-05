"use client";

import { useState } from "react";

interface Props {
  onMenuClick: () => void;
}

type UserRole = "walas" | "bk";
type StatusType = "Aktif" | "Cuti" | "Nonaktif";

interface Guru {
  id: string;
  name: string;
  email: string;
  userId: string;
  role: UserRole;
  status: StatusType;
  departemen: string;
  kelasWalas?: string;   // hanya untuk role walas
}

// ── Data awal (nanti dari MongoDB) ──
const INITIAL_DATA: Guru[] = [
  { id: "1", name: "Dr. Sarah Jenkins", email: "sarah.jenkins@sekolah.sch.id", userId: "TCH-2024-081", role: "walas", status: "Aktif", departemen: "Informatika / PPLG",    kelasWalas: "XI PPLG 1" },
  { id: "2", name: "Marcus Hendra",     email: "marcus@sekolah.sch.id",        userId: "TCH-2024-042", role: "walas", status: "Cuti",  departemen: "Matematika & Fisika",  kelasWalas: "X PPLG 2"  },
  { id: "3", name: "Simon Kael",        email: "simon@sekolah.sch.id",         userId: "TCH-2024-003", role: "walas", status: "Aktif", departemen: "Ilmu Komputer",        kelasWalas: "XII PPLG 1" },
  { id: "4", name: "James Counselor",   email: "james@sekolah.sch.id",         userId: "TCH-2024-115", role: "bk",    status: "Aktif", departemen: "Bimbingan & Konseling" },
];

const KELAS_LIST = [
  "X PPLG 1","X PPLG 2","X DKV 1","X DKV 2","X TJKT 1","X MPLB 1",
  "XI PPLG 1","XI PPLG 2","XI MPLB 4","XI TJKT 2",
  "XII PPLG 1","XII TJKT 4","XII DKV 2","XII MPLB 2",
];

const ROLE_LABEL: Record<UserRole, string> = {
  walas: "Guru / Walas",
  bk:    "Guru BK",
};

const ROLE_ICON: Record<UserRole, React.ReactNode> = {
  walas: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L1 5.5L8 9L15 5.5L8 2Z" fill="currentColor" strokeLinejoin="round" />
      <path d="M3 7v4s2 2.5 5 2.5S13 11 13 11V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  bk: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const STATUS_STYLE: Record<StatusType, string> = {
  Aktif:    "bg-[#7fe05b] text-[#111410]",
  Cuti:     "bg-[#e8e8e0] text-[#6b6b6b]",
  Nonaktif: "bg-red-100 text-red-600",
};

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#10b981","#f97316","#6366f1"];

type View = "list" | "form";

interface FormData {
  name: string;
  email: string;
  userId: string;
  password: string;
  role: UserRole;
  status: StatusType;
  departemen: string;
  kelasWalas: string;   // hanya aktif saat role walas
}

const EMPTY_FORM: FormData = {
  name: "", email: "", userId: "", password: "",
  role: "walas", status: "Aktif", departemen: "", kelasWalas: "",
};

export default function ListGuruContent({ onMenuClick }: Props) {
  const [view, setView] = useState<View>("list");
  const [guruList, setGuruList] = useState<Guru[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "Semua">("Semua");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleEdit(guru: Guru) {
    setEditId(guru.id);
    setForm({
      name: guru.name, email: guru.email,
      userId: guru.userId, password: "",
      role: guru.role, status: guru.status,
      departemen: guru.departemen,
      kelasWalas: guru.kelasWalas ?? "",
    });
    setView("form");
  }

  function handleTambah() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setView("form");
  }

  function handleSubmit() {
    if (!form.name.trim())        { alert("Nama wajib diisi."); return; }
    if (!form.userId.trim())      { alert("ID guru wajib diisi."); return; }
    if (!form.departemen.trim())  { alert("Departemen wajib diisi."); return; }
    if (form.role === "walas" && !form.kelasWalas) { alert("Pilih kelas wali untuk guru/walas."); return; }
    if (!editId && !form.password.trim()) { alert("Password wajib diisi."); return; }

    if (editId) {
      // Edit
      setGuruList((prev) =>
        prev.map((g) => g.id === editId ? { ...g, ...form } : g)
      );
      showToast("Data guru berhasil diperbarui ✓");
    } else {
      // Tambah baru
      const newGuru: Guru = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        userId: form.userId,
        role: form.role,
        status: form.status,
        departemen: form.departemen,
        kelasWalas: form.role === "walas" ? form.kelasWalas : undefined,
      };
      setGuruList((prev) => [newGuru, ...prev]);
      showToast("Guru berhasil ditambahkan ✓");
    }
    setView("list");
    setEditId(null);
  }

  function handleDelete(id: string) {
    setGuruList((prev) => prev.filter((g) => g.id !== id));
    setDeleteConfirmId(null);
    showToast("Data guru berhasil dihapus ✓");
  }

  const filtered = guruList.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.userId.toLowerCase().includes(search.toLowerCase()) ||
      g.departemen.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "Semua" || g.role === filterRole;
    return matchSearch && matchRole;
  });

  // ── FORM VIEW ──────────────────────────────
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
            <button
              type="button"
              onClick={() => setView("list")}
              className="flex items-center gap-1.5 text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] font-semibold hidden sm:block">List Guru</span>
            </button>
            <span className="text-[#d0d0c8]">/</span>
            <h1 className="text-[1rem] sm:text-[1.3rem] font-extrabold text-[#1a1a1a] tracking-tight">
              {editId ? "Edit Guru" : "Tambah Guru / BK"}
            </h1>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-5">

              {/* Role selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Role *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["walas", "bk"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r }))}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                      className={`
                        flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left
                        transition-all duration-150 active:opacity-70
                        ${form.role === r
                          ? "border-[#7fe05b] bg-[#f0fce8]"
                          : "border-[#e8e8e0] bg-[#f9f9f5] hover:border-[#d0d0c8]"
                        }
                      `}
                    >
                      <span className={form.role === r ? "text-[#4a9e2f]" : "text-[#9a9a9a]"}>
                        {ROLE_ICON[r]}
                      </span>
                      <div>
                        <p className={`text-[13px] font-bold ${form.role === r ? "text-[#111410]" : "text-[#6b6b6b]"}`}>
                          {ROLE_LABEL[r]}
                        </p>
                        <p className="text-[10.5px] text-[#9a9a9a]">
                          {r === "walas" ? "Guru mata pelajaran" : "Bimbingan & Konseling"}
                        </p>
                      </div>
                      {form.role === r && (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="ml-auto shrink-0 text-[#4a9e2f]">
                          <circle cx="8" cy="8" r="7" fill="#7fe05b" />
                          <path d="M5 8l2.5 2.5L11 6" stroke="#111410" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-black/5" />

              {/* Nama */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Nama Lengkap *</label>
                <input
                  type="text"
                  placeholder="Contoh: Dr. Sarah Jenkins"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                />
              </div>

              {/* User ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">ID Guru (userId) *</label>
                <input
                  type="text"
                  placeholder="Contoh: TCH-2024-001"
                  value={form.userId}
                  onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                  className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all font-mono"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                  Email <span className="font-normal text-[#b0b0a8] normal-case">(opsional)</span>
                </label>
                <input
                  type="email"
                  placeholder="Contoh: guru@sekolah.sch.id"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                />
              </div>

              {/* Departemen */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Departemen / Mata Pelajaran *</label>
                <input
                  type="text"
                  placeholder="Contoh: Matematika & Fisika"
                  value={form.departemen}
                  onChange={(e) => setForm((f) => ({ ...f, departemen: e.target.value }))}
                  className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                />
              </div>

              {/* Kelas Wali — hanya muncul saat role walas */}
              {form.role === "walas" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                    Kelas Wali *
                  </label>
                  <div className="relative">
                    <select
                      value={form.kelasWalas}
                      onChange={(e) => setForm((f) => ({ ...f, kelasWalas: e.target.value }))}
                      className="w-full px-4 py-3 text-[13.5px] appearance-none bg-[#f0f0ea] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all cursor-pointer"
                      style={{ color: form.kelasWalas ? "#1a1a1a" : "#b0b0a8" }}
                    >
                      <option value="" disabled>Pilih kelas yang diwali...</option>
                      {["X","XI","XII"].map((grade) => (
                        <optgroup key={grade} label={`Kelas ${grade}`}>
                          {KELAS_LIST.filter((k) => k.startsWith(grade + " ") && !k.startsWith(grade + "I") && !k.startsWith("XII") || k.startsWith(grade + " ")).filter((k) => {
                            if (grade === "X")   return k.startsWith("X ") && !k.startsWith("XI") && !k.startsWith("XII");
                            if (grade === "XI")  return k.startsWith("XI ") && !k.startsWith("XII");
                            if (grade === "XII") return k.startsWith("XII ");
                            return false;
                          }).map((k) => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a] pointer-events-none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  {form.kelasWalas && (
                    <p className="text-[11.5px] text-[#4a9e2f] font-semibold flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" fill="#7fe05b" />
                        <path d="M4 7l2.5 2.5L10 5" stroke="#111410" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Wali kelas: {form.kelasWalas}
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Status</label>
                <div className="flex gap-2">
                  {(["Aktif", "Cuti", "Nonaktif"] as StatusType[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                      className={`px-4 py-2 rounded-full text-[12.5px] font-bold border-2 transition-all active:opacity-70 ${
                        form.status === s
                          ? STATUS_STYLE[s] + " border-transparent"
                          : "bg-[#f0f0ea] text-[#6b6b6b] border-transparent"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                  Password {editId && <span className="font-normal text-[#b0b0a8] normal-case">(kosongkan jika tidak diubah)</span>}
                  {!editId && <span className="text-red-400"> *</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full pl-4 pr-11 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#666] transition-colors"
                  >
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                      {showPassword ? (
                        <>
                          <path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.4" />
                          <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </>
                      ) : (
                        <>
                          <rect x="4" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M6 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="flex-1 py-3 rounded-xl border-2 border-[#e8e8e0] bg-white text-[#6b6b6b] text-[13.5px] font-bold hover:bg-[#f0f0ea] transition active:opacity-70"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="flex-1 py-3 rounded-xl bg-[#111410] hover:bg-[#1e1e16] text-[#7fe05b] text-[13.5px] font-extrabold transition active:opacity-70"
                >
                  {editId ? "Simpan Perubahan" : "Tambahkan"}
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">Guru</h1>
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
            <input
              type="text"
              placeholder="Cari berdasarkan Nama, ID, atau Departemen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-[13px] bg-white rounded-xl border border-black/10 outline-none focus:border-[#7fe05b] transition-all shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleTambah}
            style={{ WebkitTapHighlightColor: "transparent" }}
            className="flex items-center gap-2.5 px-4 sm:px-5 py-3 bg-[#111410] hover:bg-[#1e1e16] text-white rounded-xl font-bold text-[13px] transition active:opacity-70 shrink-0 shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="8" r="4" stroke="#7fe05b" strokeWidth="1.5" />
              <path d="M2 16c0-3.314 3.134-5 7-5s7 1.686 7 5" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 3h4M15 1v4" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[#7fe05b] hidden sm:block font-extrabold">Tambahkan Guru</span>
          </button>
        </div>

        {/* Filter role */}
        <div className="flex gap-2 flex-wrap">
          {(["Semua", "walas", "bk"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterRole(f)}
              style={{ WebkitTapHighlightColor: "transparent" }}
              className={`px-4 py-2 rounded-full text-[12.5px] font-bold transition-all active:opacity-70 ${
                filterRole === f
                  ? "bg-[#111410] text-white"
                  : "bg-white border border-black/10 text-[#6b6b6b]"
              }`}
            >
              {f === "Semua" ? "Semua" : ROLE_LABEL[f]}
            </button>
          ))}
          <span className="ml-auto text-[12.5px] text-[#9a9a9a] font-semibold self-center">
            {filtered.length} guru
          </span>
        </div>

        {/* Grid kartu */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <p className="text-3xl mb-3">👨‍🏫</p>
            <p className="text-[14px] font-bold text-[#1a1a1a]">Tidak ada guru ditemukan</p>
            <p className="text-[13px] text-[#9a9a9a] mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((guru, i) => (
              <div
                key={guru.id}
                className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] transition-shadow"
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {guru.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14.5px] font-extrabold text-[#1a1a1a] truncate">{guru.name}</p>
                        <p className="text-[12px] text-[#9a9a9a] font-mono mt-0.5">ID : {guru.userId}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-black shrink-0 ${STATUS_STYLE[guru.status]}`}>
                        {guru.status}
                      </span>
                    </div>

                    {/* Role + Departemen */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-[#4a9e2f]">{ROLE_ICON[guru.role]}</span>
                      <span className="text-[12.5px] font-semibold text-[#2d2d2d]">{guru.departemen}</span>
                    </div>
                    {/* Kelas wali — hanya untuk walas */}
                    {guru.role === "walas" && guru.kelasWalas && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="text-[#9a9a9a]">
                          <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M1 5h12" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        <span className="text-[11.5px] text-[#9a9a9a] font-semibold">Wali Kelas {guru.kelasWalas}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider + Actions */}
                <div className="border-t border-black/5 px-5 py-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleEdit(guru)}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className="flex items-center gap-2 text-[13px] font-semibold text-[#2d2d2d] hover:text-[#111410] transition-colors active:opacity-70 py-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                      <path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(guru.id)}
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

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-red-500">
                <path d="M3 6h16M8 6V4h6v2M5 6l1 12h10l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-[15px] font-extrabold text-[#1a1a1a] text-center">Hapus Data Guru?</h3>
            <p className="text-[13px] text-[#9a9a9a] text-center mt-2 leading-relaxed">
              Data guru{" "}
              <span className="font-bold text-[#1a1a1a]">
                {guruList.find((g) => g.id === deleteConfirmId)?.name}
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-[#e8e8e0] text-[#6b6b6b] text-[13px] font-bold hover:bg-[#f0f0ea] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition active:opacity-70"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
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
