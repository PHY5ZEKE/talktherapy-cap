const mongoose = require("mongoose");
const PatientSlp = require("../models/patientSlp.model");
const Admin = require("../models/adminSLP.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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

const { encrypt, decrypt } = require("../middleware/aesUtilities");

const updateBookmarks = async (req, res) => {
  try {
    const { id: patientId } = req.user; // Extract patient ID from token (or request)
    const { bookmarks } = req.body; // Assuming bookmarks are sent as an array of Content ObjectIds


    if (!Array.isArray(bookmarks)) {
      return res.status(400).json({ error: true, message: "Bookmarks must be an array of Content ObjectIds." });
    }

    // Validate if each bookmark ID is a valid ObjectId
    const isValidObjectIds = bookmarks.every(id => mongoose.Types.ObjectId.isValid(id));
    if (!isValidObjectIds) {
      return res.status(400).json({ error: true, message: "Invalid Content ObjectId(s)." });
    }

    // Find the patient by ID
    const patient = await PatientSlp.findOne({ _id: patientId });

    if (!patient) {
      return res.status(404).json({ error: true, message: "Patient not found." });
    }

    // Initialize the bookmarks if it's empty or doesn't exist
    patient.bookmarkedContent = bookmarks;
    if (!patient.bookmarkedContent) {
      patient.bookmarkedContent = [];
    }

    // Add bookmarks or remove if already present
    bookmarks.forEach(bookmarkId => {
      // If it's not already bookmarked, add it
      if (!patient.bookmarkedContent.includes(bookmarkId)) {
        patient.bookmarkedContent.push(bookmarkId);
      }
    });

    // Save the updated patient record
    await patient.save();

    return res.status(200).json({
      error: false,
      message: "Bookmarks updated successfully.",
      bookmarkedContent: patient.bookmarkedContent,
    });
  } catch (error) {
    console.error("Error updating bookmarks:", error);
    return res.status(500).json({ error: true, message: "Internal server error." });
  }
};

const signupPatient = async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    mobile,
    birthday,
    diagnosis,
    consent,
    email,
    password,
  } = req.body.submissionData;

  const requiredFields = {
    firstName: "First name is required.",
    middleName: "Middle name is required.",
    lastName: "Last name is required.",
    mobile: "Mobile number is required.",
    birthday: "Date of birth is required.",
    diagnosis: "Medical diagnosis is required.",
    email: "Email is required",
    password: "Password is required",
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    if (!req.body.submissionData[field]) {
      return res.status(400).json({ error: true, message });
    }
  }

  if (consent !== true) {
    return res
      .status(400)
      .json({ error: true, message: "Must accept terms and conditions." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email format" });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: true, message: passwordError });
  }

  const createdOn = req.body.createdOn || new Date().getTime();

  const isPatientSlp = await PatientSlp.findOne({ email: email });

  if (isPatientSlp) {
    return res.json({
      error: true,
      message: "User already exist.",
    });
  }

  const hashedPassword = await hashPassword(password); // Hash the password

  const patientSlp = new PatientSlp({
    firstName: encrypt(firstName),
    middleName: encrypt(middleName),
    lastName: encrypt(lastName),
    mobile: encrypt(mobile),
    birthday: birthday,
    diagnosis: encrypt(diagnosis),
    consent,
    email: email,
    password: hashedPassword, // Use the hashed password
    createdOn,
    userRole: "patientslp",
    active: true,
  });

  await patientSlp.save();

  const accessToken = jwt.sign(
    { patientSlp },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "2m",
    }
  );

  try {
    // Create audit log with the patient's email
    await createAuditLog(
      "signupPatient",
      email, // Pass the patient's email
      `Patient with email ${email} signed up successfully`
    );
  } catch (error) {
    console.error("Error creating audit log:", error); // Log the error details
  }

  return res.json({
    error: false,
    patientSlp,
    accessToken,
    message: "Registration Successful",
  });
};

const getPatient = async (req, res) => {
  try {
    const patientId = req.user.id;

    const patient = await PatientSlp.findById(patientId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!patient) {
      return res
        .status(404)
        .json({ error: true, message: "Patient not found." });
    }

    // Decrypt sensitive information before sending the response
    patient.firstName = decrypt(patient.firstName);
    patient.middleName = decrypt(patient.middleName);
    patient.lastName = decrypt(patient.lastName);
    patient.mobile = decrypt(patient.mobile);
    patient.diagnosis = decrypt(patient.diagnosis);

    return res.status(200).json({ error: false, patient });
  } catch (error) {
    console.error("Error fetching Patient:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error." });
  }
};

const changePassword = [
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
      const patient = await PatientSlp.findOne({ _id: id });

      if (!patient) {
        return res
          .status(404)
          .json({ error: true, message: "Patient not found." });
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        patient.password,
        currentPassword
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: true, message: "Current password is incorrect." });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the patient's password
      patient.password = hashedPassword;
      await patient.save();

      // Create audit log with the patient's email
      await createAuditLog(
        "changePassword",
        patient.email, // Pass the patient's email
        `Patient with email ${patient.email} changed their password`
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

const updateProfilePicture = [
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
      const patient = await PatientSlp.findOne({ _id: id });

      if (!patient) {
        return res
          .status(404)
          .json({ error: true, message: "Patient not found." });
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
      patient.profilePicture = profilePictureUrl;
      await patient.save();

      // Create audit log with the patient's email
      await createAuditLog(
        "updateProfilePicture",
        patient.email, // Pass the patient's email
        `Patient with  ${patient.email} updated their profile picture`
      );

      return res.json({
        error: false,
        message: "Profile picture updated successfully.",
        profilePicture: patient.profilePicture,
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

// Update patient progress
const updateProgress = async (req, res) => {
  const { currentPhraseNo } = req.body; 
  console.log("Request Body:", req.body);
  console.log("Received currentPhraseNo:", currentPhraseNo); // Expecting currentPhraseNo in the request body
  const { id: patientId } = req.user;

  try {
    const patient = await PatientSlp.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update the patient's progress
    patient.currentPhraseNo = currentPhraseNo;
    await patient.save();

    res.status(200).json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error(error);
    console.error("Error updating progress:", error);
    res.status(500).json({ message: 'An error occurred while updating progress' });
  }
};

const editPatient = [
  verifyToken,
  async (req, res) => {
    const { firstName, middleName, lastName, mobile } = req.body;
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
    if (!mobile) {
      return res
        .status(400)
        .json({ error: true, message: "Mobile is required." });
    }

    try {
      // Find the patient by ID
      const patient = await PatientSlp.findOne({ _id: id });

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

      // Create audit log with the patient's email
      await createAuditLog(
        "editPatient",
        patient.email, // Pass the patient's email
        `Patient with email ${patient.email} updated their information`
      );

      return res.json({
        error: false,
        patient,
        message: "Patient information updated successfully.",
      });
    } catch (error) {
      console.error("Error updating patient information:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating patient information.",
      });
    }
  },
];

module.exports = {
  signupPatient,
  getPatient,
  updateBookmarks,
  getPatient,
  changePassword,
  updateProfilePicture,
  updateProgress,
  editPatient,
};
