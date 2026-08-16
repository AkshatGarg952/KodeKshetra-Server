import { io } from "socket.io-client";
import { SERVER_URL } from "../config.js";

/** @type {import("socket.io-client").Socket | null} */
let socket = null;

/**
 * Establishes (or reuses) a singleton Socket.IO connection for the authenticated user.
 *
 * - If no `userId` or `token` is found in sessionStorage, any existing socket is
 *   disconnected and `null` is returned.
 * - If the stored JWT token differs from the current socket's auth token, the old
 *   socket is torn down and a new one is created with the new credentials.
 * - If the socket already exists with matching credentials but is disconnected, it
 *   is reconnected.
 *
 * @returns {import("socket.io-client").Socket | null} The active socket instance, or
 *   `null` when the user is not authenticated.
 */
const establishSocketConnection = () => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  if (!userId || !token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  // Re-create the socket whenever the token changes (e.g. after re-login)
  const shouldCreateNewSocket = !socket || socket.auth?.token !== token;

  if (shouldCreateNewSocket) {
    if (socket) {
      socket.disconnect();
    }

    socket = io(SERVER_URL, {
      reconnection: true,
      transports: ["websocket", "polling"],
      withCredentials: true,
      timeout: 20000,
      auth: { token },
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error?.message || error);
      // Automatically tear down the socket on authentication failures
      if (String(error?.message || "").toLowerCase().includes("authentication")) {
        socket?.disconnect();
        socket = null;
      }
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  if (!socket) {
    return null;
  }

  // Expose on window for debugging in development
  window.socket = socket;

  return socket;
};

/**
 * Disconnects and destroys the current socket instance.
 * Should be called on logout or explicit teardown.
 */
const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Eagerly establish a socket connection on module load if the user is already logged in
if (typeof window !== "undefined") {
  const userId = sessionStorage.getItem("userId");
  if (userId) {
    establishSocketConnection();
  }
}

export { socket, disconnectSocket, establishSocketConnection };
