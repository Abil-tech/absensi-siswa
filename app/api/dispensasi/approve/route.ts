import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Dispensasi, { hitungStatusFinal, StatusDispensasi } from "@/models/dispensasi";

// ── PATCH: Approve atau tolak dispensasi (walas/BK) ──
// Body: { dispensasiId, keputusan: "disetujui" | "ditolak", catatan?: string }
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireRole(["walas", "bk"]);
    await dbConnect();

    const body = await req.json();
    const { dispensasiId, keputusan, catatan } = body;

    if (!dispensasiId || !keputusan) {
      return NextResponse.json({ error: "dispensasiId dan keputusan wajib diisi" }, { status: 400 });
    }

    if (!["disetujui", "ditolak"].includes(keputusan)) {
      return NextResponse.json({ error: "Keputusan tidak valid" }, { status: 400 });
    }

    const dispensasi = await Dispensasi.findById(dispensasiId);
    if (!dispensasi) {
      return NextResponse.json({ error: "Dispensasi tidak ditemukan" }, { status: 404 });
    }

    const role = session.user.role;

    if (role === "walas") {
      dispensasi.statusWalas = keputusan as StatusDispensasi;
      if (catatan) dispensasi.catatanWalas = catatan;
    } else if (role === "bk") {
      dispensasi.statusBK = keputusan as StatusDispensasi;
      if (catatan) dispensasi.catatanBK = catatan;
    }

    // Hitung ulang status final
    dispensasi.status = hitungStatusFinal(dispensasi.statusWalas, dispensasi.statusBK);

    await dispensasi.save();

    return NextResponse.json({ success: true, status: dispensasi.status });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[PATCH /api/dispensasi/approve]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}