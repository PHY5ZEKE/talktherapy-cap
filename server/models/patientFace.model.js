const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const faceAssessmentSchema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  capturedImage: {
    type: String, // Store the base64 encoded image
    required: false,
  },
  topPredictions: [
    {
      label: String,
      probability: Number,
    },
  ],
  recordedData: [
    {
      type: [Number],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FaceAssessment", faceAssessmentSchema);