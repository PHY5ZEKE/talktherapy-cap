const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    sourceOfReferral: {
      type: String,
      required: true,
    },
    chiefComplaint: {
      type: String,
      required: true,
    },
    selectedClinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClinicianSP",
      required: true,
    },
    selectedSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    referralUpload: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
