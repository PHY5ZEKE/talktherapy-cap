const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");
const verifyToken = require("../middleware/verifyToken");

// Route to create a new appointment
router.post(
  "/create-appointment/file",
  verifyToken,
  appointmentController.createAppointment
);

router.post(
  "/create-appointment/json",
  verifyToken,
  appointmentController.createAppointmentJSON
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

router.get(
  "/get-appointment-by-clinician",
  verifyToken, // Ensure the user is authenticated
  appointmentController.getClinicianAppointments
);

module.exports = router;
