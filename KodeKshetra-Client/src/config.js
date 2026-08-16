const rawServerUrl = import.meta.env.VITE_SERVER_URL;

export const SERVER_URL =
  (typeof rawServerUrl === "string" && rawServerUrl.trim()) ||
  "http://localhost:5000";

export const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || "admin@gmail.com"
).trim().toLowerCase();
