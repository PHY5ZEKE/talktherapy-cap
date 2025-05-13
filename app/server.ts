import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";

import type { WebSocket } from "ws";
import mongoose from "mongoose";

import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";

import "dotenv/config";

import cors from "cors";
import helmet from "helmet";
import apiRoutes from "./api/routes";
import wsService from "./websocket";

const PORT = process.env.VITE_BASE_API_PORT || 5173;
const WS_PORT = process.env.VITE_WS_PORT || 8080;

async function startServer() {
  try {
    console.log("Starting API server initialization...");

    // START MONGODB
    mongoose
      .connect(process.env.VITE_DB_CONNECTION as string)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
      });

    const app = express();

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "ws:", "wss:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
      })
    );

    app.use(
      cors({
        // origin:
        // import.meta.env.VITE_NODE_ENV === "production"
        //   ? import.meta.env.VITE_ALLOWED_ORIGINS?.split(",")
        //   : "*",
        origin: true, // Allow all origins in development
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
      })
    );

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Create Vite server in middleware mode
    console.log("Creating Vite server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    console.log("Vite server created successfully");

    console.log("Setting up API routes...");
    app.use("/api", apiRoutes);

    console.log("Setting up Vite middleware...");
    app.use(vite.middlewares);

    console.log("Creating HTTP server...");
    const server = createHttpServer(app);
    console.log("HTTP server created");

    console.log("Setting up WebSocket upgrade handler...");
    server.on("upgrade", (request, socket, head) => {
      const wsServer = (wsService as any).wss;
      wsServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wsServer.emit("connection", ws, request);
      });
    });

    // Error handling middleware
    console.log("Setting up error handling middleware...");
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({
        error: "Internal Server Error",
        message:
          process.env.VITE_NODE_ENV === "development" ? err.message : undefined,
      });
    });

    // 404 handler
    console.log("Setting up 404 handler...");
    app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: "Not Found" });
    });

    // Start the server
    console.log("Starting backend server...");
    server.listen(PORT, () => {
      console.log(`🚀 Backend server running at http://localhost:${PORT}`);
      console.log(`📡 WebSocket server running at ws://localhost:${WS_PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down server...");

      // Close WebSocket server
      wsService.close();

      // Close HTTP server
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });

      setTimeout(() => {
        console.error(
          "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
      }, 5000);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Error during server initialization:", error);
    throw error;
  }
}

console.log("Starting backend server process...");
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
