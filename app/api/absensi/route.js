import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Absensi from "../../../models/absensi";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const absensi = await Absensi.create(body);
    return NextResponse.json({ success: true, data: absensi });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const data = await Absensi.find().populate("userId");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
