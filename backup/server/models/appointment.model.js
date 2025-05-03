const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientSlp",
      required: true,
    },
    medicalDiagnosis: {
      type: String,
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
      ref: "ClinicianSLP",
      required: true,
    },
    selectedSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    newSchedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
    temporaryReschedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
    changeReason: { type: String },
    referralUpload: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Completed",
        "Schedule Change Request",
        "Temporary Reschedule Request",
        "Temporarily Rescheduled",
      ],
      default: "Pending",
    },
    roomId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
