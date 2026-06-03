import mongoose, { Document, Model } from "mongoose";

export type UserRole = "admin" | "walas" | "bk" | "siswa";

export interface IUser extends Document {
  name: string;
  email?: string;
  userId?: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name:     { type: String, required: true },
    email:    { type: String, unique: true, sparse: true },
    userId:   { type: String, unique: true, sparse: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "walas", "bk", "siswa"],
      required: true,
      default: "siswa",
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;