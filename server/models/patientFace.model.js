const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const faceAssessmentSchema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },

  topPredictions: [
    {
      label: String,
      probability: Number,
    },
  ],
  recordedData: [
    [
      {
        label: { type: String, required: true },
        probability: { type: Number, required: true },
      },
    ],
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

module.exports = mongoose.model("FaceAssessment", faceAssessmentSchema);