const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assignmentSLPSchema = new Schema({
  clinicianId: {
    type: Schema.Types.ObjectId,
    ref: "ClinicianSLP",
    required: true,
  },
  patientId: { type: Schema.Types.ObjectId, ref: "PatientSlp", required: true },
  assignedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Assigned", "Pending", "Denied"],
    default: "Pending",
  },
  reason: { type: String, default: "" },
});

module.exports = mongoose.model("AssignmentSLP", assignmentSLPSchema);
