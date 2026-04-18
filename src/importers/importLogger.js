import { randomUUID } from "crypto";

function formatMessage(level, requestId, stage, message, payload) {
  const prefix = `[import:${requestId}] [${level}] [${stage}] ${message}`;
  return payload ? `${prefix} ${JSON.stringify(payload)}` : prefix;
}

function truncateValue(value, maxLength = 600) {
  if (value == null) {
    return null;
  }

  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  if (stringValue.length <= maxLength) {
    return stringValue;
  }

  return `${stringValue.slice(0, maxLength)}...`;
}

function mergeDetails(existingDetails, nextDetails) {
  if (!existingDetails) {
    return nextDetails || null;
  }

  if (!nextDetails) {
    return existingDetails;
  }

  if (typeof existingDetails === "object" && typeof nextDetails === "object") {
    return { ...existingDetails, ...nextDetails };
  }

  return {
    previousDetails: existingDetails,
    nextDetails,
  };
}

export function createImportLogger() {
  const requestId = randomUUID();

  return {
    requestId,
    info(stage, message, payload) {
      console.log(formatMessage("info", requestId, stage, message, payload));
    },
    warn(stage, message, payload) {
      console.warn(formatMessage("warn", requestId, stage, message, payload));
    },
    error(stage, message, payload) {
      console.error(formatMessage("error", requestId, stage, message, payload));
    },
  };
}

export function createImportError(message, { statusCode = 500, stage = "unknown", details = null, cause = null } = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.stage = stage;
  error.details = details;
  error.cause = cause;
  return error;
}

export function summarizeError(error) {
  if (!error) {
    return { message: "Unknown error" };
  }

  const summary = {
    name: error.name || "Error",
    message: error.message || "Unknown error",
  };

  if (error.code) {
    summary.code = error.code;
  }

  if (error.statusCode) {
    summary.statusCode = error.statusCode;
  }

  if (error.response?.status) {
    summary.upstreamStatus = error.response.status;
  }

  if (error.response?.data !== undefined) {
    summary.upstreamBody = truncateValue(error.response.data);
  }

  if (error.details) {
    summary.details = error.details;
  }

  if (error.cause?.message) {
    summary.cause = error.cause.message;
  }

  return summary;
}

export function wrapImportError(
  error,
  { message, statusCode = 500, stage = "unknown", details = null } = {}
) {
  if (error?.statusCode && error?.stage && !message && statusCode === error.statusCode && stage === error.stage && !details) {
    return error;
  }

  return createImportError(message || error?.message || "Unknown error", {
    statusCode: error?.statusCode || statusCode,
    stage: error?.stage || stage,
    details: mergeDetails(error?.details, details),
    cause: error,
  });
}
