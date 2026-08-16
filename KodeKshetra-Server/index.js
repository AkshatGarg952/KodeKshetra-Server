// Must stay the first import: ES module imports are all evaluated before any
// statement in this file runs, so a later dotenv.config() call would leave every
// module that reads process.env at import time (rate limiters, Redis TTLs, XP
// tuning) reading undefined and silently falling back to defaults.
import "dotenv/config";

import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { corsOptions, isOriginAllowed } from "./src/config/cors.js";
import { authLimiter, executionLimiter, generalLimiter } from "./src/middlewares/rateLimiters.js";
import codeRunnerClient from "./src/services/codeRunnerClient.js";

// Database and Routes
import connectDB from "./src/database/mongoose.js";
import adminRouter from "./src/routes/admin.routes.js";
import userRouter from "./src/routes/user.routes.js";

// Models
import User from "./src/models/user.model.js";
import Battle from "./src/models/battle.model.js";
import CFproblems from "./src/models/codeforces_questions.model.js";
import leetcodeQuestion from "./src/models/leetcode_questions.model.js";

// Helpers and Services
import calculateXP from "./src/helper/XP/XPCalculator.js";
import getPaginatedLeaderboardFromRedis from "./src/helper/leaderboard/getLeaderboard.js";
import { refreshLeaderboardEntries } from "./src/helper/leaderboard/scoreCalculation.js";
import getQuestionForBattle from "./src/helper/Questions/fetchQuestion.js";
import { applyBattleOutcomeForUser, markProblemSolvedOnce } from "./src/helper/stats/applyBattleOutcome.js";
import { decideWinner } from "./src/helper/winner/decideWinner.js";
import registerExecutionRoutes from "./src/http/registerExecutionRoutes.js";
import registerLeaderboardRoute from "./src/http/registerLeaderboardRoute.js";
import jwtAuth from "./src/middlewares/jwt.middleware.js";

// Redis and Matchmaking
import cancelMatchmaking from "./src/redis/cancelMatchmaking.js";
import {
  claimBattleProcessing,
  clearBattleProcessingState,
  getBattleSubmissions,
  joinPrivateRoom,
  leavePrivateRoom,
  recordBattleSubmission,
  setPrivateRoomConfig,
} from "./src/redis/liveBattleState.js";
import addUserToQueue from "./src/redis/matchmakingController.js";
import tryToMatch from "./src/redis/matchmaker.js";
import { getRedisClient, getRedisHealth, getRedisStatus, isRedisAvailable } from "./src/redis/redisClient.js";
import { createProblemResolver } from "./src/services/problemResolver.js";

// Socket utilities and handlers
import { buildBattleStartPayload, getTotalTestCount, sanitizeQuestionForClient } from "./src/socket/battleUtils.js";
import registerMatchmakingHandlers from "./src/socket/registerMatchmakingHandlers.js";
import registerPrivateBattleHandlers from "./src/socket/registerPrivateBattleHandlers.js";
import { authorizeSocket } from "./src/socket/socketAuth.js";
import { createUserEventBus } from "./src/socket/userEventBus.js";

// Ensure all essential environment variables are set
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET", "CODE_RUNNER_URL"];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

const app = express();
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true, limit: "200kb" }));
app.use(express.json({ limit: "200kb" }));

// Configure CORS using the modular options
app.use(cors(corsOptions));

// Apply Rate limiters
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/run", executionLimiter);
app.use("/submit", executionLimiter);
app.use(generalLimiter);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to KodeKshetra Server");
});

const {
  problemCache,
  resolveProblemForExecution,
} = createProblemResolver({
  CFproblems,
  leetcodeQuestion,
  ttlMs: Number(process.env.PROBLEM_CACHE_TTL_MS || 300000),
  maxSize: Number(process.env.PROBLEM_CACHE_MAX_SIZE || 1000),
});

// Health Endpoints
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "KodeKshetra-Server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cachedProblems: problemCache.size,
  });
});

app.get("/api/redis-health", async (req, res) => {
  try {
    const redisHealth = await getRedisHealth();
    const statusCode = redisHealth.status === "ok" ? 200 : 503;
    res.status(statusCode).json({
      service: "Redis",
      timestamp: new Date().toISOString(),
      ...redisHealth,
    });
  } catch (error) {
    res.status(500).json({
      service: "Redis",
      timestamp: new Date().toISOString(),
      status: "error",
      connected: false,
      lastError: error?.message || "Unknown Redis health check error",
    });
  }
});

// Base HTTP routes
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

registerLeaderboardRoute(app, { getPaginatedLeaderboardFromRedis });

