config({ path: ".env.local" }); 
/**
 * Seed script: buat user pertama di MongoDB
 * Jalankan: node scripts/seed-admin.mjs
 */
import { config } from "dotenv";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

const users = [
  {
    name: "admin",
    userId: "admin",
    password: "4dm1n123",
    role: "admin",
  },
  {
    name: "Siswa Test",
    userId: "20240001",
    password: "siswa123",
    role: "siswa",
  },
  // Tambah user lain di sini jika perlu:
  { name: "Wali Kelas 10A", userId: "WL001", password: "walas123", role: "walas" },
  // { name: "Guru BK", userId: "BK001", password: "bk123", role: "bk" },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("✅ Terhubung ke MongoDB:", MONGODB_URI);

  const col = client.db().collection("users");

  for (const u of users) {
    const exists = await col.findOne({ userId: u.userId });
    if (exists) {
      console.log(`⚠️  User dengan ID ${u.userId} sudah ada, skip.`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await col.insertOne({ ...u, password: hashed });
    console.log(`✅ Berhasil dibuat: ${u.name} (role: ${u.role})`);
  }

  await client.close();
  console.log("🏁 Selesai.");
}

main().catch((e) => { console.error(e); process.exit(1); });
