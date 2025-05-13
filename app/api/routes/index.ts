import { Router } from "express";
import type { Request, Response } from "express";

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

// simple test endpoint
router.get("/test", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Hello, world!",
  });
});

export default router;