// Execute/submit runner routes
registerExecutionRoutes(app, {
  codeRunnerClient,
  codeRunnerUrl: process.env.CODE_RUNNER_URL,
  resolveProblemForExecution,
  authMiddleware: jwtAuth,
});

const server = http.createServer(app);

// Socket.io Server Setup
const io = new Server(server, {
  maxHttpBufferSize: Number(process.env.SOCKETIO_MAX_HTTP_BUFFER_SIZE || 1e6),
  pingTimeout: Number(process.env.SOCKETIO_PING_TIMEOUT_MS || 20000),
  pingInterval: Number(process.env.SOCKETIO_PING_INTERVAL_MS || 25000),
  perMessageDeflate: {
    threshold: 1024,
  },
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by Socket.IO CORS: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const battleState = {
  battleRooms: new Map(),
  battleSubmissions: new Map(),
  battles: new Map(),
};
const processingBattles = new Set();
const BATTLE_DURATION_SECONDS = Number(process.env.BATTLE_DURATION_SECONDS || 1800);
const SERVER_INSTANCE_ID = process.env.RENDER_INSTANCE_ID || process.env.HOSTNAME || `pid-${process.pid}`;
const USER_EVENT_CHANNEL = process.env.USER_EVENT_CHANNEL || "kodekshetra:user-events";

const userEventBus = createUserEventBus({
  getRedisClient,
  io,
  isRedisAvailable,
  serverInstanceId: SERVER_INSTANCE_ID,
  userEventChannel: USER_EVENT_CHANNEL,
});

void userEventBus.initializeUserEventSubscriber();
io.use(authorizeSocket);

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  socket.data.joinedRoomIds = new Set();

  if (userId) {
    userEventBus.addOnlineSocket(userId, socket.id);
  }

  socket.on("disconnect", async () => {
    const joinedRoomIds = [...(socket.data.joinedRoomIds || [])];
    for (const roomId of joinedRoomIds) {
      await leavePrivateRoom({ roomId, userId }).catch(() => null);

      const joinedUsers = battleState.battleRooms.get(roomId);
      if (!joinedUsers) {
        continue;
      }

      joinedUsers.delete(userId);
      if (joinedUsers.size === 0) {
        battleState.battleRooms.delete(roomId);
        battleState.battles.delete(roomId);
      } else {
        for (const otherUserId of joinedUsers) {
          userEventBus.emitToUser(otherUserId, "opponentDisconnected", {
            roomId,
            userId,
          });
        }
      }
    }

    userEventBus.removeOnlineSocket(userId, socket.id);
  });

  registerMatchmakingHandlers(socket, {
    SERVER_INSTANCE_ID,
    Battle,
    BATTLE_DURATION_SECONDS,
    User,
    addUserToQueue,
    cancelMatchmaking,
    buildBattleStartPayload,
    getRedisStatus,
    sanitizeQuestionForClient,
    io,
    onlineUsers: userEventBus.onlineUsers,
    tryToMatch,
  });

  registerPrivateBattleHandlers(socket, {
    Battle,
    BATTLE_DURATION_SECONDS,
    User,
    applyBattleOutcomeForUser,
    battleState,
    calculateXP,
    claimBattleProcessing,
    clearBattleProcessingState,
    decideWinner,
    emitToUser: userEventBus.emitToUser,
    getBattleSubmissions,
    getQuestionForBattle,
    getTotalTestCount,
    isRedisAvailable,
    joinPrivateRoom,
    leavePrivateRoom,
    markProblemSolvedOnce,
    processingBattles,
    recordBattleSubmission,
    refreshLeaderboardEntries,
    sanitizeQuestionForClient,
    buildBattleStartPayload,
    setPrivateRoomConfig,
  });
});

const PORT = process.env.PORT || process.env.PORT_NO || 5000;
server.keepAliveTimeout = Number(process.env.HTTP_KEEP_ALIVE_TIMEOUT_MS || 65000);
server.headersTimeout = Number(process.env.HTTP_HEADERS_TIMEOUT_MS || 66000);
server.requestTimeout = Number(process.env.HTTP_REQUEST_TIMEOUT_MS || 70000);

async function bootstrap() {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    const redisStatus = getRedisStatus();
    if (redisStatus.connected) {
      console.log("[Redis] Startup status: connected.");
    } else {
      console.warn(`[Redis] Startup status: unavailable.${redisStatus.lastError ? ` Last error: ${redisStatus.lastError}` : ""}`);
    }
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to start KodeKshetra server:", error.message);
  process.exit(1);
});

// Global Express error handler — registered after all routes
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[Express] Unhandled error: ${req.method} ${req.path} → ${status} ${message}`);
  if (!res.headersSent) {
    res.status(status).json({ error: message });
  }
});
