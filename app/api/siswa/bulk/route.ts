import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import Siswa from "@/models/siswa";
import Kelas from "@/models/kelas";
import User from "@/models/user";

interface BulkSiswaData {
  nama: string;
  userId: string;
  password: string;
  nisn: string;
  nis: string;
  kelas: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  noTelepon: string;
  alamat: string;
}

// ── AUTH CHECK ──
async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}

// ── GET jurusan from kelas name ──
function getJurusanFromKelas(kelasNama: string): string {
  if (kelasNama.includes("PPLG")) return "PPLG";
  if (kelasNama.includes("DKV")) return "DKV";
  if (kelasNama.includes("TJKT")) return "TJKT";
  if (kelasNama.includes("MPLB")) return "MPLB";
  if (kelasNama.includes("PM")) return "PM";
  return "";
}

// ── POST: Bulk import siswa ──
export async function POST(req: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { siswaList } = await req.json();

    if (!Array.isArray(siswaList) || siswaList.length === 0) {
      return NextResponse.json(
        { error: "Data siswa kosong atau format invalid" },
        { status: 400 }
      );
    }

    if (siswaList.length > 1000) {
      return NextResponse.json(
        { error: "Maksimal 1000 siswa per import" },
        { status: 400 }
      );
    }

    // ── Pre-check: Get all existing data ──
    const existingUserIds = (
      await User.find({}, { userId: 1 }).lean()
    ).map((u: any) => u.userId);

    const existingNisns = (
      await Siswa.find({}, { nisn: 1 }).lean()
    ).map((s: any) => s.nisn);

    const existingNis = (await Siswa.find({}, { nis: 1 }).lean()).map(
      (s: any) => s.nis
    );

    const kelasList = await Kelas.find({}, { _id: 1, nama: 1 }).lean();
    const kelasMap = new Map(kelasList.map((k: any) => [k.nama, k._id]));

    // ── Process each siswa ──
    const results = {
      success: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ rowIndex: number; reason: string }>,
    };

    const usersToCreate: Array<any> = [];
    const siswaToCreate: Array<any> = [];
    const skipUserIds = new Set<string>();

    for (let i = 0; i < siswaList.length; i++) {
      const data: BulkSiswaData = siswaList[i];

      try {
        // ── Validasi required fields ──
        if (
          !data.nama ||
          !data.userId ||
          !data.password ||
          !data.nisn ||
          !data.nis ||
          !data.kelas ||
          !data.tanggalLahir ||
          !data.noTelepon ||
          !data.alamat
        ) {
          results.failed++;
          results.errors.push({
            rowIndex: i,
            reason: "Ada field yang kosong",
          });
          continue;
        }

        // ── Check duplicate userId ──
        if (existingUserIds.includes(data.userId) || skipUserIds.has(data.userId)) {
          results.skipped++;
          results.errors.push({
            rowIndex: i,
            reason: `User ID '${data.userId}' sudah terdaftar`,
          });
          skipUserIds.add(data.userId);
          continue;
        }

        // ── Check duplicate NISN ──
        if (existingNisns.includes(data.nisn)) {
          results.skipped++;
          results.errors.push({
            rowIndex: i,
            reason: `NISN '${data.nisn}' sudah terdaftar`,
          });
          continue;
        }

        // ── Check duplicate NIS ──
        if (existingNis.includes(data.nis)) {
          results.skipped++;
          results.errors.push({
            rowIndex: i,
            reason: `NIS '${data.nis}' sudah terdaftar`,
          });
          continue;
        }

        // ── Validate kelas exists ──
        if (!kelasMap.has(data.kelas)) {
          results.failed++;
          results.errors.push({
            rowIndex: i,
            reason: `Kelas '${data.kelas}' tidak ditemukan`,
          });
          continue;
        }

        // ── Get jurusan from kelas ──
        const jurusan = getJurusanFromKelas(data.kelas);

        // ── Hash password ──
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // ── Prepare User ──
        const newUser = {
          name: data.nama,
          userId: data.userId,
          password: hashedPassword,
          role: "siswa",
        };

        usersToCreate.push(newUser);

        // ── Prepare Siswa (will reference user by index) ──
        siswaToCreate.push({
          userIndex: usersToCreate.length - 1,
          nisn: data.nisn,
          nis: data.nis,
          kelas: kelasMap.get(data.kelas),
          jurusan,
          jenisKelamin: data.jenisKelamin,
          tanggalLahir: new Date(data.tanggalLahir),
          alamat: data.alamat,
          noTelepon: data.noTelepon,
        });

        results.success++;

        // Add to existing lists to prevent duplicates within this batch
        existingUserIds.push(data.userId);
        existingNisns.push(data.nisn);
        existingNis.push(data.nis);
      } catch (err) {
        results.failed++;
        results.errors.push({
          rowIndex: i,
          reason: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
      }
    }

    // ── Bulk insert users first ──
    const createdUsers = await User.insertMany(usersToCreate);

    // ── Bulk insert siswa with user references ──
    const siswaWithUserIds = siswaToCreate.map((s) => ({
      ...s,
      userId: createdUsers[s.userIndex]._id,
      userIndex: undefined,
    }));

    await Siswa.insertMany(siswaWithUserIds);

    return NextResponse.json(
      {
        results,
        message: `Import selesai: ${results.success} berhasil, ${results.skipped} skip, ${results.failed} gagal`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/admin/siswa/bulk]", error);
    return NextResponse.json(
      { error: "Gagal import siswa" },
      { status: 500 }
    );
  }
}