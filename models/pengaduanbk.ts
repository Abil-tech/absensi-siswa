import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPengaduanBK extends Document {
  walas: mongoose.Types.ObjectId;
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

// Index untuk query laporan per walas
PengaduanBKSchema.index({ walas: 1 });

const PengaduanBK: Model<IPengaduanBK> =
  mongoose.models.PengaduanBK ||
  mongoose.model<IPengaduanBK>("PengaduanBK", PengaduanBKSchema);

export default PengaduanBK;