import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import connectDB from "./src/database/mongoose.js";
import userRouter from './src/routes/user.routes.js';
import adminRouter from './src/routes/admin.routes.js';
import User from './src/models/user.model.js';
import Battle from './src/models/battle.model.js';
import getQuestionForBattle from "./src/helper/Questions/fetchQuestion.js";
import addUserToQueue from "./src/redis/matchmakingController.js";
import tryToMatch from "./src/redis/matchmaker.js";
import getPaginatedLeaderboardFromRedis from './src/helper/leaderboard/getLeaderboard.js';
import calculateXP from './src/helper/XP/XPCalculator.js';
import cancelMatchmaking from './src/redis/cancelMatchmaking.js';
import { decideWinner } from './src/helper/winner/decideWinner.js';
import updateXP from "./src/helper/XP/UpdateXP.js";
import battleUpdate from "./src/helper/updation/battleUpdate.js";
import setStreaks from "./src/helper/updation/setStreaks.js";
import leetcodeQuestion from "./src/models/leetcode_questions.model.js";
import CFproblems from "./src/models/codeforces_questions.model.js";
import { refreshLeaderboardEntries } from './src/helper/leaderboard/scoreCalculation.js';

dotenv.config();

const codeRunnerHttpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: Number(process.env.CODE_RUNNER_MAX_SOCKETS || 512)
});

const codeRunnerHttpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: Number(process.env.CODE_RUNNER_MAX_SOCKETS || 512)
});

const codeRunnerClient = axios.create({
  timeout: Number(process.env.CODE_RUNNER_TIMEOUT_MS || 35000),
  httpAgent: codeRunnerHttpAgent,
  httpsAgent: codeRunnerHttpsAgent,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosRetry(codeRunnerClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED'
});

const app = express();
app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true, limit: '200kb' }));
app.use(express.json({ limit: '200kb' }));
app.use(cors({
  origin: ['https://kode-kshetra-client.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const PROBLEM_CACHE_TTL_MS = Number(process.env.PROBLEM_CACHE_TTL_MS || 300000);
const PROBLEM_CACHE_MAX_SIZE = Number(process.env.PROBLEM_CACHE_MAX_SIZE || 1000);
const problemCache = new Map();

const getCachedProblem = (cacheKey) => {
  const entry = problemCache.get(cacheKey);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    problemCache.delete(cacheKey);
    return null;
  }

  return entry.value;
};

const setCachedProblem = (cacheKey, value) => {
  if (!value) {
    return;
  }

  if (!problemCache.has(cacheKey) && problemCache.size >= PROBLEM_CACHE_MAX_SIZE) {
    const oldestKey = problemCache.keys().next().value;
    if (oldestKey) {
      problemCache.delete(oldestKey);
    }
  }

  problemCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + PROBLEM_CACHE_TTL_MS
  });
};

const resolveProblemForExecution = async (problem) => {
  if (!problem?.source || !problem?.problemId) {
    return problem;
  }

  const cacheKey = `${problem.source}:${problem.problemId}`;
  const cachedProblem = getCachedProblem(cacheKey);
  if (cachedProblem) {
    return cachedProblem;
  }

  let resolvedProblem = null;
  if (problem.source === 'codeforces') {
    resolvedProblem = await CFproblems.findOne({ problemId: problem.problemId })
      .select('problemId source timeLimit memoryLimit examples hiddenTests')
      .lean();
  } else if (problem.source === 'leetcode') {
    resolvedProblem = await leetcodeQuestion.findOne({ problemId: problem.problemId })
      .select('problemId source timeLimit memoryLimit sampleTests hiddenTests')
      .lean();
  }

  if (resolvedProblem) {
    setCachedProblem(cacheKey, resolvedProblem);
  }

  return resolvedProblem || problem;
};

app.get("/", async (req, res) => {
  res.status(200).send("Welcome to KodeKshetra Server");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'KodeKshetra-Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cachedProblems: problemCache.size
  });
});

app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);

