const PatientSlp = require("../models/patientSlp.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const {
  validatePassword,
  hashPassword,
  verifyPassword,
} = require("../utilities/password");
const verifyToken = require("../middleware/verifyToken");

const multer = require("multer");
const upload = require("../middleware/uploadProfilePicture");

const { encrypt, decrypt } = require("../middleware/aesUtilities");

const deactivatePatient = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const patientSlp = await PatientSlp.findOne({ email });

  if (!patientSlp) {
    return res.status(400).json({ error: true, message: "Patient not found." });
  }

  if (patientSlp.active === false) {
    return res.status(400).json({
      error: true,
      message: "Patient account is already deactivated.",
    });
  }

  patientSlp.active = false;
  await patientSlp.save();

  return res
    .status(200)
    .json({ error: false, message: "Patient deactivated successfully." });
};

const activatePatient = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const patientSlp = await PatientSlp.findOne({ email });

  if (!patientSlp) {
    return res.status(400).json({ error: true, message: "Patient not found." });
  }

  if (patientSlp.active === true) {
    return res
      .status(400)
      .json({ error: true, message: "Patient is already active." });
  }

  patientSlp.active = true;
  await patientSlp.save();

  return res
    .status(200)
    .json({ error: false, message: "Patient activated successfully." });
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
  } = req.body;

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
    if (!req.body[field]) {
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
    profilePicture: "/src/images/profile-picture/default-profile-picture.png",
    active: true,
  });

  await patientSlp.save();

  await patientSlp.save();

  const accessToken = jwt.sign(
    { patientSlp },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "2m",
    }
  );

  return res.json({
    error: false,
    patientSlp,
    accessToken,
    message: "Registration Successful",
  });
};

const loginPatient = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const patientSlpInfo = await PatientSlp.findOne({ email: email });

  if (!patientSlpInfo) {
    return res.status(400).json({ message: "User not found" });
  }

  if (patientSlpInfo.active === false) {
    return res.status(400).json({ message: "User account is deactivated" });
  }

  if (patientSlpInfo.email == email && patientSlpInfo.password == password) {
    const patientSlp = { patientSlp: patientSlpInfo };
    const accessToken = jwt.sign(patientSlp, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid email or password",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const patientSlp = await PatientSlp.findOne({ email });

  if (!patientSlp) {
    return res.status(400).json({ error: true, message: "User not found." });
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  patientSlp.resetPasswordToken = otp;
  patientSlp.resetPasswordExpires = Date.now() + 300000; // 5 minutes

  await patientSlp.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: patientSlp.email,
    from: process.env.EMAIL,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nYour OTP for password reset is: ${otp}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: true, message: "Email could not be sent." });
    }
    res.status(200).json({ error: false, message: "Password reset OTP sent." });
  });
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: true, message: "OTP is required." });
  }

  const patientSlp = await PatientSlp.findOne({ email });

  if (
    !patientSlp ||
    !patientSlp.resetPasswordToken ||
    patientSlp.resetPasswordToken !== otp
  ) {
    return res.status(400).json({ error: true, message: "Invalid OTP" });
  }

  if (Date.now() > patientSlp.resetPasswordExpires) {
    return res.status(400).json({ error: true, message: "OTP has expired" });
  }

  res.status(200).json({ error: false, message: "OTP is valid." });
};

const resetPassword = async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  if (!otp) {
    return res.status(400).json({ error: true, message: "OTP is required." });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required." });
  }

  if (!confirmPassword) {
    return res
      .status(400)
      .json({ error: true, message: "Confirm password is required." });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ error: true, message: "Passwords do not match." });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: true, message: passwordError });
  }

  const patientSlp = await PatientSlp.findOne({ email });

  if (
    !patientSlp ||
    !patientSlp.resetPasswordToken ||
    patientSlp.resetPasswordToken !== otp
  ) {
    return res.status(400).json({ error: true, message: "Invalid OTP" });
  }

  if (Date.now() > patientSlp.resetPasswordExpires) {
    return res.status(400).json({ error: true, message: "OTP has expired" });
  }

  patientSlp.password = password;
  patientSlp.resetPasswordToken = undefined;
  patientSlp.resetPasswordExpires = undefined;

  await patientSlp.save();

  res.status(200).json({ error: false, message: "Password has been reset." });
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
          .json({ error: true, message: "patient not found." });
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
        // A Multer error occurred when uploading.
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: true,
            message: "File too large. Maximum size is 1MB.",
          });
        }
        return res.status(400).json({ error: true, message: err.message });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ error: true, message: err.message });
      }
      // Everything went fine.
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
          .json({ error: true, message: "patient not found." });
      }

      // Update the profile picture URL
      patient.profilePicture = `/src/images/profile-picture/${req.file.filename}`;
      await patient.save();

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
      // Find the clinician by ID
      const patient = await PatientSlp.findOne({ _id: id });

      if (!patient) {
        return res
          .status(404)
          .json({ error: true, message: "Patient not found." });
      }

      // Update the clinician's information
      patient.firstName = encrypt(firstName);
      patient.middleName = encrypt(middleName);
      patient.lastName = encrypt(lastName);
      patient.mobile = encrypt(mobile);

      // Save the updated clinician information
      await patient.save();

      return res.json({
        error: false,
        patient,
        message: "Patient information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating Patient information.",
      });
    }
  },
];

module.exports = {
  deactivatePatient,
  activatePatient,
  signupPatient,
  loginPatient,
  getPatient,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getPatient,
  changePassword,
  updateProfilePicture,
  editPatient,
};
