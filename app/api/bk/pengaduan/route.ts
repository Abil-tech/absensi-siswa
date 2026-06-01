import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import PengaduanBK from "@/models/pengaduanbk";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";

// ── GET: Ambil semua pengaduan untuk BK ──
export async function GET(req: NextRequest) {
  try {
    await requireRole(["bk"]);
    await dbConnect();
    void Kelas;

    const pengaduanList = await PengaduanBK.find({})
      .populate("walas", "name")
      .populate({ path: "siswa", populate: [{ path: "userId", select: "name" }, { path: "kelas", select: "nama" }] })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      pengaduan: pengaduanList.map((p) => ({
        id:                p._id.toString(),
        judul:             p.judul,
        kategori:          p.kategori,
        file:              p.file,
        status:            p.status,
        tidakSelesaiCount: p.tidakSelesaiCount,
        messages:          p.messages,
        createdAt:         p.createdAt,
        walas: { nama: (p.walas as any)?.name ?? "—" },
        siswa: {
          id:    (p.siswa as any)?._id?.toString() ?? "",
          nama:  (p.siswa as any)?.userId?.name ?? "—",
          nis:   (p.siswa as any)?.nis ?? "—",
          kelas: (p.siswa as any)?.kelas?.nama ?? "—",
        },
      })),
    });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/bk/pengaduan]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}