app.get("/leaderboard/:period/:page", async (req, res) => {
  const period = Number.parseInt(req.params.period, 10);
  const page = parseInt(req.params.page, 10);

  if (![1, 7].includes(period)) {
    return res.status(400).json({ message: "Invalid period. Use 1 or 7." });
  }

  if (Number.isNaN(page) || page < 1) {
    return res.status(400).json({ message: "Invalid page number" });
  }

  try {
    const { result, hasNextPage } = await getPaginatedLeaderboardFromRedis(
      `leaderboard:${period}`,
      page
    );

    res.status(200).json({
      data: result,
      isNextPage: hasNextPage,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Failed to load leaderboard." });
  }
});

app.post('/run', async (req, res) => {
  let { code, language, problem } = req.body;

  if (!code || !language || !problem) {
    return res.status(400).json({ error: 'Missing required fields: code, language, or problem' });
  }

  try {
    problem = await resolveProblemForExecution(problem);

    const response = await codeRunnerClient.post(`${process.env.CODE_RUNNER_URL}/run`, {
      code,
      language,
      problem
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/submit', async (req, res) => {
  let { code, language, problem } = req.body;

  if (!code || !language || !problem) {
    return res.status(400).json({ error: 'Missing required fields: code, language, or problem' });
  }

  try {
    problem = await resolveProblemForExecution(problem);

    const response = await codeRunnerClient.post(`${process.env.CODE_RUNNER_URL}/submit`, {
      code,
      language,
      problem
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://kode-kshetra-client.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const onlineUsers = new Map();
const battleRooms = new Map();
const battleSubmissions = new Map();
const battles = new Map();
const processingBattles = new Set();
const BATTLE_DURATION_SECONDS = Number(process.env.BATTLE_DURATION_SECONDS || 1800);

const addOnlineSocket = (userId, socketId) => {
  if (!userId) {
    return;
  }

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socketId);
};

const removeOnlineSocket = (userId, socketId) => {
  const socketIds = onlineUsers.get(userId);
  if (!socketIds) {
    return;
  }

  socketIds.delete(socketId);
  if (socketIds.size === 0) {
    onlineUsers.delete(userId);
  }
};

const emitToUser = (userId, event, payload) => {
  const socketIds = onlineUsers.get(userId);
  if (!socketIds || socketIds.size === 0) {
    return;
  }

  for (const socketId of socketIds) {
    io.to(socketId).emit(event, payload);
  }
};

const sanitizeQuestionForClient = (question, mode) => {
  if (!question) {
    return question;
  }

  const normalizedQuestion = question.toObject ? question.toObject() : question;

  if (mode === "cp") {
    const { _id, hiddenTestCases, hiddenTests, __v, ...safeQuestion } = normalizedQuestion;
    return safeQuestion;
  }

  if (mode === "dsa") {
    const {
      _id,
      source,
      url,
      memoryLimit,
      timeLimit,
      completeCodeTemplates,
      hiddenTests,
      __v,
      ...safeQuestion
    } = normalizedQuestion;
    return safeQuestion;
  }

  return normalizedQuestion;
};

const getTotalTestCount = (question = {}) =>
  (Array.isArray(question.examples) ? question.examples.length : 0) +
  (Array.isArray(question.sampleTests) ? question.sampleTests.length : 0) +
  (Array.isArray(question.hiddenTests) ? question.hiddenTests.length : 0);

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    addOnlineSocket(userId, socket.id);
  }

  socket.on('disconnect', () => {
    for (const [battleId, userSet] of battleRooms.entries()) {
      if (userSet.has(userId)) {
        userSet.delete(userId);

        if (userSet.size === 0) {
          battleRooms.delete(battleId);
        }
      }
    }

    removeOnlineSocket(userId, socket.id);
  });

  socket.on("cancelMatchmaking", async ({ userId, mode, topic }) => {
    try {
      const user = await User.findById(userId).select('_id').lean();

      if (!user) {
        socket.emit("cancelMatchmakingResponse", {
          success: false,
          message: "Cannot find the user!"
        });
        return;
      }

      const success = await cancelMatchmaking({ userId, mode, topic });

      socket.emit("cancelMatchmakingResponse", {
        success,
        message: success
          ? "Matchmaking cancelled successfully."
          : "Could not cancel matchmaking (maybe not in queue)."
      });
    } catch (err) {
      console.error("Cancel matchmaking error:", err.message);
      socket.emit("cancelMatchmakingResponse", {
        success: false,
        message: "Server error while cancelling matchmaking."
      });
    }
  });

  socket.on("joinQueue", async ({ userId, mode, topic }) => {
    try {
      if (!userId || !mode || !topic) {
        socket.emit("matchmakingError", {
          message: "Missing matchmaking details. Please choose a mode and topic again."
        });
        return;
      }

      const user = await User.findById(userId).select('rating').lean();
      if (!user) {
        socket.emit("matchmakingError", {
          message: "Cannot find the user for matchmaking."
        });
        return;
      }

      const rating = user.rating?.[mode] || 1200;

      await addUserToQueue({ userId, mode, topic, rating });
      await tryToMatch(mode, topic, io, onlineUsers);
    } catch (err) {
      console.error("Error in joinQueue:", err);
      socket.emit("matchmakingError", {
        message: err.message || "Unable to join matchmaking right now."
      });
    }
  });

  socket.on("leaveBattleRoom", ({ userId, roomId }) => {
    if (!roomId || !battleRooms.has(roomId)) {
      return;
    }

    socket.leave(roomId);
    const joinedUsers = battleRooms.get(roomId);
    joinedUsers.delete(userId);

    if (joinedUsers.size === 0) {
      battleRooms.delete(roomId);
      battles.delete(roomId);
    }
  });

  socket.on("joinBattleRoom", async ({ battle, userId, roomId }) => {
    try {
      if (!userId || !roomId) {
        socket.emit("battleJoinError", {
          message: "Missing room details. Please try joining again."
        });
        return;
      }

      const existingRoomUsers = battleRooms.get(roomId);
      const isExistingParticipant = existingRoomUsers?.has(userId);

      if (existingRoomUsers && existingRoomUsers.size >= 2 && !isExistingParticipant) {
        socket.emit("battleJoinError", {
          message: "Room is full. Cannot join the battle."
        });
        return;
      }

      socket.join(roomId);
      if (!battleRooms.has(roomId)) {
        battleRooms.set(roomId, new Set());
      }

      battleRooms.get(roomId).add(userId);

      if (battle?.mode && battle?.topic) {
        battles.set(roomId, { mode: battle.mode, topic: battle.topic });
      }

      const joinedUsers = battleRooms.get(roomId);
      if (joinedUsers.size !== 2) {
        return;
      }

      const roomBattle = battles.get(roomId);
      if (!roomBattle?.mode || !roomBattle?.topic) {
        io.to(roomId).emit("battleJoinError", {
          message: "This room does not have a battle configuration yet. Ask the host to recreate it."
        });
        battleRooms.delete(roomId);
        battles.delete(roomId);
        io.socketsLeave(roomId);
        return;
      }

      const userIds = [...joinedUsers];
      const users = await User.find({ _id: { $in: userIds } })
        .select('_id rating solvedQuestions')
        .lean();

      if (users.length !== 2) {
        io.to(roomId).emit("battleJoinError", {
          message: "Could not load both players for this room."
        });
        battleRooms.delete(roomId);
        battles.delete(roomId);
        io.socketsLeave(roomId);
        return;
      }

      const usersById = new Map(users.map((user) => [user._id.toString(), user]));
      const user1 = usersById.get(userIds[0]);
      const user2 = usersById.get(userIds[1]);

      if (!user1 || !user2) {
        io.to(roomId).emit("battleJoinError", {
          message: "Could not load both players for this room."
        });
        battleRooms.delete(roomId);
        battles.delete(roomId);
        io.socketsLeave(roomId);
        return;
      }

      const question = await getQuestionForBattle(roomBattle, user1, user2);
      const battleStartedAt = new Date();
      const battleEndsAt = battleStartedAt.getTime() + (BATTLE_DURATION_SECONDS * 1000);
      const newBattle = await Battle.create({
        player1: user1._id,
        player2: user2._id,
        question,
        mode: roomBattle.mode,
        topic: roomBattle.topic,
        createdAt: battleStartedAt
      });

      io.to(roomId).emit("battleStart", {
        question: sanitizeQuestionForClient(question, roomBattle.mode),
        battleId: newBattle._id,
        mode: roomBattle.mode,
        topic: roomBattle.topic,
        battleStartedAt: battleStartedAt.toISOString(),
        battleEndsAt,
        battleDurationSeconds: BATTLE_DURATION_SECONDS,
        roomId,
      });
    } catch (err) {
      console.error("Error in joinBattleRoom:", err);
      socket.emit("battleJoinError", {
        message: "Unable to join the battle room right now."
      });
    }
  });

  socket.on("battleEnded", async ({ battleDetails, userId, code, roomId, lost }) => {
    if (!battleDetails?.battleId || !userId) {
      return;
    }

    if (battleSubmissions.has(battleDetails.battleId)) {
      if (processingBattles.has(battleDetails.battleId)) {
        return;
      }

      processingBattles.add(battleDetails.battleId);

      try {
        const [user, battle] = await Promise.all([
          User.findById(userId).select('currWinStreak').lean(),
          Battle.findById(battleDetails.battleId)
        ]);

        if (!battle) {
          throw new Error("Cannot find any battle!");
        }

        if (!user) {
          throw new Error("Cannot find any user!");
        }

        const question = battle.question;
        let player1 = battleSubmissions.get(battleDetails.battleId);
        let player2 = {
          id: userId,
          code: code || "",
          time: battleDetails.timeRemaining ?? 1800,
          currWinStreak: user.currWinStreak,
          language: battleDetails.language || null,
        };

        const preStatus = player1.status;
        if (preStatus) {
          if (preStatus === "won") {
            player2.status = "loss";
          } else if (preStatus === "loss") {
            player2.status = "won";
          } else {
            player2.status = "draw";
          }
        }

        if (battle.player1.toString() === userId) {
          const player = player1;
          player1 = player2;
          player2 = player;
        }

        if (!player1.status && !player2.status) {
          const [player1PassedCases, player2PassedCases] = await Promise.all([
            decideWinner(player1.code, player1.language, question),
            decideWinner(player2.code, player2.language, question)
          ]);

          player1.passedCases = player1PassedCases;
          player2.passedCases = player2PassedCases;

          if (player1PassedCases > player2PassedCases) {
            player1.status = "won";
            player2.status = "loss";
          } else if (player1PassedCases < player2PassedCases) {
            player1.status = "loss";
            player2.status = "won";
          } else if (player1.time > player2.time) {
            player1.status = "won";
            player2.status = "loss";
          } else if (player1.time < player2.time) {
            player1.status = "loss";
            player2.status = "won";
          } else {
            battle.winner = null;
            player1.status = "draw";
            player2.status = "draw";
          }
        }

        if (player1.status === "won") {
          battle.winner = player1.id;
        } else if (player2.status === "won") {
          battle.winner = player2.id;
        } else {
          battle.winner = null;
        }
        await battle.save();

        player1.xp = calculateXP(player1);
        player2.xp = calculateXP(player2);

        await Promise.all([updateXP(player1), updateXP(player2)]);
        await Promise.all([battleUpdate(player1), battleUpdate(player2)]);
        await Promise.all([setStreaks(player1), setStreaks(player2)]);

        const updateSolvedAndTopics = async (playerId, problemId, platform, tags) => {
          const updates = {
            $push: { solvedQuestions: { platform, problemId } }
          };

          if (tags && Array.isArray(tags) && tags.length > 0) {
            updates.$inc = {};
            tags.forEach((tag) => {
              updates.$inc[`topicsMastered.${tag}`] = 1;
            });
          }

          await User.findByIdAndUpdate(playerId, updates);
        };

        const totalTests = getTotalTestCount(question);
        const solvedPlatform = battle.mode === "cp" ? "Codeforces" : "LeetCode";

        await Promise.all([
          player1.passedCases === totalTests && totalTests > 0
            ? updateSolvedAndTopics(player1.id, question.problemId, solvedPlatform, question.tags)
            : Promise.resolve(),
          player2.passedCases === totalTests && totalTests > 0
            ? updateSolvedAndTopics(player2.id, question.problemId, solvedPlatform, question.tags)
            : Promise.resolve()
        ]);

        await refreshLeaderboardEntries([player1.id, player2.id]);

        emitToUser(player1.id, "battleResult", player1.status);
        emitToUser(player2.id, "battleResult", player2.status);
      } catch (err) {
        console.error(err.message);
      } finally {
        battleSubmissions.delete(battleDetails.battleId);
        processingBattles.delete(battleDetails.battleId);

        if (roomId) {
          battleRooms.delete(roomId);
          battles.delete(roomId);
        }
      }
    } else {
      const user = await User.findById(userId).select('currWinStreak').lean();
      if (!user) {
        return;
      }

      const player = {
        id: userId,
        code: code || "",
        time: battleDetails.timeRemaining ?? 0,
        currWinStreak: user.currWinStreak,
        language: battleDetails.language || null,
      };

      if (lost) {
        player.status = "loss";
      }

      battleSubmissions.set(battleDetails.battleId, player);
    }
  });
});

const PORT = process.env.PORT || process.env.PORT_NO || 5000;
server.keepAliveTimeout = Number(process.env.HTTP_KEEP_ALIVE_TIMEOUT_MS || 65000);
server.headersTimeout = Number(process.env.HTTP_HEADERS_TIMEOUT_MS || 66000);
server.requestTimeout = Number(process.env.HTTP_REQUEST_TIMEOUT_MS || 70000);

server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
