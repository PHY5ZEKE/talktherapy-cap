import mongoose, { Schema } from "mongoose";

const scheduleSchema = new Schema({
  clinician_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinician",
    required: true,
  },
  clinician_name: {
    type: String,
    required: true,
    ref: "Clinician",
  },
  clinician_specialization: {
    type: String,
    required: true,
    ref: "Clinician",
  },
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    default: "Weekly",
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Booked", "Available", "Pending"],
    default: "Available",
  },
  details: {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    patient_name: {
      type: String,
      default: null,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
