// routes/patientSlp.route.js
const express = require("express");
const router = express.Router();
const {
  deactivatePatient,
  activatePatient,
  signupPatient,
  loginPatient,
  getPatient,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  updateProfilePicture,
  editPatient,
} = require("../controllers/patientSLP.controller");

const verifyToken = require("../middleware/verifyToken");

// Remove SLP Patient
router.post("/remove-slp-patient", deactivatePatient);

// Activate SLP Patient
router.post("/activate-slp-patient", activatePatient);

// Create SLP Patient Account
router.post("/slp-patient-signup", signupPatient);

// Login SLP Patient
router.post("/slp-patient-login", loginPatient);

// Request Password Reset
router.post("/forgot-password", forgotPassword);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Reset Password
router.post("/reset-password", resetPassword);

// Get SLP Patient
router.get("/get-patient", verifyToken, getPatient);

router.put("/change-password", verifyToken, changePassword);

router.put("/update-profile-picture", verifyToken, updateProfilePicture);

router.put("/edit-patient", verifyToken, editPatient);

module.exports = router;
