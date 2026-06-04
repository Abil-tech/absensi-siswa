import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import User from "@/models/user";

// ── AUTH CHECK ──
async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}

// ── GET: List semua siswa ──
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

    const siswaList = await Siswa.find()
      .populate("userId", "name email userId")
      .populate("kelas", "id nama")
      .select("-__v")
      .lean();

    // Format response untuk frontend
    const formattedSiswa = siswaList.map((s: any) => {
      const kelas = s.kelas as any;
      return {
        id: s._id.toString(),
        userId: s.userId._id.toString(),
        name: s.userId.name,
        loginId: s.userId.userId,
        nisn: s.nisn,
        nis: s.nis,
        kelas: {
          id: kelas._id.toString(),
          nama: kelas.nama,
        },
        jurusan: s.jurusan,
        jenisKelamin: s.jenisKelamin,
        tanggalLahir: s.tanggalLahir,
        alamat: s.alamat,
        noTelp: s.noTelp,
      };
    });

    return NextResponse.json(
      { siswa: formattedSiswa },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/admin/siswa]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data siswa" },
      { status: 500 }
    );
  }
}

// ── POST: Tambah siswa baru ──
export async function POST(req: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const {
      name,
      loginId,
      password,
      nisn,
      nis,
      kelasId,
      jurusan,
      jenisKelamin,
      tanggalLahir,
      alamat,
      noTelp,
    } = await req.json();

    // ── Validasi ──
    if (!name?.trim()) return res("Nama wajib diisi", 400);
    if (!loginId?.trim()) return res("User ID wajib diisi", 400);
    if (!password?.trim()) return res("Password wajib diisi", 400);
    if (!/^\d{10}$/.test(nisn)) return res("NISN harus 10 digit angka", 400);
    if (!nis?.trim()) return res("NIS wajib diisi", 400);
    if (!kelasId?.trim()) return res("Kelas wajib dipilih", 400);
    if (!tanggalLahir) return res("Tanggal lahir wajib diisi", 400);
    if (!alamat?.trim()) return res("Alamat wajib diisi", 400);
    if (!noTelp?.trim()) return res("No. telepon wajib diisi", 400);

    // ── Cek kelas exist ──
    const kelasExists = await Kelas.findById(kelasId);
    if (!kelasExists) return res("Kelas tidak ditemukan", 404);

    // ── Cek duplicate userId, NISN, NIS ──
    const [userExists, nisnExists, nisExists] = await Promise.all([
      User.findOne({ userId: loginId }),
      Siswa.findOne({ nisn }),
      Siswa.findOne({ nis }),
    ]);

    if (userExists) return res("User ID sudah terdaftar", 400);
    if (nisnExists) return res("NISN sudah terdaftar", 400);
    if (nisExists) return res("NIS sudah terdaftar", 400);

    // ── Hash password ──
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Create User ──
    const newUser = await User.create({
      name,
      userId: loginId,
      password: hashedPassword,
      role: "siswa",
    });

    // ── Create Siswa ──
    const newSiswa = await Siswa.create({
      userId: newUser._id,
      nisn,
      nis,
      kelas: kelasId,
      jurusan,
      jenisKelamin,
      tanggalLahir: new Date(tanggalLahir),
      alamat,
      noTelp,
    });

    // ── Response ──
    const populatedSiswa = await newSiswa.populate("kelas", "id nama");
    const kelasData = populatedSiswa.kelas as any;

    return NextResponse.json(
      {
        siswa: {
          id: newSiswa._id.toString(),
          userId: newUser._id.toString(),
          name,
          loginId,
          nisn,
          nis,
          kelas: {
            id: kelasData._id.toString(),
            nama: kelasData.nama,
          },
          jurusan,
          jenisKelamin,
          tanggalLahir: newSiswa.tanggalLahir,
          alamat,
          noTelp,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/admin/siswa]", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const messages: { [key: string]: string } = {
        nisn: "NISN sudah terdaftar",
        nis: "NIS sudah terdaftar",
        userId: "User ID sudah terdaftar",
      };
      return res(messages[field] || "Data sudah terdaftar", 400);
    }

    return res("Gagal menambahkan siswa", 500);
  }
}

