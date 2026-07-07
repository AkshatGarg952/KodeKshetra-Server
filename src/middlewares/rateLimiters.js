import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

// Auth routes: tight limit to prevent brute-force / credential stuffing.
export const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS || 15 * 60 * 1000), // 15 min
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Execution (run/submit): generous per-user allowance tied to battle cadence.
export const executionLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_EXEC_WINDOW_MS || 60 * 1000), // 1 min
  max: Number(process.env.RATE_LIMIT_EXEC_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Execution rate limit exceeded. Please wait before submitting again." },
  skip: (req) => !req.path.startsWith("/run") && !req.path.startsWith("/submit"),
});

// General API: broad catch-all to prevent scraping / hammering.
export const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_GENERAL_WINDOW_MS || 60 * 1000), // 1 min
  max: Number(process.env.RATE_LIMIT_GENERAL_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => req.path === "/" || req.path === "/api/health" || req.path === "/api/redis-health",
});
