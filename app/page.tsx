// app/page.tsx  atau  app/landing/page.tsx
// Landing Page SMK Citra Negara

import Link from "next/link";
import ScrollToJurusan from "./ScrollToJurusan";

// ─────────────────────────────────────────────
// PANDUAN INSERT GAMBAR:
//
// 1. Simpan gambar ke folder: /public/images/
//    Contoh: /public/images/hero-school.jpg
//            /public/images/jurusan-dkv.jpg
//            /public/images/jurusan-pplg.jpg
//            dst.
//
// 2. Ganti nilai IMAGE_CONFIG di bawah ini
//    dengan path gambar kamu.
//
// 3. Untuk logo sekolah, ganti LOGO_SRC.
// ─────────────────────────────────────────────

const LOGO_SRC = "/images/logo-cn.png";
// Ganti dengan path logo sekolahmu. Jika belum ada, biarkan kosong ("").

const HERO_IMAGE = "/images/bg-cn.jpg";
// Foto gedung / lingkungan sekolah untuk hero section.

const JURUSAN_LIST = [
  {
    id: "dkv",
    nama: "Desain Komunikasi Visual",
    singkatan: "DKV",
    deskripsi:
      "Program pendidikan yang fokus pada pengembangan keterampilan dalam menciptakan karya visual yang efektif untuk komunikasi, mencakup desain grafis, ilustrasi, fotografi, animasi, dan multimedia.",
    image: "/images/dkv.jpg",
    logo: "/images/logo-dkv.png",
    // ↑ Simpan logo PNG jurusan DKV ke /public/images/logo-dkv.png
    accent: "#ef4444",
    accentLight: "#fef2f2",
    icon: "🎨",
  },
  {
    id: "pplg",
    nama: "Pengembangan Perangkat Lunak dan Gim",
    singkatan: "PPLG",
    deskripsi:
      "Program pendidikan yang dirancang untuk mempersiapkan siswa dengan pengetahuan dan keterampilan praktis dalam pengembangan perangkat lunak dan pembuatan gim.",
    image: "/images/pplg.jpg",
    logo: "/images/logo-pplg.png",
    // ↑ Simpan logo PNG jurusan PPLG ke /public/images/logo-pplg.png
    accent: "#ffd138",
    accentLight: "#fef3c7",
    icon: "💻",
  },
  {
    id: "tjkt",
    nama: "Teknik Jaringan Komputer dan Telekomunikasi",
    singkatan: "TJKT",
    deskripsi:
      "Program pendidikan yang dirancang untuk mempersiapkan siswa dengan pengetahuan dan keterampilan praktis dalam bidang jaringan komputer dan telekomunikasi.",
    image: "/images/tjkt.jpg",
    logo: "/images/logo-tjkt.png",
    // ↑ Simpan logo PNG jurusan TJKT ke /public/images/logo-tjkt.png
    accent: "#6BC1FF",
    accentLight: "#dbeafe",
    icon: "🌐",
  },
  {
    id: "mplb",
    nama: "Manajemen Perkantoran dan Layanan Bisnis",
    singkatan: "MPLB",
    deskripsi:
      "Program pendidikan yang dirancang untuk mempersiapkan siswa dengan pengetahuan dan keterampilan praktis dalam mengelola administrasi perkantoran dan memberikan layanan bisnis yang efektif.",
    image: "/images/mplb.jpg",
    logo: "/images/logo-mplb.png",
    // ↑ Simpan logo PNG jurusan MPLB ke /public/images/logo-mplb.png
    accent: "#e8d543",
    accentLight: "#ede9fe",
    icon: "📋",
  },
  {
    id: "pm",
    nama: "Pemasaran",
    singkatan: "PM",
    deskripsi:
      "Program pendidikan yang fokus pada pengembangan keterampilan dalam bidang pemasaran dan penjualan, mencakup riset pasar, strategi pemasaran, hingga teknik penjualan dan pelayanan pelanggan.",
    image: "/images/pm.jpg",
    logo: "/images/logo-pm.png",
    // ↑ Simpan logo PNG jurusan PM ke /public/images/logo-pm.png
    accent: "#CCAF8F",
    accentLight: "#d1fae5",
    icon: "📈",
  },
];

