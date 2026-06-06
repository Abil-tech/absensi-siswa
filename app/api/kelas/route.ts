import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Kelas from "@/models/kelas";
import { requireRole } from "@/lib/auth-helpers";

// ── GET /api/kelas ─────────────────────────────────────────────
export async function GET() {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const kelasList = await Kelas.find()
      .select("nama waliKelas")
      .populate("waliKelas", "name userId")
      .lean();

    const result = kelasList.map((k) => ({
      _id:      k._id.toString(),
      nama:     k.nama,
      waliKelas: k.waliKelas
        ? {
            _id:  (k.waliKelas as any)._id.toString(),
            name: (k.waliKelas as any).name,
          }
        : null,
    }));

    return NextResponse.json({ data: result });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (err.message === "Forbidden")    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    console.error("[GET /api/kelas]", err);
    return NextResponse.json({ error: "Gagal mengambil data kelas" }, { status: 500 });
  }
}