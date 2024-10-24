const Schedule = require("../models/schedule.model");
const ClinicianSLP = require("../models/clinicianSLP.model");
const { createAuditLog } = require("../middleware/auditLog");
const moment = require("moment");

exports.addSchedule = async (req, res) => {
  const { day, startTime, endTime } = req.body;
  const clinicianId = req.user.id; // Assuming the token contains the user ID

  try {
    // Fetch clinician details
    const clinician = await ClinicianSLP.findById(clinicianId);
    if (!clinician) {
      return res.status(404).json({ message: "Clinician not found" });
    }

    // Convert startTime and endTime to moment objects
    const startMoment = moment(startTime, "hh:mm A");
    const endMoment = moment(endTime, "hh:mm A");

    // Check for overlapping schedules
    const existingSchedules = await Schedule.find({
      clinicianId,
      day,
    });

    for (const schedule of existingSchedules) {
      const existingStart = moment(schedule.startTime, "hh:mm A");
      const existingEnd = moment(schedule.endTime, "hh:mm A");

      if (
        startMoment.isBetween(existingStart, existingEnd, null, "[)") ||
        endMoment.isBetween(existingStart, existingEnd, null, "(]") ||
        existingStart.isBetween(startMoment, endMoment, null, "[)") ||
        existingEnd.isBetween(startMoment, endMoment, null, "(]")
      ) {
        return res
          .status(400)
          .json({ message: "Schedule overlaps with an existing schedule." });
      }
    }

    // Create new schedule
    const clinicianName = `${clinician.firstName} ${clinician.middleName} ${clinician.lastName}`;
    const newSchedule = new Schedule({
      clinicianId,
      clinicianName,
      specialization: clinician.specialization,
      day,
      startTime: startMoment.format("hh:mm A"),
      endTime: endMoment.format("hh:mm A"),
      status: "Available", // Default value
    });

    await newSchedule.save();

    // Create audit log with the clinician's email
    await createAuditLog(
      "addSchedule",
      clinician.email, // Pass the clinician's email
      `Clinician with ${clinician.email} added a new schedule on ${day} from ${startTime} to ${endTime}`
    );

    res
      .status(201)
      .json({ message: "Schedule added successfully", schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getSchedules = async (req, res) => {
  const clinicianId = req.user.id; // Assuming the token contains the user ID
  try {
    const schedules = await Schedule.find({ clinicianId });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Clinicain User Schedules
exports.getClinicianSched = async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  const clinicianId = req.user.id; // Assuming the token contains the user ID

  try {
    const schedule = await Schedule.findOneAndDelete({ _id: id, clinicianId });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    try {
      // Fetch clinician details
      const clinician = await ClinicianSLP.findById(clinicianId);
      if (!clinician) {
        return res.status(404).json({ message: "Clinician not found" });
      }

      // Create audit log with the clinician's email
      await createAuditLog(
        "deleteSchedule",
        clinician.email, // Pass the clinician's email
        `Clinician with  ${clinician.email} deleted a schedule on ${schedule.day} from ${schedule.startTime} to ${schedule.endTime}`
      );
    } catch (auditLogError) {
      console.error("Error creating audit log:", auditLogError);
      // Continue without failing the request
    }

    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getScheduleById = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({ schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.editSchedule = async (req, res) => {
  const { id } = req.params;
  const { day, startTime, endTime } = req.body;
  const clinicianId = req.user.id; // Assuming the token contains the user ID

  try {
    // Convert startTime and endTime to moment objects
    const startMoment = moment(startTime, "hh:mm A");
    const endMoment = moment(endTime, "hh:mm A");

    // Check for overlapping schedules
    const existingSchedules = await Schedule.find({
      clinicianId,
      day,
      _id: { $ne: id }, // Exclude the current schedule being edited
    });

    for (const schedule of existingSchedules) {
      const existingStart = moment(schedule.startTime, "hh:mm A");
      const existingEnd = moment(schedule.endTime, "hh:mm A");

      if (
        startMoment.isBetween(existingStart, existingEnd, null, "[)") ||
        endMoment.isBetween(existingStart, existingEnd, null, "(]") ||
        existingStart.isBetween(startMoment, endMoment, null, "[)") ||
        existingEnd.isBetween(startMoment, endMoment, null, "(]")
      ) {
        return res
          .status(400)
          .json({ message: "Schedule overlaps with an existing schedule." });
      }
    }

    const schedule = await Schedule.findOneAndUpdate(
      { _id: id, clinicianId },
      {
        day,
        startTime: startMoment.format("hh:mm A"),
        endTime: endMoment.format("hh:mm A"),
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    try {
      // Fetch clinician details
      const clinician = await ClinicianSLP.findById(clinicianId);
      if (!clinician) {
        return res.status(404).json({ message: "Clinician not found" });
      }

      // Create audit log with the clinician's email
      await createAuditLog(
        "editSchedule",
        clinician.email, // Pass the clinician's email
        `Clinician with  ${clinician.email} edited a schedule on ${day} from ${startTime} to ${endTime}`
      );
    } catch (auditLogError) {
      console.error("Error creating audit log:", auditLogError);
      // Continue without failing the request
    }

    res
      .status(200)
      .json({ message: "Schedule updated successfully", schedule });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
