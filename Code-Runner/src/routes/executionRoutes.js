import { Router } from "express";
import { validateExecuteRequest, validateRunRequest } from "../middleware/requestValidators.js";
import { executeAllTests, executeCode, executeCustomTests } from "../services/judge0Service.js";
import { getTestcases } from "../services/testcaseService.js";

export default function createExecutionRoutes({ scheduleExecution }) {
  const router = Router();

  const respondWithExecutionResult = async ({ code, includeHidden, language, problem, res }) => {
    const testcases = getTestcases(problem, includeHidden);
    const timeLimit = problem.timeLimit || 2;
    const memoryLimit = problem.memoryLimit || 256000;

    try {
      const executionResult = await scheduleExecution(() =>
        executeCode(code, language, testcases, timeLimit, memoryLimit),
      );

      if (!executionResult.isError) {
        return res.json({
          isError: false,
          message: executionResult.message,
        });
      }

      return res.json({
        errorType: executionResult.errorType,
        isError: true,
        message: executionResult.message,
        result: executionResult.result || null,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  router.post("/run", validateRunRequest, async (req, res) => {
    const { code, language, problem } = req.body;
    return respondWithExecutionResult({ code, includeHidden: false, language, problem, res });
  });

  router.post("/submit", validateRunRequest, async (req, res) => {
    const { code, language, problem } = req.body;
    return respondWithExecutionResult({ code, includeHidden: true, language, problem, res });
  });

  router.post("/run-all", validateRunRequest, async (req, res) => {
    const { code, language, problem } = req.body;
    const testcases = getTestcases(problem, true);
    const timeLimit = problem.timeLimit || 2;
    const memoryLimit = problem.memoryLimit || 256000;

    try {
      const passedCount = await scheduleExecution(() =>
        executeAllTests(code, language, testcases, timeLimit, memoryLimit),
      );

      return res.json({
        passed: passedCount,
        success: true,
        total: testcases.length,
      });
    } catch (error) {
      console.error("Error in /run-all:", error);
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  });

  router.post("/execute", validateExecuteRequest, async (req, res) => {
    const { code, inputs, language, memoryLimit = 256000, timeLimit = 2 } = req.body;

    try {
      const results = await scheduleExecution(() =>
        executeCustomTests(code, language, inputs, timeLimit, memoryLimit),
      );

      return res.json({
        outputs: results.map((result) => (result.error ? `Error: ${result.error}` : result.output)),
      });
    } catch (error) {
      console.error("Error executing code:", error);
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  });

  return router;
}

