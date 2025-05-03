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
  showProgress,
  getProgress,
} = require("../controllers/patientProgress.controller");

const {
  saveAssessment,
  getAssessment,
} = require("../controllers/patientAssessment.controller");

const {
  saveFaceAssessment,
  getFaceAssessment,
} = require("../controllers/patientFace.controller");

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

router.get("/show-progress", verifyToken, showProgress);

router.get("/get-progress/:patientId", verifyToken, getProgress);

// Save speech assessment results for a patient
router.post("/speech-assessment", verifyToken, saveAssessment);

router.get("/get-assessment/:patientId", verifyToken, getAssessment);

// Save face assessment results for a patient
router.post("/face-assessment", verifyToken, saveFaceAssessment);

router.get("/get-face-assessment/:patientId", verifyToken, getFaceAssessment);

module.exports = router;
