const Schedule = require("../models/schedule.model");
const ClinicianSLP = require("../models/clinicianSLP.model");

exports.addSchedule = async (req, res) => {
  const { day, startTime, endTime } = req.body;
  const clinicianId = req.user.id; // Assuming the token contains the user ID

  try {
    // Fetch clinician details
    const clinician = await ClinicianSLP.findById(clinicianId);
    if (!clinician) {
      return res.status(404).json({ message: "Clinician not found" });
    }

    // Check for overlapping schedules
    const existingSchedule = await Schedule.findOne({
      clinicianId,
      day,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
    });

    if (existingSchedule) {
      return res
        .status(400)
        .json({ message: "Schedule overlaps with an existing schedule." });
    }

    // Create new schedule
    const clinicianName = `${clinician.firstName} ${clinician.middleName} ${clinician.lastName}`;
    const newSchedule = new Schedule({
      clinicianId,
      clinicianName,
      specialization: clinician.specialization,
      day,
      startTime,
      endTime,
      status: "Available", // Default value
    });

    await newSchedule.save();
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
  // it does not need to get the clicnian id
  // it only needs to get all instances of clinician schedules regardless of clinician id
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

    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.editSchedule = async (req, res) => {
  const { id } = req.params;
  const { day, startTime, endTime } = req.body;
  const clinicianId = req.user.id; // Assuming the token contains the user ID

  try {
    // Check for overlapping schedules
    const existingSchedule = await Schedule.findOne({
      clinicianId,
      day,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
      _id: { $ne: id }, // Exclude the current schedule being edited
    });

    if (existingSchedule) {
      return res
        .status(400)
        .json({ message: "Schedule overlaps with an existing schedule." });
    }

    const schedule = await Schedule.findOneAndUpdate(
      { _id: id, clinicianId },
      { day, startTime, endTime },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res
      .status(200)
      .json({ message: "Schedule updated successfully", schedule });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
