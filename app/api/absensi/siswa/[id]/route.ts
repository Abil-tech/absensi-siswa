import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Absensi from "@/models/absensi";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";

interface Params {
  params: Promise<{ id: string }>;
}

// ── GET /api/absensi/siswa/[id] ────────────────────────────────
// Ambil detail absensi siswa untuk hari ini
// Walas hanya bisa akses siswa di kelasnya, BK bisa akses semua siswa
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole(["walas", "bk"]);
    await dbConnect();

    const { id } = await params;

    let siswa;
    let kelasNama = "—";

    if (session.user.role === "walas") {
      // Walas hanya bisa akses siswa di kelasnya
      const kelas = await Kelas.findOne({ waliKelas: session.user.id });
      if (!kelas) {
        return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
      }
      siswa = await Siswa.findOne({ _id: id, kelas: kelas._id })
        .populate("userId", "name")
        .lean();
      kelasNama = kelas.nama;
    } else {
      // BK bisa akses semua siswa
      siswa = await Siswa.findOne({ _id: id })
        .populate("userId", "name")
        .populate("kelas", "nama")
        .lean();
      if (siswa && (siswa as any).kelas) {
        kelasNama = (siswa as any).kelas.nama;
      }
    }

    if (!siswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // Rentang hari ini (00:00:00 – 23:59:59)
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const absensi = await Absensi.findOne({
      siswa:   id,
      tanggal: { $gte: start, $lte: end },
    }).lean();

    return NextResponse.json({
      siswa: {
        id:   (siswa as any)._id.toString(),
        nama: (siswa as any).userId?.name ?? "—",
        nis:  (siswa as any).nis ?? "—",
        kelas: kelasNama,
      },
      absensi: absensi
        ? {
            id:          (absensi as any)._id.toString(),
            status:      absensi.status,
            waktu:       absensi.waktu,
            tanggal:     absensi.tanggal,
            keterangan:  absensi.keterangan,
            file:        absensi.file ?? null,
          }
        : null,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/absensi/siswa/[id]]", err);
    return NextResponse.json({ error: "Gagal mengambil data absensi" }, { status: 500 });
  }
}