import mongoose from "mongoose";

const AbsensiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tanggal: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["hadir", "izin", "sakit", "alpha"],
  },
});

export default mongoose.models.Absensi || mongoose.model("Absensi", AbsensiSchema);