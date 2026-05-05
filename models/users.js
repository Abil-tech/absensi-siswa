import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "petugas", "siswa"],
    default: "siswa",
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);