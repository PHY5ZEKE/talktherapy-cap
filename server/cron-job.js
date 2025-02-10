const cron = require("node-cron");

const {
  archiveInactiveUsers,
} = require("./controllers/superAdminSLP.controller");

const {
  deleteOldNotifications,
} = require("./controllers/notification.controller");

// Archival of Inactive Users
// This is set to run every 24 hours
cron.schedule("0 0 * * *", () => {
  console.log("Archiving inactive users for more than 3 months...");
  archiveInactiveUsers();
});

// Deletion of old notifications
cron.schedule("0 0 * * *", () => {
  console.log("Running archiveInactiveUsers task...");
  deleteOldNotifications();
});

console.log("Running scheduled tasks...");
