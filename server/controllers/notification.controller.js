const Notification = require("../models/notification.model");
const verifyToken = require("../middleware/verifyToken");
const { encrypt, decrypt } = require("../middleware/aesUtilities");

// Create a new notification
const createNotification = [
  verifyToken,
  async (req, res) => {
    try {
      let { body, date, show_to, reason } = req.body;

      if (!body || !show_to) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Ensure show_to is an array
      if (!Array.isArray(show_to)) {
        show_to = [show_to];
      }

      const encryptedShowTo = show_to.map((user) => encrypt(user));

      const notification = new Notification({
        body,
        date,
        show_to: encryptedShowTo,
        reason,
      });

      await notification.save();
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
];

// Get all notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    const decryptedNotifications = notifications.map(notification => ({
      ...notification._doc,
      show_to: notification.show_to.map(user => decrypt(user)),
    }));
    return res.status(200).json({ error: false, decryptedNotifications });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete notifications older than 1 week
const deleteOldNotifications = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    await Notification.deleteMany({ date: { $lt: oneWeekAgo } });
    console.log("Old notifications deleted");
  } catch (error) {
    console.error("Error deleting old notifications:", error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  deleteOldNotifications,
};
