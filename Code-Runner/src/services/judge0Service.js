import axios from "axios";
import http from "http";
import https from "https";
import appConfig from "../config/appConfig.js";

/**
 * Mapping of supported language identifiers to Judge0 language IDs.
 * @type {Record<string, number>}
 */
const languageMap = {
  c: 50,
  cpp: 54,
  csharp: 51,
  go: 60,
  java: 62,
  javascript: 63,
  python: 71,
  ruby: 72,
  rust: 73,
};

/**
 * Dedicated Axios instance for contacting Judge0 CE APIs.
 * Utilizes TCP keep-alive and connection socket limits.
 */
const judge0Client = axios.create({
  timeout: appConfig.judge0.timeoutMs,
  httpAgent: new http.Agent({
    keepAlive: true,
    maxSockets: appConfig.judge0.maxSockets,
  }),
  httpsAgent: new https.Agent({
    keepAlive: true,
    maxSockets: appConfig.judge0.maxSockets,
  }),
});

const JUDGE0_HEADERS = {
  "content-type": "application/json",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "X-RapidAPI-Key": appConfig.judge0.apiKey,
};

const JUDGE0_MAX_CPU_TIME_LIMIT_SECONDS = 20;
const JUDGE0_MIN_MEMORY_LIMIT_KB = 16000;
const JUDGE0_MAX_MEMORY_LIMIT_KB = 512000;

/**
 * Normalizes output string by stripping CRLF characters and trailing line-whitespaces.
 * @param {string} value - Raw stdout string from Judge0 execution.
 * @returns {string} Normalized string output.
 */
function normalizeOutput(value) {
  return (value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd();
}

/**
 * Normalizes and guards time limits passed to Judge0, converting milliseconds to seconds if needed.
 * Ensures the value stays within [0.5s, 20s] bounds.
 * @param {number|string} [rawTimeLimit=2] - Time limit constraints.
 * @returns {number} Normalized time limit in seconds.
 */
function normalizeTimeLimitForJudge0(rawTimeLimit = 2) {
  const numericTimeLimit = Number(rawTimeLimit);
  if (!Number.isFinite(numericTimeLimit) || numericTimeLimit <= 0) {
    return 2;
  }

  let normalizedTimeLimit = numericTimeLimit;
  if (normalizedTimeLimit > JUDGE0_MAX_CPU_TIME_LIMIT_SECONDS && normalizedTimeLimit >= 100) {
    normalizedTimeLimit /= 1000;
  }

  normalizedTimeLimit = Math.min(Math.max(normalizedTimeLimit, 0.5), JUDGE0_MAX_CPU_TIME_LIMIT_SECONDS);
  return Number(normalizedTimeLimit.toFixed(3));
}

/**
 * Normalizes and guards memory limits passed to Judge0, in kilobytes.
 * Ensures the value stays within sane bounds so an invalid/absurd caller-supplied
 * limit doesn't reach Judge0 as a raw, unchecked value.
 * @param {number|string} [rawMemoryLimit=256000] - Memory limit constraint in KB.
 * @returns {number} Normalized memory limit in KB.
 */
function normalizeMemoryLimitForJudge0(rawMemoryLimit = 256000) {
  const numericMemoryLimit = Number(rawMemoryLimit);
  if (!Number.isFinite(numericMemoryLimit) || numericMemoryLimit <= 0) {
    return 256000;
  }

  return Math.min(Math.max(numericMemoryLimit, JUDGE0_MIN_MEMORY_LIMIT_KB), JUDGE0_MAX_MEMORY_LIMIT_KB);
}

/**
 * Polls the Judge0 API for a submission result using the given token.
 * Retries up to the maximum configuration index.
 * @param {string} token - Submission token from Judge0.
 * @returns {Promise<object>} Parsed submission outcome.
 * @throws {Error} If maximum poll attempts are exceeded before completion.
 */
async function pollSubmission(token) {
  const url = `${appConfig.judge0.apiUrl}/${token}?base64_encoded=false`;

  for (let index = 0; index < appConfig.judge0.maxPollAttempts; index += 1) {
    const response = await judge0Client.get(url, { headers: JUDGE0_HEADERS });
    const result = response.data;
    if (result.status.id >= 3) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, appConfig.judge0.pollIntervalMs));
  }

  throw new Error("Judge0 request timed out");
}

