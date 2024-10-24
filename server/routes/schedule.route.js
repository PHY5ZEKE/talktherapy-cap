const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/schedule.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/add-schedule", verifyToken, scheduleController.addSchedule);
router.get("/get-schedules", verifyToken, scheduleController.getSchedules);
router.delete(
  "/delete-schedule/:id",
  verifyToken,
  scheduleController.deleteSchedule
);

router.get("/get-schedule/:id", scheduleController.getScheduleById);

router.put("/edit-schedule/:id", verifyToken, scheduleController.editSchedule);

// PATIENT GET
router.get(
  "/clinician-schedules",
  verifyToken,
  scheduleController.getClinicianSched
);

module.exports = router;
