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
  diagnosis: { type: String, required: true },
});

module.exports = mongoose.model("SOAP", soapSchema);
