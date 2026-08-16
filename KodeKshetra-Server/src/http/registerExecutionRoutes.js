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

  const forwardToCodeRunner = async (res, requestFn) => {
    try {
      const response = await requestFn();
      return res.status(200).json(response.data);
    } catch (error) {
      // Forward the upstream HTTP status (e.g. 503 queue-full) so clients
      // can distinguish transient overload from server bugs.
      const upstreamStatus = error.response?.status;
      const statusCode = upstreamStatus || error.statusCode || 500;
      const message = error.response?.data?.error || error.message;
      if (statusCode === 503) {
        res.set("Retry-After", "5");
      }
      return res.status(statusCode).json({ error: message });
    }
  };

  app.post("/run", async (req, res) => {
    let { code, language, problem } = req.body;

    if (!code || !language || !problem) {
      return res.status(400).json({ error: "Missing required fields: code, language, or problem" });
    }

    try {
      problem = await resolveProblemForExecution(problem);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return forwardToCodeRunner(res, () =>
      codeRunnerClient.post(`${codeRunnerUrl}/run`, { code, language, problem }),
    );
  });

  app.post("/submit", async (req, res) => {
    let { code, language, problem } = req.body;

    if (!code || !language || !problem) {
      return res.status(400).json({ error: "Missing required fields: code, language, or problem" });
    }

    try {
      problem = await resolveProblemForExecution(problem);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return forwardToCodeRunner(res, () =>
      codeRunnerClient.post(`${codeRunnerUrl}/submit`, { code, language, problem }),
    );
  });
}
