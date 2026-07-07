import axios from "axios";
import axiosRetry from "axios-retry";
import http from "http";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const codeRunnerHttpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: Number(process.env.CODE_RUNNER_MAX_SOCKETS || 512),
});

const codeRunnerHttpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: Number(process.env.CODE_RUNNER_MAX_SOCKETS || 512),
});

const codeRunnerClient = axios.create({
  timeout: Number(process.env.CODE_RUNNER_TIMEOUT_MS || 35000),
  httpAgent: codeRunnerHttpAgent,
  httpsAgent: codeRunnerHttpsAgent,
  headers: {
    "Content-Type": "application/json",
    ...(process.env.INTERNAL_SERVICE_TOKEN ? { "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN } : {}),
  },
});

axiosRetry(codeRunnerClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED",
});

export default codeRunnerClient;
