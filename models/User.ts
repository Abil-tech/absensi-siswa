import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  userId?: string;
  password: string;
  role: "admin" | "walas" | "bk" | "siswa";
}

const UserSchema = new mongoose.Schema<IUser>({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  userId:   { type: String, unique: true, sparse: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["admin", "walas", "bk", "siswa"],
    default: "siswa",
  },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
