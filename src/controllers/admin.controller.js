import dotenv from "dotenv";
import User from "../models/user.model.js";
import detectPlatform from "../importers/detectPlatform.js";
import importCodeforcesProblem from "../importers/codeforcesImporter.js";
import importLeetCodeProblem from "../importers/leetcodeImporter.js";
import normalizeProblem from "../importers/normalizeProblem.js";
import validateImportedSolution from "../importers/validateImportedSolution.js";
import generateHiddenTests from "../importers/generateHiddenTests.js";
import persistImportedProblem, { findExistingProblem } from "../importers/persistImportedProblem.js";
import { createImportError, createImportLogger } from "../importers/importLogger.js";

dotenv.config();

const SUPPORTED_LANGUAGES = new Set(["python", "cpp", "java"]);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";

async function authenticateAdmin(adminId) {
  const admin = await User.findById(adminId);
  if (!admin) {
    throw createImportError("Admin not found", { statusCode: 400, stage: "auth" });
  }

  if ((admin.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw createImportError("Access Denied", { statusCode: 403, stage: "auth" });
  }

  return admin;
}

function validateSolutionInput(solution = {}) {
  if (!solution.code || typeof solution.code !== "string") {
    throw createImportError("Solution code is required", { statusCode: 400, stage: "input-validation" });
  }

  if (!solution.language || !SUPPORTED_LANGUAGES.has(solution.language)) {
    throw createImportError(`Unsupported solution language. Supported: ${[...SUPPORTED_LANGUAGES].join(", ")}`, {
      statusCode: 400,
      stage: "input-validation",
    });
  }
}

function getImporter(platform) {
  if (platform === "codeforces") {
    return importCodeforcesProblem;
  }

  if (platform === "leetcode") {
    return importLeetCodeProblem;
  }

  throw new Error("No importer available for platform");
}

function sendError(res, error, logger) {
  const statusCode = error.statusCode || 500;
  logger?.error(error.stage || "unknown", error.message || "Unknown error", {
    statusCode,
    details: error.details || null,
    cause: error.cause?.message || null,
  });
  return res.status(statusCode).json({
    success: false,
    requestId: logger?.requestId || null,
    stage: error.stage || "unknown",
    message: error.message || "Unknown error",
    details: error.details || null,
  });
}

async function buildAndPersistProblem({
  url,
  solution,
  logger,
}) {
  logger.info("platform-detection", "Detecting platform from URL", { url });
  const detection = detectPlatform(url);
  logger.info("platform-detection", "Detected supported platform", {
    platform: detection.platform,
    normalizedUrl: detection.normalizedUrl,
    problemId: detection.metadata.problemId,
  });
  const importer = getImporter(detection.platform);
  const scrapedProblem = await importer({
    normalizedUrl: detection.normalizedUrl,
    metadata: detection.metadata,
    logger,
  });
  const normalizedProblem = normalizeProblem(detection.platform, scrapedProblem);
  logger.info("normalization", "Normalized imported problem", {
    problemId: normalizedProblem.problemId,
    source: normalizedProblem.source,
  });
  const existingProblem = await findExistingProblem(detection.platform, normalizedProblem.problemId);

  if (existingProblem) {
    throw createImportError(`Problem ${normalizedProblem.problemId} already exists in the database`, {
      statusCode: 409,
      stage: "duplicate-check",
      details: { problemId: normalizedProblem.problemId },
    });
  }

  await validateImportedSolution(normalizedProblem, solution, logger);
  const hiddenTests = await generateHiddenTests(normalizedProblem, solution, detection.platform, logger);
  normalizedProblem.hiddenTests = hiddenTests;

  const { savedQuestion, savedSolution } = await persistImportedProblem({
    platform: detection.platform,
    problem: normalizedProblem,
    solution,
    sourceUrl: detection.normalizedUrl,
    logger,
  });

  return {
    platform: detection.platform,
    normalizedUrl: detection.normalizedUrl,
    normalizedProblem,
    hiddenTests,
    savedQuestion,
    savedSolution,
  };
}

export default class adminC {
  async addCFProblem(req, res) {
    const { problem, solution } = req.body;
    const logger = createImportLogger();

    try {
      logger.info("manual-add-cf", "Received manual Codeforces problem add request", {
        problemId: problem?.problemId || null,
      });
      await authenticateAdmin(req.user?.id);
      const normalizedProblem = {
        ...problem,
        source: "codeforces",
      };

      if (solution?.code && solution?.language) {
        validateSolutionInput(solution);
        normalizedProblem.hiddenTests = await generateHiddenTests(normalizedProblem, solution, "codeforces", logger);
      } else {
        normalizedProblem.hiddenTests = [];
      }

      const { savedQuestion, savedSolution } = await persistImportedProblem({
        platform: "codeforces",
        problem: normalizedProblem,
        solution: {
          problemId: normalizedProblem.problemId,
          ...solution,
        },
        sourceUrl: problem.url || "",
        logger,
      });

      return res.status(200).json({
        success: true,
        requestId: logger.requestId,
        message: "Problem added successfully",
        questionId: savedQuestion._id,
        solutionId: savedSolution?._id || null,
        hiddenTestsGenerated: normalizedProblem.hiddenTests.length,
      });
    } catch (error) {
      return sendError(res, error, logger);
    }
  }

  async addLCProblem(req, res) {
    const { problem, solution } = req.body;
    const logger = createImportLogger();

    try {
      logger.info("manual-add-lc", "Received manual LeetCode problem add request", {
        problemId: problem?.problemId || null,
      });
      await authenticateAdmin(req.user?.id);
      const normalizedProblem = {
        ...problem,
        source: "leetcode",
      };

      if (solution?.code && solution?.language) {
        validateSolutionInput(solution);
        normalizedProblem.hiddenTests = await generateHiddenTests(normalizedProblem, solution, "leetcode", logger);
      } else {
        normalizedProblem.hiddenTests = [];
      }

      const { savedQuestion, savedSolution } = await persistImportedProblem({
        platform: "leetcode",
        problem: normalizedProblem,
        solution: {
          problemId: normalizedProblem.problemId,
          ...solution,
        },
        sourceUrl: problem.url || "",
        logger,
      });

      return res.status(200).json({
        success: true,
        requestId: logger.requestId,
        message: "Problem added successfully",
        questionId: savedQuestion._id,
        solutionId: savedSolution?._id || null,
        hiddenTestsGenerated: normalizedProblem.hiddenTests.length,
      });
    } catch (error) {
      return sendError(res, error, logger);
    }
  }

  async importProblem(req, res) {
    const { url, solution } = req.body;
    const logger = createImportLogger();

    try {
      logger.info("import-request", "Received problem import request", {
        url,
        language: solution?.language || null,
      });
      await authenticateAdmin(req.user?.id);

      if (!url || typeof url !== "string") {
        throw createImportError("Problem URL is required", { statusCode: 400, stage: "input-validation" });
      }

      validateSolutionInput(solution);

      const result = await buildAndPersistProblem({
        url,
        solution,
        logger,
      });

      return res.status(200).json({
        success: true,
        requestId: logger.requestId,
        platform: result.platform,
        problemId: result.normalizedProblem.problemId,
        title: result.normalizedProblem.title,
        url: result.normalizedUrl,
        sampleValidationPassed: true,
        hiddenTestsGenerated: result.hiddenTests.length,
        questionSaved: Boolean(result.savedQuestion),
        solutionSaved: Boolean(result.savedSolution),
      });
    } catch (error) {
      return sendError(res, error, logger);
    }
  }
}
