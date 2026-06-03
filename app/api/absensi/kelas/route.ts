import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Kelas from "@/models/kelas";
import Siswa from "@/models/siswa";
import Absensi from "@/models/absensi";

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["walas"]);

    await dbConnect();

    // Ambil kelas yang dipegang walas ini
    const kelas = await Kelas.findOne({ waliKelas: session.user.id });
    if (!kelas) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan untuk akun ini" },
        { status: 404 }
      );
    }

    // Ambil semua siswa di kelas ini
    const siswaDiKelas = await Siswa.find({ kelas: kelas._id })
      .populate("userId", "name")
      .lean();

    // Normalisasi tanggal hari ini ke 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ambil absensi hari ini untuk semua siswa di kelas ini
    const siswaIds = siswaDiKelas.map((s) => s._id);
    const absensiHariIni = await Absensi.find({
      siswa: { $in: siswaIds },
      tanggal: today,
    }).lean();

    // Buat map siswaId → absensi
    const absensiMap = new Map(
      absensiHariIni.map((a) => [a.siswa.toString(), a])
    );

    // Gabungkan data siswa dengan status absensi hari ini
    const data = siswaDiKelas.map((siswa) => {
      const absensi = absensiMap.get(siswa._id.toString());
      return {
        id: siswa._id.toString(),
        nis: siswa.nis,
        nama: (siswa.userId as any)?.name ?? "—",
        status: absensi?.status ?? null,
        waktu: absensi?.waktu ?? "—",
        keterangan: absensi?.keterangan ?? "—",
      };
    });

    return NextResponse.json({
      kelas: {
        id: kelas._id.toString(),
        nama: kelas.nama,
      },
      tanggal: today.toISOString(),
      siswa: data,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/absensi/kelas]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}