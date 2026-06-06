import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import Kelas from "@/models/kelas";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth-helpers";

// ── GET /api/guru ──────────────────────────────────────────────
export async function GET() {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const users = await User.find({ role: { $in: ["walas", "bk"] } })
      .select("-password")
      .lean();

    const walasIds = users
      .filter((u) => u.role === "walas")
      .map((u) => u._id);

    const kelasList = await Kelas.find({ waliKelas: { $in: walasIds } })
      .select("nama waliKelas")
      .lean();

    const kelasMap = new Map<string, string>();
    kelasList.forEach((k) => {
      if (k.waliKelas) kelasMap.set(k.waliKelas.toString(), k.nama);
    });

    const result = users.map((u) => ({
      _id:        u._id.toString(),
      name:       u.name,
      email:      u.email ?? "",
      userId:     u.userId ?? "",
      role:       u.role,
      status:     (u as any).status ?? "Aktif",
      departemen: (u as any).departemen ?? "",
      kelasWalas: u.role === "walas" ? (kelasMap.get(u._id.toString()) ?? "") : undefined,
    }));

    return NextResponse.json({ data: result });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (err.message === "Forbidden")    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    console.error("[GET /api/guru]", err);
    return NextResponse.json({ error: "Gagal mengambil data guru" }, { status: 500 });
  }
}

// ── POST /api/guru ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const body = await req.json();
    const { name, email, userId, password, role, status, departemen, kelasWalas } = body;

    if (!name?.trim())       return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    if (!userId?.trim())     return NextResponse.json({ error: "ID guru wajib diisi" }, { status: 400 });
    if (!password?.trim())   return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
    if (!departemen?.trim()) return NextResponse.json({ error: "Departemen wajib diisi" }, { status: 400 });
    if (!["walas", "bk"].includes(role)) return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    if (role === "walas" && !kelasWalas) return NextResponse.json({ error: "Kelas wali wajib dipilih" }, { status: 400 });

    const existingUser = await User.findOne({ userId });
    if (existingUser) return NextResponse.json({ error: "ID guru sudah digunakan" }, { status: 409 });

    if (email?.trim()) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
    }

    let kelasDoc: (mongoose.Document & { nama: string; waliKelas?: mongoose.Types.ObjectId | null }) | null = null;
    if (role === "walas") {
      kelasDoc = await Kelas.findOne({ nama: kelasWalas });
      if (!kelasDoc) return NextResponse.json({ error: `Kelas "${kelasWalas}" tidak ditemukan` }, { status: 404 });
      if (kelasDoc.waliKelas) return NextResponse.json({ error: `Kelas "${kelasWalas}" sudah memiliki wali kelas` }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name:       name.trim(),
      email:      email?.trim() || undefined,
      userId:     userId.trim(),
      password:   hashedPassword,
      role,
      status:     status ?? "Aktif",
      departemen: departemen.trim(),
    });

    if (role === "walas" && kelasDoc) {
      await Kelas.findByIdAndUpdate(kelasDoc._id, { waliKelas: newUser._id });
    }

    return NextResponse.json(
      {
        data: {
          _id:        newUser._id.toString(),
          name:       newUser.name,
          email:      newUser.email ?? "",
          userId:     newUser.userId ?? "",
          role:       newUser.role,
          status:     (newUser as any).status,
          departemen: (newUser as any).departemen,
          kelasWalas: role === "walas" ? kelasWalas : undefined,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (err.message === "Forbidden")    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    console.error("[POST /api/guru]", err);
    return NextResponse.json({ error: "Gagal menambahkan guru" }, { status: 500 });
  }
}