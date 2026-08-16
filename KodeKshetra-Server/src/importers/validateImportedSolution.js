import axios from "axios";
import { createImportError, summarizeError, wrapImportError } from "./importLogger.js";

export default async function validateImportedSolution(problem, solution, logger) {
  const codeRunnerUrl = process.env.CODE_RUNNER_URL || "http://127.0.0.1:9000";
  try {
    logger?.info("sample-validation", "Validating provided solution against sample tests", {
      problemId: problem.problemId,
      language: solution.language,
      source: problem.source,
    });
    const response = await axios.post(
      `${codeRunnerUrl}/run`,
      {
        code: solution.code,
        language: solution.language,
        problem,
      },
      {
        timeout: 60000,
        headers: process.env.INTERNAL_SERVICE_TOKEN
          ? { "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN }
          : undefined,
      }
    );

    if (response.data?.isError) {
      throw createImportError(response.data.message || "Provided solution failed sample tests", {
        statusCode: 422,
        stage: "sample-validation",
        details: {
          problemId: problem.problemId,
          language: solution.language,
          runnerResponse: response.data,
        },
      });
    }

    logger?.info("sample-validation", "Sample validation passed", {
      problemId: problem.problemId,
    });
    return response.data;
  } catch (error) {
    logger?.error("sample-validation", "Sample validation failed", summarizeError(error));
    throw wrapImportError(error, {
      message: "Failed to validate solution against sample tests",
      statusCode: 502,
      stage: "sample-validation",
      details: {
        problemId: problem.problemId,
        language: solution.language,
        codeRunnerUrl,
      },
    });
  }
}
