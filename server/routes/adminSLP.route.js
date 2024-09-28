const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminSLP.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/add-admin", adminController.addAdmin);
router.post("/remove-admin", adminController.removeAdmin);
router.post("/activate-admin", adminController.activateAdmin);
router.post("/admin-signup", adminController.adminSignup);
router.post("/admin-login", adminController.adminLogin);
router.post("/forgot-password", adminController.forgotPassword);
router.post("/verify-otp", adminController.verifyOtp);
router.post("/reset-password", adminController.resetPassword);
router.get("/get-admin", verifyToken, adminController.getAdmin);
router.get("/getAllClinicians", verifyToken, adminController.getAllClinicians);
router.get(
  "/getClinicianById/:clinicianId",
  verifyToken,
  adminController.getClinicianById
);
router.get("/getAllPatients", verifyToken, adminController.getAllPatients);
router.get(
  "/getPatientById/:patientId",
  verifyToken,
  adminController.getPatientById
);

router.put("/edit-admin", verifyToken, adminController.editAdmin);

router.put("/change-password", verifyToken, adminController.changePassword);

router.put(
  "/update-profile-picture",
  verifyToken,
  adminController.updateProfilePicture
);

router.put("/edit-clinician", verifyToken, adminController.editClinician);
router.put("/edit-patient", verifyToken, adminController.editPatient);

module.exports = router;
