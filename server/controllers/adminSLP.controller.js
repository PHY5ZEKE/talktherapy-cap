const Admin = require("../models/adminSLP.model");
const Clinician = require("../models/clinicianSLP.model");
const AssignmentSLP = require("../models/assignmentSLP.model");
const Patient = require("../models/patientSlp.model");
const jwt = require("jsonwebtoken");
const {
  validatePassword,
  hashPassword,
  verifyPassword,
} = require("../utilities/password");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const verifyToken = require("../middleware/verifyToken");
const { createAuditLog } = require("../middleware/auditLog.js");
const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/aws");
const path = require("path");

const upload = require("../middleware/uploadProfilePicture");

const { encrypt, decrypt } = require("../middleware/aesUtilities");

exports.addAdmin = async (req, res) => {
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

  const existingAdmin = await Admin.findOne({ email });
  const existingClinician = await Clinician.findOne({ email });

  if (existingAdmin) {
    if (existingAdmin.active === true) {
      return res.status(400).json({
        error: true,
        message: "Admin is already active.",
      });
    } else if (existingAdmin.active === false) {
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

  if (existingClinician) {
    return res.status(400).json({
      error: true,
      message: "Email already exists in the clinician records.",
    });
  }

  const newAdmin = new Admin({
    email,
    addedOn: new Date(),
  });

  await newAdmin.save();

  await createAuditLog(
    "addAdmin",
    email,
    `Super Admin created an admin with email ${email}`
  );

  return res.status(201).json({
    error: false,
    message: "Admin email added successfully.",
  });
};

exports.adminSignup = async (req, res) => {
  const { firstName, middleName, lastName, address, mobile, email, password } =
    req.body;

  const requiredFields = {
    firstName: "First name is required.",
    middleName: "Middle name is required.",
    lastName: "Last name is required.",
    address: "Clinic address is required.",
    mobile: "Contact number is required.",
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

  const existingAdmin = await Admin.findOne({ email });

  if (!existingAdmin) {
    return res.status(400).json({
      error: true,
      message: "Admin not recognized.",
    });
  }

  if (existingAdmin.password) {
    return res.status(400).json({
      error: true,
      message: "User already exists.",
    });
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  existingAdmin.firstName = firstName;
  existingAdmin.middleName = middleName;
  existingAdmin.lastName = lastName;
  existingAdmin.address = address;
  existingAdmin.mobile = mobile;
  existingAdmin.password = hashedPassword;
  existingAdmin.createdOn = new Date().getTime();
  existingAdmin.active = true;
  existingAdmin.userRole = "admin";

  await existingAdmin.save();

  await createAuditLog(
    "adminSignup",
    email,
    `Admin with email ${email} signed up`
  );

  const accessToken = jwt.sign(
    { admin: existingAdmin },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30m", // Set to 30 minutes for example
    }
  );

  return res.json({
    error: false,
    admin: existingAdmin,
    accessToken,
    message: "Registration Successful",
  });
};

exports.getAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!admin) {
      return res.status(404).json({ error: true, message: "Admin not found." });
    }
    return res.status(200).json({ error: false, admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error." });
  }
};

exports.getAllClinicians = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;

    // Check if the requester is a SuperAdmin
    const isAdmin = await Admin.findOne({ _id: id });

    if (!isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const clinicians = await Clinician.find({});
      return res.status(200).json({
        error: false,
        message: "Clinicians retrieved successfully.",
        clinicians: clinicians.map((clinician) => ({
          _id: clinician._id,
          firstName: clinician.firstName,
          middleName: clinician.middleName,
          lastName: clinician.lastName,
          email: clinician.email,
          address: clinician.address,
          mobile: clinician.mobile,
          active: clinician.active,
          specialization: clinician.specialization,
          createdOn: clinician.createdOn,
          addedOn: clinician.addedOn,
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

exports.getClinicianById = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;
    const { clinicianId } = req.params; // Extract admin ID from request parameters

    // Check if the requester is a SuperAdmin
    const isAdmin = await Admin.findOne({ _id: id });

    if (!isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const clinician = await Clinician.findById(clinicianId); // Query the database for the admin with the given ID

      if (!clinician) {
        return res.status(404).json({
          error: true,
          message: "Clinician not found.",
        });
      }

      return res.status(200).json({
        error: false,
        message: "Clinician retrieved successfully.",
        clinician: {
          _id: clinician._id,
          firstName: clinician.firstName,
          middleName: clinician.middleName,
          lastName: clinician.lastName,
          email: clinician.email,
          address: clinician.address,
          mobile: clinician.mobile,
          active: clinician.active,
          createdOn: clinician.createdOn,
          addedOn: clinician.addedOn,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving the clinicians.",
      });
    }
  },
];

exports.getAllPatients = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;

    // Check if the requester is a SuperAdmin
    const isAdmin = await Admin.findOne({ _id: id });

    if (!isAdmin) {
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

    // Check if the admin
    const isAdmin = await Admin.findOne({ _id: id });

    if (!isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const patient = await Patient.findById(patientId);

      if (!patient) {
        return res.status(404).json({
          error: true,
          message: "Patient not found.",
        });
      }

      return res.status(200).json({
        error: false,
        message: "Patient retrieved successfully.",
        patient: {
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

exports.editAdmin = [
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
      const admin = await Admin.findOne({ _id: id });

      if (!admin) {
        return res
          .status(404)
          .json({ error: true, message: "Admin not found." });
      }

      // Update the admin's information
      admin.firstName = firstName;
      admin.middleName = middleName;
      admin.lastName = lastName;
      admin.address = address;
      admin.mobile = mobile;

      // Save the updated admin information
      await admin.save();
      await createAuditLog(
        "editAdmin",
        admin.email,
        `${admin.email} edited their profile.`
      );

      return res.json({
        error: false,
        admin,
        message: "Admin information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating Admin information.",
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
      // Find the superAdmin by ID
      const admin = await Admin.findOne({ _id: id });

      if (!admin) {
        return res
          .status(404)
          .json({ error: true, message: "admin not found." });
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        admin.password,
        currentPassword
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: true, message: "Current password is incorrect." });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the admin's password
      admin.password = hashedPassword;
      await admin.save();
      await createAuditLog(
        "changePasswordAdmin",
        admin.email,
        `${admin.email} changed their password.`
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
      const admin = await Admin.findOne({ _id: id });

      if (!admin) {
        return res
          .status(404)
          .json({ error: true, message: "Admin not found." });
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
      admin.profilePicture = profilePictureUrl;
      await admin.save();
      await createAuditLog(
        "adminProfilePicture",
        admin.email,
        `${admin.email} updated their profile picture.`
      );

      return res.json({
        error: false,
        message: "Profile picture updated successfully.",
        profilePicture: admin.profilePicture,
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

exports.editPatient = [
  verifyToken,
  async (req, res) => {
    const { firstName, middleName, lastName, mobile, id } = req.body;
    const adminId = req.user.id; // Extract admin ID from authenticated user

    // Log the request body and admin ID
    console.log("Request Body:", req.body);
    console.log("Authenticated Admin ID:", adminId);

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
    if (!mobile) {
      return res
        .status(400)
        .json({ error: true, message: "Contact number is required." });
    }

    try {
      // Find the admin's email using the admin ID
      const admin = await Admin.findOne({ _id: adminId });
      if (!admin) {
        return res
          .status(404)
          .json({ error: true, message: "Admin not found." });
      }
      const adminEmail = admin.email;

      // Log the admin details
      console.log("Admin Found:", admin);

      const patient = await Patient.findOne({ _id: id });

      // Log the patient details
      console.log("Patient Found:", patient);

      if (!patient) {
        return res
          .status(404)
          .json({ error: true, message: "Patient not found." });
      }

      // Update the patient's information
      patient.firstName = encrypt(firstName);
      patient.middleName = encrypt(middleName);
      patient.lastName = encrypt(lastName);
      patient.mobile = encrypt(mobile);

      // Save the updated patient information
      await patient.save();

      // Log the updated patient details
      console.log("Updated Patient:", patient);

      // Create an audit log entry
      await createAuditLog(
        "editPatient",
        adminEmail,
        `${adminEmail} edited the patient account with email ${patient.email}.`
      );

      // Log the audit log creation
      console.log("Audit Log Created");

      return res.json({
        error: false,
        patient,
        message: "Patient information updated successfully.",
      });
    } catch (error) {
      // Log the error details
      console.error("Error updating patient information:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating patient information.",
      });
    }
  },
];

exports.editClinician = [
  verifyToken,
  async (req, res) => {
    const { firstName, middleName, lastName, address, id } = req.body;
    const adminId = req.user.id; // Extract admin ID from authenticated user

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

    try {
      // Find the admin's email using the admin ID
      const admin = await Admin.findOne({ _id: adminId });
      if (!admin) {
        return res
          .status(404)
          .json({ error: true, message: "Admin not found." });
      }
      const adminEmail = admin.email;

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

      // Save the updated clinician information
      await clinician.save();

      // Create an audit log entry
      await createAuditLog(
        "editClinician",
        adminEmail,
        `${adminEmail} edited the clinician account with email ${clinician.email}.`
      );

      return res.json({
        error: false,
        clinician,
        message: "Clinician information updated successfully.",
      });
    } catch (error) {
      // Log the error details
      console.error("Error updating clinician information:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating clinician information.",
      });
    }
  },
];

exports.getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await AssignmentSLP.find({
      status: "Pending",
    }).populate("clinicianId patientId");

    // Decrypt patient names
    const decryptedRequests = pendingRequests.map((request) => {
      if (request.patientId) {
        try {
          if (
            request.patientId.firstName &&
            request.patientId.firstName.includes(":")
          ) {
            request.patientId.firstName = decrypt(request.patientId.firstName);
          }
          if (
            request.patientId.middleName &&
            request.patientId.middleName.includes(":")
          ) {
            request.patientId.middleName = decrypt(
              request.patientId.middleName
            );
          }
          if (
            request.patientId.lastName &&
            request.patientId.lastName.includes(":")
          ) {
            request.patientId.lastName = decrypt(request.patientId.lastName);
          }
        } catch (decryptError) {
          console.error("Error decrypting patient details:", decryptError);
        }
      }
      return request;
    });

    res.status(200).json({ pendingRequests: decryptedRequests });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateRequestStatus = [
  verifyToken,
  async (req, res) => {
    const { requestId, status } = req.body;
    const adminId = req.user.id;

    if (!["Assigned", "Denied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      // Find the admin's email using the admin ID
      const admin = await Admin.findOne({ _id: adminId });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      const adminEmail = admin.email;

      const request = await AssignmentSLP.findById(requestId).populate(
        "clinicianId patientId"
      );

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      const clinicianEmail = request.clinicianId.email;
      const patientEmail = request.patientId.email;

      // Update the request status
      request.status = status;
      await request.save();

      // Create an audit log entry
      await createAuditLog(
        "updateRequestStatus",
        adminEmail,
        `${adminEmail} has ${status.toLowerCase()} clinician access for patient ${patientEmail} by clinician ${clinicianEmail}.`
      );

      res.status(200).json({ message: "Status updated successfully", request });
    } catch (error) {
      // Log the error details
      console.error("Error updating request status:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
];
