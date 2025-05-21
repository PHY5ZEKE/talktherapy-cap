import { Router } from "express";
import type { Request, Response } from "express";

import patientRouter from "api/patient/router";
import clinicianRouter from "api/clinician/router";
import adminRouter from "api/admin/router";
import superAdminRouter from "api/super/router";

import authRouter from "api/auth/router";
import signupRouter from "../signup/router";

import { authorizeRoles, validateToken } from "../auth/token";

const router = Router();

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
});

// WebSocket status endpoint
router.get("/ws-status", (req: Request, res: Response) => {
  res.json({
    status: "WebSocket server is running",
    endpoint: `ws://${req.headers.host?.split(":")[0]}:${
      process.env.WS_PORT || 8080
    }`,
  });
});

// patient routes
router.use("/patient", validateToken, authorizeRoles("patient"), patientRouter);

// clinician routes
router.use(
  "/clinician",
  validateToken,
  authorizeRoles("clinician"),
  clinicianRouter
);

// admin routes
router.use("/admin", validateToken, authorizeRoles("admin"), adminRouter);

// super admin routes
router.use(
  "/super",
  validateToken,
  authorizeRoles("superadmin"),
  superAdminRouter
);

// auth routes
router.use("/auth", authRouter);

// signup routes
router.use("/signup", signupRouter);

export default router;
