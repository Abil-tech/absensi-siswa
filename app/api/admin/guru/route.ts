import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/auth-helpers";
import User from "@/models/user";
import bcrypt from "bcryptjs";

// ── GET: Ambil semua guru (walas & bk) ──
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const guruList = await User.find({ role: { $in: ["walas", "bk"] } })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      guru: guruList.map((g) => ({
        id:     g._id.toString(),
        name:   g.name,
        email:  g.email ?? null,
        userId: g.userId ?? null,
        role:   g.role,
        createdAt: g.createdAt,
      })),
    });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/admin/guru]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST: Tambah guru baru ──
export async function POST(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const body = await req.json();
    const { name, email, userId, password, role } = body;

    if (!name?.trim())     return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    if (!userId?.trim())   return NextResponse.json({ error: "User ID wajib diisi" }, { status: 400 });
    if (!password?.trim()) return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
    if (!["walas", "bk"].includes(role)) return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });

    // Cek duplikasi userId
    const existing = await User.findOne({ userId });
    if (existing) return NextResponse.json({ error: "User ID sudah digunakan" }, { status: 400 });

    // Cek duplikasi email jika diisi
    if (email?.trim()) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const guru = await User.create({
      name:     name.trim(),
      email:    email?.trim() || undefined,
      userId:   userId.trim(),
      password: hashed,
      role,
    });

    return NextResponse.json({
      success: true,
      guru: {
        id:     guru._id.toString(),
        name:   guru.name,
        email:  guru.email ?? null,
        userId: guru.userId,
        role:   guru.role,
      },
    }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/admin/guru]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH: Edit guru ──
export async function PATCH(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const body = await req.json();
    const { id, name, email, userId, password, role } = body;

    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    if (!name?.trim()) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    if (!userId?.trim()) return NextResponse.json({ error: "User ID wajib diisi" }, { status: 400 });
    if (!["walas", "bk"].includes(role)) return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });

    // Cek duplikasi userId (exclude diri sendiri)
    const existingUserId = await User.findOne({ userId, _id: { $ne: id } });
    if (existingUserId) return NextResponse.json({ error: "User ID sudah digunakan" }, { status: 400 });

    // Cek duplikasi email
    if (email?.trim()) {
      const existingEmail = await User.findOne({ email, _id: { $ne: id } });
      if (existingEmail) return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }

    const updateData: any = {
      name:   name.trim(),
      userId: userId.trim(),
      role,
      email:  email?.trim() || undefined,
    };

    // Update password hanya jika diisi
    if (password?.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[PATCH /api/admin/guru]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE: Hapus guru ──
export async function DELETE(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    await dbConnect();

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[DELETE /api/admin/guru]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}