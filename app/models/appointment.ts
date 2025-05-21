import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema({
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
  schedule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    required: true,
  },
  referral_link: {
    type: String,
    required: true,
  },
  referral_source: {
    type: String,
    required: true,
  },
  chief_complaint: {
    type: String,
    required: true,
  },
  appointment_status: {
    type: String,
    required: true,
  },
  patient_diagnosis: {
    type: String,
    required: true,
  },
  appointment_room: {
    type: String,
    required: true,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
