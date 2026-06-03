"use client";

interface Props {
  onMenuClick: () => void;
}

const INFO_ITEMS = [
  { label: "Nama Lengkap",    value: "Dr. Sarah Jenkins",             icon: "👤" },
  { label: "NIP",             value: "198504122010012034",             icon: "🪪" },
  { label: "Email",           value: "sarah.jenkins@sekolah.sch.id",  icon: "📧" },
  { label: "Mata Pelajaran",  value: "Informatika / PPLG",            icon: "📚" },
  { label: "Jabatan",         value: "Guru Tetap",                    icon: "🏷️" },
  { label: "Wali Kelas",      value: "XI-1 PPLG",                     icon: "🏫" },
  { label: "No. HP",          value: "0812-9988-7766",                icon: "📱" },
  { label: "Alamat",          value: "Jl. Merdeka No. 45, Bandung",   icon: "📍" },
];

const STATS = [
  { label: "Kelas Diajar",     value: "4",    sub: "semester ini",    color: "#7fe05b" },
  { label: "Total Siswa",      value: "142",  sub: "yang diajar",     color: "#3b82f6" },
  { label: "Rata-rata Hadir",  value: "94%",  sub: "kehadiran siswa", color: "#f59e0b" },
  { label: "Tahun Mengajar",   value: "12",   sub: "tahun pengalaman",color: "#8b5cf6" },
];



export default function GuruProfilContent({ onMenuClick }: Props) {

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden text-[#1a1a1a] p-1"
            aria-label="Buka menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-[1.15rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">
            Profil Saya
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* ── Hero Card ── */}
        <div className="bg-[#111410] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#7fe05b]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-[#3b82f6]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7fe05b] to-[#4a9e2f] flex items-center justify-center text-[#111410] font-black text-2xl shadow-lg">
              DS
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-white font-extrabold text-xl tracking-tight">Dr. Sarah Jenkins</h2>
              <span className="inline-block self-center px-3 py-1 bg-[#7fe05b] text-[#111410] text-[11.5px] font-black rounded-full">
                GURU TETAP
              </span>
            </div>
            <p className="text-white/50 text-[13px] mt-1">NIP 198504122010012034 · Informatika / PPLG</p>
            <p className="text-white/30 text-[12px] mt-0.5">Wali Kelas XI-1 PPLG · Tahun Ajaran 2024/2025</p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
            {[
              { val: "4",    sub: "Kelas"    },
              { val: "142",  sub: "Siswa"    },
              { val: "12th", sub: "Pengalaman" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center bg-white/8 rounded-xl px-4 py-2">
                <span className="text-[#7fe05b] font-black text-lg leading-none">{s.val}</span>
                <span className="text-white/40 text-[10.5px] font-semibold mt-0.5">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        

        {/* ── Informasi Pribadi ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <div className="px-4 sm:px-6 py-4 border-b border-black/5">
            <h3 className="text-[14px] font-extrabold text-[#1a1a1a]">Informasi Pribadi</h3>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INFO_ITEMS.map((item, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wide flex items-center gap-1.5">
                  <span>{item.icon}</span> {item.label}
                </label>
                  <p className="text-[13.5px] font-semibold text-[#1a1a1a] bg-[#f9f9f5] rounded-[10px] px-3.5 py-2.5">
                    {item.value}
                  </p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
