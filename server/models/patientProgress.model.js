const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const patientProgressSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "PatientSlp", required: true },
  textId: { type: Number, required: true }, 
  currentPhrase: { type: Number, required: true },
  correctCount: { type: Number, default: 0 },
  totalPhrases: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PatientProgress", patientProgressSchema);