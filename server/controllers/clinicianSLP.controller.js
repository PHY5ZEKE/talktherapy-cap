const Clinician = require("../models/clinicianSLP.model");
const AssignmentSLP = require("../models/assignmentSLP.model.js");
const Admin = require("../models/adminSLP.model");
const Patient = require("../models/patientSlp.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {
  validatePassword,
  hashPassword,
  verifyPassword,
} = require("../utilities/password");
const verifyToken = require("../middleware/verifyToken");
const { createAuditLog } = require("../middleware/auditLog.js");
const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/aws");
const path = require("path");
const upload = require("../middleware/uploadProfilePicture");

const { decrypt } = require("../middleware/aesUtilities");

const safeDecrypt = (text) => {
  try {
    return text && text.includes(":") ? decrypt(text) : text;
  } catch (error) {
    console.error("Error decrypting text:", error);
    return text;
  }
};

exports.addClinician = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email format" });
  }

  const existingClinician = await Clinician.findOne({ email });
  const existingAdmin = await Admin.findOne({ email });

  if (existingClinician) {
    if (existingClinician.active === true) {
      return res.status(400).json({
        error: true,
        message: "Clinician is already active.",
      });
    } else if (existingClinician.active === false) {
      return res.status(400).json({
        error: true,
        message:
          "Unable to add a deactivated account. Please reactivate the account.",
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "Email already exists.",
      });
    }
  }

  if (existingAdmin) {
    return res.status(400).json({
      error: true,
      message: "Email already exists as an admin.",
    });
  }

  const newClinician = new Clinician({
    email,
    addedOn: new Date(),
  });

  await newClinician.save();

  try {
    // Extract user ID from req.user
    const userId = req.user.id;

    // Find the admin using the extracted ID
    const admin = await Admin.findOne({ _id: userId });

    if (!admin) {
      return res.status(404).json({ error: true, message: "Admin not found." });
    }

    // Use the admin's email in the audit log
    await createAuditLog(
      "addClinician",
      admin.email, // Pass the admin's email
      `Admin with email ${admin.email} added a new clinician with email ${email}`
    );
  } catch (error) {
    console.error("Error creating audit log:", error); // Log the error details
  }

  return res.status(201).json({
    error: false,
    message: "Clinician email added successfully.",
  });
};

exports.clinicianSignup = async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    mobile,
    birthday,
    address,
    specialization,
    email,
    password,
  } = req.body;

  const requiredFields = {
    firstName: "First name is required.",
    middleName: "Middle name is required.",
    lastName: "Last name is required.",
    mobile: "Mobile number is required.",
    birthday: "Date of birth is required.",
    address: "Clinic address is required.",
    specialization: "Specialization is required.",
    email: "Email is required",
    password: "Password is required",
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    if (!req.body[field]) {
      return res.status(400).json({ error: true, message });
    }
  }

  // Validate firstName, middleName, and lastName
  const nameRegex = /^[A-Za-z\s]{1,35}$/;
  if (!nameRegex.test(firstName)) {
    return res.status(400).json({
      error: true,
      message:
        "First name must be a string of letters and not exceed 35 characters.",
    });
  }
  if (!nameRegex.test(middleName)) {
    return res.status(400).json({
      error: true,
      message:
        "Middle name must be a string of letters and not exceed 35 characters.",
    });
  }
  if (!nameRegex.test(lastName)) {
    return res.status(400).json({
      error: true,
      message:
        "Last name must be a string of letters and not exceed 35 characters.",
    });
  }

  // Validate mobile number (Philippine 11-digit format)
  const mobileRegex = /^09\d{9}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
      error: true,
      message: "Mobile number must be a valid Philippine 11-digit format.",
    });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email format" });
  }

  // Validate password
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: true, message: passwordError });
  }

  const existingClinician = await Clinician.findOne({ email });

  if (!existingClinician) {
    return res
      .status(400)
      .json({ error: true, message: "Clinician not recognized." });
  }

  if (existingClinician.password) {
    return res
      .status(400)
      .json({ error: true, message: "User already exists." });
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  existingClinician.firstName = firstName;
  existingClinician.middleName = middleName;
  existingClinician.lastName = lastName;
  existingClinician.mobile = mobile;
  existingClinician.birthday = birthday;
  existingClinician.address = address;
  existingClinician.specialization = specialization;
  existingClinician.password = hashedPassword;
  existingClinician.createdOn = new Date().getTime();
  existingClinician.userRole = "clinician";
  existingClinician.active = true;

  await existingClinician.save();

  await createAuditLog(
    "clinicianSignup",
    email,
    `Clinician with email ${email} signed up`
  );

  const accessToken = jwt.sign(
    { clinician: existingClinician },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );

  return res.json({
    error: false,
    clinician: existingClinician,
    accessToken,
    message: "Registration Successful",
  });
};

