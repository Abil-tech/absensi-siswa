import mongoose, { Document, Model, Schema } from "mongoose";

export type JenisKelamin = "L" | "P";

export interface ISiswa extends Document {
  userId: mongoose.Types.ObjectId;   // relasi ke User._id
  nisn: string;
  nis: string;
  kelas: mongoose.Types.ObjectId;    // relasi ke Kelas._id
  jurusan: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: Date;
  alamat: string;
  noTelp: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiswaSchema = new mongoose.Schema<ISiswa>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    nisn: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "NISN harus 10 digit angka"],
    },
    nis: {
      type: String,
      required: true,
      unique: true,
    },
    kelas: {
      type: Schema.Types.ObjectId,
      ref: "Kelas",
      required: true,
    },
    jurusan: {
      type: String,
      required: true,
    },
    jenisKelamin: {
      type: String,
      enum: ["L", "P"],
      required: true,
    },
    tanggalLahir: {
      type: Date,
      required: true,
    },
    alamat: {
      type: String,
      required: true,
    },
    noTelp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Index untuk query yang sering dipakai
SiswaSchema.index({ kelas: 1 });

const Siswa: Model<ISiswa> =
  mongoose.models.Siswa || mongoose.model<ISiswa>("Siswa", SiswaSchema);

export default Siswa;