const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminSLP.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/super-admin-signup", superAdminController.signup);
router.post("/login", superAdminController.login);
router.get("/get-super-admin", verifyToken, superAdminController.getSuperAdmin);
router.post("/forgot-password", superAdminController.forgotPassword);
router.post("/verify-otp", superAdminController.verifyOtp);
router.post("/reset-password", superAdminController.resetPassword);
router.get("/check-auth", superAdminController.checkAuth);
router.get("/getAllAdmins", verifyToken, superAdminController.getAllAdmins);
router.get(
  "/getAdminById/:adminId",
  verifyToken,
  superAdminController.getAdminById
);

router.put(
  "/edit-super-admin",
  verifyToken,
  superAdminController.editSuperAdmin
);

router.put(
  "/change-password",
  verifyToken,
  superAdminController.changePassword
);

router.put(
  "/update-profile-picture",
  verifyToken,
  superAdminController.updateProfilePicture
);

router.put("/edit-admin", verifyToken, superAdminController.editAdmin);

router.get("/audit-logs", verifyToken, superAdminController.getAuditLogs);

router.post("/email-notification", superAdminController.sendNotification)

router.get("/email-admins", verifyToken, superAdminController.getAllAdminsEmail);

module.exports = router;
