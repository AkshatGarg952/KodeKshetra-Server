import { v4 as uuidv4 } from "uuid";
import redisClient, { isRedisAvailable } from './redisClient.js';
import User from '../models/user.model.js';
import Battle from '../models/battle.model.js';
import getQuestionForBattle from "../helper/Questions/fetchQuestion.js";
import { buildBattleStartPayload } from "../socket/battleUtils.js";

const queueLocks = new Map();
const MATCHMAKING_RATING_GAP = 200;
const BATTLE_DURATION_SECONDS = Number(process.env.BATTLE_DURATION_SECONDS || 1800);
const MATCHMAKING_LOCK_TTL_MS = Number(process.env.MATCHMAKING_LOCK_TTL_MS || 5000);

const getQueueKey = (mode, topic) => `${mode}:${topic}`;
const getQueueMemberKey = (mode, topic) => `queue-members:${mode}:${topic}`;
const getDistributedLockKey = (queueKey) => `lock:matchmaking:${queueKey}`;

const acquireDistributedQueueLock = async (queueKey) => {
  const lockKey = getDistributedLockKey(queueKey);
  const lockToken = uuidv4();
  const result = await redisClient.set(lockKey, lockToken, {
    NX: true,
    PX: MATCHMAKING_LOCK_TTL_MS
  });

  if (result !== 'OK') {
    return null;
  }

  return { lockKey, lockToken };
};

const releaseDistributedQueueLock = async (lockKey, lockToken) => {
  if (!lockKey || !lockToken) {
    return;
  }

  try {
    await redisClient.eval(
      'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end',
      {
        keys: [lockKey],
        arguments: [lockToken]
      }
    );
  } catch (error) {
    console.warn(`Failed to release matchmaking lock ${lockKey}: ${error.message}`);
  }
};

const withQueueLock = async (queueKey, worker) => {
  while (queueLocks.has(queueKey)) {
    await queueLocks.get(queueKey);
  }

  let resolveLock;
  const lockPromise = new Promise((resolve) => {
    resolveLock = resolve;
  });
  queueLocks.set(queueKey, lockPromise);

  try {
    const distributedLock = await acquireDistributedQueueLock(queueKey);
    if (!distributedLock) {
      return;
    }

    try {
      return await worker();
    } finally {
      await releaseDistributedQueueLock(distributedLock.lockKey, distributedLock.lockToken);
    }
  } finally {
    resolveLock();
    if (queueLocks.get(queueKey) === lockPromise) {
      queueLocks.delete(queueKey);
    }
  }
};

const sanitizeQuestionForClient = (question, mode) => {
  if (!question) {
    return question;
  }

  if (mode === "cp") {
    const { _id, hiddenTestCases, hiddenTests, __v, ...safeQuestion } = question;
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
    } = question;
    return safeQuestion;
  }

  return question;
};

const emitToUserSockets = (io, socketIds, event, payload) => {
  if (!socketIds || socketIds.size === 0) {
    return;
  }

  for (const socketId of socketIds) {
    io.to(socketId).emit(event, payload);
  }
};

async function tryToMatch(mode, topic, io, onlineUsers) {
  if (!isRedisAvailable()) {
    console.warn('Redis is not available. Cannot perform matchmaking.');
    return;
  }

  const queueKey = getQueueKey(mode, topic);
  const membershipKey = getQueueMemberKey(mode, topic);

  return withQueueLock(queueKey, async () => {
    const queue = await redisClient.lRange(queueKey, 0, -1);
    const parsedQueue = queue
      .map((rawUser) => {
        try {
          return { ...JSON.parse(rawUser), rawUser };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((left, right) => {
        const ratingDifference = (left.rating || 0) - (right.rating || 0);
        if (ratingDifference !== 0) {
          return ratingDifference;
        }

        return (left.joinedAt || 0) - (right.joinedAt || 0);
      });

    const matches = [];
    for (let index = 0; index < parsedQueue.length - 1;) {
      const currentUser = parsedQueue[index];
      const nextUser = parsedQueue[index + 1];

      if (Math.abs((currentUser.rating || 0) - (nextUser.rating || 0)) <= MATCHMAKING_RATING_GAP) {
        matches.push([currentUser, nextUser]);
        index += 2;
        continue;
      }

      index += 1;
    }

    for (const [user1, user2] of matches) {
      const removalResults = await redisClient
        .multi()
        .lRem(queueKey, 1, user1.rawUser)
        .lRem(queueKey, 1, user2.rawUser)
        .sRem(membershipKey, user1.userId, user2.userId)
        .exec();

      const [removedUser1, removedUser2] = Array.isArray(removalResults) ? removalResults : [];
      if (!removedUser1 || !removedUser2) {
        continue;
      }

      const users = await User.find({ _id: { $in: [user1.userId, user2.userId] } })
        .select('_id rating solvedQuestions')
        .lean();

      if (users.length !== 2) {
        continue;
      }

      const usersById = new Map(users.map((user) => [user._id.toString(), user]));
      const leftUser = usersById.get(user1.userId);
      const rightUser = usersById.get(user2.userId);

      if (!leftUser || !rightUser) {
        continue;
      }

      const battleConfig = { mode, topic, battleId: uuidv4() };
      const question = await getQuestionForBattle(battleConfig, leftUser, rightUser);
      const battleStartedAt = new Date();
      const battleEndsAt = battleStartedAt.getTime() + (BATTLE_DURATION_SECONDS * 1000);
      const newBattle = await Battle.create({
        player1: user1.userId,
        player2: user2.userId,
        battleType: 'matchmaking',
        mode,
        topic,
        question,
        createdAt: battleStartedAt,
        battleStartedAt,
        battleEndsAt
      });

      const payload = buildBattleStartPayload({
        question: sanitizeQuestionForClient(question, mode),
        battleId: newBattle._id,
        mode,
        topic,
        battleType: 'matchmaking',
        battleStartedAt: battleStartedAt.toISOString(),
        battleEndsAt,
        battleDurationSeconds: BATTLE_DURATION_SECONDS,
      });

      emitToUserSockets(io, onlineUsers.get(user1.userId), 'battleStart', payload);
      emitToUserSockets(io, onlineUsers.get(user2.userId), 'battleStart', payload);
    }
  });
}

export default tryToMatch;
