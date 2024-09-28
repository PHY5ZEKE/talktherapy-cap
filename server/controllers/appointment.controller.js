const Appointment = require("../models/appointment.model");
const ClinicianSLP = require("../models/clinicianSLP.model");
const Schedule = require("../models/schedule.model");
const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../client/src/documents/referrals")); // Specify the new directory to save the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Use a unique filename
  },
});

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/; // Allowed file types
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Only .jpeg, .jpg, .png, .pdf, .doc, and .docx files are allowed!"
        )
      );
    }
  },
}).single("referralUpload");

exports.createAppointment = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const {
        patientId,
        sourceOfReferral,
        chiefComplaint,
        selectedClinician,
        selectedSchedule,
      } = req.body;

      // Check if the patient already has an appointment
      const existingAppointment = await Appointment.findOne({ patientId });
      if (existingAppointment) {
        return res
          .status(400)
          .json({ message: "Patient already has an appointment" });
      }

      // Validate selectedClinician and selectedSchedule
      const clinician = await ClinicianSLP.findById(selectedClinician);
      if (!clinician) {
        return res.status(400).json({ message: "Invalid clinician selected" });
      }

      const schedule = await Schedule.findById(selectedSchedule);
      if (!schedule) {
        return res.status(400).json({ message: "Invalid schedule selected" });
      }

      // Create a new appointment
      const newAppointment = new Appointment({
        patientId,
        sourceOfReferral,
        chiefComplaint,
        selectedClinician,
        selectedSchedule,
        referralUpload: req.file ? req.file.path : "", // Save the file path
        status: "Pending",
      });

      // Save the appointment to the database
      await newAppointment.save();

      res.status(201).json({
        message: "Appointment created successfully",
        appointment: newAppointment,
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate({
      path: "selectedSchedule",
      select: "clinicianName specialization day startTime endTime", // Select the schedule details
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPatientAppointment = async (req, res) => {
  try {
    const patientId = req.user.id; // Assuming the patient ID is stored in req.user.id after token verification

    const appointments = await Appointment.find().populate({
      path: "selectedSchedule",
      select: "clinicianName specialization day startTime endTime", // Select the schedule details
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editAppointment = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const patientId = req.user.id; // Assuming the patient ID is stored in req.user.id after token verification
      const { appointmentId } = req.params;
      const {
        sourceOfReferral,
        chiefComplaint,
        selectedClinician,
        selectedSchedule,
      } = req.body;

      // Find the appointment by appointmentId and patientId
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId,
      });

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if the appointment status is "Pending"
      if (appointment.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Only pending appointments can be edited" });
      }

      // Validate selectedClinician and selectedSchedule
      const clinician = await ClinicianSLP.findById(selectedClinician);
      if (!clinician) {
        return res.status(400).json({ message: "Invalid clinician selected" });
      }

      const schedule = await Schedule.findById(selectedSchedule);
      if (!schedule) {
        return res.status(400).json({ message: "Invalid schedule selected" });
      }

      // Update the appointment with the new details
      appointment.sourceOfReferral = sourceOfReferral;
      appointment.chiefComplaint = chiefComplaint;
      appointment.selectedClinician = selectedClinician;
      appointment.selectedSchedule = selectedSchedule;

      // Update the referralUpload field if a new file is uploaded
      if (req.file) {
        appointment.referralUpload = req.file.path;
      }

      await appointment.save();

      res.status(200).json({
        message: "Appointment updated successfully",
        appointment,
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId).populate({
      path: "selectedSchedule",
      select: "clinicianName specialization day startTime endTime",
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    // Find the appointment by appointmentId
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check the current status and update accordingly
    if (
      appointment.status === "Pending" &&
      (status === "Approved" || status === "Rejected")
    ) {
      appointment.status = status;
    } else if (appointment.status === "Approved" && status === "Completed") {
      appointment.status = status;
    } else {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    await appointment.save();

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