/**
 * Submits source code and input parameters to Judge0 CE and awaits resolution.
 * @param {object} params
 * @param {string} params.code - Source code to execute.
 * @param {string} params.input - Standard input data.
 * @param {string} params.language - Targeted programming language.
 * @param {number} params.memoryLimit - Memory limits in kilobytes.
 * @param {number} params.timeLimit - Time limits in seconds.
 * @returns {Promise<object>} Finished execution result.
 */
async function submitToJudge0({ code, input, language, memoryLimit, timeLimit }) {
  const payload = {
    language_id: languageMap[language],
    source_code: code,
    stdin: input,
    cpu_time_limit: normalizeTimeLimitForJudge0(timeLimit),
    memory_limit: normalizeMemoryLimitForJudge0(memoryLimit),
  };

  const response = await judge0Client.post(
    `${appConfig.judge0.apiUrl}?base64_encoded=false`,
    payload,
    { headers: JUDGE0_HEADERS },
  );

  return pollSubmission(response.data.token);
}

/**
 * Builds a standardized error descriptor schema.
 * @param {object} params
 * @param {string} params.errorType - Error classification (e.g. Wrong Answer, Time Limit Exceeded).
 * @param {string} params.message - Descriptive details of the failure.
 * @param {object|null} [params.result=null] - Test case context details.
 * @returns {object} Standardized error response.
 */
function buildExecutionError({ errorType, message, result = null }) {
  return {
    errorType,
    isError: true,
    message,
    result,
  };
}

/**
 * Executes a program against a set of input-output test assertions sequentially.
 * Halts and returns immediately on the first encountered failing test case.
 * @param {string} code - Source code text.
 * @param {string} language - Target language selector.
 * @param {Array<{input: string, expected: string}>} tests - Test suite cases.
 * @param {number} [timeLimit=2] - Seconds constraint.
 * @param {number} [memoryLimit=256000] - Kilobytes limit.
 * @returns {Promise<object>} Run verification details.
 */
