import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import PengaduanBK from "@/models/pengaduanbk";

// ── POST: Kirim pesan di thread pengaduan ──
// Body: { pengaduanId, pesan }
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(["walas", "bk"]);
    await dbConnect();

    const { pengaduanId, pesan } = await req.json();

    if (!pengaduanId || !pesan?.trim()) {
      return NextResponse.json({ error: "pengaduanId dan pesan wajib diisi" }, { status: 400 });
    }

    const pengaduan = await PengaduanBK.findById(pengaduanId);
    if (!pengaduan) {
      return NextResponse.json({ error: "Pengaduan tidak ditemukan" }, { status: 404 });
    }

    if (pengaduan.status !== "open") {
      return NextResponse.json({ error: "Pengaduan sudah ditutup" }, { status: 400 });
    }

    // Validasi akses — walas hanya bisa balas pengaduannya sendiri
    if (session.user.role === "walas" && pengaduan.walas.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    pengaduan.messages.push({
      role:  session.user.role as "walas" | "bk",
      pesan: pesan.trim(),
      createdAt: new Date(),
    });

    await pengaduan.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/pengaduan/pesan]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}