import mongoose, { Schema } from "mongoose";

const sampleDataSchema = new Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
});

const SampleData = mongoose.model("SampleData", sampleDataSchema, "sampledata");

export default SampleData;
