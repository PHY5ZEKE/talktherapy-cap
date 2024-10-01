const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");
const verifyToken = require("../middleware/verifyToken");

// Route to create a new appointment
router.post(
  "/create-appointment",
  verifyToken,
  appointmentController.createAppointment
);
router.get("/get-all-appointments", appointmentController.getAllAppointments);
router.get(
  "/get-appointment",
  verifyToken,
  appointmentController.getPatientAppointment
);

router.put(
  "/edit-appointment/:appointmentId",
  verifyToken,
  appointmentController.editAppointment
);

router.get(
  "/get-appointment-by-id/:appointmentId",
  verifyToken,
  appointmentController.getAppointmentById
);

router.put(
  "/update-status/:appointmentId",
  verifyToken,
  appointmentController.updateAppointmentStatus
);

module.exports = router;
