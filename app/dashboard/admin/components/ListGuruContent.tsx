"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Props {
  onMenuClick: () => void;
}

type UserRole = "walas" | "bk";

interface Guru {
  id: string;
  name: string;
  email: string | null;
  userId: string | null;
  role: UserRole;
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  userId: string;
  password: string;
  role: UserRole;
}

const EMPTY_FORM: FormData = {
  name: "", email: "", userId: "", password: "", role: "walas",
};

const ROLE_LABEL: Record<UserRole, string> = {
  walas: "Wali Kelas",
  bk:    "Guru BK",
};

const ROLE_STYLE: Record<UserRole, string> = {
  walas: "bg-[#f0fce8] text-[#4a9e2f]",
  bk:    "bg-blue-50 text-blue-600",
};

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#10b981","#f97316","#6366f1"];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

type View = "list" | "form";

export default function ListGuruContent({ onMenuClick }: Props) {
  const [view, setView]               = useState<View>("list");
  const [guruList, setGuruList]       = useState<Guru[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterRole, setFilterRole]   = useState<UserRole | "Semua">("Semua");
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState<FormData>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast]             = useState("");
  const [formError, setFormError]     = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function fetchGuru() {
    try {
      const res = await fetch("/api/admin/guru");
      if (!res.ok) return;
      const json = await res.json();
      setGuruList(json.guru);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchGuru(); }, []);

  function handleEdit(guru: Guru) {
    setEditId(guru.id);
    setForm({
      name:     guru.name,
      email:    guru.email ?? "",
      userId:   guru.userId ?? "",
      password: "",
      role:     guru.role,
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
    if (!form.name.trim())   { setFormError("Nama wajib diisi."); return; }
    if (!form.userId.trim()) { setFormError("User ID wajib diisi."); return; }
    if (!editId && !form.password.trim()) { setFormError("Password wajib diisi."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/guru", {
        method:  editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...form }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal menyimpan data."); return; }

      await fetchGuru();
      showToast(editId ? "Data guru berhasil diperbarui ✓" : "Guru berhasil ditambahkan ✓");
      setView("list");
      setEditId(null);
    } catch { setFormError("Gagal terhubung ke server."); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch("/api/admin/guru", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return;
      await fetchGuru();
      setDeleteConfirmId(null);
      showToast("Data guru berhasil dihapus ✓");
    } catch {}
  }

  const filtered = guruList.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.userId ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (g.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "Semua" || g.role === filterRole;
    return matchSearch && matchRole;
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
              <span className="text-[13px] font-semibold hidden sm:block">List Guru</span>
            </button>
            <span className="text-[#d0d0c8]">/</span>
            <h1 className="text-[1rem] sm:text-[1.3rem] font-extrabold text-[#1a1a1a] tracking-tight">
              {editId ? "Edit Guru" : "Tambah Guru"}
            </h1>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-5">

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-xl px-4 py-3">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#c0392b" strokeWidth="1.5" /><path d="M8 5v3.5M8 11h.01" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  {formError}
                </div>
              )}

              {/* Role */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Role *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["walas", "bk"] as UserRole[]).map((r) => (
                    <button key={r} type="button" onClick={() => setForm((f) => ({ ...f, role: r }))} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${form.role === r ? "border-[#7fe05b] bg-[#f0fce8]" : "border-[#e8e8e0] bg-[#f9f9f5]"}`}>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-bold ${form.role === r ? "text-[#111410]" : "text-[#6b6b6b]"}`}>{ROLE_LABEL[r]}</p>
                        <p className="text-[10.5px] text-[#9a9a9a]">{r === "walas" ? "Wali kelas siswa" : "Bimbingan & Konseling"}</p>
                      </div>
                      {form.role === r && (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="ml-auto shrink-0">
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
                <input type="text" placeholder="Contoh: Budi Santoso" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all" />
              </div>

              {/* User ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">User ID *</label>
                <input type="text" placeholder="Contoh: WL001" value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all font-mono" />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">Email <span className="font-normal text-[#b0b0a8] normal-case">(opsional)</span></label>
                <input type="email" placeholder="Contoh: guru@sekolah.sch.id" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all" />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide">
                  Password {editId ? <span className="font-normal text-[#b0b0a8] normal-case">(kosongkan jika tidak diubah)</span> : <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full pl-4 pr-11 py-3 text-[13.5px] bg-[#f0f0ea] text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-transparent outline-none focus:border-[#7fe05b] focus:bg-white transition-all" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#666] transition-colors">
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                      {showPassword ? (
                        <><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></>
                      ) : (
                        <><rect x="4" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M6 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></>
                      )}
                    </svg>
                  </button>
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
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">List Guru</h1>
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
            <input type="text" placeholder="Cari nama, User ID, atau email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 text-[13px] bg-white rounded-xl border border-black/10 outline-none focus:border-[#7fe05b] transition-all shadow-sm" />
          </div>
          <button type="button" onClick={handleTambah} className="flex items-center gap-2.5 px-4 sm:px-5 py-3 bg-[#111410] hover:bg-[#1e1e16] text-white rounded-xl font-bold text-[13px] transition shrink-0 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="8" r="4" stroke="#7fe05b" strokeWidth="1.5" />
              <path d="M2 16c0-3.314 3.134-5 7-5s7 1.686 7 5" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 3h4M15 1v4" stroke="#7fe05b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[#7fe05b] hidden sm:block font-extrabold">Tambah Guru</span>
          </button>
        </div>

        {/* Filter role */}
        <div className="flex gap-2 flex-wrap items-center">
          {(["Semua", "walas", "bk"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilterRole(f)} className={`px-4 py-2 rounded-full text-[12.5px] font-bold transition-all ${filterRole === f ? "bg-[#111410] text-white" : "bg-white border border-black/10 text-[#6b6b6b]"}`}>
              {f === "Semua" ? "Semua" : ROLE_LABEL[f as UserRole]}
            </button>
          ))}
          <span className="ml-auto text-[12.5px] text-[#9a9a9a] font-semibold">{filtered.length} guru</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center text-[13px] text-[#9a9a9a] py-10">Memuat data guru...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <p className="text-3xl mb-3">👨‍🏫</p>
            <p className="text-[14px] font-bold text-[#1a1a1a]">Tidak ada guru ditemukan</p>
            <p className="text-[13px] text-[#9a9a9a] mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((guru, i) => (
              <div key={guru.id} className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] transition-shadow">
                <div className="p-5 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {getInitials(guru.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14.5px] font-extrabold text-[#1a1a1a] truncate">{guru.name}</p>
                        <p className="text-[12px] text-[#9a9a9a] font-mono mt-0.5">{guru.userId ?? "—"}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-black shrink-0 ${ROLE_STYLE[guru.role]}`}>
                        {ROLE_LABEL[guru.role]}
                      </span>
                    </div>
                    {guru.email && (
                      <p className="text-[12px] text-[#9a9a9a] mt-1.5 truncate">{guru.email}</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-black/5 px-5 py-3 flex items-center justify-between">
                  <button type="button" onClick={() => handleEdit(guru)} className="flex items-center gap-2 text-[13px] font-semibold text-[#2d2d2d] hover:text-[#111410] transition-colors py-1">
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleteConfirmId(guru.id)} className="flex items-center gap-2 text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors py-1">
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
            <h3 className="text-[15px] font-extrabold text-[#1a1a1a] text-center">Hapus Data Guru?</h3>
            <p className="text-[13px] text-[#9a9a9a] text-center mt-2 leading-relaxed">
              Data <span className="font-bold text-[#1a1a1a]">{guruList.find((g) => g.id === deleteConfirmId)?.name}</span> akan dihapus permanen.
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
    </div>
  );
}