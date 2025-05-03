const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  createNotification,
  getNotifications,
} = require('../controllers/notification.controller');

// Route to create a new notification
router.post('/create-notifications', verifyToken, createNotification);

// Route to get all notifications
router.get('/get-notifications', getNotifications);

module.exports = router;