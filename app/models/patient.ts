import mongoose, { Schema } from "mongoose";
import type { PATIENT } from "types/account";

const patientSchema = new Schema<
  Omit<PATIENT, "confPassword"> & {
    accountStatus: "active" | "inactive" | "deleted";
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
  birthday: { type: String, required: true },
  diagnosis: { type: String, required: true },
  consent: { type: Boolean, required: true },
  accountStatus: { type: String, required: true, default: "active" },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  deletedAt: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  role: { type: String, required: true, default: "patient" },
  bookmarkedContent: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Content",
    default: [],
  },
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
