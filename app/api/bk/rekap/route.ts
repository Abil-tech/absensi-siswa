import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Absensi from "@/models/absensi";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import User from "@/models/user";

function res(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/**
 * Hitung jumlah hari sekolah (Senin–Jumat) dalam rentang [start, end] inklusif.
 */
function hitungHariSekolah(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay(); // 0 = Minggu, 6 = Sabtu
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/**
 * Ambil "jurusan" dari nama kelas, contoh:
 * "11 PPLG 1" -> "PPLG"
 * "X DKV 2"   -> "DKV"
 */
function parseJurusan(namaKelas: string): string {
  const parts = namaKelas.trim().split(/\s+/);
  // bagian tengah dianggap jurusan (buang tingkat di awal & nomor urut di akhir)
  return parts.slice(1, -1).join(" ") || parts[1] || "";
}

// GET /api/bk/rekap?start=2026-06-01&end=2026-06-30
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "bk") return res("Unauthorized", 401);

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const startStr = searchParams.get("start");
    const endStr   = searchParams.get("end");

    if (!startStr || !endStr) {
      return res("Parameter 'start' dan 'end' wajib diisi (format YYYY-MM-DD)", 400);
    }

    const start = new Date(`${startStr}T00:00:00.000Z`);
    const end   = new Date(`${endStr}T23:59:59.999Z`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res("Rentang tanggal tidak valid", 400);
    }

    const hariSekolah = hitungHariSekolah(start, end);

    // ── Ambil semua siswa beserta nama (dari User) dan kelas ──
    const siswaList = await Siswa.find({})
      .populate<{ userId: { name: string } | null }>("userId", "name")
      .populate<{ kelas: { _id: mongoose.Types.ObjectId; nama: string } | null }>("kelas", "nama")
      .select("userId kelas")
      .lean<{
        _id: mongoose.Types.ObjectId;
        userId: { name: string } | null;
        kelas: { _id: mongoose.Types.ObjectId; nama: string } | null;
      }[]>();

    // ── Aggregate jumlah absensi per siswa per status ──
    const agg = await Absensi.aggregate<{
      _id: mongoose.Types.ObjectId; // siswa id
      status: string;
      count: number;
    }>([
      { $match: { tanggal: { $gte: start, $lte: end } } },
      { $group: { _id: { siswa: "$siswa", status: "$status" }, count: { $sum: 1 } } },
      { $project: { siswa: "$_id.siswa", status: "$_id.status", count: 1, _id: 0 } },
    ]);

    // Map: siswaId -> { hadir, terlambat, sakit, izin }
    const countMap = new Map<string, Record<string, number>>();
    for (const row of agg as unknown as { siswa: mongoose.Types.ObjectId; status: string; count: number }[]) {
      const key = row.siswa.toString();
      if (!countMap.has(key)) countMap.set(key, {});
      countMap.get(key)![row.status] = row.count;
    }

    // ── Susun hasil akhir ──
    const rekap = siswaList.map((s) => {
      const counts    = countMap.get(s._id.toString()) ?? {};
      const hadir     = (counts.hadir ?? 0) + (counts.terlambat ?? 0); // terlambat dianggap hadir
      const sakit     = counts.sakit ?? 0;
      const izin      = counts.izin  ?? 0;
      const totalAbsen = (counts.hadir ?? 0) + (counts.terlambat ?? 0) + sakit + izin;
      const alfa      = Math.max(hariSekolah - totalAbsen, 0);

      const namaKelas = s.kelas?.nama ?? "-";

      return {
        nama:    s.userId?.name ?? "-",
        kelas:   namaKelas,
        jurusan: namaKelas !== "-" ? parseJurusan(namaKelas) : "-",
        hadir,
        sakit,
        izin,
        alfa,
      };
    });

    // Urutkan berdasarkan nama kelas, lalu nama siswa
    rekap.sort((a, b) =>
      a.kelas === b.kelas ? a.nama.localeCompare(b.nama) : a.kelas.localeCompare(b.kelas)
    );

    return NextResponse.json(
      { rekap, hariSekolah, periode: { start: startStr, end: endStr } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/bk/rekap]", error);
    return res("Gagal mengambil rekap absensi", 500);
  }
}