const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminSLP.controller");
const { authenticateSuperAdminToken } = require("../utilities/auth");
const verifyToken = require("../middleware/verifyToken");

router.post("/super-admin-signup", superAdminController.signup);
router.post("/super-admin-login", superAdminController.login);
router.get(
  "/get-super-admin",
  authenticateSuperAdminToken,
  superAdminController.getSuperAdmin
);
router.post("/forgot-password", superAdminController.forgotPassword);
router.post("/verify-otp", superAdminController.verifyOtp);
router.post("/reset-password", superAdminController.resetPassword);
router.get("/check-auth", superAdminController.checkAuth);
router.get(
  "/getAllAdmins",
  authenticateSuperAdminToken,
  superAdminController.getAllAdmins
);
router.get(
  "/getAdminById/:adminId",
  authenticateSuperAdminToken,
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

router.put(
  "/edit-admin",
  verifyToken,
  superAdminController.editAdmin
);


module.exports = router;