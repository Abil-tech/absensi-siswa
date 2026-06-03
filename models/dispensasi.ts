import mongoose, { Document, Model, Schema } from "mongoose";

export type StatusDispensasi = "pending" | "disetujui" | "ditolak";

export interface IDispensasi extends Document {
  siswa: mongoose.Types.ObjectId;
  file: string;
  keterangan: string;
  statusWalas: StatusDispensasi;
  statusBK: StatusDispensasi;
  status: StatusDispensasi;
  catatanWalas?: string;
  catatanBK?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Hitung status final berdasarkan statusWalas dan statusBK
export function hitungStatusFinal(
  statusWalas: StatusDispensasi,
  statusBK: StatusDispensasi
): StatusDispensasi {
  if (statusWalas === "disetujui" || statusBK === "disetujui") return "disetujui";
  if (statusWalas === "ditolak" && statusBK === "ditolak") return "ditolak";
  return "pending";
}

const DispensasiSchema = new mongoose.Schema<IDispensasi>(
  {
    siswa: {
      type: Schema.Types.ObjectId,
      ref: "Siswa",
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    keterangan: {
      type: String,
      required: true,
      trim: true,
    },
    statusWalas: {
      type: String,
      enum: ["pending", "disetujui", "ditolak"],
      default: "pending",
    },
    statusBK: {
      type: String,
      enum: ["pending", "disetujui", "ditolak"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "disetujui", "ditolak"],
      default: "pending",
    },
    catatanWalas: { type: String, trim: true },
    catatanBK:    { type: String, trim: true },
  },
  { timestamps: true }
);

DispensasiSchema.index({ siswa: 1 });
DispensasiSchema.index({ status: 1 });

const Dispensasi: Model<IDispensasi> =
  mongoose.models.Dispensasi ||
  mongoose.model<IDispensasi>("Dispensasi", DispensasiSchema);

export default Dispensasi;