import axios from 'axios';
import http from 'http';
import https from 'https';

const codeRunnerClient = axios.create({
  timeout: Number(process.env.CODE_RUNNER_TIMEOUT_MS || 35000),
  httpAgent: new http.Agent({
    keepAlive: true,
    maxSockets: Number(process.env.CODE_RUNNER_MAX_SOCKETS || 512)
  }),
  httpsAgent: new https.Agent({
    keepAlive: true,
    maxSockets: Number(process.env.CODE_RUNNER_MAX_SOCKETS || 512)
  }),
  headers: {
    'Content-Type': 'application/json'
  }
});

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
