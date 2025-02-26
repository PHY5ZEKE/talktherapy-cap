const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  body: { type: String, required: true },
  date: { type: Date, required: true },
  show_to: { type: [String], required: true },
  reason: { type: String, required: false }
});

module.exports = mongoose.model("notification", notificationSchema);
