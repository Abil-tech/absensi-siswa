"use client";

interface Props { onMenuClick: () => void; }

const now = new Date();
const jamSekarang = now.getHours();
const statusWaktu =
  jamSekarang < 10 ? "Pagi Hari" :
  jamSekarang < 14 ? "Siang Hari" :
  jamSekarang < 18 ? "Sore Hari" : "Malam Hari";

const RECENT_ACTIVITY = [
  { aksi: "Siswa baru didaftarkan", nama: "Adi Nugroho", waktu: "2 menit lalu",    ikon: "👤", color: "#3b82f6" },
  { aksi: "Data guru diperbarui",   nama: "Dr. Sarah Jenkins", waktu: "15 menit lalu", ikon: "✏️", color: "#f59e0b" },
  { aksi: "Siswa baru didaftarkan", nama: "Bella Permata", waktu: "1 jam lalu",    ikon: "👤", color: "#3b82f6" },
  { aksi: "Akun guru dibuat",       nama: "Bpk. Hendra K.", waktu: "2 jam lalu",   ikon: "🔑", color: "#8b5cf6" },
  { aksi: "Data siswa dihapus",     nama: "Lina Octavia", waktu: "3 jam lalu",     ikon: "🗑️", color: "#ef4444" },
];

export default function AdminDashboardContent({ onMenuClick }: Props) {
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
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">
            Tinjauan Sistem
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-6">

        {/* ── Status label ── */}
        <h2 className="text-[1rem] sm:text-[1.1rem] font-extrabold text-[#1a1a1a]">
          Status {statusWaktu}
        </h2>

        {/* ── Stat cards row 1 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Jumlah Siswa */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#f0fce8] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-[#4a9e2f]">
                  <path d="M14 4L2 10L14 16L26 10L14 4Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M6 13V19C6 19 9 22 14 22C19 22 22 19 22 19V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[13px] font-bold text-[#4a9e2f]">+12%</span>
            </div>
            <p className="text-[2.8rem] font-black text-[#1a1a1a] leading-none tracking-tight">1,248</p>
            <p className="text-[14px] font-bold text-[#1a1a1a] mt-2">Jumlah Siswa</p>
          </div>

          {/* Anggota Staf */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#f0fce8] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-[#4a9e2f]">
                  <circle cx="14" cy="10" r="5" fill="currentColor" />
                  <path d="M4 24c0-5.523 4.477-9 10-9s10 3.477 10 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[13px] font-bold text-[#4a9e2f]">Aktif</span>
            </div>
            <p className="text-[2.8rem] font-black text-[#1a1a1a] leading-none tracking-tight">84</p>
            <p className="text-[14px] font-bold text-[#1a1a1a] mt-2">Anggota Staf</p>
          </div>
        </div>

        {/* ── Kehadiran Hari Ini — dark card ── */}
        <div className="bg-[#111410] rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.15)] relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#7fe05b]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/50 text-[14px] font-semibold mb-3">Kehadiran Hari Ini</p>
              <p className="text-[3.5rem] sm:text-[4rem] font-black text-[#7fe05b] leading-none tracking-tight">94.2%</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#7fe05b]/15 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-[#7fe05b]">
                  <rect x="3" y="5" width="22" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 11h22" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9 8V5M19 8V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M8 17h4M8 21h6M16 17h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[#7fe05b] text-[13px] font-bold">Data Normal</span>
            </div>
          </div>

          {/* Progress bar kehadiran */}
          <div className="mt-6">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-[#7fe05b]" style={{ width: "94.2%" }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-white/40 text-[11.5px] font-semibold">0%</span>
              <span className="text-white/40 text-[11.5px] font-semibold">100%</span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Hadir",     value: "1,175", color: "#7fe05b" },
              { label: "Tidak Hadir", value: "48",  color: "#ef4444" },
              { label: "Terlambat", value: "25",    color: "#f59e0b" },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 rounded-xl px-3 py-2.5 text-center">
                <p className="font-black text-[1.1rem] leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-white/40 text-[10.5px] font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stat cards row 2 ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Kelas",   value: "12",  icon: "🏫", color: "#3b82f6", bg: "#dbeafe" },
            { label: "Jurusan",       value: "6",   icon: "📚", color: "#8b5cf6", bg: "#ede9fe" },
            { label: "Guru Aktif",    value: "56",  icon: "👨‍🏫", color: "#f59e0b", bg: "#fef3c7" },
            { label: "Staff & Admin", value: "28",  icon: "🏢", color: "#10b981", bg: "#d1fae5" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <p className="text-[1.6rem] font-black leading-tight tracking-tight" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11.5px] font-semibold text-[#9a9a9a] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Aktivitas Terbaru ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5">
            <h3 className="text-[14px] font-extrabold text-[#1a1a1a]">Aktivitas Terbaru</h3>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafaf7] transition-colors">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ background: a.color + "18" }}
                >
                  {a.ikon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{a.aksi}</p>
                  <p className="text-[11.5px] text-[#9a9a9a] truncate">{a.nama}</p>
                </div>
                <span className="text-[11px] text-[#b0b0a8] font-semibold whitespace-nowrap shrink-0">{a.waktu}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
