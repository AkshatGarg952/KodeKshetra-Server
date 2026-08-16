# ⚡ Code Runner

A robust, sandboxed code execution microservice built with **Express.js** and **Judge0**. It securely compiles and runs user code against defined test cases or custom inputs. This service forms the code execution engine for the [KodeKshetra Server](file:///c:/Users/garga/OneDrive/Desktop/Kodekshetra/KodeKshetra-Server/README.md) platform.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Key Features

- **Multi-Language Support**: Execute code in Python, C++, and Java.
- **Sandboxed Execution**: Isolated code execution powered by Judge0 API.
- **Testing Modes**: Supports sample tests, hidden test suites, and custom user-defined inputs.
- **Resilience**: Built-in rate limiting, request validation, and a bounded execution queue that caps concurrent Judge0 submissions.
- **Service Auth**: Optional `x-internal-token` check so only KodeKshetra-Server can reach the execution endpoints.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & Express.js
- **Execution Engine**: Judge0 CE API (RapidAPI or self-hosted)
- **HTTP Client**: Axios (keep-alive agents with capped sockets)
- **Rate Limiter**: express-rate-limit
- **Dev Tools**: Morgan, Dotenv, Nodemon

---

## 📂 Project Structure

```
Code-Runner/
├── index.js                        # Entry point — boots the HTTP server
└── src/
    ├── app.js                      # Express app: auth, CORS, rate limit, /health
    ├── config/appConfig.js         # Environment validation and config
    ├── middleware/
    │   └── requestValidators.js    # Request validation for /run, /submit, /execute
    ├── routes/executionRoutes.js   # Execution endpoint definitions
    └── services/
        ├── executionQueue.js       # Concurrency + pending-queue limits
        ├── judge0Service.js        # Judge0 submission and polling logic
        └── testcaseService.js      # Test case comparison and result shaping
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Judge0 API key (from [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce) or self-hosted instance)

### Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and fill it in:
   ```env
   PORT=9000
   NODE_ENV=development
   JUDGE0_API_KEY=your_rapidapi_key_here
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com/submissions
   INTERNAL_SERVICE_TOKEN=shared_secret_matching_kodekshetra_server
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=3000
   ```
   *`JUDGE0_API_KEY` is required — the service throws at startup without it. Leaving `INTERNAL_SERVICE_TOKEN` blank disables service-to-service auth and logs a warning; see `.env.example` for the queue and Judge0 tuning knobs.*

3. **Run Server**:
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```
   *The service runs by default at `http://localhost:9000`.*

---

## 📡 API Endpoints

| Method | Endpoint | Description | Key Body Parameters |
|:---:|:---|:---|:---|
| **GET** | `/health` | Check service health and uptime | None |
| **POST** | `/run` | Run code against sample tests | `code`, `language`, `problem` (with sample tests) |
| **POST** | `/submit` | Run code against all (sample + hidden) tests | `code`, `language`, `problem` (with all tests) |
| **POST** | `/run-all` | Run all tests and return summary stats | `code`, `language`, `problem` |
| **POST** | `/execute` | Run custom code with arbitrary inputs | `code`, `language`, `inputs` |

---

## 🤝 Acknowledgments

- **Judge0** for the execution environment.
- **Akshat Garg** - [GitHub Profile](https://github.com/AkshatGarg952).
