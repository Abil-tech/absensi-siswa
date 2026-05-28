import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-helpers";
import { uploadToCloudinary } from "@/lib/cloudinaryHelper";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Folder per kebutuhan
const FOLDER_MAP: Record<string, string> = {
  absensi:    "absensi",
  pengaduan:  "pengaduan-bk",
};

export async function POST(req: NextRequest) {
  try {
    await requireSession();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "absensi";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validasi tipe file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak diizinkan. Gunakan JPG, PNG, WEBP, atau PDF." },
        { status: 400 }
      );
    }

    // Validasi ukuran file
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Ukuran file maksimal ${MAX_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    // Validasi folder
    if (!FOLDER_MAP[folder]) {
      return NextResponse.json({ error: "Folder tidak valid" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const url = await uploadToCloudinary(buffer, FOLDER_MAP[folder], filename);

    return NextResponse.json({ url });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }
}