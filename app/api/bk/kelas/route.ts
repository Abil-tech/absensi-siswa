import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Absensi from "@/models/absensi";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["bk"]);
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const tanggalParam = searchParams.get("tanggal");

    const tanggal = tanggalParam ? new Date(tanggalParam) : new Date();
    const startOfDay = new Date(tanggal);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(tanggal);
    endOfDay.setHours(23, 59, 59, 999);

    // Ambil semua kelas beserta wali kelas
    const kelasList = await Kelas.find().lean();

    if (kelasList.length === 0) {
      return NextResponse.json({ kelas: [] });
    }

    // Ambil nama wali kelas — filter undefined secara type-safe
    const waliIds = kelasList
      .map((k) => k.waliKelas)
      .filter((id): id is mongoose.Types.ObjectId => id != null);
    const waliUsers = await User.find({ _id: { $in: waliIds } }).lean();
    const waliMap = new Map(waliUsers.map((u) => [u._id.toString(), u.name]));

    // Ambil semua siswa
    const semuaSiswa = await Siswa.find().lean();

    // Ambil nama siswa dari User
    const userIds = semuaSiswa.map((s) => s.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    // Ambil absensi hari ini
    const absensiList = await Absensi.find({
      tanggal: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    const absensiMap = new Map(
      absensiList.map((a) => [a.siswa.toString(), a])
    );

    // Susun per kelas
    const result = kelasList.map((kelas) => {
      const siswaKelas = semuaSiswa.filter(
        (s) => s.kelas.toString() === kelas._id.toString()
      );

      const siswaData = siswaKelas.map((s) => {
        const absensi = absensiMap.get(s._id.toString());
        const nama = userMap.get(s.userId.toString()) ?? "-";

        return {
          id:     s._id.toString(),
          nis:    s.nis,
          nama,
          status: absensi?.status ?? null,
          waktu:  absensi?.waktu ?? "-",
        };
      });

      const hadir      = siswaData.filter((s) => s.status === "hadir").length;
      const terlambat  = siswaData.filter((s) => s.status === "terlambat").length;
      const sakit      = siswaData.filter((s) => s.status === "sakit").length;
      const izin       = siswaData.filter((s) => s.status === "izin").length;
      const belumAbsen = siswaData.filter((s) => s.status === null).length;

      return {
        id:        kelas._id.toString(),
        nama:      kelas.nama,
        waliKelas: kelas.waliKelas
          ? (waliMap.get(kelas.waliKelas.toString()) ?? null)
          : null,
        total:     siswaKelas.length,
        hadir,
        terlambat,
        sakit,
        izin,
        belumAbsen,
        siswa: siswaData,
      };
    });

    return NextResponse.json({ tanggal: tanggal.toISOString(), kelas: result });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "Unauthorized" || err.message === "Forbidden") {
        return NextResponse.json({ error: err.message }, { status: 401 });
      }
    }
    console.error("[GET /api/bk/kelas]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}