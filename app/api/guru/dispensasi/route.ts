import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Dispensasi from "@/models/dispensasi";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["walas"]);
    await dbConnect();

    // Cari kelas yang dipegang walas ini
    const kelas = await Kelas.findOne({ waliKelas: session.user.id }).lean();
    if (!kelas) {
      return NextResponse.json({ dispensasi: [] });
    }

    // Ambil semua siswa di kelas ini
    const siswaList = await Siswa.find({ kelas: kelas._id }).lean();
    if (siswaList.length === 0) {
      return NextResponse.json({ dispensasi: [] });
    }

    const siswaIds = siswaList.map((s) => s._id);

    // Map siswaId -> data siswa untuk lookup
    const siswaMap = new Map(
      siswaList.map((s) => [s._id.toString(), s])
    );

    // Ambil user names untuk siswa
    const userIds = siswaList.map((s) => s.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    // Ambil semua dispensasi dari siswa kelas ini
    const dispensasiList = await Dispensasi.find({ siswa: { $in: siswaIds } })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      dispensasi: dispensasiList.map((d) => {
        const siswa = siswaMap.get(d.siswa.toString());
        const nama = siswa ? (userMap.get(siswa.userId.toString()) ?? "-") : "-";
        const nis = siswa?.nis ?? "-";

        return {
          id:           d._id.toString(),
          file:         d.file,
          keterangan:   d.keterangan,
          statusWalas:  d.statusWalas,
          statusBK:     d.statusBK,
          status:       d.status,
          catatanWalas: d.catatanWalas ?? null,
          tanggal:      d.createdAt,
          siswa: {
            id:   d.siswa.toString(),
            nama,
            nis,
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
    console.error("[GET /api/guru/dispensasi]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}