import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Absensi from "@/models/absensi";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Hitung user per role
    const [totalSiswaUser, totalWalas, totalBK, totalAdmin] = await Promise.all([
      User.countDocuments({ role: "siswa" }),
      User.countDocuments({ role: "walas" }),
      User.countDocuments({ role: "bk" }),
      User.countDocuments({ role: "admin" }),
    ]);

    // Anggota staf = walas + bk + admin
    const totalStaf = totalWalas + totalBK + totalAdmin;
    // Staf & Admin = bk + admin
    const totalStafAdmin = totalBK + totalAdmin;

    // Total kelas
    const totalKelas = await Kelas.countDocuments();

    // Jurusan unik — ambil dari kata tengah nama kelas (index 1)
    const kelasList = await Kelas.find().lean();
    const jurusanSet = new Set(
      kelasList
        .map((k) => k.nama.split(" ")[1])
        .filter(Boolean)
    );
    const totalJurusan = jurusanSet.size;

    // Total siswa (dari model Siswa, bukan User)
    const totalSiswa = await Siswa.countDocuments();

    // Absensi hari ini
    const absensiHariIni = await Absensi.find({
      tanggal: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    const hadir     = absensiHariIni.filter((a) => a.status === "hadir").length;
    const terlambat = absensiHariIni.filter((a) => a.status === "terlambat").length;
    const sakit     = absensiHariIni.filter((a) => a.status === "sakit").length;
    const izin      = absensiHariIni.filter((a) => a.status === "izin").length;
    const tidakHadir = sakit + izin + (totalSiswa - absensiHariIni.length);
    const persentaseHadir = totalSiswa > 0
      ? Math.round(((hadir + terlambat) / totalSiswa) * 100)
      : 0;

    return NextResponse.json({
      siswa:          totalSiswa,
      staf:           totalStaf,
      walas:          totalWalas,
      bk:             totalBK,
      admin:          totalAdmin,
      stafAdmin:      totalStafAdmin,
      kelas:          totalKelas,
      jurusan:        totalJurusan,
      guruAktif:      totalWalas,
      kehadiran: {
        persentase:  persentaseHadir,
        hadir,
        terlambat,
        tidakHadir,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "Unauthorized" || err.message === "Forbidden") {
        return NextResponse.json({ error: err.message }, { status: 401 });
      }
    }
    console.error("[GET /api/admin/dashboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}