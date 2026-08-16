import dotenv from "dotenv";
dotenv.config();

const DEFAULT_ALLOWED_ORIGINS = [
  "https://kode-kshetra-client.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const allowedOrigins = Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]));

/**
 * Checks if the provided origin header matches allowed lists, localhost, or Vercel preview domains.
 * @param {string} origin
 * @returns {boolean}
 */
export function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    const { protocol, hostname } = parsedOrigin;

    if ((hostname === "localhost" || hostname === "127.0.0.1") && (protocol === "http:" || protocol === "https:")) {
      return true;
    }

    // Only trust this project's own Vercel preview deployments
    // (e.g. kode-kshetra-client-git-branch-team.vercel.app), not any *.vercel.app.
    if (protocol === "https:" && hostname.endsWith(".vercel.app") && hostname.startsWith("kode-kshetra-client")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
