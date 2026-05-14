import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json();

    if (!userId || !password) {
      return NextResponse.json(
        { error: "userId dan password wajib diisi" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Cari berdasarkan email ATAU userId (NIS/NIP)
    const user = await User.findOne({
      $or: [
        { email:  userId },
        { userId: userId },
      ],
    }).select("+password");

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Kembalikan data user (tanpa password)
    return NextResponse.json({
      id:    user._id.toString(),
      name:  user.name,
      email: user.email,
      role:  user.role,
    });
  } catch (err) {
    console.error("[/api/users/verify]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
