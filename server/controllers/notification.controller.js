const Notification = require("../models/notification.model");
const verifyToken = require("../middleware/verifyToken");
const { encrypt, decrypt } = require("../middleware/aesUtilities");

// Create a new notification
const createNotification = [
  verifyToken,
  async (req, res) => {
    try {
      const { body, date, show_to } = req.body;
      console.log(`body: ${body}, date:${date}, show:${show_to}`);
      if (!body || !show_to) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const notification = new Notification({
        body,
        date,
        show_to: encrypt(show_to),
      });
      console.log(notification);
      await notification.save();

      res.status(201).json(notification);
    } catch (error) {
      console.log(error);
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
        show_to: decrypt(notification.show_to),
      }));
      console.log(decryptedNotifications);
      return res.status(200).json({ error: false, decryptedNotifications });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete notifications older than 1 week
const deleteOldNotifications = async () => {
  // const oneWeekAgo = new Date();
  // oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const threeMinutesAgo = new Date();
  threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3);

  try {
    await Notification.deleteMany({ date: { $lt: threeMinutesAgo } });
    console.log("Old notifications deleted");
  } catch (error) {
    console.error("Error deleting old notifications:", error);
  }
};

// Schedule the deletion of old notifications 24 hrs ahu
// setInterval(deleteOldNotifications, 24 * 60 * 60 * 1000);
setInterval(deleteOldNotifications, 3 * 60 * 1000);

module.exports = {
  createNotification,
  getNotifications,
};
