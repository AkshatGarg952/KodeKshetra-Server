import axios from "axios";
import { createImportError, summarizeError, wrapImportError } from "./importLogger.js";

function normalizeHiddenInput(testInput) {
  if (typeof testInput === "string") {
    return testInput;
  }

  if (testInput && typeof testInput === "object" && "input" in testInput) {
    return String(testInput.input);
  }

  return String(testInput || "");
}

export default async function generateHiddenTests(problem, solution, platform, logger) {
  const hiddenForcesUrl = process.env.HIDDEN_FORCES_URL || "http://127.0.0.1:8000";
  const codeRunnerUrl = process.env.CODE_RUNNER_URL || "http://127.0.0.1:9000";
  const endpoint = platform === "codeforces" ? "/generate-codeforces-tests" : "/generate-leetcode-tests";
  let hiddenInputs = [];

  try {
    logger?.info("hidden-inputs", "Requesting hidden test inputs", {
      problemId: problem.problemId,
      platform,
      endpoint,
    });

    const hiddenInputsResponse = await axios.post(
      `${hiddenForcesUrl}${endpoint}`,
      { problem },
      {
        timeout: 300000,
        headers: process.env.INTERNAL_SERVICE_TOKEN
          ? { "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN }
          : undefined,
      }
    );

    hiddenInputs = (hiddenInputsResponse.data?.hiddenTestCases || [])
      .map(normalizeHiddenInput)
      .filter(Boolean);

    if (hiddenInputs.length === 0) {
      throw createImportError("HiddenForces did not return any valid hidden test cases", {
        statusCode: 502,
        stage: "hidden-inputs",
        details: {
          problemId: problem.problemId,
          platform,
        },
      });
    }

    logger?.info("hidden-inputs", "Generated hidden test inputs", {
      problemId: problem.problemId,
      count: hiddenInputs.length,
    });
  } catch (error) {
    logger?.error("hidden-inputs", "Hidden test input generation failed", summarizeError(error));
    throw wrapImportError(error, {
      message: "Failed to generate hidden test inputs",
      statusCode: 502,
      stage: "hidden-inputs",
      details: {
        problemId: problem.problemId,
        platform,
        hiddenForcesUrl,
      },
    });
  }

  try {
    const outputsResponse = await axios.post(
      `${codeRunnerUrl}/execute`,
      {
        code: solution.code,
        language: solution.language,
        problem: {
          ...problem,
          testCases: hiddenInputs,
        },
        },
      {
        timeout: 120000,
        headers: process.env.INTERNAL_SERVICE_TOKEN
          ? { "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN }
          : undefined,
      }
    );

    const outputs = outputsResponse.data?.outputs || [];
    if (outputs.length !== hiddenInputs.length) {
      throw createImportError("Mismatch between generated hidden inputs and produced outputs", {
        statusCode: 502,
        stage: "hidden-outputs",
        details: {
          problemId: problem.problemId,
          expectedOutputs: hiddenInputs.length,
          receivedOutputs: outputs.length,
        },
      });
    }

    const hiddenTests = hiddenInputs.map((input, index) => ({
      input,
      output: String(outputs[index] || ""),
    }));

    logger?.info("hidden-outputs", "Generated hidden test outputs", {
      problemId: problem.problemId,
      count: hiddenTests.length,
    });

    return hiddenTests;
  } catch (error) {
    logger?.error("hidden-outputs", "Hidden test output generation failed", summarizeError(error));
    throw wrapImportError(error, {
      message: "Failed to generate hidden test outputs",
      statusCode: 502,
      stage: "hidden-outputs",
      details: {
        problemId: problem.problemId,
        platform,
        codeRunnerUrl,
        hiddenInputCount: hiddenInputs.length,
      },
    });
  }
}
