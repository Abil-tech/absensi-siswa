import mongoose, { Document, Model, Schema } from "mongoose";

export type StatusPengaduan = "open" | "selesai" | "ditutup";
export type RolePesan = "walas" | "bk";

export interface IPesan {
  role: RolePesan;
  pesan: string;
  gambar?: string;
  createdAt: Date;
}

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
  file: string;
  status: StatusPengaduan;
  tidakSelesaiCount: number;
  messages: IPesan[];
  createdAt: Date;
  updatedAt: Date;
}

const PesanSchema = new mongoose.Schema<IPesan>(
  {
    role:   { type: String, enum: ["walas", "bk"], required: true },
    pesan:  { type: String, default: "", trim: true },
    gambar: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const PengaduanBKSchema = new mongoose.Schema<IPengaduanBK>(
  {
    walas: { type: Schema.Types.ObjectId, ref: "User", required: true },
    siswa: { type: Schema.Types.ObjectId, ref: "Siswa", required: true },
    kategori: { type: String, enum: KATEGORI_LIST, required: true },
    judul: { type: String, required: true, trim: true },
    file: { type: String, required: true },
    status: { type: String, enum: ["open", "selesai", "ditutup"], default: "open" },
    tidakSelesaiCount: { type: Number, default: 0, min: 0, max: 3 },
    messages: [PesanSchema],
  },
  { timestamps: true }
);

PengaduanBKSchema.index({ walas: 1 });
PengaduanBKSchema.index({ siswa: 1 });
PengaduanBKSchema.index({ status: 1 });

const PengaduanBK: Model<IPengaduanBK> =
  mongoose.models.PengaduanBK ||
  mongoose.model<IPengaduanBK>("PengaduanBK", PengaduanBKSchema);

export default PengaduanBK;