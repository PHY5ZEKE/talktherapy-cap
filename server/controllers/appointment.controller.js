const Appointment = require("../models/appointment.model");
const Admin = require("../models/adminSLP.model"); // Import the Admin model
const ClinicianSLP = require("../models/clinicianSLP.model");
const AssignmentSLP = require("../models/assignmentSLP.model");
const Patient = require("../models/patientSlp.model");
const Schedule = require("../models/schedule.model");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB size limit
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|jpg|jpeg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid File Type"));
    }
  },
}).single("file");

// Utility Functions
const findAppointmentDetails = async (appointmentId) => {
  return await Appointment.findById(appointmentId).populate([
    "selectedSchedule",
    "newSchedule",
    "temporaryReschedule",
  ]);
};

const isEncrypted = (text) => {
  return text.includes(":");
};

const findAdminDetails = async (adminId) => {
  return await Admin.findById(adminId);
};

const findPatientDetails = async (patientId) => {
  return await Patient.findById(patientId);
};

const findClinicianDetails = async (clinicianId) => {
  return await ClinicianSLP.findById(clinicianId);
};

const handlePendingStatus = async (appointment, status) => {
  appointment.status = status;
  if (status === "Accepted") {
    if (appointment.selectedSchedule.status === "Booked") {
      throw new Error("The selected schedule is no longer available.");
    }
    appointment.roomId = generateRoomId();
    appointment.selectedSchedule.status = "Booked";
    await appointment.selectedSchedule.save();

    // Assign patient to clinician
    const existingAssignment = await AssignmentSLP.findOne({
      clinicianId: appointment.selectedClinician,
      patientId: appointment.patientId,
    });

    if (!existingAssignment) {
      const clinicianPatient = new AssignmentSLP({
        clinicianId: appointment.selectedClinician,
        patientId: appointment.patientId,
        status: "Assigned",
        reason: "",
      });
      await clinicianPatient.save();
    }
  } else if (status === "Rejected") {
    appointment.selectedSchedule.status = "Available";
    await appointment.selectedSchedule.save();
    appointment.roomId = "errorRoomId";
  } else {
    appointment.roomId = "errorRoomId";
  }
};

const handleAcceptedStatus = async (appointment) => {
  appointment.status = "Completed";
  appointment.roomId = "errorRoomId";
  appointment.selectedSchedule.status = "Available";
  await appointment.selectedSchedule.save();
};

const handleScheduleChangeRequest = async (appointment, status) => {
  if (status === "Accepted") {
    if (appointment.newSchedule.status === "Booked") {
      throw new Error("The new schedule is no longer available.");
    }

    appointment.status = "Accepted";
    const oldSchedule = appointment.selectedSchedule;
    oldSchedule.status = "Available";

    await oldSchedule.save();

    appointment.selectedSchedule = appointment.newSchedule;
    appointment.newSchedule = null;
    appointment.changeReason = "";
    appointment.selectedSchedule.status = "Booked";

    await appointment.selectedSchedule.save();
  } else if (status === "Rejected") {
    appointment.status = "Rejected";
    const oldSchedule = appointment.selectedSchedule;
    oldSchedule.status = "Available";
    appointment.newSchedule.status = "Available";

    await oldSchedule.save();
    await appointment.newSchedule.save();
  }
};

const handleTemporaryRescheduleRequest = async (appointment, status) => {
  if (status === "Accepted") {
    if (appointment.temporaryReschedule.status === "Booked") {
      throw new Error("The temporary reschedule is no longer available.");
    }

    appointment.status = "Temporarily Rescheduled";
    const temporaryReschedule = appointment.temporaryReschedule;
    temporaryReschedule.status = "Booked";

    await temporaryReschedule.save();
  } else if (status === "Rejected") {
    appointment.status = "Accepted";
    const temporaryReschedule = appointment.temporaryReschedule;
    temporaryReschedule.status = "Available";

    await temporaryReschedule.save(); // Save the temporaryReschedule object
  }
};

