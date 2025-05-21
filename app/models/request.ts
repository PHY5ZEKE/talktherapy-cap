import { request } from "http";
import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema({
  clinician_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinician",
    required: true,
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  request_type: {
    type: String,
    required: true,
    enum: ["Referral", "Consultation", "Follow-up", "Assignment"],
  },
  request_status: {
    type: String,
    required: true,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  request_date: {
    type: Date,
    default: Date.now,
  },
});

const Request = mongoose.model("Request", requestSchema);
export default Request;
