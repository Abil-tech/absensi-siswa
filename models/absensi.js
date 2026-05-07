/**
 * ============================================================
 *  SISTEM ABSENSI SISWA - MongoDB
 *  Menggunakan: mongoose (ODM untuk MongoDB)
 *  Jalankan: node absensi_siswa.js
 * ============================================================
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────
//  KONEKSI DATABASE
// ─────────────────────────────────────────────
const MONGO_URI = "mongodb://localhost:27017/absensi_sekolah";

async function connect() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Terhubung ke MongoDB:", MONGO_URI);
  } catch (err) {
    console.error("❌ Gagal terhubung:", err.message);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────
//  SCHEMA & MODEL
// ─────────────────────────────────────────────

// 1. Schema Kelas
const kelasSchema = new mongoose.Schema(
  {
    nama_kelas: { type: String, required: true, unique: true, trim: true }, // contoh: "X IPA 1"
    tingkat: { type: String, enum: ["X", "XI", "XII"], required: true },
    jurusan: {
      type: String,
      enum: ["IPA", "IPS", "Bahasa", "Umum"],
      default: "Umum",
    },
    wali_kelas: { type: String, required: true },
    tahun_ajaran: { type: String, required: true }, // contoh: "2025/2026"
  },
  { timestamps: true }
);

// 2. Schema Siswa
const siswaSchema = new mongoose.Schema(
  {
    nis: { type: String, required: true, unique: true, trim: true }, // Nomor Induk Siswa
    nama: { type: String, required: true, trim: true },
    jenis_kelamin: { type: String, enum: ["L", "P"], required: true },
    tanggal_lahir: { type: Date, required: true },
    alamat: { type: String },
    no_telepon: { type: String },
    kelas: { type: mongoose.Schema.Types.ObjectId, ref: "Kelas", required: true },
    foto: { type: String }, // URL/path foto
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: usia siswa
siswaSchema.virtual("usia").get(function () {
  const today = new Date();
  const lahir = new Date(this.tanggal_lahir);
  return today.getFullYear() - lahir.getFullYear();
});

// 3. Schema Absensi
const absensiSchema = new mongoose.Schema(
  {
    siswa: { type: mongoose.Schema.Types.ObjectId, ref: "Siswa", required: true },
    kelas: { type: mongoose.Schema.Types.ObjectId, ref: "Kelas", required: true },
    tanggal: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Hadir", "Sakit", "Izin", "Alpha"],
      required: true,
    },
    keterangan: { type: String, default: "" },
    dicatat_oleh: { type: String, required: true }, // nama guru/admin
    jam_masuk: { type: String }, // format "HH:MM"
  },
  { timestamps: true }
);

// Index agar tidak ada duplikat absensi per siswa per hari
absensiSchema.index({ siswa: 1, tanggal: 1 }, { unique: true });

// ─── Inisialisasi Model ───
const Kelas = mongoose.model("Kelas", kelasSchema);
const Siswa = mongoose.model("Siswa", siswaSchema);
const Absensi = mongoose.model("Absensi", absensiSchema);

// ─────────────────────────────────────────────
//  FUNGSI KELAS
// ─────────────────────────────────────────────

async function tambahKelas(data) {
  const kelas = new Kelas(data);
  await kelas.save();
  console.log(`✅ Kelas "${kelas.nama_kelas}" berhasil ditambahkan.`);
  return kelas;
}

async function semuaKelas() {
  return await Kelas.find().sort({ nama_kelas: 1 });
}

// ─────────────────────────────────────────────
//  FUNGSI SISWA
// ─────────────────────────────────────────────

async function tambahSiswa(data) {
  const siswa = new Siswa(data);
  await siswa.save();
  console.log(`✅ Siswa "${siswa.nama}" (NIS: ${siswa.nis}) berhasil ditambahkan.`);
  return siswa;
}

async function cariSiswaByNIS(nis) {
  return await Siswa.findOne({ nis }).populate("kelas");
}

async function cariSiswaByKelas(kelasId) {
  return await Siswa.find({ kelas: kelasId, aktif: true })
    .populate("kelas")
    .sort({ nama: 1 });
}

async function updateSiswa(nis, updateData) {
  const siswa = await Siswa.findOneAndUpdate({ nis }, updateData, { new: true });
  if (siswa) console.log(`✅ Data siswa "${siswa.nama}" diperbarui.`);
  return siswa;
}

async function hapusSiswa(nis) {
  // Soft delete — tandai tidak aktif
  const siswa = await Siswa.findOneAndUpdate(
    { nis },
    { aktif: false },
    { new: true }
  );
  if (siswa) console.log(`🗑️  Siswa "${siswa.nama}" dinonaktifkan.`);
  return siswa;
}

// ─────────────────────────────────────────────
//  FUNGSI ABSENSI
// ─────────────────────────────────────────────

async function catatAbsensi(data) {
  try {
    // Normalisasi tanggal ke tengah malam
    const tgl = new Date(data.tanggal);
    tgl.setHours(0, 0, 0, 0);
    data.tanggal = tgl;

    const absensi = new Absensi(data);
    await absensi.save();
    console.log(`✅ Absensi tercatat untuk siswa ID: ${data.siswa} | Status: ${data.status}`);
    return absensi;
  } catch (err) {
    if (err.code === 11000) {
      console.warn("⚠️  Absensi sudah tercatat untuk siswa ini hari ini.");
    } else {
      throw err;
    }
  }
}

async function updateAbsensi(siswaId, tanggal, updateData) {
  const tgl = new Date(tanggal);
  tgl.setHours(0, 0, 0, 0);

  const absensi = await Absensi.findOneAndUpdate(
    { siswa: siswaId, tanggal: tgl },
    updateData,
    { new: true }
  );
  if (absensi) console.log(`✅ Absensi diperbarui → Status: ${absensi.status}`);
  return absensi;
}

async function absensiHariIni(kelasId) {
  const hari = new Date();
  hari.setHours(0, 0, 0, 0);
  const besok = new Date(hari);
  besok.setDate(besok.getDate() + 1);

  return await Absensi.find({
    kelas: kelasId,
    tanggal: { $gte: hari, $lt: besok },
  })
    .populate("siswa", "nama nis")
    .sort({ "siswa.nama": 1 });
}

async function absensiSiswa(siswaId, bulan, tahun) {
  const awal = new Date(tahun, bulan - 1, 1);
  const akhir = new Date(tahun, bulan, 1);

  return await Absensi.find({
    siswa: siswaId,
    tanggal: { $gte: awal, $lt: akhir },
  }).sort({ tanggal: 1 });
}

// ─────────────────────────────────────────────
//  FUNGSI LAPORAN & STATISTIK
// ─────────────────────────────────────────────

async function rekapAbsensiKelas(kelasId, bulan, tahun) {
  const awal = new Date(tahun, bulan - 1, 1);
  const akhir = new Date(tahun, bulan, 1);

  const hasil = await Absensi.aggregate([
    {
      $match: {
        kelas: new mongoose.Types.ObjectId(kelasId),
        tanggal: { $gte: awal, $lt: akhir },
      },
    },
    {
      $group: {
        _id: { siswa: "$siswa", status: "$status" },
        jumlah: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.siswa",
        rekap: {
          $push: { status: "$_id.status", jumlah: "$jumlah" },
        },
      },
    },
    {
      $lookup: {
        from: "siswas",
        localField: "_id",
        foreignField: "_id",
        as: "info_siswa",
      },
    },
    { $unwind: "$info_siswa" },
    {
      $project: {
        nama: "$info_siswa.nama",
        nis: "$info_siswa.nis",
        rekap: 1,
      },
    },
    { $sort: { nama: 1 } },
  ]);

  return hasil;
}

async function siswaSeringAlpha(kelasId, minAlpha = 3) {
  const hasil = await Absensi.aggregate([
    {
      $match: {
        kelas: new mongoose.Types.ObjectId(kelasId),
        status: "Alpha",
      },
    },
    {
      $group: {
        _id: "$siswa",
        total_alpha: { $sum: 1 },
      },
    },
    { $match: { total_alpha: { $gte: minAlpha } } },
    {
      $lookup: {
        from: "siswas",
        localField: "_id",
        foreignField: "_id",
        as: "info_siswa",
      },
    },
    { $unwind: "$info_siswa" },
    {
      $project: {
        nama: "$info_siswa.nama",
        nis: "$info_siswa.nis",
        total_alpha: 1,
      },
    },
    { $sort: { total_alpha: -1 } },
  ]);

  return hasil;
}

async function persentaseKehadiran(siswaId, bulan, tahun) {
  const awal = new Date(tahun, bulan - 1, 1);
  const akhir = new Date(tahun, bulan, 1);

  const total = await Absensi.countDocuments({
    siswa: siswaId,
    tanggal: { $gte: awal, $lt: akhir },
  });

  const hadir = await Absensi.countDocuments({
    siswa: siswaId,
    status: "Hadir",
    tanggal: { $gte: awal, $lt: akhir },
  });

  const persen = total > 0 ? ((hadir / total) * 100).toFixed(2) : 0;
  return { total_hari: total, hadir, persentase: `${persen}%` };
}

// ─────────────────────────────────────────────
//  DEMO / SEEDING DATA CONTOH
// ─────────────────────────────────────────────

async function seedContoh() {
  console.log("\n📦 Menyiapkan data contoh...\n");

  // Tambah kelas
  const kelas = await tambahKelas({
    nama_kelas: "X IPA 1",
    tingkat: "X",
    jurusan: "IPA",
    wali_kelas: "Budi Santoso, S.Pd",
    tahun_ajaran: "2025/2026",
  });

  // Tambah siswa
  const s1 = await tambahSiswa({
    nis: "2025001",
    nama: "Andi Pratama",
    jenis_kelamin: "L",
    tanggal_lahir: new Date("2008-03-15"),
    alamat: "Jl. Merdeka No. 10, Jakarta",
    kelas: kelas._id,
  });

  const s2 = await tambahSiswa({
    nis: "2025002",
    nama: "Sari Dewi",
    jenis_kelamin: "P",
    tanggal_lahir: new Date("2008-07-22"),
    alamat: "Jl. Pahlawan No. 5, Jakarta",
    kelas: kelas._id,
  });

  // Catat absensi hari ini
  const hari = new Date();
  await catatAbsensi({
    siswa: s1._id,
    kelas: kelas._id,
    tanggal: hari,
    status: "Hadir",
    jam_masuk: "07:15",
    dicatat_oleh: "Admin",
  });

  await catatAbsensi({
    siswa: s2._id,
    kelas: kelas._id,
    tanggal: hari,
    status: "Sakit",
    keterangan: "Demam, lampiran surat dokter",
    dicatat_oleh: "Admin",
  });

  console.log("\n🎉 Data contoh berhasil dibuat!\n");

  // Tampilkan rekap absensi hari ini
  const rekapHariIni = await absensiHariIni(kelas._id);
  console.log("📋 Absensi Hari Ini:");
  rekapHariIni.forEach((a) => {
    console.log(`  • ${a.siswa.nama} (${a.siswa.nis}) → ${a.status}`);
  });

  // Persentase kehadiran
  const bulan = hari.getMonth() + 1;
  const tahun = hari.getFullYear();
  const stat = await persentaseKehadiran(s1._id, bulan, tahun);
  console.log(`\n📊 Statistik ${s1.nama}:`, stat);
}

// ─────────────────────────────────────────────
//  MAIN — JALANKAN DEMO
// ─────────────────────────────────────────────

async function main() {
  await connect();

  // Bersihkan koleksi lama (hanya untuk demo)
  await Kelas.deleteMany({});
  await Siswa.deleteMany({});
  await Absensi.deleteMany({});

  await seedContoh();

  console.log("\n✅ Script selesai. Koneksi ditutup.");
  await mongoose.disconnect();
}

main().catch(console.error);

// ─────────────────────────────────────────────
//  EKSPOR (gunakan sebagai modul jika perlu)
// ─────────────────────────────────────────────
module.exports = {
  Kelas,
  Siswa,
  Absensi,
  tambahKelas,
  semuaKelas,
  tambahSiswa,
  cariSiswaByNIS,
  cariSiswaByKelas,
  updateSiswa,
  hapusSiswa,
  catatAbsensi,
  updateAbsensi,
  absensiHariIni,
  absensiSiswa,
  rekapAbsensiKelas,
  siswaSeringAlpha,
  persentaseKehadiran,
};