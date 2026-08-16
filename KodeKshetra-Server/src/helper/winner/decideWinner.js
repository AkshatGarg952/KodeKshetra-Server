import codeRunnerClient from "../../services/codeRunnerClient.js";

export async function decideWinner(code, language, problem) {

  try {
    const response = await codeRunnerClient.post(`${process.env.CODE_RUNNER_URL}/run-all`, {
      code,
      language,
      problem
    });

    return response.data.passed || 0;

  } catch (err) {
    console.error('Error calling /run-all:', err.message);
    return 0;
  }
}
