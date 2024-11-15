// routes/patientSlp.route.js
const express = require("express");
const router = express.Router();
const {
  signupPatient,
  getPatient,
  changePassword,
  updateProfilePicture,
  editPatient,
  updateBookmarks,
} = require("../controllers/patientSLP.controller");

const verifyToken = require("../middleware/verifyToken");

// Create SLP Patient Account
router.post("/slp-patient-signup", signupPatient);

// Get SLP Patient
router.get("/get-patient", verifyToken, getPatient);

router.put("/change-password", verifyToken, changePassword);

router.put("/update-profile-picture", verifyToken, updateProfilePicture);

router.put("/edit-patient", verifyToken, editPatient);

// New route to update bookmarks
router.put("/update-bookmarks", verifyToken, updateBookmarks);

module.exports = router;