exports.getClinician = async (req, res) => {
  try {
    const clinicianId = req.user.id;

    const clinician = await Clinician.findById(clinicianId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!clinician) {
      return res
        .status(404)
        .json({ error: true, message: "Clinician not found." });
    }

    return res.status(200).json({ error: false, clinician });
  } catch (error) {
    console.error("Error fetching Clinician:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error." });
  }
};

exports.getAllPatients = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;

    const isClinician = await Clinician.findOne({ _id: id });

    if (!isClinician) {
      return res.sendStatus(401);
    }

    try {
      const patients = await Patient.find({});
      return res.status(200).json({
        error: false,
        message: "Patient retrieved successfully.",
        patients: patients.map((patient) => ({
          _id: patient._id,
          firstName: decrypt(patient.firstName),
          middleName: decrypt(patient.middleName),
          lastName: decrypt(patient.lastName),
          email: patient.email,
          mobile: decrypt(patient.mobile),
          active: patient.active,
          createdOn: patient.createdOn,
          addedOn: patient.addedOn,
          profilePicture: patient.profilePicture,
        })),
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving patients.",
      });
    }
  },
];

exports.getPatientById = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;
    const { patientId } = req.params;

    const isClinician = await Clinician.findOne({ _id: id });

    if (!isClinician) {
      return res.sendStatus(401);
    }

    try {
      const patient = await Patient.findById(patientId);

      if (!patient) {
        return res.status(404).json({
          error: true,
          message: "Clinician not found.",
        });
      }

      return res.status(200).json({
        error: false,
        message: "Patient retrieved successfully.",
        patient: {
          _id: patient._id,
          firstName: decrypt(patient.firstName),
          lastName: decrypt(patient.lastName),
          email: patient.email,
          mobile: decrypt(patient.mobile),
          diagnosis: decrypt(patient.diagnosis),
          active: patient.active,
          createdOn: patient.createdOn,
          addedOn: patient.addedOn,
          profilePicture: patient.profilePicture,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving the patient.",
      });
    }
  },
];

exports.editClinician = [
  verifyToken,
  async (req, res) => {
    const { firstName, middleName, lastName, address, mobile } = req.body;
    const { id } = req.user;

    // Validate input
    if (!firstName) {
      return res
        .status(400)
        .json({ error: true, message: "First name is required." });
    }
    if (!middleName) {
      return res
        .status(400)
        .json({ error: true, message: "Middle name is required." });
    }
    if (!lastName) {
      return res
        .status(400)
        .json({ error: true, message: "Last name is required." });
    }
    if (!address) {
      return res
        .status(400)
        .json({ error: true, message: "Clinic address is required." });
    }
    if (!mobile) {
      return res
        .status(400)
        .json({ error: true, message: "Contact number is required." });
    }

    try {
      // Find the clinician by ID
      const clinician = await Clinician.findOne({ _id: id });

      if (!clinician) {
        return res
          .status(404)
          .json({ error: true, message: "Clinician not found." });
      }

      // Update the clinician's information
      clinician.firstName = firstName;
      clinician.middleName = middleName;
      clinician.lastName = lastName;
      clinician.address = address;
      clinician.mobile = mobile;

      // Save the updated clinician information
      await clinician.save();

      // Create audit log with the clinician's email
      await createAuditLog(
        "editClinician",
        clinician.email, // Pass the clinician's email
        `Clinician ${clinician.email} updated their information`
      );

      return res.json({
        error: false,
        clinician,
        message: "Clinician information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating clinician information.",
      });
    }
  },
];

