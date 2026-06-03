import mongoose, { Document, Model, Schema } from "mongoose";

export type StatusAbsensi = "hadir" | "terlambat" | "sakit" | "izin";

export interface IAbsensi extends Document {
  siswa: mongoose.Types.ObjectId;
  tanggal: Date;
  waktu: string;
  status: StatusAbsensi;
  file: string;
  keterangan: string;
  createdAt: Date;
  updatedAt: Date;
}

const AbsensiSchema = new mongoose.Schema<IAbsensi>(
  {
    siswa: {
      type: Schema.Types.ObjectId,
      ref: "Siswa",
      required: true,
    },
    tanggal: {
      type: Date,
      required: true,
    },
    waktu: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["hadir", "terlambat", "sakit", "izin"],
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    keterangan: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Satu siswa hanya bisa absen satu kali per hari
AbsensiSchema.index({ siswa: 1, tanggal: 1 }, { unique: true });

const Absensi: Model<IAbsensi> =
  mongoose.models.Absensi || mongoose.model<IAbsensi>("Absensi", AbsensiSchema);

export default Absensi;