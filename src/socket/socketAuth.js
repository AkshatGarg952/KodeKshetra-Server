import jwt from "jsonwebtoken";

function normalizeBearerToken(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  return value.startsWith("Bearer ") ? value.slice(7) : value;
}

export function resolveSocketAuthToken(socket) {
  const authToken = normalizeBearerToken(socket.handshake.auth?.token);
  if (authToken) {
    return authToken;
  }

  return normalizeBearerToken(socket.handshake.headers?.authorization);
}

export function authorizeSocket(socket, next) {
  try {
    const token = resolveSocketAuthToken(socket);
    if (!token) {
      return next(new Error("Authentication token is required."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authenticatedUserId = decoded?.id?.toString?.();
    if (!authenticatedUserId) {
      return next(new Error("Invalid authentication token."));
    }

    socket.data.userId = authenticatedUserId;
    return next();
  } catch {
    return next(new Error("Invalid authentication token."));
  }
}