exports.changePassword = [
  verifyToken,
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.user;

    // Validate input
    if (!currentPassword) {
      return res
        .status(400)
        .json({ error: true, message: "Current password is required." });
    }
    if (!newPassword) {
      return res
        .status(400)
        .json({ error: true, message: "New password is required." });
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: true, message: passwordError });
    }

    try {
      // Find the clinician by ID
      const clinician = await Clinician.findOne({ _id: id });

      if (!clinician) {
        return res
          .status(404)
          .json({ error: true, message: "Clinician not found." });
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        clinician.password,
        currentPassword
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: true, message: "Current password is incorrect." });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the clinician's password
      clinician.password = hashedPassword;
      await clinician.save();

      // Create audit log with the clinician's email
      await createAuditLog(
        "changePassword",
        clinician.email, // Pass the clinician's email
        `Clinician ${clinician.email} changed their password`
      );

      return res.json({
        error: false,
        message: "Password changed successfully.",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while changing the password.",
      });
    }
  },
];

exports.updateProfilePicture = [
  verifyToken,
  (req, res, next) => {
    upload.single("profilePicture")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: true,
            message: "File too large. Maximum size is 1MB.",
          });
        }
        return res.status(400).json({ error: true, message: err.message });
      } else if (err) {
        return res.status(400).json({ error: true, message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const { id } = req.user;

    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No file uploaded." });
    }

    try {
      const clinician = await Clinician.findOne({ _id: id });

      if (!clinician) {
        return res
          .status(404)
          .json({ error: true, message: "Clinician not found." });
      }

      // Upload the file to S3
      const fileName = `${req.user.id}_${Date.now()}${path.extname(
        req.file.originalname
      )}`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `profile-pictures/${fileName}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      // Update the profile picture URL
      const profilePictureUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile-pictures/${fileName}`;
      clinician.profilePicture = profilePictureUrl;
      await clinician.save();

      // Create audit log with the clinician's email
      await createAuditLog(
        "updateProfilePicture",
        clinician.email, // Pass the clinician's email
        `Clinician with ${clinician.email} updated their profile picture`
      );

      return res.json({
        error: false,
        message: "Profile picture updated successfully.",
        profilePicture: clinician.profilePicture,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating the profile picture.",
      });
    }
  },
];

exports.getAssignedPatients = async (req, res) => {
  try {
    const clinicianId = req.user.id; // Assuming the token contains the clinician ID

    const assignedPatients = await AssignmentSLP.find({
      clinicianId,
      status: "Assigned",
    }).populate("patientId");

    const patients = assignedPatients.map((assignment) => {
      const patient = assignment.patientId;
      return {
        _id: patient._id,
        firstName: safeDecrypt(patient.firstName),
        middleName: safeDecrypt(patient.middleName),
        lastName: safeDecrypt(patient.lastName),
        email: patient.email,
        mobile: safeDecrypt(patient.mobile),
      };
    });

    res.status(200).json({ assignedPatients: patients });
  } catch (error) {
    console.error("Error fetching assigned patients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.requestAccess = async (req, res) => {
  try {
    const { clinicianId, patientId, reason, status } = req.body;

    // get if existing then check status if pending
    const existingAssignment = await AssignmentSLP.findOne({
      clinicianId,
      patientId,
      status: "Pending",
    });

    if (existingAssignment) {
      return res.status(400).json({
        error: true,
        message: "You already have a request.",
      });
    }

    const newAssignment = new AssignmentSLP({
      clinicianId,
      patientId,
      reason,
      status,
    });

    await newAssignment.save();

    // Retrieve the clinician's and patient's emails
    const clinician = await Clinician.findById(clinicianId);
    const patient = await Patient.findById(patientId);

    if (!clinician || !patient) {
      return res.status(404).json({
        error: true,
        message: "Clinician or Patient not found.",
      });
    }

    const clinicianEmail = clinician.email;
    const patientEmail = patient.email;

    // Create an audit log entry
    await createAuditLog(
      "requestAccess",
      clinicianEmail,
      `Clinician ${clinicianEmail} requested access for patient ${patientEmail}.`
    );

    res.status(201).json({ message: "Access requested successfully" });
  } catch (error) {
    console.error("Error requesting access:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
