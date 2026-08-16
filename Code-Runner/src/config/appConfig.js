import dotenv from "dotenv";

dotenv.config();

function readNumber(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validateEnv() {
  const required = ["JUDGE0_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\nPlease create a .env file based on .env.example`,
    );
  }
}

validateEnv();

const appConfig = {
  execution: {
    maxConcurrent: readNumber(process.env.MAX_CONCURRENT_EXECUTIONS, 40),
    maxQueueSize: readNumber(process.env.MAX_PENDING_EXECUTIONS, 400),
  },
  judge0: {
    apiKey: process.env.JUDGE0_API_KEY,
    apiUrl: process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com/submissions",
    maxPollAttempts: readNumber(process.env.JUDGE0_MAX_POLL_ATTEMPTS, 30),
    maxSockets: readNumber(process.env.JUDGE0_MAX_SOCKETS, 256),
    pollIntervalMs: readNumber(process.env.JUDGE0_POLL_INTERVAL_MS, 1000),
    timeoutMs: readNumber(process.env.JUDGE0_TIMEOUT_MS, 15000),
  },
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 9000,
  rateLimit: {
    maxRequests: readNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 3000),
    windowMs: readNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  },
};

export default appConfig;

