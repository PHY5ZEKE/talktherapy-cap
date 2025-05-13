import { Router } from "express";
import type { Request, Response } from "express";

import patientRouter from "api/patient/router";
import clinicianRouter from "api/clinician/router";
import adminRouter from "api/admin/router";
// import superAdminRouter from "api/super-admin/router";
import authRouter from "api/auth/router";

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
router.use("/patient", patientRouter);
router.use("/clinician", clinicianRouter);
router.use("/admin", adminRouter);
// router.use("/super-admin", superAdminRouter);
router.use("/auth", authRouter);

export default router;
