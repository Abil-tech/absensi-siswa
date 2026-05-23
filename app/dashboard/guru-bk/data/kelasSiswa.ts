// data/kelasSiswa.ts
// Data terpusat untuk semua kelas dan siswa

export type StatusType = "Hadir" | "Izin" | "Sakit" | "Terlambat" | "Dispen" | "Alfa";

export interface Siswa {
  id: string;
  nama: string;
  initials: string;
  status: StatusType;
  checkin: string;
}

export interface Kelas {
  id: string;
  nama: string;
  tingkat: "X" | "XI" | "XII";
  jurusan: string;
  siswa: Siswa[];
}

export const DATA_KELAS: Kelas[] = [
  {
    id: "x-pplg-1",
    nama: "X PPLG 1",
    tingkat: "X",
    jurusan: "PPLG",
    siswa: [
      { id: "202501001", nama: "Adi Nugroho",       initials: "AN", status: "Hadir",     checkin: "07:20 AM" },
      { id: "202501002", nama: "Bella Permata",      initials: "BP", status: "Hadir",     checkin: "07:25 AM" },
      { id: "202501003", nama: "Cahyo Wibowo",       initials: "CW", status: "Terlambat", checkin: "08:10 AM" },
      { id: "202501004", nama: "Dewi Rahayu",        initials: "DR", status: "Hadir",     checkin: "07:18 AM" },
      { id: "202501005", nama: "Eko Prasetyo",       initials: "EP", status: "Izin",      checkin: "—" },
      { id: "202501006", nama: "Fitri Handayani",    initials: "FH", status: "Hadir",     checkin: "07:30 AM" },
      { id: "202501007", nama: "Galih Santoso",      initials: "GS", status: "Sakit",     checkin: "—" },
      { id: "202501008", nama: "Hana Maharani",      initials: "HM", status: "Hadir",     checkin: "07:22 AM" },
      { id: "202501009", nama: "Irfan Maulana",      initials: "IM", status: "Dispen",    checkin: "—" },
      { id: "202501010", nama: "Julia Sari",         initials: "JS", status: "Hadir",     checkin: "07:28 AM" },
    ],
  },
  {
    id: "x-pplg-2",
    nama: "X PPLG 2",
    tingkat: "X",
    jurusan: "PPLG",
    siswa: [
      { id: "202502001", nama: "Kevin Ardian",       initials: "KA", status: "Hadir",     checkin: "07:15 AM" },
      { id: "202502002", nama: "Lina Octavia",       initials: "LO", status: "Alfa",      checkin: "—" },
      { id: "202502003", nama: "Mario Satria",       initials: "MS", status: "Hadir",     checkin: "07:20 AM" },
      { id: "202502004", nama: "Nadia Putri",        initials: "NP", status: "Hadir",     checkin: "07:33 AM" },
      { id: "202502005", nama: "Oscar Hidayat",      initials: "OH", status: "Terlambat", checkin: "08:05 AM" },
      { id: "202502006", nama: "Putri Anjani",       initials: "PA", status: "Hadir",     checkin: "07:19 AM" },
      { id: "202502007", nama: "Qori Ramadhan",      initials: "QR", status: "Izin",      checkin: "—" },
      { id: "202502008", nama: "Rizky Firmansyah",   initials: "RF", status: "Hadir",     checkin: "07:27 AM" },
      { id: "202502009", nama: "Sinta Dewi",         initials: "SD", status: "Hadir",     checkin: "07:31 AM" },
      { id: "202502010", nama: "Taufik Hidayat",     initials: "TH", status: "Sakit",     checkin: "—" },
    ],
  },
  {
    id: "xi-pplg-1",
    nama: "XI PPLG 1",
    tingkat: "XI",
    jurusan: "PPLG",
    siswa: [
      { id: "202401001", nama: "Aaron Montgomery",   initials: "AM", status: "Hadir",     checkin: "07:25 AM" },
      { id: "202401014", nama: "Beatrice Sullivan",  initials: "BS", status: "Hadir",     checkin: "07:42 AM" },
      { id: "202401022", nama: "Curtis Rhodes",      initials: "CR", status: "Izin",      checkin: "—" },
      { id: "202401045", nama: "Danielle Parker",    initials: "DP", status: "Terlambat", checkin: "08:15 AM" },
      { id: "202401056", nama: "Elias Thorne",       initials: "ET", status: "Hadir",     checkin: "07:12 AM" },
      { id: "202401063", nama: "Fiona Castillo",     initials: "FC", status: "Hadir",     checkin: "07:58 AM" },
      { id: "202401071", nama: "George Lawson",      initials: "GL", status: "Sakit",     checkin: "—" },
      { id: "202401089", nama: "Hannah Brooks",      initials: "HB", status: "Hadir",     checkin: "07:33 AM" },
      { id: "202401094", nama: "Ivan Mercer",        initials: "IM", status: "Terlambat", checkin: "08:02 AM" },
      { id: "202401102", nama: "Julia Sinclair",     initials: "JS", status: "Hadir",     checkin: "07:20 AM" },
    ],
  },
  {
    id: "xi-pplg-2",
    nama: "XI PPLG 2",
    tingkat: "XI",
    jurusan: "PPLG",
    siswa: [
      { id: "202403001", nama: "Ahmad Fauzi",        initials: "AF", status: "Hadir",     checkin: "07:18 AM" },
      { id: "202403002", nama: "Bayu Setiawan",      initials: "BS", status: "Dispen",    checkin: "—" },
      { id: "202403003", nama: "Citra Lestari",      initials: "CL", status: "Hadir",     checkin: "07:24 AM" },
      { id: "202403004", nama: "Dika Pratama",       initials: "DP", status: "Alfa",      checkin: "—" },
      { id: "202403005", nama: "Erna Susanti",       initials: "ES", status: "Hadir",     checkin: "07:16 AM" },
      { id: "202403006", nama: "Fajar Nugroho",      initials: "FN", status: "Hadir",     checkin: "07:29 AM" },
      { id: "202403007", nama: "Gita Puspita",       initials: "GP", status: "Izin",      checkin: "—" },
      { id: "202403008", nama: "Hendra Kusuma",      initials: "HK", status: "Hadir",     checkin: "07:35 AM" },
      { id: "202403009", nama: "Indah Permatasari",  initials: "IP", status: "Hadir",     checkin: "07:22 AM" },
      { id: "202403010", nama: "Joko Widodo",        initials: "JW", status: "Terlambat", checkin: "08:08 AM" },
    ],
  },
  {
    id: "xii-pplg-1",
    nama: "XII PPLG 1",
    tingkat: "XII",
    jurusan: "PPLG",
    siswa: [
      { id: "202301001", nama: "Kelvin Pratama",     initials: "KP", status: "Hadir",     checkin: "07:10 AM" },
      { id: "202301002", nama: "Layla Indah",        initials: "LI", status: "Hadir",     checkin: "07:14 AM" },
      { id: "202301003", nama: "Mirza Fauzan",       initials: "MF", status: "Hadir",     checkin: "07:19 AM" },
      { id: "202301004", nama: "Nisa Rahmawati",     initials: "NR", status: "Sakit",     checkin: "—" },
      { id: "202301005", nama: "Omar Hakim",         initials: "OH", status: "Hadir",     checkin: "07:22 AM" },
      { id: "202301006", nama: "Prita Maharani",     initials: "PM", status: "Hadir",     checkin: "07:30 AM" },
      { id: "202301007", nama: "Qalbi Nurfauzan",    initials: "QN", status: "Izin",      checkin: "—" },
      { id: "202301008", nama: "Rafi Akbar",         initials: "RA", status: "Hadir",     checkin: "07:17 AM" },
      { id: "202301009", nama: "Salma Aulia",        initials: "SA", status: "Terlambat", checkin: "08:20 AM" },
      { id: "202301010", nama: "Tegar Maulana",      initials: "TM", status: "Hadir",     checkin: "07:25 AM" },
    ],
  },
  {
    id: "xii-pplg-2",
    nama: "XII PPLG 2",
    tingkat: "XII",
    jurusan: "PPLG",
    siswa: [
      { id: "202302001", nama: "Ulfa Fitriani",      initials: "UF", status: "Hadir",     checkin: "07:20 AM" },
      { id: "202302002", nama: "Vino Prasetya",      initials: "VP", status: "Alfa",      checkin: "—" },
      { id: "202302003", nama: "Wulan Sari",         initials: "WS", status: "Hadir",     checkin: "07:28 AM" },
      { id: "202302004", nama: "Xander Putra",       initials: "XP", status: "Hadir",     checkin: "07:15 AM" },
      { id: "202302005", nama: "Yuni Kartika",       initials: "YK", status: "Dispen",    checkin: "—" },
      { id: "202302006", nama: "Zaki Ramdani",       initials: "ZR", status: "Hadir",     checkin: "07:33 AM" },
      { id: "202302007", nama: "Agus Setiawan",      initials: "AS", status: "Hadir",     checkin: "07:21 AM" },
      { id: "202302008", nama: "Bintang Cahaya",     initials: "BC", status: "Izin",      checkin: "—" },
      { id: "202302009", nama: "Cindy Permata",      initials: "CP", status: "Hadir",     checkin: "07:26 AM" },
      { id: "202302010", nama: "Danu Wirawan",       initials: "DW", status: "Sakit",     checkin: "—" },
    ],
  },
];

export const STATUS_STYLE: Record<StatusType, string> = {
  Hadir:     "bg-[#7fe05b] text-[#111410]",
  Izin:      "border border-gray-300 text-gray-700 bg-white",
  Sakit:     "bg-red-100 text-red-700",
  Terlambat: "bg-[#111410] text-[#7fe05b]",
  Dispen:    "bg-blue-100 text-blue-700",
  Alfa:      "bg-orange-100 text-orange-700",
};

export const AVATAR_COLORS = [
  "#3b82f6","#8b5cf6","#f59e0b","#ef4444",
  "#06b6d4","#10b981","#f97316","#6366f1",
  "#ec4899","#14b8a6",
];
