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

const {
  saveProgress,
  loadProgress,
} = require("../controllers/patientProgress.controller");

const verifyToken = require("../middleware/verifyToken");

// Create SLP Patient Account
router.post("/slp-patient-signup", signupPatient);

// Get SLP Patient
router.get("/get-patient", verifyToken, getPatient);

router.put("/change-password", verifyToken, changePassword);

router.put("/update-profile-picture", verifyToken, updateProfilePicture);

router.put("/edit-patient", verifyToken, editPatient);

router.put("/update-bookmarks", verifyToken, updateBookmarks);

// Save patient progress
router.post("/save-progress", verifyToken, saveProgress);

// Load patient progress
router.get("/load-progress", verifyToken, loadProgress);


module.exports = router;
