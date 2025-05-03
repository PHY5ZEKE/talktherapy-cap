const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const speechAssessmentSchema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  top3Results: [
    {
      label: { type: String, required: true },
      score: { type: Number, required: true },
    },
  ],
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SpeechAssessment", speechAssessmentSchema);