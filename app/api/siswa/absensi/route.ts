import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import Siswa from "@/models/siswa";
import Absensi from "@/models/absensi";
import { uploadToCloudinary } from "@/lib/cloudinaryHelper"; 
import Kelas from "@/models/kelas";     

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// ── GET: Ambil data absensi siswa ──
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["siswa"]);
    await dbConnect();
    void Kelas; // ← pastikan schema Kelas sudah terdaftar

    const siswa = await Siswa.findOne({ userId: session.user.id })
      .populate("kelas", "nama")
      .lean();

    if (!siswa) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    }

    const absensiList = await Absensi.find({ siswa: siswa._id })
      .sort({ tanggal: -1 })
      .lean();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const abensiBulanIni = absensiList.filter(
      (a) => new Date(a.tanggal) >= startOfMonth
    );

    const stats = {
      hadir: abensiBulanIni.filter((a) => a.status === "hadir").length,
      sakit: abensiBulanIni.filter((a) => a.status === "sakit").length,
      izin:  abensiBulanIni.filter((a) => a.status === "izin").length,
      total: abensiBulanIni.length,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sudahAbsenHariIni = absensiList.some(
      (a) => new Date(a.tanggal).getTime() === today.getTime()
    );

    const jam = now.getHours();
    const menit = now.getMinutes();
    const bisaAbsen = jam < 6 || (jam === 6 && menit <= 40);

    return NextResponse.json({
      siswa: {
        id:           siswa._id.toString(),
        nis:          siswa.nis,
        nisn:         siswa.nisn,
        kelas:        (siswa.kelas as any)?.nama ?? "—",
        jurusan:      siswa.jurusan,
        jenisKelamin: siswa.jenisKelamin,
      },
      stats,
      sudahAbsenHariIni,
      bisaAbsen,
      absensi: absensiList.map((a) => ({
        id:         a._id.toString(),
        tanggal:    a.tanggal,
        waktu:      a.waktu,
        status:     a.status,
        keterangan: a.keterangan,
        file:       a.file,
      })),
    });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/siswa/absensi]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST: Submit absensi siswa ──
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(["siswa"]);
    await dbConnect();

    const now = new Date();
    const jam = now.getHours();
    const menit = now.getMinutes();
    const masihBisaAbsen = jam < 6 || (jam === 6 && menit <= 40);

    if (!masihBisaAbsen) {
      return NextResponse.json(
        { error: "Waktu absensi sudah habis. Batas waktu adalah jam 06.40." },
        { status: 400 }
      );
    }

    const siswa = await Siswa.findOne({ userId: session.user.id });
    if (!siswa) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sudahAbsen = await Absensi.findOne({ siswa: siswa._id, tanggal: today });
    if (sudahAbsen) {
      return NextResponse.json(
        { error: "Kamu sudah melakukan absensi hari ini." },
        { status: 400 }
      );
    }

    const formData   = await req.formData();
    const status     = formData.get("status")     as string | null;
    const keterangan = formData.get("keterangan") as string | null;
    const file       = formData.get("file")       as File | null;

    if (!status || !["hadir", "sakit", "izin"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }
    if (!keterangan?.trim()) {
      return NextResponse.json({ error: "Keterangan wajib diisi" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "File bukti wajib diunggah" }, { status: 400 });
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
    const fileUrl  = await uploadToCloudinary(buffer, "absensi", filename);

    const waktu = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    await Absensi.create({
      siswa:      siswa._id,
      tanggal:    today,
      waktu,
      status:     status as "hadir" | "sakit" | "izin",
      file:       fileUrl,
      keterangan: keterangan.trim(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Kamu sudah melakukan absensi hari ini." },
        { status: 400 }
      );
    }
    console.error("[POST /api/siswa/absensi]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}