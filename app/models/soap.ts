import mongoose, { Schema } from "mongoose";

const soapScheme = new Schema({
  patient_id: mongoose.Schema.Types.ObjectId,
  clinician_id: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  activity_plan: {
    type: String,
    default: "No activity plan",
  },
  session_type: {
    type: String,
    default: "No session type",
  },
  session_recording: {
    type: String,
    default: "No session recording",
  },
  session_subjective: {
    type: String,
    default: "No session subjective",
  },
  session_objective: {
    type: String,
    default: "No session objective",
  },
  session_assessment: {
    type: String,
    default: "No session assessment",
  },
  session_recommendation: {
    type: String,
    default: "No session recommendation",
  },
});

const Soap = mongoose.model("Soap", soapScheme);
export default Soap;
