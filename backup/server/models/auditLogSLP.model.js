const mongoose = require("mongoose");

const auditLogSLPSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String, required: true },
});

module.exports = mongoose.model("AuditLogSLP", auditLogSLPSchema);