const STATS = [
  { value: "1.200+", label: "Siswa Aktif"        },
  { value: "80+",    label: "Tenaga Pengajar"     },
  { value: "5",      label: "Program Keahlian"    },
  { value: "25th",   label: "Pengalaman"          },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5ef] font-[family-name:var(--font-plus-jakarta)] overflow-x-hidden">

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Logo */}
          {LOGO_SRC ? (
            <img src={LOGO_SRC} alt="Logo SMK Citra Negara" className="w-9 h-9 object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#7fe05b] flex items-center justify-center text-[#111410] font-black text-sm">CN</div>
          )}
          <div>
            <p className="font-extrabold text-[14px] text-[#111410] leading-tight tracking-tight">SMK Citra Negara</p>
            <p className="text-[10px] text-[#9a9a9a] font-medium">Academic Portal</p>
          </div>
        </div>

        <Link
          href="/login"
          className="
            flex items-center gap-2 px-5 py-2.5
            bg-[#7fe05b] hover:bg-[#6bcf49]
            text-[#111410] text-[13px] font-extrabold tracking-wider
            rounded-full transition-all duration-150 active:scale-95
            shadow-[0_2px_12px_rgba(127,224,91,0.4)]
          "
        >
          LOGIN
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </nav>

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative pt-16 h-[85vh] min-h-[500px] max-h-[750px] overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0">
          {HERO_IMAGE ? (
            <img
              src={HERO_IMAGE}
              alt="SMK Citra Negara"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Placeholder gradient jika belum ada foto */
            <div className="w-full h-full bg-gradient-to-br from-[#111410] via-[#1e2a14] to-[#0a1a08]" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />
          {/* Overlay warna brand */}
          <div className="absolute inset-0 bg-[#111410]/30" />
        </div>

        {/* Decorative dots pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#7fe05b 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Hero content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pb-8">
          {/* Logo besar di tengah */}
          <div className="mb-6">
            {LOGO_SRC ? (
              <img
                src={LOGO_SRC}
                alt="Logo SMK Citra Negara"
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-2xl mx-auto"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#7fe05b] flex items-center justify-center mx-auto shadow-2xl">
                <span className="text-[#111410] font-black text-3xl">CN</span>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-2 bg-[#7fe05b]/20 border border-[#7fe05b]/40 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#7fe05b] animate-pulse" />
            <span className="text-[#7fe05b] text-[12px] font-bold tracking-widest uppercase">Penerimaan Siswa Baru 2025/2026</span>
          </div>

          <h1 className="text-white text-[2rem] sm:text-[3rem] lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] max-w-3xl">
            SMK <span className="text-[#7fe05b]">Citra</span> Negara
          </h1>
          <p className="text-white/70 text-[14px] sm:text-[16px] mt-3 max-w-lg leading-relaxed">
            Membentuk generasi terampil, berkarakter, dan siap bersaing di era global
          </p>

          <div className="flex items-center gap-3 mt-7">
            <Link
              href="/login"
              className="
                flex items-center gap-2 px-6 py-3
                bg-[#7fe05b] hover:bg-[#6bcf49]
                text-[#111410] text-[13.5px] font-extrabold tracking-wide
                rounded-full transition-all duration-150 active:scale-95
                shadow-[0_4px_20px_rgba(127,224,91,0.5)]
              "
            >
              Masuk Portal Akademik
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <ScrollToJurusan />
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 20C1200 55 720 0 0 40L0 60Z" fill="#f5f5ef" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <section className="relative z-10 -mt-1 px-6 sm:px-10 lg:px-20 py-8">
        <div className="max-w-4xl mx-auto bg-[#111410] rounded-2xl px-6 py-6 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <p className="text-[#7fe05b] font-black text-[1.8rem] sm:text-[2rem] leading-none tracking-tight">{s.value}</p>
                <p className="text-white/50 text-[11.5px] font-semibold mt-1.5 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          JURUSAN SECTION
      ══════════════════════════════════════ */}
      <section id="jurusan" className="px-6 sm:px-10 lg:px-20 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-[#7fe05b] text-[12px] font-black uppercase tracking-widest mb-3 bg-[#f0fce8] px-4 py-1.5 rounded-full">
              Program Keahlian
            </span>
            <h2 className="text-[1.8rem] sm:text-[2.4rem] font-extrabold text-[#111410] tracking-tight leading-tight">
              Pilih Jurusan <span className="text-[#7fe05b]">Terbaikmu</span>
            </h2>
            <p className="text-[#9a9a9a] text-[14px] mt-3 max-w-xl mx-auto leading-relaxed">
              Lima program keahlian unggulan yang dirancang untuk mempersiapkan kamu menjadi profesional siap kerja
            </p>
          </div>

          {/* 3 jurusan atas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            {JURUSAN_LIST.slice(0, 3).map((jurusan) => (
              <JurusanCard key={jurusan.id} jurusan={jurusan} />
            ))}
          </div>

          {/* 2 jurusan bawah — centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[calc(66.66%+10px)] mx-auto">
            {JURUSAN_LIST.slice(3).map((jurusan) => (
              <JurusanCard key={jurusan.id} jurusan={jurusan} />
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════ */}
      <section className="px-6 sm:px-10 lg:px-20 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-[#111410] rounded-3xl px-8 sm:px-14 py-12 overflow-hidden text-center">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#7fe05b]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#7fe05b]/10 rounded-full blur-2xl pointer-events-none" />

            <span className="relative inline-block text-[#7fe05b] text-[12px] font-black uppercase tracking-widest mb-4 bg-[#7fe05b]/10 border border-[#7fe05b]/20 px-4 py-1.5 rounded-full">
              Portal Akademik
            </span>
            <h2 className="relative text-white text-[1.6rem] sm:text-[2.2rem] font-extrabold tracking-tight leading-tight max-w-xl mx-auto">
              Sudah punya akun? Masuk ke <span className="text-[#7fe05b]">Portal Siswa</span> sekarang
            </h2>
            <p className="relative text-white/50 text-[14px] mt-3 max-w-md mx-auto">
              Pantau kehadiran, lihat jadwal, dan akses semua layanan akademik dalam satu platform
            </p>
            <Link
              href="/login"
              className="
                relative inline-flex items-center gap-2.5 mt-8
                px-8 py-4 bg-[#7fe05b] hover:bg-[#6bcf49]
                text-[#111410] text-[14px] font-extrabold tracking-wide
                rounded-full transition-all duration-150 active:scale-95
                shadow-[0_4px_24px_rgba(127,224,91,0.4)]
              "
            >
              LOGIN SEKARANG
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="px-6 sm:px-10 lg:px-20 py-8 border-t border-black/8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {LOGO_SRC && <img src={LOGO_SRC} alt="Logo" className="w-7 h-7 object-contain" />}
            <p className="text-[13px] font-bold text-[#1a1a1a]">SMK Citra Negara</p>
          </div>
          <p className="text-[12px] text-[#9a9a9a] text-center">
            © 2025 SMK Citra Negara. Academic Portal v1.0
          </p>
          <Link href="/login" className="text-[12.5px] font-bold text-[#4a9e2f] hover:underline">
            Login Portal →
          </Link>
        </div>
      </footer>

    </div>
  );
}

// ─────────────────────────────────────────────
// KOMPONEN KARTU JURUSAN
// ─────────────────────────────────────────────
function JurusanCard({ jurusan }: { jurusan: typeof JURUSAN_LIST[0] }) {
  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Accent bar atas */}
      <div className="h-1.5 w-full" style={{ background: jurusan.accent }} />

      {/* ── CONTAINER GAMBAR JURUSAN ──
          Untuk mengganti gambar:
          1. Simpan foto ke /public/images/
          2. Ubah nilai "image" di JURUSAN_LIST di atas
          3. Gambar akan otomatis tampil di sini
      ── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f0f0ea]">
        {jurusan.image ? (
          <img
            src={jurusan.image}
            alt={jurusan.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Placeholder jika gambar belum diisi */
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: jurusan.accentLight }}
          >
            <span className="text-4xl">{jurusan.icon}</span>
            <p className="text-[12px] font-bold text-[#9a9a9a]">Tambah foto {jurusan.singkatan}</p>
            <p className="text-[10.5px] text-[#b0b0a8] px-4 text-center">
              Simpan ke: /public/images/jurusan-{jurusan.id}.jpg
            </p>
          </div>
        )}
        {/* ── LOGO JURUSAN (pojok kiri atas) ──
            Untuk insert logo PNG:
            Simpan file ke /public/images/logo-{id}.png
            Contoh: /public/images/logo-dkv.png
            Ukuran rekomendasi: min 80x80px, format PNG transparan
        ── */}
        <div className="absolute top-3 left-3 w-10 h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
          {jurusan.logo ? (
            <img
              src={jurusan.logo}
              alt={`Logo ${jurusan.singkatan}`}
              className="w-full h-full object-contain"
            />
          ) : (
            /* Fallback teks jika logo belum diisi */
            <div
              className="w-full h-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: jurusan.accent }}
            >
              {jurusan.singkatan}
            </div>
          )}
        </div>
      </div>

      {/* Konten teks */}
      <div className="p-5">
        <h3 className="font-extrabold text-[14px] text-[#111410] leading-snug mb-2">
          {jurusan.nama}{" "}
          <span className="font-black" style={{ color: jurusan.accent }}>({jurusan.singkatan})</span>
        </h3>
        <p className="text-[12.5px] text-[#6b6b6b] leading-relaxed">
          {jurusan.deskripsi}
        </p>
      </div>

      {/* Bottom accent */}
      <div
        className="mx-5 mb-5 h-0.5 rounded-full opacity-20"
        style={{ background: jurusan.accent }}
      />
    </div>
  );
}