const handleTemporarilyRescheduled = async (appointment) => {
  appointment.status = "Accepted";
  const temporaryReschedule = appointment.temporaryReschedule;
  temporaryReschedule.status = "Available";

  await temporaryReschedule.save();
};

const decryptPatientDetails = (appointment) => {
  if (appointment.patientId) {
    try {
      if (
        appointment.patientId.firstName &&
        appointment.patientId.firstName.includes(":")
      ) {
        appointment.patientId.firstName = decrypt(
          appointment.patientId.firstName
        );
      }
      if (
        appointment.patientId.middleName &&
        appointment.patientId.middleName.includes(":")
      ) {
        appointment.patientId.middleName = decrypt(
          appointment.patientId.middleName
        );
      }
      if (
        appointment.patientId.lastName &&
        appointment.patientId.lastName.includes(":")
      ) {
        appointment.patientId.lastName = decrypt(
          appointment.patientId.lastName
        );
      }
    } catch (error) {
      console.error("Error decrypting patient details:", error);
    }
  }
  return appointment;
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

exports.createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error("Error during file upload:", err.message);
        return res.status(400).json({ message: err.message });
      }
      try {
        const {
          patientId,
          medicalDiagnosis,
          sourceOfReferral,
          chiefComplaint,
          selectedClinician,
          selectedSchedule,
        } = req.body;

        console.log("Request Body:", req.body);

        if (!selectedSchedule) {
          console.error("Schedule ID is required but not provided");
          return res.status(400).json({ error: "Schedule ID is required" });
        }

        // Validate the extracted fields
        if (!selectedClinician) {
          console.error("Clinician ID is required but not provided");
          return res.status(400).json({ message: "Clinician ID is required" });
        }

        // Check if the clinician exists
        const clinician = await ClinicianSLP.findById(selectedClinician);
        if (!clinician) {
          console.error(`Invalid clinician selected: ${selectedClinician}`);
          return res
            .status(400)
            .json({ message: "Invalid clinician selected" });
        }

        // Check if the schedule exists and is available
        const schedule = await Schedule.findById(selectedSchedule).session(
          session
        );
        if (!schedule) {
          console.error(`Invalid schedule selected: ${selectedSchedule}`);
          return res.status(400).json({ message: "Invalid schedule selected" });
        }

        if (schedule.status !== "Available") {
          console.error(`Schedule is not available: ${selectedSchedule}`);
          return res.status(400).json({ message: "Schedule is not available" });
        }

        // Check if the patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
          console.error(`Invalid patient selected: ${patientId}`);
          return res.status(400).json({ message: "Invalid patient selected" });
        }

        // Check if patient has an existing appointment
        const existingAppointment = await Appointment.find({
          patientId: patientId,
          status: { $nin: ["Completed", "Rejected"] },
        });

        if (existingAppointment.length > 0) {
          console.error(`Patient already has an appointment: ${patientId}`);
          return res
            .status(400)
            .json({ message: "Patient already has an appointment" });
        }

        // Update the status of the selected schedule to "Requested"
        schedule.status = "Requested";
        await schedule.save({ session });

        // Save the appointment with file upload to DB
        const newAppointment = new Appointment({
          patientId,
          medicalDiagnosis,
          sourceOfReferral,
          chiefComplaint,
          selectedClinician,
          selectedSchedule,
          referralUpload: req.file ? req.file.location : null,
          status: "Pending",
        });

        await newAppointment.save({ session });

        await session.commitTransaction();
        session.endSession();

        try {
          const { day, startTime, endTime } = schedule;

          await createAuditLog(
            "createAppointment",
            patient.email,
            `Patient ${patient.email} has booked a session with clinician ${clinician.email} on ${day} from ${startTime} to ${endTime}`
          );
        } catch (auditLogError) {
          console.error("Error creating audit log:", auditLogError);
        }

        res.status(201).json({
          message: "Appointment created successfully",
          appointment: newAppointment,
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error during appointment creation:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  } catch (error) {
    console.error("Error starting transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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
        path: "selectedClinician",
        select: "firstName middleName lastName", // Select the patient details
      })
      .populate({
        path: "newSchedule",
        select: "clinicianName specialization day startTime endTime", // Select the schedule details
      })
      .populate({
        path: "temporaryReschedule",
        select: "clinicianName specialization day startTime endTime", // Select the schedule details
      });

    // Decrypt patient and clinician details
    const decryptedAppointments = appointments.map((appointment) => {
      if (appointment.patientId) {
        try {
          if (isEncrypted(appointment.patientId.firstName)) {
            appointment.patientId.firstName = decrypt(
              appointment.patientId.firstName
            );
          }
          if (isEncrypted(appointment.patientId.middleName)) {
            appointment.patientId.middleName = decrypt(
              appointment.patientId.middleName
            );
          }
          if (isEncrypted(appointment.patientId.lastName)) {
            appointment.patientId.lastName = decrypt(
              appointment.patientId.lastName
            );
          }
        } catch (decryptError) {
          console.error("Error decrypting patient details:", decryptError);
        }
      }
      if (appointment.selectedClinician) {
        try {
          if (isEncrypted(appointment.selectedClinician.firstName)) {
            appointment.selectedClinician.firstName = decrypt(
              appointment.selectedClinician.firstName
            );
          }
          if (isEncrypted(appointment.selectedClinician.middleName)) {
            appointment.selectedClinician.middleName = decrypt(
              appointment.selectedClinician.middleName
            );
          }
          if (isEncrypted(appointment.selectedClinician.lastName)) {
            appointment.selectedClinician.lastName = decrypt(
              appointment.selectedClinician.lastName
            );
          }
        } catch (error) {
          console.error("Error decrypting clinician details:", error);
        }
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
        path: "selectedClinician",
        select: "firstName middleName lastName",
      },
      {
        path: "newSchedule",
        select: "clinicianName specialization day startTime endTime status", // Select the new schedule details
      },
      {
        path: "temporaryReschedule",
        select: "clinicianName specialization day startTime endTime status", // Select the new schedule details
      },
      {
        path: "patientId",
        select: "firstName middleName lastName",
      },
    ]);

    // Decrypt patient and clinician details
    const decryptedAppointments = appointments.map((appointment) => {
      if (appointment.patientId) {
        try {
          if (isEncrypted(appointment.patientId.firstName)) {
            appointment.patientId.firstName = decrypt(
              appointment.patientId.firstName
            );
          }
          if (isEncrypted(appointment.patientId.middleName)) {
            appointment.patientId.middleName = decrypt(
              appointment.patientId.middleName
            );
          }
          if (isEncrypted(appointment.patientId.lastName)) {
            appointment.patientId.lastName = decrypt(
              appointment.patientId.lastName
            );
          }
        } catch (decryptError) {
          console.error("Error decrypting patient details:", decryptError);
        }
      }
      if (appointment.selectedClinician) {
        try {
          if (isEncrypted(appointment.selectedClinician.firstName)) {
            appointment.selectedClinician.firstName = decrypt(
              appointment.selectedClinician.firstName
            );
          }
          if (isEncrypted(appointment.selectedClinician.middleName)) {
            appointment.selectedClinician.middleName = decrypt(
              appointment.selectedClinician.middleName
            );
          }
          if (isEncrypted(appointment.selectedClinician.lastName)) {
            appointment.selectedClinician.lastName = decrypt(
              appointment.selectedClinician.lastName
            );
          }
        } catch (error) {
          console.error("Error decrypting clinician details:", error);
        }
      }
      return appointment;
    });

    res.status(200).json(decryptedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
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
        path: "selectedClinician",
        select: "firstName middleName lastName",
      })
      .populate({
        path: "patientId",
        select: "firstName middleName lastName",
      })
      .populate({
        path: "newSchedule",
        select: "clinicianName specialization day startTime endTime",
      })
      .populate({
        path: "temporaryReschedule",
        select: "clinicianName specialization day startTime endTime",
      });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Decrypt patient information
    if (appointment.patientId) {
      if (isEncrypted(appointment.patientId.firstName)) {
        appointment.patientId.firstName = decrypt(
          appointment.patientId.firstName
        );
      }
      if (isEncrypted(appointment.patientId.middleName)) {
        appointment.patientId.middleName = decrypt(
          appointment.patientId.middleName
        );
      }
      if (isEncrypted(appointment.patientId.lastName)) {
        appointment.patientId.lastName = decrypt(
          appointment.patientId.lastName
        );
      }
    }

    // Decrypt clinician information
    if (appointment.selectedClinician) {
      if (isEncrypted(appointment.selectedClinician.firstName)) {
        appointment.selectedClinician.firstName = decrypt(
          appointment.selectedClinician.firstName
        );
      }
      if (isEncrypted(appointment.selectedClinician.middleName)) {
        appointment.selectedClinician.middleName = decrypt(
          appointment.selectedClinician.middleName
        );
      }
      if (isEncrypted(appointment.selectedClinician.lastName)) {
        appointment.selectedClinician.lastName = decrypt(
          appointment.selectedClinician.lastName
        );
      }
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
    const userId = req.user.id; // Assuming the token contains the user ID
    const userRole = req.user.role; // Assuming the token contains the user role

    const appointment = await findAppointmentDetails(appointmentId);
    if (!appointment) {
      console.error("Appointment not found");
      return res.status(404).json({ message: "Appointment not found" });
    }

    let user;
    if (userRole === "admin") {
      user = await findAdminDetails(userId);
      if (!user) {
        console.log("Admin not found");
        return res.status(404).json({ message: "Admin not found" });
      }
    } else if (userRole === "clinician") {
      user = await findClinicianDetails(userId);
      if (!user) {
        console.log("Clinician not found");
        return res.status(404).json({ message: "Clinician not found" });
      }
    } else {
      console.log("Invalid user role");
      return res.status(400).json({ message: "Invalid user role" });
    }

    const patient = await findPatientDetails(appointment.patientId);
    if (!patient) {
      console.log("Patient not found");
      return res.status(404).json({ message: "Patient not found" });
    }

    const clinician = await findClinicianDetails(appointment.selectedClinician);
    if (!clinician) {
      console.log("Clinician not found");
      return res.status(404).json({ message: "Clinician not found" });
    }

    console.log("Current Appointment Status:", appointment.status);

    try {
      switch (appointment.status) {
        case "Pending":
          console.log("Handling Pending status");
          await handlePendingStatus(appointment, status);
          break;
        case "Accepted":
          console.log("Handling Accepted status");
          if (status === "Completed") {
            await handleAcceptedStatus(appointment);
          }
          break;
        case "Schedule Change Request":
          console.log("Handling Schedule Change Request status");
          await handleScheduleChangeRequest(appointment, status);
          break;
        case "Temporary Reschedule Request":
          console.log("Handling Temporary Reschedule Request status");
          await handleTemporaryRescheduleRequest(appointment, status);
          break;
        case "Temporarily Rescheduled":
          console.log("Handling Temporarily Rescheduled status");
          if (status === "Reverted") {
            await handleTemporarilyRescheduled(appointment);
          }
          break;
        default:
          console.log("Invalid status transition");
          return res.status(400).json({ message: "Invalid status transition" });
      }

      await appointment.save();
      console.log("Appointment saved successfully");

      try {
        await createAuditLog(
          "updateAppointmentStatus",
          user.email,
          `User ${user.email} ${status} the appointment request of patient email ${patient.email} with clinician email ${clinician.email}`
        );
        console.log("Audit log created successfully");
      } catch (auditLogError) {
        console.error("Error creating audit log:", auditLogError);
      }

      res.status(200).json({
        message: "Appointment status updated successfully",
        appointment,
      });
    } catch (error) {
      console.error("Error during status handling:", error);
      if (
        error.message === "The selected schedule is no longer available." ||
        error.message === "The new schedule is no longer available." ||
        error.message === "The temporary reschedule is no longer available."
      ) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
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
      status: {
        $in: [
          "Accepted",
          "Completed",
          "Temporarily Rescheduled",
          "Temporary Reschedule Request",
          "Schedule Change Request",
        ],
      },
    })
      .populate({
        path: "selectedSchedule",
        select: "clinicianName specialization day startTime endTime", // Select the schedule details
      })
      .populate({
        path: "patientId",
        select: "firstName middleName lastName", // Select the patient details
      })
      .populate({
        path: "selectedClinician",
        select: "firstName middleName lastName",
      })
      .populate({
        path: "temporaryReschedule",
        select: "clinicianName specialization day startTime endTime", // Select the schedule details
      })
      .populate({
        path: "newSchedule",
        select: "clinicianName specialization day startTime endTime", // Select the schedule details
      });

    // Decrypt patient and clinician details
    const decryptedAppointments = appointments.map((appointment) => {
      if (appointment.patientId) {
        try {
          if (isEncrypted(appointment.patientId.firstName)) {
            appointment.patientId.firstName = decrypt(
              appointment.patientId.firstName
            );
          }
          if (isEncrypted(appointment.patientId.middleName)) {
            appointment.patientId.middleName = decrypt(
              appointment.patientId.middleName
            );
          }
          if (isEncrypted(appointment.patientId.lastName)) {
            appointment.patientId.lastName = decrypt(
              appointment.patientId.lastName
            );
          }
        } catch (decryptError) {
          console.error("Error decrypting patient details:", decryptError);
        }
      }
      if (appointment.selectedClinician) {
        try {
          if (isEncrypted(appointment.selectedClinician.firstName)) {
            appointment.selectedClinician.firstName = decrypt(
              appointment.selectedClinician.firstName
            );
          }
          if (isEncrypted(appointment.selectedClinician.middleName)) {
            appointment.selectedClinician.middleName = decrypt(
              appointment.selectedClinician.middleName
            );
          }
          if (isEncrypted(appointment.selectedClinician.lastName)) {
            appointment.selectedClinician.lastName = decrypt(
              appointment.selectedClinician.lastName
            );
          }
        } catch (error) {
          console.error("Error decrypting clinician details:", error);
        }
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

    // Update the status of the new schedule to "Requested"
    newSchedule.status = "Requested";
    await newSchedule.save();

    // Update the appointment with the new schedule and reason
    appointment.newSchedule = newScheduleId;
    appointment.changeReason = reason;
    appointment.status = "Schedule Change Request";

    await appointment.save();

    // Retrieve the patient's and clinician's emails
    const patient = await Patient.findById(patientId);
    const clinician = await ClinicianSLP.findById(
      appointment.selectedClinician
    );

    if (!patient || !clinician) {
      return res.status(404).json({
        error: true,
        message: "Patient or Clinician not found.",
      });
    }

    const patientEmail = patient.email;
    const clinicianEmail = clinician.email;

    // Create an audit log entry
    await createAuditLog(
      "requestScheduleChange",
      patientEmail,
      `Patient ${patientEmail} requested a schedule change for an appointment with clinician ${clinicianEmail}.`
    );

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

    // Update the status of the new schedule to "Requested"
    newSchedule.status = "Requested";
    await newSchedule.save();

    // Update the appointment with the new schedule and reason
    appointment.temporaryReschedule = newScheduleId;
    appointment.changeReason = reason;
    appointment.status = "Temporary Reschedule Request";

    await appointment.save();

    // Retrieve the patient's and clinician's emails
    const patient = await Patient.findById(patientId);
    const clinician = await ClinicianSLP.findById(
      appointment.selectedClinician
    );

    if (!patient || !clinician) {
      return res.status(404).json({
        error: true,
        message: "Patient or Clinician not found.",
      });
    }

    const patientEmail = patient.email;
    const clinicianEmail = clinician.email;

    // Create an audit log entry
    await createAuditLog(
      "requestTemporaryReschedule",
      patientEmail,
      `Patient ${patientEmail} requested a temporary reschedule for an appointment with clinician ${clinicianEmail}.`
    );

    res.status(200).json({
      message: "Temporary reschedule request submitted successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error requesting temporary reschedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAffectedAppointments = async (req, res) => {
  try {
    const clinicianId = req.params.clinicianId; // Retrieve clinicianId from URL parameters

    // Find appointments for the logged-in clinician with status "Accepted" or "Completed"
    const appointments = await Appointment.find({
      selectedClinician: clinicianId,
    })
      .populate({
        path: "patientId",
        select: "email", // Select the patient details
      })
      .populate({
        path: "selectedClinician",
        select: "firstName middleName lastName",
      });

    const decryptedAppointments = appointments.map((appointment) => {
      if (appointment.selectedClinician) {
        try {
          if (isEncrypted(appointment.selectedClinician.firstName)) {
            appointment.selectedClinician.firstName = decrypt(
              appointment.selectedClinician.firstName
            );
          }
          if (isEncrypted(appointment.selectedClinician.middleName)) {
            appointment.selectedClinician.middleName = decrypt(
              appointment.selectedClinician.middleName
            );
          }
          if (isEncrypted(appointment.selectedClinician.lastName)) {
            appointment.selectedClinician.lastName = decrypt(
              appointment.selectedClinician.lastName
            );
          }
        } catch (error) {
          console.error("Error decrypting clinician details:", error);
        }
      }
      return appointment;
    });

    res.status(200).json(decryptedAppointments);
  } catch (error) {
    console.error("Error fetching clinician appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.joinRoomAudit = async (req, res) => {
  const { action, user, details } = req.body;
  try {
    await createAuditLog(action, user, details);
    res.status(200).json({ message: "Audit log created successfully" });
  } catch (error) {
    console.error("Cannot log join room.", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//for rejected appoinments
exports.updateAppointment = async (req, res) => {
  try {
    const { appointmentId, selectedScheduleId, selectedClinicianId } = req.body;

    console.log("Received update request:");
    console.log("Appointment ID:", appointmentId);
    console.log("Selected Schedule ID:", selectedScheduleId);
    console.log("Selected Clinician ID:", selectedClinicianId);

    // Find the appointment by appointmentId
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log("Appointment not found");
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Validate the new schedule
    const newSchedule = await Schedule.findById(selectedScheduleId);
    if (!newSchedule) {
      console.log("Invalid new schedule selected");
      return res.status(400).json({ message: "Invalid new schedule selected" });
    }

    // Validate the new clinician
    const newClinician = await ClinicianSLP.findById(selectedClinicianId);
    if (!newClinician) {
      console.log("Invalid new clinician selected");
      return res
        .status(400)
        .json({ message: "Invalid new clinician selected" });
    }

    // Update the appointment with the new schedule and clinician
    appointment.selectedSchedule = selectedScheduleId;
    appointment.selectedClinician = selectedClinicianId;
    appointment.status = "Pending";

    await appointment.save();

    console.log("Appointment updated successfully:", appointment);

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find the appointment by appointmentId
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log("Appointment not found");
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Delete the appointment
    await Appointment.deleteOne({ _id: appointmentId });

    console.log("Appointment deleted successfully");

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
