import mongoose, { Document, Model, Schema } from "mongoose";

export interface IKelas extends Document {
  nama: string;
  waliKelas?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const KelasSchema = new mongoose.Schema<IKelas>(
  {
    nama: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    waliKelas: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Kelas: Model<IKelas> =
  mongoose.models.Kelas || mongoose.model<IKelas>("Kelas", KelasSchema);

export default Kelas;