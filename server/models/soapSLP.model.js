const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const soapSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "PatientSlp", required: true },
  clinicianId: {
    type: Schema.Types.ObjectId,
    ref: "clinicianSLP",
    required: true,
  },
  date: { type: Date, required: true },
  activityPlan: { type: String, required: true },
  sessionType: { type: String, required: true },
  sessionRecording: { type: String, required: true },
  subjective: { type: String, required: true },
  objective: { type: String, required: true },
  assessment: { type: String, required: true },
  recommendation: { type: String, required: true },
});

module.exports = mongoose.model("SOAP", soapSchema);
