import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import mongoose from "mongoose";
import PengaduanBK, { KATEGORI_LIST, KategoriPengaduan } from "@/models/pengaduanbk";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import { uploadToCloudinary } from "@/lib/cloudinaryHelper";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
    try {
        const session = await requireRole(["walas"]);
        await dbConnect();

        const formData = await req.formData();
        const siswaId = formData.get("siswaId") as string | null;
        const kategori = formData.get("kategori") as string | null;
        const judul = formData.get("judul") as string | null;
        const keterangan = formData.get("keterangan") as string | null;
        const file = formData.get("file") as File | null;

        if (!siswaId || !kategori || !judul?.trim() || !keterangan?.trim() || !file) {
            return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
        }

        // Validasi kategori
        if (!KATEGORI_LIST.includes(kategori as KategoriPengaduan)) {
            return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
        }

        // Validasi file
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipe file tidak diizinkan. Gunakan JPG, PNG, WEBP, atau PDF." },
                { status: 400 }
            );
        }
        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: "Ukuran file maksimal 10MB." }, { status: 400 });
        }

        const kelas = await Kelas.findOne({ waliKelas: session.user.id });
        if (!kelas) {
            return NextResponse.json({ error: "Kelas tidak ditemukan untuk akun ini" }, { status: 404 });
        }

        const siswa = await Siswa.findOne({ _id: siswaId, kelas: kelas._id });
        if (!siswa) {
            return NextResponse.json({ error: "Siswa tidak ditemukan di kelas ini" }, { status: 404 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const fileUrl = await uploadToCloudinary(buffer, "pengaduan-bk", filename);

        const pengaduan = await PengaduanBK.create({
            walas: session.user.id,
            siswa: siswaId,
            kategori: kategori as KategoriPengaduan,
            judul: judul.trim(),
            keterangan: keterangan.trim(),
            file: fileUrl,
        });

        // Gunakan type assertion untuk akses _id
        const doc = pengaduan as typeof pengaduan & { _id: mongoose.Types.ObjectId };
        return NextResponse.json({ success: true, id: doc._id.toString() }, { status: 201 });
    } catch (err: any) {
        if (err.message === "Unauthorized" || err.message === "Forbidden") {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        console.error("[POST /api/pengaduan]", err);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}