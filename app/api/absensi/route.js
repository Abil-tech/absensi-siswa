import { connectDB } from "@/lib/mongodb";
import Absensi from "@/models/absensi";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const absensi = await Absensi.create(body);

    return Response.json({ success: true, data: absensi });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}

export async function GET() {
  await connectDB();

  const data = await Absensi.find().populate("userId");

  return Response.json(data);
}