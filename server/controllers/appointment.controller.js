const Appointment = require("../models/appointment.model");
const Admin = require("../models/adminSLP.model"); // Import the Admin model
const ClinicianSLP = require("../models/clinicianSLP.model");
const Patient = require("../models/patientSlp.model");
const Schedule = require("../models/schedule.model");
const multer = require("multer");
const path = require("path");
const s3 = require("../config/aws");
const multerS3 = require("multer-s3");
const { createAuditLog } = require("../middleware/auditLog");

const { encrypt, decrypt } = require("../middleware/aesUtilities");

// Initialize upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const folderName = "referrals"; // Specify your folder name here
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      const filePath = `${folderName}/${fileName}`;
      cb(null, filePath);
    },
  }),
}).single("file");

// Create a new appointment JSON first
exports.createAppointmentJSON = async (req, res) => {
  try {
    // Now req.body contains the form fields, and req.file contains the file
    const {
      patientId,
      sourceOfReferral,
      chiefComplaint,
      selectedClinician,
      selectedSchedule,
    } = req.body;

    // Validate the extracted fields
    if (!selectedClinician) {
      return res.status(400).json({ message: "Clinician ID is required" });
    }

    // Check if the clinician exists
    const clinician = await ClinicianSLP.findById(selectedClinician);
    if (!clinician) {
      return res.status(400).json({ message: "Invalid clinician selected" });
    }

    // Check if the schedule exists
    const schedule = await Schedule.findById(selectedSchedule);
    if (!schedule) {
      return res.status(400).json({ message: "Invalid schedule selected" });
    }

    // Check if the patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(400).json({ message: "Invalid patient selected" });
    }

    // Check if appointment already exists for the patient
    const existingAppointment = await Appointment.findOne({ patientId });
    const existingSchedule = await Appointment.findOne({ selectedSchedule });
    if (existingAppointment && existingSchedule) {
      return res
        .status(400)
        .json({ message: "Patient already has an appointment" });
    }

    // Save the JSON without File Upload to DB
    const newAppointment = new Appointment({
      patientId,
      sourceOfReferral,
      chiefComplaint,
      selectedClinician,
      selectedSchedule,
      referralUpload: "Uploading",
      status: "Pending",
    });

    await newAppointment.save();

    try {
      // Extract schedule details
      const { day, startTime, endTime } = schedule;

      // Create audit log with the patient's email and clinician's email
      await createAuditLog(
        "createAppointment",
        patient.email, // Pass the patient's email
        `Patient ${patient.email} has booked a session with clinician ${clinician.email} on ${day} from ${startTime} to ${endTime}`
      );
    } catch (auditLogError) {
      console.error("Error creating audit log:", auditLogError);
      // Continue without failing the request
    }

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: newAppointment,
      appointmentId: newAppointment._id,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get JSON and then send file to DB
exports.createAppointment = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      // Check if appointment and schedule with patient already exists
      const existingAppointment = await Appointment.findOne({
        _id: req.body.appointmentId,
      });
      if (existingAppointment) {
        // Update the appointment with the new details
        existingAppointment.sourceOfReferral = req.body.sourceOfReferral;
        existingAppointment.chiefComplaint = req.body.chiefComplaint;
        existingAppointment.selectedClinician = req.body.selectedClinician;
        existingAppointment.selectedSchedule = req.body.selectedSchedule;
        existingAppointment.referralUpload = req.file
          ? req.file.location
          : "Uploading";

        // Save the new appointment to mongodb
        await existingAppointment.save();

        res.status(201).json({
          message: "Appointment created successfully",
          appointment: existingAppointment,
        });
      } else {
        return res
          .status(400)
          .json({ message: "No appointment found for patient" });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: "selectedSchedule",
        select: "clinicianName specialization day startTime endTime", // Select the schedule details
      })
      .populate({
        path: "patientId",
        select: "firstName middleName lastName", // Select the patient details
      })
      .populate({
        path: "newSchedule",
        select: "clinicianName specialization day startTime endTime", // Select the schedule details
      });
    // Decrypt patient details
    const decryptedAppointments = appointments.map((appointment) => {
      if (appointment.patientId) {
        appointment.patientId.firstName = decrypt(
          appointment.patientId.firstName
        );
        appointment.patientId.middleName = decrypt(
          appointment.patientId.middleName
        );
        appointment.patientId.lastName = decrypt(
          appointment.patientId.lastName
        );
      }
      return appointment;
    });

    res.status(200).json(decryptedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPatientAppointment = async (req, res) => {
  try {
    const patientId = req.user.id; // Assuming the patient ID is stored in req.user.id after token verification

    // Find appointments for the logged-in user only
    const appointments = await Appointment.find({ patientId }).populate([
      {
        path: "selectedSchedule",
        select: "clinicianName specialization day startTime endTime status", // Select the schedule details
      },
      {
        path: "newSchedule",
        select: "clinicianName specialization day startTime endTime status", // Select the new schedule details
      },
    ]);

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

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "selectedSchedule",
        select: "clinicianName specialization day startTime endTime",
      })
      .populate({
        path: "patientId",
        select: "firstName middleName lastName",
      })
      .populate({
        path: "newSchedule",
        select: "clinicianName specialization day startTime endTime",
      });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Decrypt patient information
    if (appointment.patientId) {
      appointment.patientId.firstName = decrypt(
        appointment.patientId.firstName
      );
      appointment.patientId.middleName = decrypt(
        appointment.patientId.middleName
      );
      appointment.patientId.lastName = decrypt(appointment.patientId.lastName);
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function generateRoomId() {
  const length = 8;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const adminId = req.user.id; // Assuming the token contains the admin ID

    // Find the appointment by appointmentId and populate selectedSchedule and newSchedule
    const appointment = await Appointment.findById(appointmentId).populate([
      "selectedSchedule",
      "newSchedule",
    ]);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Fetch admin details
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Fetch patient details
    const patient = await Patient.findById(appointment.patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Fetch clinician details
    const clinician = await ClinicianSLP.findById(
      appointment.selectedClinician
    );
    if (!clinician) {
      return res.status(404).json({ message: "Clinician not found" });
    }

    // Check the current status and update accordingly
    if (
      appointment.status === "Pending" &&
      (status === "Accepted" || status === "Rejected")
    ) {
      // If appointment is Pending and the status to update is Accepted or Rejected
      appointment.status = status;
      if (status === "Accepted") {
        appointment.roomId = generateRoomId();
        // Update the selectedSchedule status to "Booked"
        appointment.selectedSchedule.status = "Booked";
        await appointment.selectedSchedule.save();
      } else {
        appointment.roomId = "errorRoomId";
      }
    } else if (appointment.status === "Accepted" && status === "Completed") {
      // If appointment is Accepted and the status to update is Completed
      appointment.status = status;
      appointment.roomId = "errorRoomId";
      // Update the selectedSchedule status to "Available"
      appointment.selectedSchedule.status = "Available";
      await appointment.selectedSchedule.save();
    } else if (appointment.status === "Schedule Change Request") {
      // If appointment is Schedule Change Request and the status to update is Accepted or Rejected
      if (status === "Accepted") {
        appointment.status = "Accepted";
        // Update status of old schedule to "Available"
        const oldSchedule = appointment.selectedSchedule;
        oldSchedule.status = "Available";
        await oldSchedule.save();
        // Override the selectedSchedule with the newSchedule
        appointment.selectedSchedule = appointment.newSchedule;
        // Empty the newSchedule and changeReason
        appointment.newSchedule = null;
        appointment.changeReason = "";
        // Update the newSchedule status to "Booked"
        appointment.selectedSchedule.status = "Booked";
        await appointment.selectedSchedule.save();
      } else if (status === "Rejected") {
        appointment.status = "Rejected";
        // Update status of old schedule to "Available"
        const oldSchedule = appointment.selectedSchedule;
        oldSchedule.status = "Available";
        await oldSchedule.save();
      }
    } else {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    await appointment.save();

    try {
      // Create audit log with the admin's email, patient's email, and clinician's email
      await createAuditLog(
        "updateAppointmentStatus",
        admin.email, // Pass the admin's email
        `Admin ${admin.email} ${status} the appointment request of patient email ${patient.email} with clinician email ${clinician.email}`
      );
    } catch (auditLogError) {
      console.error("Error creating audit log:", auditLogError);
      // Continue without failing the request
    }

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getClinicianAppointments = async (req, res) => {
  try {
    const clinicianId = req.user.id; // Assuming the clinician ID is stored in req.user.id after token verification

    // Find appointments for the logged-in clinician with status "Accepted" or "Completed"
    const appointments = await Appointment.find({
      selectedClinician: clinicianId,
      status: { $in: ["Accepted", "Completed"] },
    })
      .populate({
        path: "selectedSchedule",
        select: "clinicianName specialization day startTime endTime", // Select the schedule details
      })
      .populate({
        path: "patientId",
        select: "firstName middleName lastName", // Select the patient details
      });

    // Decrypt patient details
    const decryptedAppointments = appointments.map((appointment) => {
      if (appointment.patientId) {
        appointment.patientId.firstName = decrypt(
          appointment.patientId.firstName
        );
        appointment.patientId.middleName = decrypt(
          appointment.patientId.middleName
        );
        appointment.patientId.lastName = decrypt(
          appointment.patientId.lastName
        );
      }
      return appointment;
    });

    res.status(200).json(decryptedAppointments);
  } catch (error) {
    console.error("Error fetching clinician appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.requestScheduleChange = async (req, res) => {
  try {
    const { appointmentId, newScheduleId, reason } = req.body;
    const patientId = req.user.id; // Assuming the patient ID is stored in req.user.id after token verification

    // Find the appointment by appointmentId and patientId
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Validate the new schedule
    const newSchedule = await Schedule.findById(newScheduleId);
    if (!newSchedule) {
      return res.status(400).json({ message: "Invalid new schedule selected" });
    }

    // Update the appointment with the new schedule and reason
    appointment.newSchedule = newScheduleId;
    appointment.changeReason = reason;
    appointment.status = "Schedule Change Request";

    await appointment.save();

    res.status(200).json({
      message: "Schedule change request submitted successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error requesting schedule change:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.requestTemporaryReschedule = async (req, res) => {
  try {
    const { appointmentId, newScheduleId, reason } = req.body;
    const patientId = req.user.id; // Assuming the patient ID is stored in req.user.id after token verification

    // Find the appointment by appointmentId and patientId
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Validate the new schedule
    const newSchedule = await Schedule.findById(newScheduleId);
    if (!newSchedule) {
      return res.status(400).json({ message: "Invalid new schedule selected" });
    }

    // Update the appointment with the new schedule and reason
    appointment.temporaryReschedule = newScheduleId;
    appointment.changeReason = reason;
    appointment.status = "Temporary Reschedule Request";

    await appointment.save();

    res.status(200).json({
      message: "Temporary reschedule request submitted successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error requesting temporary reschedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
