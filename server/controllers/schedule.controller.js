const Schedule = require("../models/schedule.model");
const ClinicianSLP = require("../models/clinicianSLP.model");
const { createAuditLog } = require("../middleware/auditLog");
const moment = require("moment");

const { encrypt, decrypt } = require("../middleware/aesUtilities");

// Helper function
const isEncrypted = (text) => {
  return text.includes(":");
};

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

    // Check if the schedule block is exactly 1 hour
    const duration = moment.duration(endMoment.diff(startMoment));
    if (duration.asHours() !== 1) {
      return res
        .status(400)
        .json({ message: "Each schedule block must be exactly 1 hour." });
    }

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
    const schedules = await Schedule.find({ clinicianId }).populate({
      path: "clinicianId",
      select: "firstName middleName lastName",
    });

    // Decrypt schedule clinician names
    const decryptedSchedules = schedules.map((schedule) => {
      if (schedule.clinicianId) {
        try {
          if (isEncrypted(schedule.clinicianId.firstName)) {
            schedule.clinicianId.firstName = decrypt(
              schedule.clinicianId.firstName
            );
          }
          if (isEncrypted(schedule.clinicianId.middleName)) {
            schedule.clinicianId.middleName = decrypt(
              schedule.clinicianId.middleName
            );
          }
          if (isEncrypted(schedule.clinicianId.lastName)) {
            schedule.clinicianId.lastName = decrypt(
              schedule.clinicianId.lastName
            );
          }
        } catch (decryptError) {
          console.error("Error decrypting patient details:", decryptError);
        }
      }
      return schedule;
    });

    res.status(200).json(decryptedSchedules);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Clinicain User Schedules
exports.getClinicianSched = async (req, res) => {
  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  try {
    // Fetch all schedules
    const schedules = await Schedule.find();

    schedules.sort((a, b) => {
      if (dayOrder[a.day] === dayOrder[b.day]) {
        return moment(a.startTime, "hh:mm A").diff(
          moment(b.startTime, "hh:mm A")
        );
      }
      return dayOrder[a.day] - dayOrder[b.day];
    });

    // Fetch clinician details for each schedule
    const schedulesWithSpecialization = await Promise.all(
      schedules.map(async (schedule) => {
        try {
          const clinician = await ClinicianSLP.findById(schedule.clinicianId);
          if (clinician) {
            // Decrypt clinician names
            try {
              if (isEncrypted(clinician.firstName)) {
                clinician.firstName = decrypt(clinician.firstName);
              }
              if (isEncrypted(clinician.middleName)) {
                clinician.middleName = decrypt(clinician.middleName);
              }
              if (isEncrypted(clinician.lastName)) {
                clinician.lastName = decrypt(clinician.lastName);
              }
            } catch (decryptError) {
              console.error(
                "Error decrypting clinician details:",
                decryptError
              );
            }

            return {
              ...schedule.toObject(),
              clinicianId: {
                _id: clinician._id,
                firstName: clinician.firstName,
                middleName: clinician.middleName,
                lastName: clinician.lastName,
              },
              specialization: clinician.specialization,
              contact: clinician.mobile,
              email: clinician.email,
              address: clinician.address,
            };
          } else {
            console.warn(`Clinician with ID ${schedule.clinicianId} not found`);
            return null; // Return null if clinician is not found
          }
        } catch (clinicianError) {
          console.error("Error fetching clinician details:", clinicianError);
          return null; // Return null if there is an error fetching clinician details
        }
      })
    );

    const validSchedules = schedulesWithSpecialization.filter(
      (schedule) => schedule !== null
    );
    res.status(200).json(validSchedules);
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

    // Check if the schedule block is exactly 1 hour
    const duration = moment.duration(endMoment.diff(startMoment));
    if (duration.asHours() !== 1) {
      return res
        .status(400)
        .json({ message: "Each schedule block must be exactly 1 hour." });
    }

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
        `Clinician with ${clinician.email} edited a schedule on ${day} from ${startTime} to ${endTime}`
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
