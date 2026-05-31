import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Siswa from "@/models/siswa";
import Dispensasi, { hitungStatusFinal, StatusDispensasi } from "@/models/dispensasi";
import { uploadToCloudinary } from "@/lib/cloudinaryHelper";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// ── GET: Ambil riwayat dispensasi siswa ──
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["siswa"]);
    await dbConnect();

    const siswa = await Siswa.findOne({ userId: session.user.id });
    if (!siswa) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    }

    const dispensasiList = await Dispensasi.find({ siswa: siswa._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      dispensasi: dispensasiList.map((d) => ({
        id:           d._id.toString(),
        file:         d.file,
        keterangan:   d.keterangan,
        statusWalas:  d.statusWalas,
        statusBK:     d.statusBK,
        status:       d.status,
        catatanWalas: d.catatanWalas ?? null,
        catatanBK:    d.catatanBK ?? null,
        tanggal:      d.createdAt,
      })),
    });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/siswa/dispensasi]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST: Ajukan dispensasi ──
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(["siswa"]);
    await dbConnect();

    const siswa = await Siswa.findOne({ userId: session.user.id });
    if (!siswa) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    }

    const formData   = await req.formData();
    const keterangan = formData.get("keterangan") as string | null;
    const file       = formData.get("file")       as File | null;

    if (!keterangan?.trim()) {
      return NextResponse.json({ error: "Keterangan wajib diisi" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "Dokumen dispensasi wajib diunggah" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak diizinkan. Gunakan JPG, PNG, WEBP, atau PDF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Ukuran file maksimal 10MB." }, { status: 400 });
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const fileUrl  = await uploadToCloudinary(buffer, "dispensasi", filename);

    await Dispensasi.create({
      siswa:      siswa._id,
      file:       fileUrl,
      keterangan: keterangan.trim(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/siswa/dispensasi]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}