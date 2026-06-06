import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import Kelas from "@/models/kelas";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { requireRole } from "@/lib/auth-helpers";

interface Params {
  params: Promise<{ id: string }>;
}

// ── PUT /api/guru/[id] ─────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, userId, password, role, status, departemen, kelasWalas } = body;

    if (!name?.trim())       return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    if (!userId?.trim())     return NextResponse.json({ error: "ID guru wajib diisi" }, { status: 400 });
    if (!departemen?.trim()) return NextResponse.json({ error: "Departemen wajib diisi" }, { status: 400 });
    if (!["walas", "bk"].includes(role)) return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    if (role === "walas" && !kelasWalas) return NextResponse.json({ error: "Kelas wali wajib dipilih" }, { status: 400 });

    const existingUser = await User.findById(id);
    if (!existingUser) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

    const dupUserId = await User.findOne({ userId, _id: { $ne: id } });
    if (dupUserId) return NextResponse.json({ error: "ID guru sudah digunakan" }, { status: 409 });

    if (email?.trim()) {
      const dupEmail = await User.findOne({ email, _id: { $ne: id } });
      if (dupEmail) return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
    }

    if (role === "walas") {
      const kelasLama = await Kelas.findOne({ waliKelas: id });
      const kelasBaru = await Kelas.findOne({ nama: kelasWalas });

      if (!kelasBaru) return NextResponse.json({ error: `Kelas "${kelasWalas}" tidak ditemukan` }, { status: 404 });

      const kelasBerubah = kelasLama?.nama !== kelasWalas;
      if (kelasBerubah) {
        if (kelasBaru.waliKelas && kelasBaru.waliKelas.toString() !== id) {
          return NextResponse.json({ error: `Kelas "${kelasWalas}" sudah memiliki wali kelas` }, { status: 409 });
        }
        if (kelasLama) await Kelas.findByIdAndUpdate(kelasLama._id, { waliKelas: null });
        await Kelas.findByIdAndUpdate(kelasBaru._id, { waliKelas: id });
      }
    } else {
      if (existingUser.role === "walas") {
        await Kelas.findOneAndUpdate({ waliKelas: id }, { waliKelas: null });
      }
    }

    const updatePayload: Record<string, unknown> = {
      name:       name.trim(),
      email:      email?.trim() || undefined,
      userId:     userId.trim(),
      role,
      status,
      departemen: departemen.trim(),
    };

    if (password?.trim()) {
      updatePayload.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatePayload, { new: true }).select("-password");

    return NextResponse.json({
      data: {
        _id:        updatedUser!._id.toString(),
        name:       updatedUser!.name,
        email:      updatedUser!.email ?? "",
        userId:     updatedUser!.userId ?? "",
        role:       updatedUser!.role,
        status:     (updatedUser as any).status,
        departemen: (updatedUser as any).departemen,
        kelasWalas: role === "walas" ? kelasWalas : undefined,
      },
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (err.message === "Forbidden")    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    console.error("[PUT /api/guru/[id]]", err);
    return NextResponse.json({ error: "Gagal memperbarui data guru" }, { status: 500 });
  }
}

// ── DELETE /api/guru/[id] ──────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

    if (user.role === "walas") {
      await Kelas.findOneAndUpdate({ waliKelas: id }, { waliKelas: null });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "Guru berhasil dihapus" });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (err.message === "Forbidden")    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    console.error("[DELETE /api/guru/[id]]", err);
    return NextResponse.json({ error: "Gagal menghapus guru" }, { status: 500 });
  }
}