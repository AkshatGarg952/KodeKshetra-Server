import cors from "cors";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import appConfig from "./config/appConfig.js";
import createExecutionRoutes from "./routes/executionRoutes.js";
import { createExecutionQueue } from "./services/executionQueue.js";

export default function createApp() {
  const app = express();
  const executionQueue = createExecutionQueue(appConfig.execution);
  const internalToken = process.env.INTERNAL_SERVICE_TOKEN;
  if (!internalToken) {
    console.warn(
      "WARNING: INTERNAL_SERVICE_TOKEN is not set — the code execution API is running with NO service-to-service auth and is fully public."
    );
  }
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...(process.env.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];

  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (!internalToken || req.path === "/health") {
      return next();
    }

    if (req.get("x-internal-token") !== internalToken) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized service request.",
      });
    }

    return next();
  });
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));
  app.use(morgan(appConfig.nodeEnv === "development" ? "dev" : "combined"));
  app.use(rateLimit({
    windowMs: appConfig.rateLimit.windowMs,
    max: appConfig.rateLimit.maxRequests,
    skip: (req) => req.path === "/health",
    message: {
      success: false,
      error: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      ...executionQueue.getStats(),
    });
  });

  app.use(createExecutionRoutes({
    scheduleExecution: executionQueue.scheduleExecution,
  }));

  return app;
}
