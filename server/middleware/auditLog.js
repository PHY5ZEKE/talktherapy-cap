const AuditLog = require("../models/auditLogSLP.model.js");

const createAuditLog = async (action, user, details) => {
  // const auditLog = new AuditLog({ action, user, details });
  // await auditLog.save();
  console.log(
    `Audit log action: ${action}, user: ${user}, details: ${details}`
  );
};

module.exports = { createAuditLog };
