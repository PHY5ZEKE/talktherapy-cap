const express = require("express");
const router = express.Router();
const clinicianController = require("../controllers/clinicianSLP.controller");
const verifyToken = require("../middleware/verifyToken");

// Route to add a clinician
router.post("/add-clinician", verifyToken, clinicianController.addClinician);

// Route for clinician signup
router.post("/signup", clinicianController.clinicianSignup);

router.put("/change-password", verifyToken, clinicianController.changePassword);

// Route to get clinician details (requires authentication)

router.get("/get-clinician", verifyToken, clinicianController.getClinician);

router.put("/edit-clinician", verifyToken, clinicianController.editClinician);

router.get("/getAllPatients", verifyToken, clinicianController.getAllPatients);
router.get(
  "/getPatientById/:patientId",
  verifyToken,
  clinicianController.getPatientById
);

router.put(
  "/update-profile-picture",
  verifyToken,
  clinicianController.updateProfilePicture
);

router.get(
  "/get-assigned-patients",
  verifyToken,
  clinicianController.getAssignedPatients
);

router.post("/request-access", verifyToken, clinicianController.requestAccess);

module.exports = router;
