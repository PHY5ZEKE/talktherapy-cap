import mongoose, { Schema } from "mongoose";
import type { ADMIN } from "types/account";

const adminSchema = new Schema<
  Omit<ADMIN, "confPassword"> & {
    accountStatus: "active" | "inactive" | "deleted" | "pending";
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
    deletedAt: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    role: string;
    bookmarkedContent: {
      type: [mongoose.Schema.Types.ObjectId];
      ref: "Content";
      default: [];
    };
  }
>({
  firstName: { type: String, required: true },
  middleName: { type: String, default: null },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  accountStatus: { type: String, required: true, default: "active" },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  deletedAt: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  role: { type: String, required: true, default: "admin" },
  bookmarkedContent: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Content",
    default: [],
  },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
