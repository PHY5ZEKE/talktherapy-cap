const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  clinicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClinicianSLP", // Ensure this matches the model name in clinicianSLP.model.js
    required: true,
  },
  clinicianName: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "available",
  },
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