export async function executeCode(code, language, tests, timeLimit = 2, memoryLimit = 256000) {
  if (!languageMap[language]) {
    return buildExecutionError({
      errorType: "System Error",
      message: `Unsupported language: ${language}`,
    });
  }

  try {
    const executionStats = {
      executionTimes: [],
      memoryUsages: [],
      passedTests: 0,
      totalTests: tests.length,
    };

    for (let index = 0; index < tests.length; index += 1) {
      const test = tests[index];
      let result;

      try {
        result = await submitToJudge0({
          code,
          input: test.input,
          language,
          memoryLimit,
          timeLimit,
        });
      } catch (error) {
        console.error("Judge0 API Error:", {
          data: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
        throw new Error(`Judge0 API Error (${error.response?.status}): ${JSON.stringify(error.response?.data)}`);
      }

      const executionTime = result.time ? Number.parseFloat(result.time) : null;
      const memoryUsed = result.memory ? Number.parseInt(result.memory, 10) : null;

      if (executionTime !== null) {
        executionStats.executionTimes.push(executionTime);
      }

      if (memoryUsed !== null) {
        executionStats.memoryUsages.push(memoryUsed);
      }

      if (result.status.id !== 3) {
        let errorType = "Runtime Error";
        let errorMessage = result.stderr || result.compile_output || result.status.description;

        switch (result.status.id) {
          case 4:
            errorType = "Wrong Answer";
            errorMessage = "Output did not match expected result";
            break;
          case 5:
            errorType = "Time Limit Exceeded";
            errorMessage = `Execution time exceeded ${normalizeTimeLimitForJudge0(timeLimit)}s limit`;
            break;
          case 6:
            errorType = "Compilation Error";
            errorMessage = "Code failed to compile";
            break;
          case 7:
          case 8:
          case 9:
          case 10:
            errorType = "Memory Limit Exceeded";
            errorMessage = `Memory usage exceeded ${memoryLimit}KB limit`;
            break;
          case 11:
            errorType = "Runtime Error (SIGSEGV)";
            errorMessage = "Segmentation fault - Invalid memory access";
            break;
          case 12:
            errorType = "Runtime Error (SIGXFSZ)";
            errorMessage = "Output size limit exceeded";
            break;
          case 13:
            errorType = "Runtime Error (SIGFPE)";
            errorMessage = "Floating point exception (division by zero)";
            break;
          case 14:
            errorType = "Runtime Error (SIGABRT)";
            errorMessage = "Program aborted";
            break;
          default:
            break;
        }

        return buildExecutionError({
          errorType,
          message: errorMessage,
          result: {
            actualOutput: result.stdout ? normalizeOutput(result.stdout) : null,
            detailedError: result.stderr || result.compile_output || "",
            executionTime,
            expectedOutput: test.expected,
            input: test.input,
            memoryUsed,
            statusId: result.status.id,
            testCaseNumber: index + 1,
            totalTests: tests.length,
          },
        });
      }

      const produced = normalizeOutput(result.stdout);
      const expected = normalizeOutput(test.expected);
      if (produced !== expected) {
        return buildExecutionError({
          errorType: "Wrong Answer",
          message: "Output did not match expected result",
          result: {
            actualOutput: produced,
            executionTime,
            expectedOutput: expected,
            input: test.input,
            memoryUsed,
            testCaseNumber: index + 1,
            totalTests: tests.length,
          },
        });
      }

      executionStats.passedTests += 1;
    }

    return {
      isError: false,
      message: "All test cases passed successfully",
      stats: {
        avgTime: executionStats.executionTimes.length > 0
          ? (executionStats.executionTimes.reduce((sum, value) => sum + value, 0) / executionStats.executionTimes.length).toFixed(3)
          : null,
        maxMemory: executionStats.memoryUsages.length > 0 ? Math.max(...executionStats.memoryUsages) : null,
        passedTests: executionStats.passedTests,
        totalTests: tests.length,
      },
    };
  } catch (error) {
    return buildExecutionError({
      errorType: "System Error",
      message: error.message,
    });
  }
}

/**
 * Runs code against all tests and returns total passing test count.
 * Unlike `executeCode`, this does not stop on the first failure.
 * @param {string} code - Source code text.
 * @param {string} language - Target language selector.
 * @param {Array<{input: string, expected: string}>} tests - Complete test suite.
 * @param {number} [timeLimit=2] - Seconds constraint.
 * @param {number} [memoryLimit=256000] - Kilobytes limit.
 * @returns {Promise<number>} Number of test cases that passed successfully.
 */
export async function executeAllTests(code, language, tests, timeLimit = 2, memoryLimit = 256000) {
  if (!languageMap[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  let passed = 0;
  for (const test of tests) {
    try {
      const result = await submitToJudge0({
        code,
        input: test.input,
        language,
        memoryLimit,
        timeLimit,
      });

      if (result.status.id !== 3) {
        continue;
      }

      if (normalizeOutput(result.stdout) === normalizeOutput(test.expected)) {
        passed += 1;
      }
    } catch (error) {
      console.error(`Test execution failed: ${error.message}`);
    }
  }

  return passed;
}

/**
 * Runs code against custom standard input lists and returns inputs/outputs/errors mapping.
 * @param {string} code - Source code text.
 * @param {string} language - Target language selector.
 * @param {string[]} testcases - Array of custom input values.
 * @param {number} [timeLimit=2] - Seconds constraint.
 * @param {number} [memoryLimit=256000] - Kilobytes limit.
 * @returns {Promise<Array<{input: string, output: string|null, error?: string}>>} Custom test results mapping.
 */
export async function executeCustomTests(code, language, testcases, timeLimit = 2, memoryLimit = 256000) {
  if (!languageMap[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const results = [];
  for (const input of testcases) {
    try {
      const result = await submitToJudge0({
        code,
        input,
        language,
        memoryLimit,
        timeLimit,
      });

      if (result.status.id !== 3) {
        results.push({
          error: result.stderr || result.compile_output || result.status.description,
          input,
          output: null,
        });
      } else {
        results.push({
          input,
          output: normalizeOutput(result.stdout),
        });
      }
    } catch (error) {
      results.push({
        error: `Judge0 execution failed: ${error.message}`,
        input,
        output: null,
      });
    }
  }

  return results;
}
