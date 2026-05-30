import mongoose, { Document, Model, Schema } from "mongoose";

export const KATEGORI_LIST = [
  "Pelanggaran Disiplin",
  "Masalah Akademik",
  "Perundungan (Bullying)",
  "Masalah Kehadiran",
  "Lainnya",
] as const;

export type KategoriPengaduan = typeof KATEGORI_LIST[number];

export interface IPengaduanBK extends Document {
  walas: mongoose.Types.ObjectId;
  siswa: mongoose.Types.ObjectId;
  kategori: KategoriPengaduan;
  judul: string;
  keterangan: string;
  file: string;
  createdAt: Date;
  updatedAt: Date;
}

const PengaduanBKSchema = new mongoose.Schema<IPengaduanBK>(
  {
    walas: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    siswa: {
      type: Schema.Types.ObjectId,
      ref: "Siswa",
      required: true,
    },
    kategori: {
      type: String,
      enum: KATEGORI_LIST,
      required: true,
    },
    judul: {
      type: String,
      required: true,
      trim: true,
    },
    keterangan: {
      type: String,
      required: true,
      trim: true,
    },
    file: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

PengaduanBKSchema.index({ walas: 1 });
PengaduanBKSchema.index({ siswa: 1 });

const PengaduanBK: Model<IPengaduanBK> =
  mongoose.models.PengaduanBK ||
  mongoose.model<IPengaduanBK>("PengaduanBK", PengaduanBKSchema);

export default PengaduanBK;