import { MongoClient, ObjectId } from "mongodb";
import { config } from "dotenv";

config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI tidak ditemukan di .env.local");

// ─────────────────────────────────────────────
// DATA KELAS
// Tambah atau edit kelas di sini
// ─────────────────────────────────────────────
const KELAS_LIST = [
  { nama: "10 PPLG 1" },
  { nama: "10 PPLG 2" },
  { nama: "11 PPLG 1" },
  { nama: "11 PPLG 2" },
  { nama: "12 PPLG 1" },
  { nama: "12 PPLG 2" },
  
  { nama: "10 DKV 1" },
  { nama: "10 DKV 2"  },
  { nama: "10 DKV PLUS" },
  { nama: "11 DKV 1" },
  { nama: "11 DKV 2" },
  { nama: "11 DKV PLUS" },
  { nama: "12 DKV 1" },
  { nama: "12 DKV 2" },
  { nama: "12 DKV PLUS" },
  
  { nama: "10 PM 1" },
  { nama: "10 PM 2" },
  { nama: "11 PM 1" },
  { nama: "11 PM 2" },
  { nama: "12 PM 1" },
  { nama: "12 PM 2" },

  { nama: "10 TJKT 1" },
  { nama: "10 TJKT 2" },
  { nama: "11 TJKT 1" },
  { nama: "11 TJKT 2" },
  { nama: "12 TJKT 1" },
  { nama: "12 TJKT 2" },

  { nama: "10 MPLB 1" },
  { nama: "10 MPLB 2" },
  { nama: "11 MPLB 1" },
  { nama: "11 MPLB 2" },
  { nama: "12 MPLB 1" },
  { nama: "12 MPLB 2" },
  
];

// ─────────────────────────────────────────────
// DATA SISWA
// Sesuaikan dengan kelas yang ada di KELAS_LIST
// ─────────────────────────────────────────────
const SISWA_LIST = [
  {
    userUserId: "20240001", // userId di collection users (untuk cari _id)
    nisn: "0123456789",
    nis: "24001",
    kelasNama: "11 PPLG 1",
    jurusan: "PPLG",
    jenisKelamin: "L",
    tanggalLahir: new Date("2006-05-10"),
    alamat: "Jl. Contoh No. 1, Jakarta",
    noTelp: "081234567890",
  },
  // Tambah siswa lain di sini dengan format yang sama
];

// Walas yang akan di-assign ke kelas
// Format: { kelasNama: "...", walasUserId: "..." }
const WALAS_ASSIGN = [
  { kelasNama: "11 PPLG 1", walasUserId: "WL11PPLG1" },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("✅ Terhubung ke MongoDB");

  const db = client.db();
  const kelasCol  = db.collection("kelas");
  const siswaCol  = db.collection("siswas");
  const userCol   = db.collection("users");

  // ── Seed Kelas ──
  console.log("\n── Seed Kelas ──");
  const kelasIdMap = new Map(); // nama → _id

  for (const k of KELAS_LIST) {
    const exists = await kelasCol.findOne({ nama: k.nama });
    if (exists) {
      console.log(`⚠️  Kelas "${k.nama}" sudah ada, skip.`);
      kelasIdMap.set(k.nama, exists._id);
      continue;
    }
    const result = await kelasCol.insertOne({ nama: k.nama, waliKelas: null, createdAt: new Date(), updatedAt: new Date() });
    kelasIdMap.set(k.nama, result.insertedId);
    console.log(`✅ Kelas "${k.nama}" dibuat`);
  }

  // ── Assign Walas ke Kelas ──
  console.log("\n── Assign Walas ──");
  for (const assign of WALAS_ASSIGN) {
    const walas = await userCol.findOne({ userId: assign.walasUserId });
    if (!walas) {
      console.log(`⚠️  Walas userId "${assign.walasUserId}" tidak ditemukan, skip.`);
      continue;
    }
    const kelasId = kelasIdMap.get(assign.kelasNama);
    if (!kelasId) {
      console.log(`⚠️  Kelas "${assign.kelasNama}" tidak ditemukan, skip.`);
      continue;
    }
    await kelasCol.updateOne(
      { _id: kelasId },
      { $set: { waliKelas: walas._id, updatedAt: new Date() } }
    );
    console.log(`✅ Walas "${assign.walasUserId}" di-assign ke kelas "${assign.kelasNama}"`);
  }

  // ── Seed Siswa ──
  console.log("\n── Seed Siswa ──");
  for (const s of SISWA_LIST) {
    const user = await userCol.findOne({ userId: s.userUserId });
    if (!user) {
      console.log(`⚠️  User userId "${s.userUserId}" tidak ditemukan, skip.`);
      continue;
    }

    const kelasId = kelasIdMap.get(s.kelasNama);
    if (!kelasId) {
      console.log(`⚠️  Kelas "${s.kelasNama}" tidak ditemukan, skip.`);
      continue;
    }

    const exists = await siswaCol.findOne({ $or: [{ nisn: s.nisn }, { nis: s.nis }] });
    if (exists) {
      console.log(`⚠️  Siswa NISN "${s.nisn}" / NIS "${s.nis}" sudah ada, skip.`);
      continue;
    }

    await siswaCol.insertOne({
      userId:       user._id,
      nisn:         s.nisn,
      nis:          s.nis,
      kelas:        kelasId,
      jurusan:      s.jurusan,
      jenisKelamin: s.jenisKelamin,
      tanggalLahir: s.tanggalLahir,
      alamat:       s.alamat,
      noTelp:       s.noTelp,
      createdAt:    new Date(),
      updatedAt:    new Date(),
    });
    console.log(`✅ Siswa NIS "${s.nis}" dibuat`);
  }

  await client.close();
  console.log("\n🏁 Selesai.");
}

main().catch((e) => { console.error(e); process.exit(1); });
