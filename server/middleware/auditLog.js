const AuditLog = require("../models/auditLogSLP.model.js");

const createAuditLog = async (action, user, details) => {
  // Comment out the actual logging functionality
  // const auditLog = new AuditLog({ action, user, details });
  // await auditLog.save();

  // Simply return to avoid breaking the system
  return;
};

module.exports = { createAuditLog };
