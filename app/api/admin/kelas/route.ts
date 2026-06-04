import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Kelas from "@/models/kelas";

// ── AUTH CHECK ──
async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}

// ── GET: List semua kelas ──
export async function GET(req: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const kelasList = await Kelas.find()
      .select("_id nama")
      .lean();

    // Format response untuk frontend
    const formattedKelas = kelasList.map((k: any) => ({
      id: k._id.toString(),
      nama: k.nama,
    }));

    return NextResponse.json(
      { kelas: formattedKelas },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/admin/kelas]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kelas" },
      { status: 500 }
    );
  }
}