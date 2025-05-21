import mongoose, { Schema } from "mongoose";

// Ccheck fo
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
  status: {
    type: String,
    required: true,
    enum: ["Booked", "Available", "Pending"],
    default: "Available",
  },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