// ── PATCH: Edit siswa ──
export async function PATCH(req: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const {
      id,
      name,
      loginId,
      password,
      nisn,
      nis,
      kelasId,
      jurusan,
      jenisKelamin,
      tanggalLahir,
      alamat,
      noTelp,
    } = await req.json();

    // ── Validasi ──
    if (!id) return res("ID siswa wajib diisi", 400);
    if (!name?.trim()) return res("Nama wajib diisi", 400);
    if (!loginId?.trim()) return res("User ID wajib diisi", 400);
    if (!/^\d{10}$/.test(nisn)) return res("NISN harus 10 digit angka", 400);
    if (!nis?.trim()) return res("NIS wajib diisi", 400);
    if (!kelasId?.trim()) return res("Kelas wajib dipilih", 400);
    if (!tanggalLahir) return res("Tanggal lahir wajib diisi", 400);
    if (!alamat?.trim()) return res("Alamat wajib diisi", 400);
    if (!noTelp?.trim()) return res("No. telepon wajib diisi", 400);

    // ── Cek siswa exist ──
    const siswa = await Siswa.findById(id);
    if (!siswa) return res("Siswa tidak ditemukan", 404);

    // ── Cek kelas exist ──
    const kelasExists = await Kelas.findById(kelasId);
    if (!kelasExists) return res("Kelas tidak ditemukan", 404);

    // ── Cek duplicate NISN/NIS (exclude current) ──
    const [nisnExists, nisExists] = await Promise.all([
      Siswa.findOne({ nisn, _id: { $ne: id } }),
      Siswa.findOne({ nis, _id: { $ne: id } }),
    ]);

    if (nisnExists) return res("NISN sudah terdaftar siswa lain", 400);
    if (nisExists) return res("NIS sudah terdaftar siswa lain", 400);

    // ── Update User ──
    const userUpdateData: any = { name };
    if (password?.trim()) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(siswa.userId, userUpdateData);

    // ── Update Siswa ──
    const updatedSiswa = await Siswa.findByIdAndUpdate(
      id,
      {
        nisn,
        nis,
        kelas: kelasId,
        jurusan,
        jenisKelamin,
        tanggalLahir: new Date(tanggalLahir),
        alamat,
        noTelp,
      },
      { new: true }
    ).populate("kelas", "id nama");

    // ── Response ──
    const kelasData = (updatedSiswa?.kelas as any) || {};
    return NextResponse.json(
      {
        siswa: {
          id: updatedSiswa?._id.toString(),
          userId: siswa.userId.toString(),
          name,
          loginId,
          nisn,
          nis,
          kelas: {
            id: kelasData._id?.toString(),
            nama: kelasData.nama,
          },
          jurusan,
          jenisKelamin,
          tanggalLahir: updatedSiswa?.tanggalLahir,
          alamat,
          noTelp,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PATCH /api/admin/siswa]", error);
    return res("Gagal mengubah data siswa", 500);
  }
}

// ── DELETE: Hapus siswa ──
export async function DELETE(req: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const { id } = await req.json();

    if (!id) return res("ID siswa wajib diisi", 400);

    // ── Cek siswa exist ──
    const siswa = await Siswa.findById(id);
    if (!siswa) return res("Siswa tidak ditemukan", 404);

    // ── Delete User & Siswa ──
    await Promise.all([
      User.findByIdAndDelete(siswa.userId),
      Siswa.findByIdAndDelete(id),
    ]);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/admin/siswa]", error);
    return res("Gagal menghapus siswa", 500);
  }
}

// ── Helper: Response wrapper ──
function res(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}