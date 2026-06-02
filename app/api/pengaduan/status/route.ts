import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import PengaduanBK from "@/models/pengaduanbk";

// ── PATCH: Update status pengaduan (hanya BK) ──
// Body: { pengaduanId, keputusan: "selesai" | "tidak_selesai" }
export async function PATCH(req: NextRequest) {
  try {
    await requireRole(["walas"]);
    await dbConnect();

    const { pengaduanId, keputusan } = await req.json();

    if (!pengaduanId || !keputusan) {
      return NextResponse.json({ error: "pengaduanId dan keputusan wajib diisi" }, { status: 400 });
    }

    if (!["selesai", "tidak_selesai"].includes(keputusan)) {
      return NextResponse.json({ error: "Keputusan tidak valid" }, { status: 400 });
    }

    const pengaduan = await PengaduanBK.findById(pengaduanId);
    if (!pengaduan) {
      return NextResponse.json({ error: "Pengaduan tidak ditemukan" }, { status: 404 });
    }

    if (pengaduan.status !== "open") {
      return NextResponse.json({ error: "Pengaduan sudah ditutup" }, { status: 400 });
    }

    if (keputusan === "selesai") {
      pengaduan.status = "selesai";
    } else {
      pengaduan.tidakSelesaiCount += 1;
      if (pengaduan.tidakSelesaiCount >= 3) {
        pengaduan.status = "ditutup";
      }
    }

    await pengaduan.save();

    return NextResponse.json({
      success: true,
      status: pengaduan.status,
      tidakSelesaiCount: pengaduan.tidakSelesaiCount,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[PATCH /api/pengaduan/status]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}