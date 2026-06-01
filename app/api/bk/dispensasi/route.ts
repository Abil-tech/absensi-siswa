import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Dispensasi from "@/models/dispensasi";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["bk"]);
    await dbConnect();

    // Ambil semua dispensasi
    const dispensasiList = await Dispensasi.find()
      .sort({ createdAt: -1 })
      .lean();

    if (dispensasiList.length === 0) {
      return NextResponse.json({ dispensasi: [] });
    }

    // Kumpulkan siswaIds unik
    const siswaIds = [...new Set(dispensasiList.map((d) => d.siswa.toString()))];

    const siswaList = await Siswa.find({ _id: { $in: siswaIds } }).lean();
    const siswaMap = new Map(siswaList.map((s) => [s._id.toString(), s]));

    // Ambil nama user untuk setiap siswa
    const userIds = siswaList.map((s) => s.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    // Ambil nama kelas
    const kelasIds = [...new Set(siswaList.map((s) => s.kelas.toString()))];
    const kelasList = await Kelas.find({ _id: { $in: kelasIds } }).lean();
    const kelasMap = new Map(kelasList.map((k) => [k._id.toString(), k.nama]));

    return NextResponse.json({
      dispensasi: dispensasiList.map((d) => {
        const siswa = siswaMap.get(d.siswa.toString());
        const nama = siswa ? (userMap.get(siswa.userId.toString()) ?? "-") : "-";
        const nis = siswa?.nis ?? "-";
        const namaKelas = siswa ? (kelasMap.get(siswa.kelas.toString()) ?? "-") : "-";

        return {
          id:          d._id.toString(),
          file:        d.file,
          keterangan:  d.keterangan,
          statusWalas: d.statusWalas,
          statusBK:    d.statusBK,
          status:      d.status,
          catatanBK:   d.catatanBK ?? null,
          tanggal:     d.createdAt,
          siswa: {
            id:    d.siswa.toString(),
            nama,
            nis,
            kelas: namaKelas,
          },
        };
      }),
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "Unauthorized" || err.message === "Forbidden") {
        return NextResponse.json({ error: err.message }, { status: 401 });
      }
    }
    console.error("[GET /api/bk/dispensasi]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}