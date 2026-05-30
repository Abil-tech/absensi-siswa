import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import Absensi from "@/models/absensi";

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["siswa"]);
    await dbConnect();

    // Ambil data siswa berdasarkan userId dari session
    const siswa = await Siswa.findOne({ userId: session.user.id })
      .populate("kelas", "nama")
      .lean();

    if (!siswa) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    }

    // Ambil semua absensi siswa ini
    const absensiList = await Absensi.find({ siswa: siswa._id })
      .sort({ tanggal: -1 })
      .lean();

    // Hitung statistik bulanan (bulan ini)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const abensiBulanIni = absensiList.filter(
      (a) => new Date(a.tanggal) >= startOfMonth
    );

    const stats = {
      hadir: abensiBulanIni.filter((a) => a.status === "hadir").length,
      sakit: abensiBulanIni.filter((a) => a.status === "sakit").length,
      izin:  abensiBulanIni.filter((a) => a.status === "izin").length,
      total: abensiBulanIni.length,
    };

    // Cek apakah sudah absen hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sudahAbsenHariIni = absensiList.some(
      (a) => new Date(a.tanggal).getTime() === today.getTime()
    );

    // Cek apakah masih bisa absen (sebelum 06.40)
    const jam = now.getHours();
    const menit = now.getMinutes();
    const bisaAbsen = (jam < 6) || (jam === 6 && menit <= 40);

    return NextResponse.json({
      siswa: {
        id:           siswa._id.toString(),
        nama:         (siswa as any).userId,
        nis:          siswa.nis,
        nisn:         siswa.nisn,
        kelas:        (siswa.kelas as any)?.nama ?? "—",
        jurusan:      siswa.jurusan,
        jenisKelamin: siswa.jenisKelamin,
      },
      stats,
      sudahAbsenHariIni,
      bisaAbsen,
      absensi: absensiList.map((a) => ({
        id:         a._id.toString(),
        tanggal:    a.tanggal,
        waktu:      a.waktu,
        status:     a.status,
        keterangan: a.keterangan,
        file:       a.file,
      })),
    });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/siswa/absensi]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}