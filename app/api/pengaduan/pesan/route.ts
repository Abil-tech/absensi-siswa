import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import PengaduanBK from "@/models/pengaduanbk";
import { uploadToCloudinary } from "@/lib/cloudinaryHelper";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// ── POST: Kirim pesan (teks dan/atau gambar) di thread pengaduan ──
// FormData: pengaduanId (string), pesan (string, opsional), gambar (File, opsional)
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(["walas", "bk"]);
    await dbConnect();

    const formData    = await req.formData();
    const pengaduanId = formData.get("pengaduanId") as string | null;
    const pesanText   = (formData.get("pesan") as string | null)?.trim() ?? "";
    const gambar      = formData.get("gambar") as File | null;

    if (!pengaduanId) {
      return NextResponse.json({ error: "pengaduanId wajib diisi" }, { status: 400 });
    }
    if (!pesanText && !gambar) {
      return NextResponse.json({ error: "Pesan atau gambar wajib diisi" }, { status: 400 });
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

    let gambarUrl: string | undefined;

    if (gambar) {
      if (!ALLOWED_TYPES.includes(gambar.type)) {
        return NextResponse.json(
          { error: "Tipe gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF." },
          { status: 400 }
        );
      }
      if (gambar.size > MAX_SIZE) {
        return NextResponse.json({ error: "Ukuran gambar maksimal 10MB." }, { status: 400 });
      }

      const buffer   = Buffer.from(await gambar.arrayBuffer());
      const filename = `${Date.now()}-${gambar.name.replace(/\s+/g, "_")}`;
      gambarUrl = await uploadToCloudinary(buffer, "pengaduan-chat", filename);
    }

    pengaduan.messages.push({
      role:      session.user.role as "walas" | "bk",
      pesan:     pesanText,
      gambar:    gambarUrl,
      createdAt: new Date(),
    });

    await pengaduan.save();

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "Unauthorized" || err.message === "Forbidden")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/pengaduan/pesan]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}