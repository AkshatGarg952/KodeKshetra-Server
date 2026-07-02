export default function registerExecutionRoutes(app, {
  codeRunnerClient,
  codeRunnerUrl,
  resolveProblemForExecution,
  authMiddleware,
}) {
  if (authMiddleware) {
    app.use("/run", authMiddleware);
    app.use("/submit", authMiddleware);
  }

  app.post("/run", async (req, res) => {
    let { code, language, problem } = req.body;

    if (!code || !language || !problem) {
      return res.status(400).json({ error: "Missing required fields: code, language, or problem" });
    }

    try {
      problem = await resolveProblemForExecution(problem);
      const response = await codeRunnerClient.post(`${codeRunnerUrl}/run`, {
        code,
        language,
        problem,
      });

      return res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/submit", async (req, res) => {
    let { code, language, problem } = req.body;

    if (!code || !language || !problem) {
      return res.status(400).json({ error: "Missing required fields: code, language, or problem" });
    }

    try {
      problem = await resolveProblemForExecution(problem);
      const response = await codeRunnerClient.post(`${codeRunnerUrl}/submit`, {
        code,
        language,
        problem,
      });

      return res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });
}
